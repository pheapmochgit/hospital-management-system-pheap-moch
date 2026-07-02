package com.hospital.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "patient_id", nullable = false)
    private Long patientId;
    
    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;
    
    @Column(name = "date", nullable = false)
    private String date;
    
    @Column(name = "time", nullable = false)
    private String time;
    
    @Column(nullable = false)
    private String reason;
    
    @Column(nullable = false)
    private String status; // SCHEDULED, COMPLETED, CANCELLED
    
    @Transient
    private String patientName;
    
    @Transient
    private String doctorName;
}
