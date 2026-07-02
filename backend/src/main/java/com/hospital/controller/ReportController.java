package com.hospital.controller;

import com.hospital.model.Report;
import com.hospital.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getReportCount() {
        return ResponseEntity.ok(reportService.getTotalReports());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getReportById(@PathVariable Long id) {
        Report report = reportService.getReportById(id);
        if (report != null) {
            return ResponseEntity.ok(report);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody Report report) {
        return ResponseEntity.ok(reportService.createReport(report));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Report> updateReport(@PathVariable Long id, @RequestBody Report report) {
        return ResponseEntity.ok(reportService.updateReport(id, report));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Report>> getReportsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(reportService.getReportsByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Report>> getReportsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(reportService.getReportsByDoctor(doctorId));
    }
}
