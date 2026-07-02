package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.Patient;
import com.hospital.model.Doctor;
import com.hospital.model.User;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Appointment> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        appointments.forEach(this::enrichAppointment);
        return appointments;
    }
    
    public Appointment getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id).orElse(null);
        if (appointment != null) {
            enrichAppointment(appointment);
        }
        return appointment;
    }
    
    public Appointment createAppointment(Appointment appointment) {
        Long patientId = resolvePatientId(appointment.getPatientId());
        Long doctorId = resolveDoctorId(appointment.getDoctorId());

        appointment.setPatientId(patientId);
        appointment.setDoctorId(doctorId);
        appointment.setStatus("PENDING");
        return appointmentRepository.save(appointment);
    }
    
    public Appointment updateAppointment(Long id, Appointment appointment) {
        Appointment existingAppointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (appointment.getPatientId() != null) {
            existingAppointment.setPatientId(resolvePatientId(appointment.getPatientId()));
        }
        if (appointment.getDoctorId() != null) {
            existingAppointment.setDoctorId(resolveDoctorId(appointment.getDoctorId()));
        }
        if (appointment.getDate() != null) {
            existingAppointment.setDate(appointment.getDate());
        }
        if (appointment.getTime() != null) {
            existingAppointment.setTime(appointment.getTime());
        }
        if (appointment.getReason() != null) {
            existingAppointment.setReason(appointment.getReason());
        }
        if (appointment.getStatus() != null) {
            existingAppointment.setStatus(appointment.getStatus());
        }

        return appointmentRepository.save(existingAppointment);
    }
    
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
    
    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        appointments.forEach(this::enrichAppointment);
        return appointments;
    }
    
    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
        appointments.forEach(this::enrichAppointment);
        return appointments;
    }
    
    public long getTotalAppointments() {
        return appointmentRepository.count();
    }
    
    private Long resolvePatientId(Long patientId) {
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        if (patientRepository.findById(patientId).isPresent()) {
            return patientId;
        }

        Patient patient = patientRepository.findByUserId(patientId).orElse(null);
        if (patient != null) {
            return patient.getId();
        }

        Patient createdPatient = new Patient();
        createdPatient.setUserId(patientId);
        createdPatient.setDateOfBirth("Unknown");
        createdPatient.setGender("Unknown");
        createdPatient.setBloodGroup("Unknown");
        createdPatient.setCreatedAt(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        Patient savedPatient = patientRepository.save(createdPatient);
        return savedPatient.getId();
    }

    private Long resolveDoctorId(Long doctorId) {
        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID is required");
        }

        if (doctorRepository.findById(doctorId).isPresent()) {
            return doctorId;
        }

        throw new IllegalArgumentException("No doctor record found for the provided doctor ID");
    }

    private void enrichAppointment(Appointment appointment) {
        Patient patient = patientRepository.findById(appointment.getPatientId()).orElse(null);
        if (patient != null && patient.getUserId() != null) {
            User user = userRepository.findById(patient.getUserId()).orElse(null);
            if (user != null) {
                appointment.setPatientName(user.getFullName());
            }
        }
        
        Doctor doctor = doctorRepository.findById(appointment.getDoctorId()).orElse(null);
        if (doctor != null && doctor.getUserId() != null) {
            User user = userRepository.findById(doctor.getUserId()).orElse(null);
            if (user != null) {
                appointment.setDoctorName(user.getFullName());
            }
        }
    }
}
