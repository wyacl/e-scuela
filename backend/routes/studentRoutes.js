const express = require('express');
const router = express.Router();
const { getAllStudents, getStudentById } = require('../controllers/studentController');

// Map routes to controller functions
router.get('/', getAllStudents);
router.get('/:id', getStudentById);

module.exports = router;