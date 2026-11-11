package com.openlabs.service;

import com.openlabs.common.ApiException;
import com.openlabs.domain.*;
import com.openlabs.dto.Dtos.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Booking requests flow: a company member requests equipment, the owning college's
 * contact approves or rejects it, and approved bookings are final for now.
 * Payment will be added as a step after approval.
 */
@Service
public class BookingService {

    /** Pending and approved requests hold their dates, so two requests can't both claim them. */
    public static final Set<BookingStatus> BLOCKING = EnumSet.of(BookingStatus.PENDING, BookingStatus.APPROVED);

    private final BookingRepository bookings;
    private final EquipmentRepository equipment;
    private final UnavailablePeriodRepository unavailable;
    private final UserRepository users;

    public BookingService(BookingRepository bookings, EquipmentRepository equipment,
                          UnavailablePeriodRepository unavailable, UserRepository users) {
        this.bookings = bookings;
        this.equipment = equipment;
        this.unavailable = unavailable;
        this.users = users;
    }

    @Transactional
    public BookingView request(Long userId, BookingRequest r) {
        User requester = Access.requireCompanyUser(users, userId);

        if (r.startDate().isBefore(LocalDate.now())) {
            throw ApiException.badRequest("Start date cannot be in the past");
        }
        if (r.endDate().isBefore(r.startDate())) {
            throw ApiException.badRequest("End date must be on or after the start date");
        }

        Equipment item = equipment.findById(r.equipmentId())
                .orElseThrow(() -> ApiException.notFound("Equipment not found"));
        Organization owner = item.getOrganization();
        if (owner.getType() != OrgType.COLLEGE || !owner.isApproved()) {
            throw ApiException.notFound("Equipment not found");   // don't reveal unapproved listings
        }

        if (unavailable.countOverlapping(item.getId(), r.startDate(), r.endDate()) > 0) {
            throw ApiException.conflict("The college has marked this equipment unavailable on some of those dates");
        }
        if (bookings.countOverlapping(item.getId(), r.startDate(), r.endDate(), BLOCKING) > 0) {
            throw ApiException.conflict("Those dates are already requested or booked");
        }

        long days = ChronoUnit.DAYS.between(r.startDate(), r.endDate()) + 1;

        Booking b = new Booking();
        b.setEquipment(item);
        b.setRequester(requester);
        b.setStartDate(r.startDate());
        b.setEndDate(r.endDate());
        b.setTotalCost(item.getRatePerDay().multiply(BigDecimal.valueOf(days)));
        b.setStatus(BookingStatus.PENDING);
        b.setCreatedAt(LocalDateTime.now());
        try {
            bookings.saveAndFlush(b);
        } catch (DataIntegrityViolationException ex) {
            // Two requests raced past the checks above; the database constraint rejected the second.
            throw ApiException.conflict("Those dates were just taken by another request");
        }
        return toView(b);
    }

    @Transactional(readOnly = true)
    public List<BookingView> mine(Long userId) {
        return bookings.findByRequesterIdOrderByCreatedAtDesc(userId).stream()
                .map(BookingService::toView).toList();
    }

    /** Pending requests for the college's equipment, for its contact to review. */
    @Transactional(readOnly = true)
    public List<BookingView> incoming(Long userId) {
        User contact = Access.requireCollegeContact(users, userId);
        return bookings.findByEquipmentOrganizationIdAndStatusOrderByCreatedAtDesc(
                        contact.getOrganization().getId(), BookingStatus.PENDING)
                .stream().map(BookingService::toView).toList();
    }

    @Transactional
    public BookingView decide(Long userId, Long bookingId, boolean approve) {
        User contact = Access.requireCollegeContact(users, userId);
        Booking b = find(bookingId);
        if (!b.getEquipment().getOrganization().getId().equals(contact.getOrganization().getId())) {
            throw ApiException.forbidden("This request is for another organization's equipment");
        }
        if (b.getStatus() != BookingStatus.PENDING) {
            throw ApiException.conflict("Only pending requests can be decided");
        }
        b.setStatus(approve ? BookingStatus.APPROVED : BookingStatus.REJECTED);
        b.setDecidedBy(contact);
        return toView(b);
    }

    @Transactional
    public BookingView cancel(Long userId, Long bookingId) {
        Booking b = find(bookingId);
        if (!b.getRequester().getId().equals(userId)) {
            throw ApiException.forbidden("You can only cancel your own requests");
        }
        if (b.getStatus() != BookingStatus.PENDING && b.getStatus() != BookingStatus.APPROVED) {
            throw ApiException.conflict("This booking can no longer be cancelled");
        }
        b.setStatus(BookingStatus.CANCELLED);
        return toView(b);
    }

    private Booking find(Long id) {
        return bookings.findById(id).orElseThrow(() -> ApiException.notFound("Booking not found"));
    }

    static BookingView toView(Booking b) {
        User requester = b.getRequester();
        return new BookingView(
                b.getId(),
                b.getEquipment().getId(),
                b.getEquipment().getName(),
                b.getEquipment().getAssetCode(),
                requester.getName(),
                requester.getOrganization() == null ? null : requester.getOrganization().getName(),
                b.getStartDate(),
                b.getEndDate(),
                b.getTotalCost(),
                b.getStatus().name());
    }
}
