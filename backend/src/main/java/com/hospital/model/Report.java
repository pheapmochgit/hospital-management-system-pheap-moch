package com.hospital.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "patient_id", nullable = false)
    private Long patientId;
    
    @Column(nullable = false)
    private String reportType; // MRI, ECG, X_RAY, BLOOD_TEST, ULTRASOUND
    
    @Column(columnDefinition = "LONGTEXT")
    private String description;
    
    @Column(nullable = false)
    private String date;
    
    @Column(columnDefinition = "LONGTEXT")
    private String fileContent; // Store as text or file path
    
    @Transient
    private String patientName;
}
