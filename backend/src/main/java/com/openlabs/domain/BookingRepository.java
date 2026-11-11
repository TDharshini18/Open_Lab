package com.openlabs.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);

    /** Requests for equipment owned by a college, for its contact to review. */
    List<Booking> findByEquipmentOrganizationIdAndStatusOrderByCreatedAtDesc(Long organizationId, BookingStatus status);

    /** Any booking at all for this equipment, including past ones. Used to block deletion. */
    long countByEquipmentId(Long equipmentId);

    /** Application-level overlap check. The database constraint is the final safety net. */
    @Query("select count(b) from Booking b where b.equipment.id = :equipmentId "
         + "and b.status in :statuses and b.startDate <= :end and b.endDate >= :start")
    long countOverlapping(@Param("equipmentId") Long equipmentId,
                          @Param("start") LocalDate start,
                          @Param("end") LocalDate end,
                          @Param("statuses") Collection<BookingStatus> statuses);
}
