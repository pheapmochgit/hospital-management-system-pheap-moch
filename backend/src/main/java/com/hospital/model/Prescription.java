package com.hospital.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private String medication;

    @Column(nullable = false)
    private String dosage;

    @Lob
    @Column
    private String instructions;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String status; // ACTIVE, COMPLETED, CANCELLED

    @Transient
    private String patientName;

    @Transient
    private String doctorName;
}
