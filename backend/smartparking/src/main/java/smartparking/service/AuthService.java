
package smartparking.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import smartparking.dto.AdminSetupRequest;
import smartparking.dto.AuthResponse;
import smartparking.dto.LoginRequest;
import smartparking.dto.RegisterRequest;
import smartparking.entity.User;
import smartparking.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${admin.setup-secret}")
    private String adminSetupSecret;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // Customer Registration
    public AuthResponse register(RegisterRequest request) {

        if (request.getName() == null || request.getName().isBlank()
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {

            throw new IllegalArgumentException("All fields are required");
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered");
        }

        String encryptedPassword =
                passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getName().trim(),
                email,
                encryptedPassword,
                "CUSTOMER"
        );

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole()
        );

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                "Registration successful",
                token
        );
    }

    // Customer Login
    public AuthResponse login(LoginRequest request) {
        return authenticate(request, "CUSTOMER");
    }

    // Admin Login
    public AuthResponse loginAdmin(LoginRequest request) {
        return authenticate(request, "ADMIN");
    }

    // Common Authentication Method
    private AuthResponse authenticate(
            LoginRequest request,
            String requiredRole) {

        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException(
                    "Email and password are required");
        }

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(), user.getPassword())) {

            throw new RuntimeException("Invalid email or password");
        }

        if (!requiredRole.equals(user.getRole())) {
            throw new RuntimeException(
                    "You are not authorized to access this login.");
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole()
        );

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                "Login successful",
                token
        );
    }

    // Secure First-Time Admin Registration
    public AuthResponse registerFirstAdmin(AdminSetupRequest request) {

        if (request.getName() == null || request.getName().isBlank()
              || request.getEmail() == null || request.getEmail().isBlank()
              || request.getPassword() == null || request.getPassword().isBlank()
              || request.getSetupSecret() == null) {

            throw new IllegalArgumentException("All fields are required");
        }

        boolean secretMatches = MessageDigest.isEqual(
              adminSetupSecret.getBytes(StandardCharsets.UTF_8),
              request.getSetupSecret().getBytes(StandardCharsets.UTF_8)
        );

        if (!secretMatches) {
           throw new RuntimeException("Invalid admin setup secret");
        }

        if (userRepository.existsByRole("ADMIN")) {
          throw new RuntimeException("Admin account already exists");
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
           throw new RuntimeException("Email is already registered");
        }

        String encryptedPassword = passwordEncoder.encode(request.getPassword());

        User admin = new User(
            request.getName().trim(),
            email,
            encryptedPassword,
            "ADMIN"
        );

        User savedAdmin = userRepository.save(admin);

        String token = jwtService.generateToken(
            savedAdmin.getId(),
            savedAdmin.getEmail(),
            savedAdmin.getRole()
        );

        return new AuthResponse(
            savedAdmin.getId(),
            savedAdmin.getName(),
            savedAdmin.getEmail(),
            savedAdmin.getRole(),
            "Admin account created successfully",
            token
        );
    }
}
