package com.openlabs.web;

import com.openlabs.dto.Dtos.*;
import com.openlabs.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService service;

    public BookingController(BookingService service) { this.service = service; }

    /** Company members send a request. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingView request(@AuthenticationPrincipal Long userId, @Valid @RequestBody BookingRequest r) {
        return service.request(userId, r);
    }

    /** The requester's own requests. */
    @GetMapping("/mine")
    public List<BookingView> mine(@AuthenticationPrincipal Long userId) {
        return service.mine(userId);
    }

    /** Requests waiting for the college contact. */
    @GetMapping("/incoming")
    public List<BookingView> incoming(@AuthenticationPrincipal Long userId) {
        return service.incoming(userId);
    }

    @PatchMapping("/{id}/approve")
    public BookingView approve(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        return service.decide(userId, id, true);
    }

    @PatchMapping("/{id}/reject")
    public BookingView reject(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        return service.decide(userId, id, false);
    }

    @PatchMapping("/{id}/cancel")
    public BookingView cancel(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        return service.cancel(userId, id);
    }
}
