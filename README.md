# Hospital Management System

A complete Hospital Management System built with **Java Spring Boot** backend and **React** frontend.

## Features

-  Admin Dashboard 
-  Doctor Management
-  Patient Management
-  Appointment Scheduling
- Department Management
- Medical Reports
-  User Authentication (Login/Register)
-  Role-based Access Control (Admin, Doctor, Patient)
-  Beautiful and responsive UI

## Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.0.0
- Spring Data JPA
- MySQL 8.0
- Maven

**Frontend:**
- React 18.2
- React Router 6.8
- Axios
- CSS3

## Prerequisites

Before running the project, make sure you have installed:

- Java JDK 17 or higher
- Maven 3.6 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher

## Database Setup

1. Create MySQL Database:
```sql
CREATE DATABASE hospital_db;
```

2. Update database credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hospital_db
spring.datasource.username=root
spring.datasource.password=root
```

## Backend Setup & Run

```bash
cd backend

# Build the project
mvn clean install

# Run the Spring Boot application
mvn spring-boot:run
```

The backend will start at `http://localhost:8080`

## Frontend Setup & Run

```bash
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will start at `http://localhost:3000`

## Default Login Credentials

You can use these credentials to login:

- **Email:** admin@hospital.com
- **Password:** admin

Note: You need to create users first by registering or inserting data into the database.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/register` - User registration
- `GET /api/auth/user/{id}` - Get user by ID
- `GET /api/auth/all` - List all users
- `POST /api/auth/cleanup-orphans` - Remove orphan doctor users
- `POST /api/auth/reset` - Reset non-admin application data

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/{id}` - Update department
- `DELETE /api/departments/{id}` - Delete department

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/user/{userId}` - Get doctor by linked user ID
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/{id}` - Update doctor
- `DELETE /api/doctors/{id}` - Delete doctor

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/user/{userId}` - Get patient by linked user ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Delete appointment

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create report
- `PUT /api/reports/{id}` - Update report
- `DELETE /api/reports/{id}` - Delete report

## Project Structure

```
hospital-system/
├── backend/
│   ├── src/main/java/com/hospital/
│   │   ├── model/          # Entity models
│   │   ├── repository/     # Database repositories
│   │   ├── service/        # Business logic services
│   │   ├── controller/     # REST API controllers
│   │   └── HospitalApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml             # Maven dependencies
│
└── frontend/
    ├── src/
    │   ├── pages/          # Page components
    │   ├── components/     # Reusable components
    │   ├── services/       # API services
    │   ├── styles/         # CSS stylesheets
    │   ├── App.jsx
    │   └── index.jsx
    ├── public/
    │   └── index.html
    └── package.json        # NPM dependencies
```

## Features Explained

### Admin Panel
- View system statistics (users, doctors, patients, departments, appointments, reports)
- Manage doctors and their qualifications
- Manage patients and their health information
- Schedule and manage appointments
- View and manage medical departments
- Access medical reports

### Doctor Panel
- View personal profile and qualifications
- Check assigned appointments
- View appointment history

### Patient Panel
- View personal health information
- Schedule new appointments
- View appointment history
- Access medical reports

## Troubleshooting

**Backend won't start:**
- Make sure MySQL is running
- Check database credentials in application.properties
- Ensure Java 17+ is installed

**Frontend won't start:**
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

**CORS issues:**
- The backend is configured to accept requests from `http://localhost:3000`


## Future Enhancements
- Mobile app version




