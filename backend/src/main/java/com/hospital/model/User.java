package com.hospital.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String role; // ADMIN, DOCTOR, PATIENT

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String address;

    private String dateOfBirth;

    private String gender;

    private String bloodGroup;

    @Transient
    private String qualification;

    @Transient
    private String department;

    @Transient
    private Integer experience;

    @Transient
    private Double consultationFee;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}