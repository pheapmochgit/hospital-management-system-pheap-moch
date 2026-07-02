package com.hospital.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hospital.model.Prescription;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PrescriptionRepository;
import com.hospital.repository.UserRepository;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Prescription> getAllPrescriptions() {
        List<Prescription> prescriptions = prescriptionRepository.findAll();
        prescriptions.forEach(this::enrichPrescription);
        return prescriptions;
    }

    public Prescription getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id).orElse(null);
        if (prescription != null) {
            enrichPrescription(prescription);
        }
        return prescription;
    }

    public Prescription createPrescription(Prescription prescription) {
        return prescriptionRepository.save(prescription);
    }

    public Prescription updatePrescription(Long id, Prescription prescription) {
        prescription.setId(id);
        return prescriptionRepository.save(prescription);
    }

    public void deletePrescription(Long id) {
        prescriptionRepository.deleteById(id);
    }

    public List<Prescription> getPrescriptionsByPatient(Long patientId) {
        List<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId);
        prescriptions.forEach(this::enrichPrescription);
        return prescriptions;
    }

    public List<Prescription> getPrescriptionsByDoctor(Long doctorId) {
        List<Prescription> prescriptions = prescriptionRepository.findByDoctorId(doctorId);
        prescriptions.forEach(this::enrichPrescription);
        return prescriptions;
    }

    public long getTotalPrescriptions() {
        return prescriptionRepository.count();
    }

    private void enrichPrescription(Prescription prescription) {
        if (prescription.getPatientId() != null) {
            patientRepository.findById(prescription.getPatientId()).ifPresent(patient -> {
                if (patient.getUserId() != null) {
                    userRepository.findById(patient.getUserId()).ifPresent(user ->
                        prescription.setPatientName(user.getFullName())
                    );
                }
            });
        }

        if (prescription.getDoctorId() != null) {
            doctorRepository.findById(prescription.getDoctorId()).ifPresent(doctor -> {
                if (doctor.getUserId() != null) {
                    userRepository.findById(doctor.getUserId()).ifPresent(user ->
                        prescription.setDoctorName(user.getFullName())
                    );
                }
            });
        }
    }
}
