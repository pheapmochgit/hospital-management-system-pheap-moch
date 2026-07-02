package com.hospital;

import com.hospital.model.User;
import com.hospital.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.LocalDateTime;

@SpringBootApplication
@EnableScheduling
public class HospitalApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospitalApplication.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000", "http://localhost:3001")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }

    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("admin@hospital.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@hospital.com");
                admin.setPassword("admin");
                admin.setFullName("Admin User");
                admin.setRole("ADMIN");
                admin.setPhone("0123456789");
                admin.setAddress("123 Hospital Road");
                admin.setCreatedAt(LocalDateTime.now());
                userRepository.save(admin);
            }

            userRepository.findAll().stream()
                    .filter(user -> user.getRole() != null && user.getRole().trim().equalsIgnoreCase("ADMIN"))
                    .filter(user -> !user.getEmail().equalsIgnoreCase("admin@hospital.com"))
                    .forEach(userRepository::delete);
        };
    }
}
