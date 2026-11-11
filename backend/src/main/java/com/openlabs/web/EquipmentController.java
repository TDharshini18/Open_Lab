package com.openlabs.web;

import com.openlabs.dto.Dtos.*;
import com.openlabs.service.EquipmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {
    private final EquipmentService service;

    public EquipmentController(EquipmentService service) { this.service = service; }

    /** Companies browse equipment from approved colleges. */
    @GetMapping
    public List<EquipmentView> browse(@AuthenticationPrincipal Long userId,
                                      @RequestParam(required = false) String category) {
        return service.browse(userId, category);
    }

    /** A college's own equipment. */
    @GetMapping("/mine")
    public List<EquipmentView> mine(@AuthenticationPrincipal Long userId) {
        return service.listMine(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EquipmentView create(@AuthenticationPrincipal Long userId, @Valid @RequestBody EquipmentRequest r) {
        return service.create(userId, r);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        service.delete(userId, id);
    }

    @GetMapping("/{id}/unavailable")
    public List<UnavailableView> unavailable(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        return service.listUnavailable(userId, id);
    }

    @PostMapping("/{id}/unavailable")
    @ResponseStatus(HttpStatus.CREATED)
    public UnavailableView addUnavailable(@AuthenticationPrincipal Long userId, @PathVariable Long id,
                                          @Valid @RequestBody UnavailableRequest r) {
        return service.addUnavailable(userId, id, r);
    }

    @GetMapping("/{id}/availability")
    public AvailabilityView availability(@AuthenticationPrincipal Long userId, @PathVariable Long id,
                                         @RequestParam LocalDate from, @RequestParam LocalDate to) {
        return service.availability(userId, id, from, to);
    }
}
