package com.openlabs.service;

import com.openlabs.common.ApiException;
import com.openlabs.domain.*;
import com.openlabs.dto.Dtos.*;
import com.openlabs.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final OrganizationRepository orgs;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, OrganizationRepository orgs,
                       PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.orgs = orgs;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    /**
     * A college or company registers. Its contact can't sign in until an admin approves it.
     */
    @Transactional
    public MessageResponse registerOrg(RegisterOrgRequest r) {
        String email = normalize(r.email());
        if (users.existsByEmail(email)) {
            throw ApiException.conflict("Email already registered");
        }
        String orgName = r.orgName().trim();
        if (orgs.existsByName(orgName)) {
            throw ApiException.conflict("An organization with this name already exists");
        }

        Organization org = orgs.save(new Organization(orgName, r.orgType()));

        User contact = new User();
        contact.setName(r.contactName().trim());
        contact.setEmail(email);
        contact.setPasswordHash(encoder.encode(r.password()));
        contact.setRole(Role.ORG_CONTACT);
        contact.setOrganization(org);
        users.save(contact);

        return new MessageResponse("Registration received. An admin will review it before you can sign in.");
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest r) {
        User u = users.findByEmail(normalize(r.email()))
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));
        if (!encoder.matches(r.password(), u.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        Organization org = u.getOrganization();
        if (org != null && !org.isApproved()) {
            String msg = org.getStatus() == OrgStatus.REJECTED
                    ? "This registration was not approved"
                    : "Your organization is awaiting admin approval";
            throw ApiException.forbidden(msg);
        }
        return new LoginResponse(jwt.issue(u), toView(u));
    }

    static UserView toView(User u) {
        Organization o = u.getOrganization();
        return new UserView(
                u.getId(), u.getName(), u.getEmail(), u.getRole().name(),
                o == null ? null : o.getId(),
                o == null ? null : o.getName(),
                o == null ? null : o.getType().name());
    }

    static String normalize(String email) {
        return email.trim().toLowerCase();
    }
}
