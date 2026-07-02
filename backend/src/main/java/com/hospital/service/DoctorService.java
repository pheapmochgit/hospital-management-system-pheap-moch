package com.hospital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.hospital.model.Department;
import com.hospital.model.Doctor;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.hospital.model.User;

@Service
public class DoctorService {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(DoctorService.class);

    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    public List<Doctor> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        doctors.forEach(this::enrichDoctor);
        return doctors;
    }
    
    public Doctor getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id).orElse(null);
        if (doctor != null) {
            enrichDoctor(doctor);
        }
        return doctor;
    }
    
    public Doctor createDoctor(Doctor doctor) {
        if (doctor.getUserId() == null || userRepository.findById(doctor.getUserId()).isEmpty()) {
            User user = resolveOrCreateUser(doctor);
            doctor.setUserId(user.getId());
            doctor.setName(user.getFullName());
            doctor.setEmail(user.getEmail());
            doctor.setPhone(user.getPhone());
        } else {
            userRepository.findById(doctor.getUserId()).ifPresent(user -> {
                doctor.setName(user.getFullName());
                doctor.setEmail(user.getEmail());
                doctor.setPhone(user.getPhone());
            });
        }

        Doctor saved = doctorRepository.save(doctor);
        enrichDoctor(saved);
        return saved;
    }
    
    public Doctor updateDoctor(Long id, Doctor doctor) {
        // If client supplied a specific userId that is missing, resolve or create a matching user
        if (doctor.getUserId() != null && userRepository.findById(doctor.getUserId()).isEmpty()) {
            User fallbackUser = resolveOrCreateUser(doctor);
            doctor.setUserId(fallbackUser.getId());
        }

        // Load existing and merge non-null fields to avoid overwriting required columns
        Doctor existing = doctorRepository.findById(id).orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (doctor.getUserId() != null) existing.setUserId(doctor.getUserId());
        if (doctor.getQualification() != null) existing.setQualification(doctor.getQualification());
        if (doctor.getExperience() != null) existing.setExperience(doctor.getExperience());
        if (doctor.getConsultationFee() != null) existing.setConsultationFee(doctor.getConsultationFee());
        if (doctor.getPhone() != null) existing.setPhone(doctor.getPhone());
        if (doctor.getName() != null) existing.setName(doctor.getName());
        if (doctor.getEmail() != null) existing.setEmail(doctor.getEmail());

        if (doctor.getDepartmentName() != null) {
            String departmentName = doctor.getDepartmentName().trim();
            if (departmentName.isEmpty()) {
                existing.setDepartmentId(null);
            } else {
                departmentRepository.findByName(departmentName).ifPresentOrElse(
                    dept -> existing.setDepartmentId(dept.getId()),
                    () -> {
                        Department newDepartment = new Department();
                        newDepartment.setName(departmentName);
                        newDepartment.setDescription("Updated via profile");
                        Department saved = departmentRepository.save(newDepartment);
                        existing.setDepartmentId(saved.getId());
                    }
                );
            }
        }

        // Ensure linked user exists (prefer existing user by id or email, otherwise create)
        if (existing.getUserId() == null || userRepository.findById(existing.getUserId()).isEmpty()) {
            User user = resolveOrCreateUser(existing);
            existing.setUserId(user.getId());
            existing.setName(user.getFullName());
            existing.setEmail(user.getEmail());
            existing.setPhone(user.getPhone());
        } else {
            userRepository.findById(existing.getUserId()).ifPresent(user -> {
                existing.setName(user.getFullName());
                existing.setEmail(user.getEmail());
                existing.setPhone(user.getPhone());
            });
        }

        // Ensure required doctor fields are present to satisfy DB constraints
        if (existing.getQualification() == null) existing.setQualification("General");
        if (existing.getExperience() == null) existing.setExperience(0);
        if (existing.getConsultationFee() == null) existing.setConsultationFee(0.0);

        try {
            Doctor saved = doctorRepository.save(existing);
            enrichDoctor(saved);
            return saved;
        } catch (Exception ex) {
            LOGGER.error("Error saving doctor id={} userId={}: {}", existing.getId(), existing.getUserId(), ex.toString(), ex);
            throw ex;
        }
    }

    private User resolveOrCreateUser(Doctor doctor) {
        if (doctor.getUserId() != null) {
            Optional<User> byId = userRepository.findById(doctor.getUserId());
            if (byId.isPresent()) {
                return byId.get();
            }
        }
        if (doctor.getEmail() != null) {
            Optional<User> byEmail = userRepository.findByEmail(doctor.getEmail());
            if (byEmail.isPresent()) {
                return byEmail.get();
            }
        }

        User user = new User();
        String email = doctor.getEmail() != null ? doctor.getEmail() : "doctor" + System.currentTimeMillis() + "@example.com";
        String name = doctor.getName() != null ? doctor.getName() : "Doctor";
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("changeme"));
        user.setFullName(name);
        user.setRole("DOCTOR");
        user.setPhone(doctor.getPhone() != null ? doctor.getPhone() : "0000000000");
        user.setAddress("Auto-created by admin");
        return userRepository.save(user);
    }
    
    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }
    
    public long getTotalDoctors() {
        return doctorRepository.count();
    }

    public Doctor getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId).orElse(null);
        if (doctor != null) {
            enrichDoctor(doctor);
        }
        return doctor;
    }
    
    private void enrichDoctor(Doctor doctor) {
        if (doctor.getUserId() != null) {
            userRepository.findById(doctor.getUserId()).ifPresent(user -> {
                doctor.setName(user.getFullName());
                doctor.setEmail(user.getEmail());
                doctor.setPhone(user.getPhone());
            });
        }
        if (doctor.getDepartmentId() != null) {
            departmentRepository.findById(doctor.getDepartmentId()).ifPresent(dept ->
                doctor.setDepartmentName(dept.getName())
            );
        }
    }
}
