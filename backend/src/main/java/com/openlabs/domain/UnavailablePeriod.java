package com.openlabs.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** A date range when a college has marked an item as unusable (maintenance, repairs, etc.). */
@Entity
@Table(name = "unavailable_periods")
@Getter @NoArgsConstructor
public class UnavailablePeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String reason = "";

    public UnavailablePeriod(Equipment equipment, LocalDate startDate, LocalDate endDate, String reason) {
        this.equipment = equipment;
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason == null ? "" : reason;
    }
}
