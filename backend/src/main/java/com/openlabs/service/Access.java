package com.openlabs.service;

import com.openlabs.common.ApiException;
import com.openlabs.domain.OrgType;
import com.openlabs.domain.Role;
import com.openlabs.domain.User;
import com.openlabs.domain.UserRepository;

/**
 * Permission checks shared by all services. Every rule lives here, so a change
 * to who can do what happens in one place.
 */
public final class Access {
    private Access() {}

    public static User user(UserRepository users, Long id) {
        return users.findById(id)
                .orElseThrow(() -> ApiException.unauthorized("User no longer exists"));
    }

    public static User requireAdmin(UserRepository users, Long id) {
        User u = user(users, id);
        if (u.getRole() != Role.ADMIN) {
            throw ApiException.forbidden("Admins only");
        }
        return u;
    }

    /** The one point of contact of an approved college. */
    public static User requireCollegeContact(UserRepository users, Long id) {
        User u = user(users, id);
        boolean ok = u.getRole() == Role.ORG_CONTACT
                && u.getOrganization() != null
                && u.getOrganization().getType() == OrgType.COLLEGE
                && u.getOrganization().isApproved();
        if (!ok) {
            throw ApiException.forbidden("Only an approved college contact can do this");
        }
        return u;
    }

    /** Any member of an approved company. */
    public static User requireCompanyUser(UserRepository users, Long id) {
        User u = user(users, id);
        boolean ok = u.getOrganization() != null
                && u.getOrganization().getType() == OrgType.COMPANY
                && u.getOrganization().isApproved();
        if (!ok) {
            throw ApiException.forbidden("Only members of an approved company can do this");
        }
        return u;
    }
}
