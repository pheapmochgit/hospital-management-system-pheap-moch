package com.hospital.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "date_of_birth", nullable = false, length = 20)
    private String dateOfBirth;
    
    @Column(nullable = false, length = 20)
    private String gender;
    
    @Column(name = "blood_group", nullable = false, length = 10)
    private String bloodGroup;

    @Column(length = 255)
    private String allergies;

    @Column(name = "medical_history", length = 1024)
    private String medicalHistory;

    @Column(name = "chronic_conditions", length = 512)
    private String chronicConditions;
    
    @Column(name = "created_at")
    private String createdAt;
    
    @Transient
    private String name;
    
    @Transient
    private String email;
    
    @Transient
    private String phone;
}
