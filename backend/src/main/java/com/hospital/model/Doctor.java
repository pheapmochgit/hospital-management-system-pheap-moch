package com.hospital.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "department_id")
    private Long departmentId;
    
    @Column(nullable = false)
    private String qualification;
    
    @Column(nullable = false)
    private Integer experience;
    
    @Column(nullable = false)
    private Double consultationFee;
    
    @Transient
    private String name;
    
    @Transient
    private String departmentName;

    @Transient
    private String email;

    @Transient
    private String phone;
}
