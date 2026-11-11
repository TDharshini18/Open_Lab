package com.openlabs.web;

import com.openlabs.dto.Dtos.*;
import com.openlabs.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;

    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/register-org")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse registerOrg(@Valid @RequestBody RegisterOrgRequest r) {
        return auth.registerOrg(r);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest r) {
        return auth.login(r);
    }
}
