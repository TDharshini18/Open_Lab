package com.openlabs.config;

import com.openlabs.domain.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Demo data for the first start. Accounts (password: password123):
 *   admin@openlabs.local            ADMIN
 *   contact.riverside@openlabs.local ORG_CONTACT, approved college
 *   contact.hilltop@openlabs.local   ORG_CONTACT, approved college
 *   buyer@nova.local                 MEMBER, approved company
 *   contact.greenfield@openlabs.local ORG_CONTACT, PENDING college (test the approval flow)
 */
@Component
public class DataSeeder implements CommandLineRunner {
    private final OrganizationRepository orgs;
    private final UserRepository users;
    private final EquipmentRepository equipment;
    private final PasswordEncoder encoder;

    public DataSeeder(OrganizationRepository orgs, UserRepository users,
                      EquipmentRepository equipment, PasswordEncoder encoder) {
        this.orgs = orgs;
        this.users = users;
        this.equipment = equipment;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (users.count() > 0) return;

        Organization riverside = orgs.save(approved("Riverside Institute of Technology", OrgType.COLLEGE));
        Organization hilltop = orgs.save(approved("Hilltop Science College", OrgType.COLLEGE));
        Organization nova = orgs.save(approved("Nova Electronics Pvt Ltd", OrgType.COMPANY));
        orgs.save(new Organization("Greenfield College", OrgType.COLLEGE));   // stays PENDING

        users.save(person("Platform Admin", "admin@openlabs.local", Role.ADMIN, null));
        users.save(person("Riverside Contact", "contact.riverside@openlabs.local", Role.ORG_CONTACT, riverside));
        users.save(person("Hilltop Contact", "contact.hilltop@openlabs.local", Role.ORG_CONTACT, hilltop));
        users.save(person("Nova Buyer", "buyer@nova.local", Role.MEMBER, nova));
        users.save(person("Greenfield Contact", "contact.greenfield@openlabs.local", Role.ORG_CONTACT,
                orgs.findByStatusOrderByCreatedAtAsc(OrgStatus.PENDING).get(0)));

        equipment.save(item("Digital Oscilloscope 100MHz", "Measurement", "Four-channel scope",
                "Electronics Lab E-101", "150.00", riverside));
        equipment.save(item("Arduino Uno Kit (x10)", "Microcontroller", "Starter kits with sensors",
                "Electronics Lab E-102", "50.00", riverside));
        equipment.save(item("Prusa i3 3D Printer", "Fabrication", "PLA and PETG capable",
                "Mechanical Workshop M-01", "400.00", hilltop));
    }

    private Organization approved(String name, OrgType type) {
        Organization o = new Organization(name, type);
        o.approve();
        return o;
    }

    private User person(String name, String email, Role role, Organization org) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPasswordHash(encoder.encode("password123"));
        u.setRole(role);
        u.setOrganization(org);
        return u;
    }

    private Equipment item(String name, String category, String description,
                           String location, String rate, Organization org) {
        Equipment e = new Equipment();
        e.setAssetCode("LAB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        e.setName(name);
        e.setCategory(category);
        e.setDescription(description);
        e.setLocation(location);
        e.setRatePerDay(new BigDecimal(rate));
        e.setOrganization(org);
        return e;
    }
}
