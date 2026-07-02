package com.hospital.service;

import com.hospital.model.User;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginShouldAcceptPlainTextPasswordForExistingUsers() {
        User user = new User();
        user.setEmail("existing@hospital.com");
        user.setPassword("plain-password");
        user.setRole("PATIENT");
        user.setFullName("Existing User");

        when(userRepository.findByEmail("existing@hospital.com")).thenReturn(Optional.of(user));

        User result = authService.login("existing@hospital.com", "plain-password");

        assertNotNull(result);
        assertEquals("existing@hospital.com", result.getEmail());
    }

    @Test
    void registerShouldCreatePatientProfileForPatientUsers() {
        User user = new User();
        user.setEmail("new-patient@hospital.com");
        user.setPassword("plain-password");
        user.setRole("PATIENT");
        user.setFullName("New Patient");
        user.setPhone("0123456789");
        user.setAddress("Some address");

        when(userRepository.findByEmail("new-patient@hospital.com")).thenReturn(Optional.empty());
        when(userRepository.save(org.mockito.ArgumentMatchers.any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(10L);
            return savedUser;
        });

        User result = authService.register(user);

        assertNotNull(result);
        assertEquals("PATIENT", result.getRole());
    }
}
