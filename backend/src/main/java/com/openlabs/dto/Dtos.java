package com.openlabs.dto;

import com.openlabs.domain.OrgType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Request and response shapes. The API never exposes JPA entities directly. */
public final class Dtos {
    private Dtos() {}

    // ---------- auth ----------
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record RegisterOrgRequest(
            @NotBlank String orgName,
            @NotNull OrgType orgType,
            @NotBlank String contactName,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8) String password) {}

    public record CreateAdminRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8) String password) {}

    public record UserView(Long id, String name, String email, String role,
                           Long organizationId, String organizationName, String organizationType) {}

    public record LoginResponse(String token, UserView user) {}

    public record MessageResponse(String message) {}

    // ---------- organizations ----------
    public record OrganizationView(Long id, String name, String type, String status, LocalDateTime createdAt) {}

    // ---------- equipment ----------
    public record EquipmentRequest(
            @NotBlank String name,
            @NotBlank String category,
            String description,
            String location,
            @NotNull @DecimalMin("0.0") BigDecimal ratePerDay) {}

    public record EquipmentView(Long id, String assetCode, String name, String category, String description,
                                String location, BigDecimal ratePerDay, Long organizationId, String organizationName) {}

    public record UnavailableRequest(@NotNull LocalDate startDate, @NotNull LocalDate endDate, String reason) {}

    public record UnavailableView(Long id, LocalDate startDate, LocalDate endDate, String reason) {}

    public record AvailabilityView(boolean available, String message) {}

    // ---------- bookings ----------
    public record BookingRequest(@NotNull Long equipmentId, @NotNull LocalDate startDate, @NotNull LocalDate endDate) {}

    public record BookingView(Long id, Long equipmentId, String equipmentName, String assetCode,
                              String requesterName, String requesterOrganization,
                              LocalDate startDate, LocalDate endDate, BigDecimal totalCost, String status) {}
}
