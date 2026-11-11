package com.openlabs.service;

import com.openlabs.common.ApiException;
import com.openlabs.domain.*;
import com.openlabs.dto.Dtos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class EquipmentService {
    private final EquipmentRepository equipment;
    private final UserRepository users;
    private final BookingRepository bookings;
    private final UnavailablePeriodRepository unavailable;

    public EquipmentService(EquipmentRepository equipment, UserRepository users,
                            BookingRepository bookings, UnavailablePeriodRepository unavailable) {
        this.equipment = equipment;
        this.users = users;
        this.bookings = bookings;
        this.unavailable = unavailable;
    }

    /** Browse: equipment from approved colleges only, optionally filtered by category. */
    @Transactional(readOnly = true)
    public List<EquipmentView> browse(Long userId, String category) {
        Access.user(users, userId);
        return equipment.findByOrganizationTypeAndOrganizationStatusOrderByNameAsc(OrgType.COLLEGE, OrgStatus.APPROVED)
                .stream()
                .filter(e -> category == null || category.isBlank()
                        || e.getCategory().equalsIgnoreCase(category.trim()))
                .map(EquipmentService::toView)
                .toList();
    }

    /** The college's own equipment. */
    @Transactional(readOnly = true)
    public List<EquipmentView> listMine(Long userId) {
        User contact = Access.requireCollegeContact(users, userId);
        return equipment.findByOrganizationIdOrderByNameAsc(contact.getOrganization().getId())
                .stream().map(EquipmentService::toView).toList();
    }

    @Transactional
    public EquipmentView create(Long userId, EquipmentRequest r) {
        User contact = Access.requireCollegeContact(users, userId);
        Equipment e = new Equipment();
        e.setAssetCode("LAB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        e.setName(r.name().trim());
        e.setCategory(r.category().trim());
        e.setDescription(r.description() == null ? "" : r.description().trim());
        e.setLocation(r.location() == null ? "" : r.location().trim());
        e.setRatePerDay(r.ratePerDay());
        e.setOrganization(contact.getOrganization());
        return toView(equipment.save(e));
    }

    /**
     * A college can remove an item only if nothing has ever been requested for it.
     * Past requests must stay in the history, so the item can't be deleted once used.
     */
    @Transactional
    public void delete(Long userId, Long equipmentId) {
        User contact = Access.requireCollegeContact(users, userId);
        Equipment e = findOwned(contact, equipmentId);
        if (bookings.countByEquipmentId(equipmentId) > 0) {
            throw ApiException.conflict("This equipment has booking history and can't be deleted");
        }
        equipment.delete(e);   // its unavailable periods are removed by the database (ON DELETE CASCADE)
    }

    @Transactional
    public UnavailableView addUnavailable(Long userId, Long equipmentId, UnavailableRequest r) {
        User contact = Access.requireCollegeContact(users, userId);
        Equipment e = findOwned(contact, equipmentId);
        if (r.endDate().isBefore(r.startDate())) {
            throw ApiException.badRequest("End date must be on or after the start date");
        }
        UnavailablePeriod p = unavailable.save(new UnavailablePeriod(e, r.startDate(), r.endDate(), r.reason()));
        return new UnavailableView(p.getId(), p.getStartDate(), p.getEndDate(), p.getReason());
    }

    @Transactional(readOnly = true)
    public List<UnavailableView> listUnavailable(Long userId, Long equipmentId) {
        Access.user(users, userId);
        find(equipmentId);
        return unavailable.findByEquipmentIdOrderByStartDateAsc(equipmentId).stream()
                .map(p -> new UnavailableView(p.getId(), p.getStartDate(), p.getEndDate(), p.getReason()))
                .toList();
    }

    /** Can this item be requested for these dates? Companies check this before sending a request. */
    @Transactional(readOnly = true)
    public AvailabilityView availability(Long userId, Long equipmentId, LocalDate from, LocalDate to) {
        Access.user(users, userId);
        find(equipmentId);
        if (to.isBefore(from)) {
            throw ApiException.badRequest("End date must be on or after the start date");
        }
        if (unavailable.countOverlapping(equipmentId, from, to) > 0) {
            return new AvailabilityView(false, "The college has marked this equipment unavailable on some of those dates");
        }
        long booked = bookings.countOverlapping(equipmentId, from, to, BookingService.BLOCKING);
        if (booked > 0) {
            return new AvailabilityView(false, "Those dates are already requested or booked");
        }
        return new AvailabilityView(true, "Available for those dates");
    }

    private Equipment find(Long id) {
        return equipment.findById(id).orElseThrow(() -> ApiException.notFound("Equipment not found"));
    }

    /** Looks up an item and checks that it belongs to the caller's college. */
    private Equipment findOwned(User contact, Long id) {
        Equipment e = find(id);
        if (!e.getOrganization().getId().equals(contact.getOrganization().getId())) {
            throw ApiException.forbidden("This equipment belongs to another organization");
        }
        return e;
    }

    static EquipmentView toView(Equipment e) {
        return new EquipmentView(e.getId(), e.getAssetCode(), e.getName(), e.getCategory(),
                e.getDescription(), e.getLocation(), e.getRatePerDay(),
                e.getOrganization().getId(), e.getOrganization().getName());
    }
}
