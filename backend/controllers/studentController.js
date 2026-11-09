const pool = require('../config/db');

// @desc    Get all students
// @route   GET /api/students
exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await pool.query('SELECT * FROM students');
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error while fetching students.' });
    }
};

// @desc    Get a single student by ID
// @route   GET /api/students/:id
exports.getStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;
        const [student] = await pool.query('SELECT * FROM students WHERE student_id = ?', [studentId]);
        
        if (student.length === 0) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        
        res.status(200).json(student[0]);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Server error while fetching student.' });
    }
};

// @desc    Delete a student, related records, and its unshared user account
// @route   DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [students] = await connection.execute(
            'SELECT user_id FROM students WHERE student_id = ? FOR UPDATE',
            [req.params.id]
        );

        if (students.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Student not found in the database.' });
        }

        await connection.execute(
            'DELETE FROM students WHERE student_id = ?',
            [req.params.id]
        );
        await connection.execute(
            `DELETE FROM users
             WHERE id = ?
               AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = ?)`,
            [students[0].user_id, students[0].user_id]
        );

        await connection.commit();
        return res.status(200).json({ message: 'Student and related records deleted.' });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Error rolling back student deletion:', rollbackError);
            }
        }
        console.error('Error deleting student:', error);
        return res.status(500).json({ message: 'Could not delete student from the database.' });
    } finally {
        if (connection) connection.release();
    }
};