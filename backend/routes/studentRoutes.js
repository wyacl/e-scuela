const express = require('express');
const router = express.Router();
const { getAllStudents, getStudentById, deleteStudent } = require('../controllers/studentController');

// Map routes to controller functions
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.delete('/:id', deleteStudent);

module.exports = router;