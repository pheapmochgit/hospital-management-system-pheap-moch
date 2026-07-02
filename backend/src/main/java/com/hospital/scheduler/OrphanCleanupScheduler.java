package com.hospital.scheduler;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.hospital.service.AuthService;

@Component
public class OrphanCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(OrphanCleanupScheduler.class);

    @Autowired
    private AuthService authService;

    // Runs daily at 03:00 AM server time. Adjust cron as needed.
    @Scheduled(cron = "0 0 3 * * *")
    public void runDailyCleanup() {
        try {
            List<Long> deleted = authService.deleteOrphanDoctorUsers();
            if (deleted != null && !deleted.isEmpty()) {
                log.info("Orphan doctor users deleted by scheduler: {}", deleted);
            } else {
                log.info("Orphan doctor cleanup ran: no orphans found.");
            }
        } catch (Exception ex) {
            log.error("Error running orphan cleanup scheduler", ex);
        }
    }
}
