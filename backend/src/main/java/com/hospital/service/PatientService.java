package com.hospital.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hospital.model.Patient;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;

@Service
public class PatientService {
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Patient> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();
        patients.forEach(this::enrichPatient);
        return patients;
    }
    
    public Patient getPatientById(Long id) {
        Patient patient = patientRepository.findById(id).orElse(null);
        if (patient != null) {
            enrichPatient(patient);
        }
        return patient;
    }
    
    public Patient createPatient(Patient patient) {
        patient.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        return patientRepository.save(patient);
    }
    
    public Patient updatePatient(Long id, Patient patient) {
        patient.setId(id);
        return patientRepository.save(patient);
    }
    
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
    
    public long getTotalPatients() {
        return patientRepository.count();
    }
    
    public Patient getPatientByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId).orElse(null);
        if (patient != null) {
            enrichPatient(patient);
        }
        return patient;
    }

    private void enrichPatient(Patient patient) {
        if (patient.getUserId() != null) {
            userRepository.findById(patient.getUserId()).ifPresent(user -> {
                patient.setName(user.getFullName());
                patient.setEmail(user.getEmail());
                patient.setPhone(user.getPhone());

                if (user.getDateOfBirth() != null && !user.getDateOfBirth().isBlank()) {
                    patient.setDateOfBirth(user.getDateOfBirth());
                }
                if (user.getGender() != null && !user.getGender().isBlank()) {
                    patient.setGender(user.getGender());
                }
                if (user.getBloodGroup() != null && !user.getBloodGroup().isBlank()) {
                    patient.setBloodGroup(user.getBloodGroup());
                }
            });
        }
    }
}
