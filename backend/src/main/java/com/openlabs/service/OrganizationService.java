package com.openlabs.service;

import com.openlabs.common.ApiException;
import com.openlabs.domain.*;
import com.openlabs.dto.Dtos.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Admin-only work: approving colleges and companies, and creating other admins. */
@Service
public class OrganizationService {
    private final OrganizationRepository orgs;
    private final UserRepository users;
    private final PasswordEncoder encoder;

    public OrganizationService(OrganizationRepository orgs, UserRepository users, PasswordEncoder encoder) {
        this.orgs = orgs;
        this.users = users;
        this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    public List<OrganizationView> list(Long adminId, OrgStatus status) {
        Access.requireAdmin(users, adminId);
        return orgs.findByStatusOrderByCreatedAtAsc(status).stream()
                .map(OrganizationService::toView)
                .toList();
    }

    @Transactional
    public OrganizationView approve(Long adminId, Long orgId) {
        Access.requireAdmin(users, adminId);
        Organization org = find(orgId);
        org.approve();   // managed entity: saved at commit
        return toView(org);
    }

    @Transactional
    public OrganizationView reject(Long adminId, Long orgId) {
        Access.requireAdmin(users, adminId);
        Organization org = find(orgId);
        org.reject();
        return toView(org);
    }

    @Transactional
    public MessageResponse createAdmin(Long adminId, CreateAdminRequest r) {
        Access.requireAdmin(users, adminId);
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw ApiException.conflict("Email already registered");
        }
        User admin = new User();
        admin.setName(r.name().trim());
        admin.setEmail(email);
        admin.setPasswordHash(encoder.encode(r.password()));
        admin.setRole(Role.ADMIN);
        users.save(admin);
        return new MessageResponse("Admin created");
    }

    private Organization find(Long id) {
        return orgs.findById(id).orElseThrow(() -> ApiException.notFound("Organization not found"));
    }

    static OrganizationView toView(Organization o) {
        return new OrganizationView(o.getId(), o.getName(), o.getType().name(),
                o.getStatus().name(), o.getCreatedAt());
    }
}
