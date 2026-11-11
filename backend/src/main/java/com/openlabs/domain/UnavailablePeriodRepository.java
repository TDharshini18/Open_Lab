package com.openlabs.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface UnavailablePeriodRepository extends JpaRepository<UnavailablePeriod, Long> {

    List<UnavailablePeriod> findByEquipmentIdOrderByStartDateAsc(Long equipmentId);

    @Query("select count(u) from UnavailablePeriod u where u.equipment.id = :equipmentId "
         + "and u.startDate <= :end and u.endDate >= :start")
    long countOverlapping(@Param("equipmentId") Long equipmentId,
                          @Param("start") LocalDate start,
                          @Param("end") LocalDate end);
}
