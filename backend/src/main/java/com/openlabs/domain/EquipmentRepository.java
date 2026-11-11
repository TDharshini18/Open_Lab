package com.openlabs.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByOrganizationIdOrderByNameAsc(Long organizationId);

    /** Everything a company can browse: equipment from approved colleges only. */
    List<Equipment> findByOrganizationTypeAndOrganizationStatusOrderByNameAsc(OrgType type, OrgStatus status);
}
