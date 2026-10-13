-- E-SCUELA Initial Database Schema
CREATE DATABASE IF NOT EXISTS e_scuela_db;
USE e_scuela_db;

-- 1. Users Table (Authentication & Authorization)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'faculty', 'student') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Students Table (Profile Information)
CREATE TABLE students (
    student_id VARCHAR(20) PRIMARY KEY, -- e.g., '2026-001'
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(20) DEFAULT 'Pending',
    section VARCHAR(50) DEFAULT 'Pending Enrollment',
    academic_status ENUM('Regular', 'Irregular', 'Transferee') DEFAULT 'Regular',
    contact_number VARCHAR(20) DEFAULT 'N/A',
    guardian_name VARCHAR(100) DEFAULT 'N/A',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Enrollments Table (Academic Records)
CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    school_year VARCHAR(20) NOT NULL,
    grade_level VARCHAR(20) NOT NULL,
    strand VARCHAR(20) DEFAULT 'N/A',
    section VARCHAR(50) NOT NULL,
    enrollment_date DATE NOT NULL,
    enrollment_status ENUM('Enrolled', 'Dropped') DEFAULT 'Enrolled',
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 4. Subjects Table (Curriculum)
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(50) NOT NULL UNIQUE
);

-- 5. Grades Table (Academic Performance)
CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    subject_id INT NOT NULL,
    q1 DECIMAL(5,2) DEFAULT NULL,
    q2 DECIMAL(5,2) DEFAULT NULL,
    q3 DECIMAL(5,2) DEFAULT NULL,
    q4 DECIMAL(5,2) DEFAULT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_subject (student_id, subject_id)
);