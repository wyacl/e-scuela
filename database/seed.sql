    USE e_scuela_db;

-- 1. Insert Core Application Users
-- Note: Passwords are temporarily stored in plain text purely for the initial development seed.
-- Phase 4 (Authentication) will replace these with bcrypt hashes.
INSERT INTO users (username, password_hash, role) VALUES 
('admin', 'admin123', 'admin'),
('faculty', 'faculty123', 'faculty'),
('catherine', 'cath123', 'student'),
('achilles', 'ach123', 'student'),
('2026-003', '2026-003', 'student'),
('2026-004', '2026-004', 'student'),
('2026-005', '2026-005', 'student'),
('2026-006', '2026-006', 'student');

-- 2. Insert Student Profiles
INSERT INTO students (student_id, user_id, full_name, grade_level, section, academic_status) VALUES 
('2026-001', 3, 'CATHERINE A. ROSARIO', 'Grade 12', 'STEM-A', 'Regular'),
('2026-002', 4, 'ACHILLES NERO C. AGUILA', 'Grade 11', 'STEM-A', 'Regular'),
('2026-003', 5, 'PRINCE CARL B. BARTOLOME', 'Grade 12', 'STEM-A', 'Regular'),
('2026-004', 6, 'BLUE BARRON B. BAMBILLA', 'Grade 11', 'HUMSS-A', 'Regular'),
('2026-005', 7, 'JAYSON J. ESQUEJO', 'Grade 12', 'STEM-A', 'Regular'),
('2026-006', 8, 'CARL ANTHONY V. DE VERA', 'Grade 12', 'STEM-A', 'Regular');

-- 3. Insert Enrollment Records
INSERT INTO enrollments (student_id, school_year, grade_level, strand, section, enrollment_date, enrollment_status) VALUES 
('2026-001', '2026-2027', 'Grade 12', 'STEM', 'STEM-A', '2026-06-15', 'Enrolled'),
('2026-002', '2026-2027', 'Grade 11', 'STEM', 'STEM-A', '2026-06-15', 'Enrolled'),
('2026-003', '2026-2027', 'Grade 12', 'STEM', 'STEM-A', '2026-06-15', 'Enrolled'),
('2026-004', '2026-2027', 'Grade 11', 'HUMSS', 'HUMSS-A', '2026-06-15', 'Enrolled'),
('2026-005', '2026-2027', 'Grade 12', 'STEM', 'STEM-A', '2026-06-15', 'Enrolled'),
('2026-006', '2026-2027', 'Grade 12', 'STEM', 'STEM-A', '2026-06-15', 'Enrolled');

-- 4. Insert Master Curriculum Subjects
INSERT INTO subjects (subject_name) VALUES 
('Mathematics'), ('English'), ('Science'), ('Filipino'), 
('History'), ('PE'), ('ICT'), ('Research');

-- 5. Insert Sample Grades for '2026-001' (Catherine)
INSERT INTO grades (student_id, subject_id, q1, q2, q3, q4) VALUES 
('2026-001', (SELECT id FROM subjects WHERE subject_name = 'Mathematics'), 88, 90, 89, 91),
('2026-001', (SELECT id FROM subjects WHERE subject_name = 'English'), 91, 90, 92, 93),
('2026-001', (SELECT id FROM subjects WHERE subject_name = 'Science'), 90, 91, 89, 92),
('2026-001', (SELECT id FROM subjects WHERE subject_name = 'Filipino'), 92, 91, 90, 93),
('2026-001', (SELECT id FROM subjects WHERE subject_name = 'PE'), 95, 94, 96, 95),
('2026-001', (SELECT id FROM subjects WHERE subject_name = 'ICT'), 89, 90, 91, 90),
('2026-001', (SELECT id FROM subjects WHERE subject_name = 'Research'), 90, 92, 91, 93),
('2026-001', (SELECT id FROM subjects WHERE subject_name = 'History'), 78, 80, 79, 81);

-- 6. Insert Sample Grades for '2026-002' (Achilles)
INSERT INTO grades (student_id, subject_id, q1, q2, q3, q4) VALUES 
('2026-002', (SELECT id FROM subjects WHERE subject_name = 'Mathematics'), 85, 87, 88, 86),
('2026-002', (SELECT id FROM subjects WHERE subject_name = 'English'), 90, 91, 92, 91),
('2026-002', (SELECT id FROM subjects WHERE subject_name = 'Science'), 88, 89, 90, 91),
('2026-002', (SELECT id FROM subjects WHERE subject_name = 'Filipino'), 91, 90, 92, 93),
('2026-002', (SELECT id FROM subjects WHERE subject_name = 'PE'), 94, 95, 94, 96),
('2026-002', (SELECT id FROM subjects WHERE subject_name = 'ICT'), 89, 88, 90, 91),
('2026-002', (SELECT id FROM subjects WHERE subject_name = 'History'), 86, 87, 88, 89);