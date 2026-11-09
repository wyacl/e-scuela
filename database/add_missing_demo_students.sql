USE e_scuela_db;
START TRANSACTION;

INSERT IGNORE INTO users (username, password_hash, role) VALUES
('2026-003', '2026-003', 'student'),
('2026-004', '2026-004', 'student'),
('2026-005', '2026-005', 'student'),
('2026-006', '2026-006', 'student');

INSERT INTO students (student_id, user_id, full_name, grade_level, section, academic_status)
SELECT '2026-003', id, 'PRINCE CARL B. BARTOLOME', 'Grade 12', 'STEM-A', 'Regular'
FROM users WHERE username = '2026-003'
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id);
INSERT INTO students (student_id, user_id, full_name, grade_level, section, academic_status)
SELECT '2026-004', id, 'BLUE BARRON B. BAMBILLA', 'Grade 11', 'HUMSS-A', 'Regular'
FROM users WHERE username = '2026-004'
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id);
INSERT INTO students (student_id, user_id, full_name, grade_level, section, academic_status)
SELECT '2026-005', id, 'JAYSON J. ESQUEJO', 'Grade 12', 'STEM-A', 'Regular'
FROM users WHERE username = '2026-005'
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id);
INSERT INTO students (student_id, user_id, full_name, grade_level, section, academic_status)
SELECT '2026-006', id, 'CARL ANTHONY V. DE VERA', 'Grade 12', 'STEM-A', 'Regular'
FROM users WHERE username = '2026-006'
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id);

INSERT INTO enrollments
    (student_id, school_year, grade_level, strand, section, enrollment_date, enrollment_status)
SELECT '2026-003', '2026-2027', 'Grade 12', 'STEM', 'STEM-A', '2026-06-15', 'Enrolled'
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE student_id = '2026-003' AND school_year = '2026-2027');
INSERT INTO enrollments
    (student_id, school_year, grade_level, strand, section, enrollment_date, enrollment_status)
SELECT '2026-004', '2026-2027', 'Grade 11', 'HUMSS', 'HUMSS-A', '2026-06-15', 'Enrolled'
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE student_id = '2026-004' AND school_year = '2026-2027');
INSERT INTO enrollments
    (student_id, school_year, grade_level, strand, section, enrollment_date, enrollment_status)
SELECT '2026-005', '2026-2027', 'Grade 12', 'STEM', 'STEM-A', '2026-06-15', 'Enrolled'
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE student_id = '2026-005' AND school_year = '2026-2027');
INSERT INTO enrollments
    (student_id, school_year, grade_level, strand, section, enrollment_date, enrollment_status)
SELECT '2026-006', '2026-2027', 'Grade 12', 'STEM', 'STEM-A', '2026-06-15', 'Enrolled'
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE student_id = '2026-006' AND school_year = '2026-2027');

COMMIT;
