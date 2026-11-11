package com.openlabs.web;

import com.openlabs.domain.OrgStatus;
import com.openlabs.dto.Dtos.*;
import com.openlabs.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Admin endpoints. Access is also enforced in SecurityConfig and in the service layer. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final OrganizationService service;

    public AdminController(OrganizationService service) { this.service = service; }

    @GetMapping("/organizations")
    public List<OrganizationView> list(@AuthenticationPrincipal Long userId,
                                       @RequestParam(defaultValue = "PENDING") OrgStatus status) {
        return service.list(userId, status);
    }

    @PatchMapping("/organizations/{id}/approve")
    public OrganizationView approve(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        return service.approve(userId, id);
    }

    @PatchMapping("/organizations/{id}/reject")
    public OrganizationView reject(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        return service.reject(userId, id);
    }

    @PostMapping("/admins")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse createAdmin(@AuthenticationPrincipal Long userId,
                                       @Valid @RequestBody CreateAdminRequest r) {
        return service.createAdmin(userId, r);
    }
}
