const express = require('express');
const { saveEnrollment } = require('../controllers/enrollmentController');

const router = express.Router();

router.post('/', saveEnrollment);

module.exports = router;
