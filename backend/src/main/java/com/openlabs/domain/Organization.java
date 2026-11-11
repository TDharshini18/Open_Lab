package com.openlabs.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** A college or a company that uses the platform. Starts as PENDING until an admin approves it. */
@Entity
@Table(name = "organizations")
@Getter
@NoArgsConstructor
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrgType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrgStatus status = OrgStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Organization(String name, OrgType type) {
        this.name = name;
        this.type = type;
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    /** Domain rule: only approved organizations can sign in and trade equipment. */
    public boolean isApproved() {
        return status == OrgStatus.APPROVED;
    }

    public void approve() {
        this.status = OrgStatus.APPROVED;
    }

    public void reject() {
        this.status = OrgStatus.REJECTED;
    }
}
