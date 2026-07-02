package com.hospital.controller;

import com.hospital.model.User;
import com.hospital.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User request) {

        User user = authService.login(request.getEmail(), request.getPassword());

        if (user != null) {
            // Remove password before sending to frontend
            user.setPassword(null);
            return ResponseEntity.ok(user);
        }

        Map<String, String> error = new HashMap<>();
        error.put("message", "Invalid email or password");

        return ResponseEntity.status(401).body(error);
    }

    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@RequestBody User request) {

        User user = authService.adminLogin(request.getEmail(), request.getPassword());

        if (user != null) {
            // Remove password before sending to frontend
            user.setPassword(null);
            return ResponseEntity.ok(user);
        }

        Map<String, String> error = new HashMap<>();
        error.put("message", "Invalid admin credentials");

        return ResponseEntity.status(401).body(error);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        
        // ✅ FIXED: Validate that only PATIENT and DOCTOR roles are allowed for registration
        String role = user.getRole();
        if (role != null && role.trim().toUpperCase().equals("ADMIN")) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Admin registration not allowed. Please use admin login instead.");
            return ResponseEntity.status(400).body(error);
        }

        User saved = authService.register(user);

        if (saved != null) {
            // Remove password before sending to frontend
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        }

        Map<String, String> error = new HashMap<>();
        error.put("message", "Email already exists");

        return ResponseEntity.status(400).body(error);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {

        User user = authService.getUserById(id);

        if (user != null) {
            return ResponseEntity.ok(user);
        }

        return ResponseEntity.notFound().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUserCount() {
        return ResponseEntity.ok(authService.getTotalUsers());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<com.hospital.model.User> users = authService.getAllUsers();
        List<Map<String, Object>> out = users.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("email", u.getEmail());
            m.put("role", u.getRole());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(out);
    }

    @PostMapping("/cleanup-orphans")
    public ResponseEntity<Map<String, Object>> cleanupOrphanDoctorUsers() {
        List<Long> deleted = authService.deleteOrphanDoctorUsers();
        Map<String, Object> resp = new HashMap<>();
        resp.put("deletedCount", deleted.size());
        resp.put("deletedIds", deleted);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetData() {
        authService.resetAllNonAdminData();
        return ResponseEntity.ok().body("Application data has been reset.");
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updated = authService.updateUser(id, user);

        if (updated != null) {
            updated.setPassword(null);
            return ResponseEntity.ok(updated);
        }

        return ResponseEntity.notFound().build();
    }
}