package com.hospital.service;

import com.hospital.model.Report;
import com.hospital.model.Patient;
import com.hospital.model.User;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.ReportRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Report> getAllReports() {
        List<Report> reports = reportRepository.findAll();
        reports.forEach(this::enrichReport);
        return reports;
    }
    
    public Report getReportById(Long id) {
        Report report = reportRepository.findById(id).orElse(null);
        if (report != null) {
            enrichReport(report);
        }
        return report;
    }
    
    public Report createReport(Report report) {
        return reportRepository.save(report);
    }
    
    public Report updateReport(Long id, Report report) {
        report.setId(id);
        return reportRepository.save(report);
    }
    
    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }
    
    public List<Report> getReportsByPatient(Long patientId) {
        List<Report> reports = reportRepository.findByPatientId(patientId);
        reports.forEach(this::enrichReport);
        return reports;
    }

    public List<Report> getReportsByDoctor(Long doctorId) {
        List<Long> patientIds = appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(appointment -> appointment.getPatientId())
                .distinct()
                .collect(Collectors.toList());

        if (patientIds.isEmpty()) {
            return List.of();
        }

        List<Report> reports = reportRepository.findByPatientIdIn(patientIds);
        reports.forEach(this::enrichReport);
        return reports;
    }
    
    public long getTotalReports() {
        return reportRepository.count();
    }
    
    private void enrichReport(Report report) {
        Patient patient = patientRepository.findById(report.getPatientId()).orElse(null);
        if (patient != null && patient.getUserId() != null) {
            User user = userRepository.findById(patient.getUserId()).orElse(null);
            if (user != null) {
                report.setPatientName(user.getFullName());
            }
        }
    }
}
