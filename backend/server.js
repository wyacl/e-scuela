require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import Database and Routes
const pool = require('./config/db'); 
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and Utility Middleware
app.use(helmet());
app.use(cors());
app.use(express.json()); // Parses incoming JSON payloads

// Mount API Routes
app.use('/api/students', studentRoutes);

// Root test route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'E-SCUELA Backend is running securely.' });
});

// Centralized 404 Error Handling for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: 'API Endpoint not found.' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server initialized on port ${PORT}`);
});