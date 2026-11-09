const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const validSubjects = new Set([
    'Mathematics', 'English', 'Science', 'Filipino',
    'History', 'PE', 'ICT', 'Research'
]);

function text(value, maxLength) {
    return typeof value === 'string' && value.trim().length <= maxLength
        ? value.trim()
        : '';
}

exports.saveEnrollment = async (req, res) => {
    const student = req.body?.student;
    const enrollment = req.body?.enrollment;
    const subjects = req.body?.subjects;

    const studentId = text(student?.id, 20);
    const name = text(student?.name, 100);
    const grade = text(enrollment?.grade, 20);
    const academicStatus = text(student?.status, 20);
    const schoolYear = text(enrollment?.schoolYear, 20);
    const strand = text(enrollment?.strand, 20);
    const section = text(enrollment?.section, 50);
    const date = text(enrollment?.date, 10);
    const enrollmentStatus = text(enrollment?.enrollmentStatus, 10);
    const contact = text(student?.contact, 20) || 'N/A';
    const guardian = text(student?.guardian, 100) || 'N/A';

    if (!/^\d{4}-\d{3}$/.test(studentId) || !name || !grade || !section ||
        !/^\d{4}-\d{4}$/.test(schoolYear) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !['Regular', 'Irregular', 'Transferee'].includes(academicStatus) ||
        !['Enrolled', 'Dropped'].includes(enrollmentStatus) ||
        !Array.isArray(subjects) || subjects.some(subject => !validSubjects.has(subject)) ||
        (enrollmentStatus === 'Enrolled' && subjects.length === 0)) {
        return res.status(400).json({ message: 'Enrollment details are invalid.' });
    }

    const studentSection = enrollmentStatus === 'Dropped' ? 'Dropped' : section;
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [studentRows] = await connection.execute(
            'SELECT student_id FROM students WHERE student_id = ? FOR UPDATE',
            [studentId]
        );

        if (studentRows.length === 0) {
            const [userRows] = await connection.execute(
                'SELECT id FROM users WHERE username = ? FOR UPDATE',
                [studentId]
            );

            let userId;
            if (userRows.length > 0) {
                userId = userRows[0].id;
            } else {
                const passwordHash = await bcrypt.hash(studentId, 10);
                const [userResult] = await connection.execute(
                    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                    [studentId, passwordHash, 'student']
                );
                userId = userResult.insertId;
            }

            await connection.execute(
                `INSERT INTO students
                    (student_id, user_id, full_name, grade_level, section, academic_status, contact_number, guardian_name)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [studentId, userId, name, grade, studentSection, academicStatus, contact, guardian]
            );
        } else {
            await connection.execute(
                `UPDATE students
                 SET full_name = ?, grade_level = ?, section = ?, academic_status = ?,
                     contact_number = ?, guardian_name = ?
                 WHERE student_id = ?`,
                [name, grade, studentSection, academicStatus, contact, guardian, studentId]
            );
        }

        const [existingEnrollments] = await connection.execute(
            `SELECT id FROM enrollments
             WHERE student_id = ? AND school_year = ?
             ORDER BY id LIMIT 1 FOR UPDATE`,
            [studentId, schoolYear]
        );

        if (existingEnrollments.length > 0) {
            await connection.execute(
                `UPDATE enrollments
                 SET grade_level = ?, strand = ?, section = ?, enrollment_date = ?, enrollment_status = ?
                 WHERE id = ?`,
                [grade, strand, section, date, enrollmentStatus, existingEnrollments[0].id]
            );
        } else {
            await connection.execute(
                `INSERT INTO enrollments
                    (student_id, school_year, grade_level, strand, section, enrollment_date, enrollment_status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [studentId, schoolYear, grade, strand, section, date, enrollmentStatus]
            );
        }

        for (const subject of new Set(subjects)) {
            const [subjectResult] = await connection.execute(
                'INSERT INTO subjects (subject_name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
                [subject]
            );
            await connection.execute(
                'INSERT INTO grades (student_id, subject_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
                [studentId, subjectResult.insertId]
            );
        }

        await connection.commit();
        return res.status(200).json({ message: 'Enrollment saved to the database.' });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Error rolling back enrollment transaction:', rollbackError);
            }
        }
        console.error('Error saving enrollment:', error);
        return res.status(500).json({ message: 'Could not save enrollment to the database.' });
    } finally {
        if (connection) connection.release();
    }
};
