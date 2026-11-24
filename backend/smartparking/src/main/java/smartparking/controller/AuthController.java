
package smartparking.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import smartparking.dto.AdminSetupRequest;
import smartparking.dto.AuthResponse;
import smartparking.dto.LoginRequest;
import smartparking.dto.RegisterRequest;
import smartparking.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Customer Registration
    @PostMapping("/signup")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    // Customer Login
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // Admin Login
    @PostMapping("/admin/login")
    public AuthResponse adminLogin(@RequestBody LoginRequest request) {
        return authService.loginAdmin(request);
    }

    // First-Time Admin Registration
    @PostMapping("/admin/setup")
    public AuthResponse registerFirstAdmin(
           @RequestBody AdminSetupRequest request) {

        return authService.registerFirstAdmin(request);
    }
}
