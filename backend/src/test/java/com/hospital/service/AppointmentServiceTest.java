package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AppointmentService appointmentService;

    @Test
    void createAppointmentShouldUsePatientRecordIdWhenProvidedUserId() {
        Appointment appointment = new Appointment();
        appointment.setPatientId(4L);
        appointment.setDoctorId(1L);
        appointment.setDate("2026-06-30");
        appointment.setTime("10:00");
        appointment.setReason("Checkup");
        appointment.setStatus("PENDING");

        Patient patientRecord = new Patient();
        patientRecord.setId(1L);
        patientRecord.setUserId(4L);

        Doctor doctor = new Doctor();
        doctor.setId(1L);

        when(patientRepository.findById(4L)).thenReturn(Optional.empty());
        when(patientRepository.findByUserId(4L)).thenReturn(Optional.of(patientRecord));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Appointment saved = appointmentService.createAppointment(appointment);

        ArgumentCaptor<Appointment> appointmentCaptor = ArgumentCaptor.forClass(Appointment.class);
        verify(appointmentRepository).save(appointmentCaptor.capture());

        assertEquals(1L, appointmentCaptor.getValue().getPatientId());
        assertEquals("PENDING", saved.getStatus());
    }
}
