package com.hospital.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hospital.model.Department;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.model.User;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PrescriptionRepository;
import com.hospital.repository.ReportRepository;
import com.hospital.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 
     * 
     * @param email - User email
     * @param password 
     * @return 
     */
    public User login(String email, String password) {

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String storedPassword = user.getPassword();

            if (storedPassword == null || storedPassword.isBlank()) {
                return null;
            }

            boolean passwordMatches = false;

            if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
                try {
                    passwordMatches = passwordEncoder.matches(password, storedPassword);
                } catch (IllegalArgumentException ex) {
                    passwordMatches = false;
                }
            } else {
                passwordMatches = storedPassword.equals(password);
            }

            if (passwordMatches) {
                user.setRole(normalizeRole(user.getRole()));
                if (!storedPassword.startsWith("$2") && !storedPassword.equals(password)) {
                    user.setPassword(passwordEncoder.encode(password));
                    userRepository.save(user);
                }
                return user;
            }
        }

        return null;
    }

    /**
     * Admin login with encrypted password validation
     * 
     * @param email - Admin email
     * @param password -
     * @return U
     */
    public User adminLogin(String email, String password) {

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String userRole = normalizeRole(user.getRole());
            
            // Only allow ADMIN role
            if (!"ADMIN".equals(userRole)) {
                return null;
            }
            
            String storedPassword = user.getPassword();

            if (storedPassword == null || storedPassword.isBlank()) {
                return null;
            }

            boolean passwordMatches = false;

            if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
                try {
                    passwordMatches = passwordEncoder.matches(password, storedPassword);
                } catch (IllegalArgumentException ex) {
                    passwordMatches = false;
                }
            } else {
                passwordMatches = storedPassword.equals(password);
            }

            if (passwordMatches) {
                user.setRole(normalizeRole(user.getRole()));
                if (!storedPassword.startsWith("$2") && !storedPassword.equals(password)) {
                    user.setPassword(passwordEncoder.encode(password));
                    userRepository.save(user);
                }
                return user;
            }
        }

        return null;
    }

    /**
     * Register new user with encrypted password
     * 
     * @param user -
     * @return Saved user if successful, null if email already exists or invalid role
     */
    public User register(User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return null; // email already exists
        }

        String requestedRole = normalizeRole(user.getRole());
        
        // Only allow PATIENT and DOCTOR roles for registration
        if ("ADMIN".equals(requestedRole)) {
            return null; // Admin registration not allowed
        }
        
        user.setRole(requestedRole);
        user.setCreatedAt(LocalDateTime.now());

        // Encrypt password before saving to database
        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encryptedPassword);

        User savedUser = userRepository.save(user);
        createProfileForRole(savedUser);
        return savedUser;
    }

    private void createProfileForRole(User user) {
        String role = normalizeRole(user.getRole());

        if ("PATIENT".equals(role)) {
            if (patientRepository.findByUserId(user.getId()).isEmpty()) {
                Patient patient = new Patient();
                patient.setUserId(user.getId());
                patient.setName(user.getFullName());
                patient.setEmail(user.getEmail());
                patient.setPhone(user.getPhone());
                patient.setDateOfBirth(normalizePatientField(user.getDateOfBirth(), "Unknown", 20));
                patient.setGender(normalizePatientField(user.getGender(), "Unknown", 20));
                patient.setBloodGroup(normalizePatientField(user.getBloodGroup(), "Unknown", 10));
                patient.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                patientRepository.save(patient);
            }
        } else if ("DOCTOR".equals(role)) {
            if (doctorRepository.findByUserId(user.getId()).isEmpty()) {
                Doctor doctor = new Doctor();
                doctor.setUserId(user.getId());
                if (user.getDepartment() != null && !user.getDepartment().isBlank()) {
                    String departmentName = user.getDepartment().trim();
                    Department savedDepartment = departmentRepository.findByName(departmentName)
                            .orElseGet(() -> {
                                Department department = new Department();
                                department.setName(departmentName);
                                department.setDescription("Registered via doctor signup");
                                return departmentRepository.save(department);
                            });
                    doctor.setDepartmentId(savedDepartment.getId());
                } else {
                    doctor.setDepartmentId(null);
                }
                doctor.setQualification(user.getQualification() != null && !user.getQualification().isBlank() ? user.getQualification() : "General Physician");
                doctor.setExperience(user.getExperience() != null ? user.getExperience() : 0);
                doctor.setConsultationFee(user.getConsultationFee() != null ? user.getConsultationFee() : 0.0);
                doctor.setName(user.getFullName());
                doctor.setEmail(user.getEmail());
                doctor.setPhone(user.getPhone());
                doctorRepository.save(doctor);
            }
        }
    }

    private String normalizePatientField(String value, String fallback, int maxLength) {
        if (value == null) {
            return fallback;
        }

        String trimmed = value.trim();
        if (trimmed.isBlank() || trimmed.equalsIgnoreCase("Not provided")) {
            return fallback;
        }

        if (trimmed.length() > maxLength) {
            return trimmed.substring(0, maxLength);
        }

        return trimmed;
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "PATIENT";
        }

        String normalized = role.trim().toUpperCase().replace("ROLE_", "");
        String[] candidates = normalized.split("[,;|\\s]+");
        for (String candidate : candidates) {
            if (List.of("PATIENT", "DOCTOR", "ADMIN").contains(candidate)) {
                return candidate;
            }
        }

        return "PATIENT";
    }

    /**
     * Get user by ID
     * @param id - User ID
     * @return User object if found, null otherwise
     */
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User updateUser(Long id, User user) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setFullName(user.getFullName());
                    existing.setEmail(user.getEmail());
                    existing.setPhone(user.getPhone());
                    existing.setAddress(user.getAddress());
                    existing.setDateOfBirth(user.getDateOfBirth());
                    existing.setGender(user.getGender());
                    existing.setBloodGroup(user.getBloodGroup());
                    User savedUser = userRepository.save(existing);

                    if ("PATIENT".equals(normalizeRole(savedUser.getRole()))) {
                        patientRepository.findByUserId(savedUser.getId()).ifPresentOrElse(patient -> {
                            patient.setDateOfBirth(normalizePatientField(savedUser.getDateOfBirth(), "Unknown", 20));
                            patient.setGender(normalizePatientField(savedUser.getGender(), "Unknown", 20));
                            patient.setBloodGroup(normalizePatientField(savedUser.getBloodGroup(), "Unknown", 10));
                            patientRepository.save(patient);
                        }, () -> {
                            Patient patient = new Patient();
                            patient.setUserId(savedUser.getId());
                            patient.setName(savedUser.getFullName());
                            patient.setEmail(savedUser.getEmail());
                            patient.setPhone(savedUser.getPhone());
                            patient.setDateOfBirth(normalizePatientField(savedUser.getDateOfBirth(), "Unknown", 20));
                            patient.setGender(normalizePatientField(savedUser.getGender(), "Unknown", 20));
                            patient.setBloodGroup(normalizePatientField(savedUser.getBloodGroup(), "Unknown", 10));
                            patient.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                            patientRepository.save(patient);
                        });
                    }

                    return savedUser;
                })
                .orElse(null);
    }

    /**
     * Get all users
     * @return List of all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get total user count, including admin users.
     * @return Total number of users
     */
    public long getTotalUsers() {
        return userRepository.count();
    }

    /**
     * Delete user rows with role DOCTOR that have no corresponding doctors profile.
     * @return list of deleted user ids
     */
    @Transactional
    public List<Long> deleteOrphanDoctorUsers() {
        List<User> orphans = userRepository.findAll().stream()
                .filter(u -> "DOCTOR".equals(normalizeRole(u.getRole())))
                .filter(u -> doctorRepository.findByUserId(u.getId()).isEmpty())
                .toList();

        List<Long> deletedIds = orphans.stream().map(User::getId).toList();
        orphans.forEach(userRepository::delete);
        return deletedIds;
    }

    @Transactional
    public void resetAllNonAdminData() {
        appointmentRepository.deleteAll();
        reportRepository.deleteAll();
        prescriptionRepository.deleteAll();
        patientRepository.deleteAll();
        doctorRepository.deleteAll();

        userRepository.findAll().stream()
                .filter(user -> !"ADMIN".equals(normalizeRole(user.getRole())))
                .forEach(userRepository::delete);

        resetAutoIncrementSequences();
        ensureSingleAdminExists();
    }

    private void resetAutoIncrementSequences() {
        jdbcTemplate.execute("ALTER TABLE appointments AUTO_INCREMENT = 1");
        jdbcTemplate.execute("ALTER TABLE reports AUTO_INCREMENT = 1");
        jdbcTemplate.execute("ALTER TABLE prescriptions AUTO_INCREMENT = 1");
        jdbcTemplate.execute("ALTER TABLE patients AUTO_INCREMENT = 1");
        jdbcTemplate.execute("ALTER TABLE doctors AUTO_INCREMENT = 1");
        jdbcTemplate.execute("ALTER TABLE users AUTO_INCREMENT = 1");
    }

    private void ensureSingleAdminExists() {
        List<User> admins = userRepository.findAll().stream()
                .filter(user -> "ADMIN".equals(normalizeRole(user.getRole())))
                .toList();

        if (admins.isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@hospital.com");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setFullName("Admin User");
            admin.setRole("ADMIN");
            admin.setPhone("0123456789");
            admin.setAddress("123 Hospital Road");
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            return;
        }

        User primaryAdmin = admins.stream()
                .filter(admin -> "admin@hospital.com".equalsIgnoreCase(admin.getEmail()))
                .findFirst()
                .orElse(admins.get(0));

        admins.stream()
                .filter(admin -> !admin.getId().equals(primaryAdmin.getId()))
                .forEach(userRepository::delete);
    }
}