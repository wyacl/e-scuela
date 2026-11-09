-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 26, 2026 at 04:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `e_scuela_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `school_year` varchar(20) NOT NULL,
  `grade_level` varchar(20) NOT NULL,
  `strand` varchar(20) DEFAULT 'N/A',
  `section` varchar(50) NOT NULL,
  `enrollment_date` date NOT NULL,
  `enrollment_status` enum('Enrolled','Dropped') DEFAULT 'Enrolled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `student_id`, `school_year`, `grade_level`, `strand`, `section`, `enrollment_date`, `enrollment_status`) VALUES
(1, '2026-001', '2026-2027', 'Grade 12', 'STEM', 'STEM-A', '2026-06-14 16:00:00', 'Enrolled'),
(2, '2026-002', '2026-2027', 'Grade 11', 'STEM', 'STEM-A', '2026-06-14 16:00:00', 'Enrolled'),
(3, '2026-003', '2026-2027', 'Grade 12', 'STEM', 'STEM-A', '2026-06-14 16:00:00', 'Enrolled'),
(4, '2026-004', '2026-2027', 'Grade 11', 'HUMSS', 'HUMSS-A', '2026-06-14 16:00:00', 'Enrolled'),
(5, '2026-005', '2026-2027', 'Grade 12', 'STEM', 'STEM-A', '2026-06-14 16:00:00', 'Enrolled'),
(6, '2026-006', '2026-2027', 'Grade 12', 'STEM', 'STEM-A', '2026-06-14 16:00:00', 'Enrolled'),
(7, '2026-045', '2026-2027', 'Grade 1', 'N/A', 'Section C', '2026-10-25 16:00:00', 'Enrolled'),
(8, '2026-020', '2026-2027', 'Grade 12', 'ABM', 'ABM-A', '2026-10-25 16:00:00', 'Enrolled');

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `q1` decimal(5,2) DEFAULT NULL,
  `q2` decimal(5,2) DEFAULT NULL,
  `q3` decimal(5,2) DEFAULT NULL,
  `q4` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `student_id`, `subject_id`, `q1`, `q2`, `q3`, `q4`) VALUES
(1, '2026-001', 1, '88.00', '90.00', '89.00', '91.00'),
(2, '2026-001', 2, '91.00', '90.00', '92.00', '93.00'),
(3, '2026-001', 3, '90.00', '91.00', '89.00', '92.00'),
(4, '2026-001', 4, '92.00', '91.00', '90.00', '93.00'),
(5, '2026-001', 6, '95.00', '94.00', '96.00', '95.00'),
(6, '2026-001', 7, '89.00', '90.00', '91.00', '90.00'),
(7, '2026-001', 8, '90.00', '92.00', '91.00', '93.00'),
(8, '2026-001', 5, '78.00', '80.00', '79.00', '81.00'),
(9, '2026-002', 1, '85.00', '87.00', '88.00', '86.00'),
(10, '2026-002', 2, '90.00', '91.00', '92.00', '91.00'),
(11, '2026-002', 3, '88.00', '89.00', '90.00', '91.00'),
(12, '2026-002', 4, '91.00', '90.00', '92.00', '93.00'),
(13, '2026-002', 6, '94.00', '95.00', '94.00', '96.00'),
(14, '2026-002', 7, '89.00', '88.00', '90.00', '91.00'),
(15, '2026-002', 5, '86.00', '87.00', '88.00', '89.00'),
(16, '2026-045', 1, NULL, NULL, NULL, NULL),
(17, '2026-045', 2, NULL, NULL, NULL, NULL),
(18, '2026-045', 3, NULL, NULL, NULL, NULL),
(19, '2026-045', 4, NULL, NULL, NULL, NULL),
(20, '2026-045', 5, NULL, NULL, NULL, NULL),
(21, '2026-045', 6, NULL, NULL, NULL, NULL),
(22, '2026-045', 7, NULL, NULL, NULL, NULL),
(23, '2026-045', 8, NULL, NULL, NULL, NULL),
(24, '2026-020', 1, NULL, NULL, NULL, NULL),
(25, '2026-020', 2, NULL, NULL, NULL, NULL),
(26, '2026-020', 3, NULL, NULL, NULL, NULL),
(27, '2026-020', 4, NULL, NULL, NULL, NULL),
(28, '2026-020', 5, NULL, NULL, NULL, NULL),
(29, '2026-020', 6, NULL, NULL, NULL, NULL),
(30, '2026-020', 7, NULL, NULL, NULL, NULL),
(31, '2026-020', 8, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `grade_level` varchar(20) DEFAULT 'Pending',
  `section` varchar(50) DEFAULT 'Pending Enrollment',
  `academic_status` enum('Regular','Irregular','Transferee') DEFAULT 'Regular',
  `contact_number` varchar(20) DEFAULT 'N/A',
  `guardian_name` varchar(100) DEFAULT 'N/A'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `user_id`, `full_name`, `grade_level`, `section`, `academic_status`, `contact_number`, `guardian_name`) VALUES
('2026-001', 3, 'CATHERINE A. ROSARIO', 'Grade 12', 'STEM-A', 'Regular', 'N/A', 'N/A'),
('2026-002', 4, 'ACHILLES NERO C. AGUILA', 'Grade 11', 'STEM-A', 'Regular', 'N/A', 'N/A'),
('2026-003', 5, 'PRINCE CARL B. BARTOLOME', 'Grade 12', 'STEM-A', 'Regular', 'N/A', 'N/A'),
('2026-004', 6, 'BLUE BARRON B. BAMBILLA', 'Grade 11', 'HUMSS-A', 'Regular', 'N/A', 'N/A'),
('2026-005', 7, 'JAYSON J. ESQUEJO', 'Grade 12', 'STEM-A', 'Regular', 'N/A', 'N/A'),
('2026-006', 8, 'CARL ANTHONY V. DE VERA', 'Grade 12', 'STEM-A', 'Regular', 'N/A', 'N/A'),
('2026-020', 14, 'Prince Carl B. Bartolome', 'Grade 12', 'ABM-A', 'Regular', '09472585383', 'Stephen Curry'),
('2026-045', 13, 'Pwins', 'Grade 1', 'Section C', 'Regular', '09101234567', 'wwww');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `subject_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `subject_name`) VALUES
(1, 'Mathematics'),
(2, 'English'),
(3, 'Science'),
(4, 'Filipino'),
(5, 'History'),
(6, 'PE'),
(7, 'ICT'),
(8, 'Research');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','faculty','student') NOT NULL DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin123', 'admin', '2026-10-13 16:40:36', '2026-10-13 16:40:36'),
(2, 'faculty', 'faculty123', 'faculty', '2026-10-13 16:40:36', '2026-10-13 16:40:36'),
(3, 'catherine', 'cath123', 'student', '2026-10-13 16:40:36', '2026-10-13 16:40:36'),
(4, 'achilles', 'ach123', 'student', '2026-10-13 16:40:36', '2026-10-13 16:40:36'),
(5, '2026-003', '2026-003', 'student', '2026-10-13 16:40:36', '2026-10-13 16:40:36'),
(6, '2026-004', '2026-004', 'student', '2026-10-13 16:40:36', '2026-10-13 16:40:36'),
(7, '2026-005', '2026-005', 'student', '2026-10-13 16:40:36', '2026-10-13 16:40:36'),
(8, '2026-006', '2026-006', 'student', '2026-10-13 16:40:36', '2026-10-13 16:40:36'),
(13, '2026-045', '$2a$10$pEWkeJkopmphIx82Uqb4ve.j.512VhM0.AWysezrcm6oVcj5Ut1qK', 'student', '2026-10-26 14:58:32', '2026-10-26 14:58:32'),
(14, '2026-020', '$2a$10$ETEkLDcrvqiTCuoJR3pIR.qTLtP90XwpyaXUyJpEEPRdppWJQIMMm', 'student', '2026-10-26 15:12:16', '2026-10-26 15:12:16');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_subject` (`student_id`,`subject_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subject_name` (`subject_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
