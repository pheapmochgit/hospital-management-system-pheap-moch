package com.hospital.service;

import com.hospital.model.Department;
import com.hospital.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }
    
    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id).orElse(null);
    }
    
    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }
    
    public Department updateDepartment(Long id, Department department) {
        department.setId(id);
        return departmentRepository.save(department);
    }
    
    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }
    
    public long getTotalDepartments() {
        return departmentRepository.count();
    }
}
