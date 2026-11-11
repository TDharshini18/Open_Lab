package com.openlabs.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    boolean existsByName(String name);

    List<Organization> findByStatusOrderByCreatedAtAsc(OrgStatus status);

    List<Organization> findByTypeAndStatusOrderByNameAsc(OrgType type, OrgStatus status);
}
