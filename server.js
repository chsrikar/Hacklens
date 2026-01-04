/**
 * HackLens - GitHub Repository Intelligence Tool
 * Main server entry point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const analyzeRoutes = require('./src/routes/analyze');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', analyzeRoutes);

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║           HackLens Server                 ║
    ║   GitHub Repository Intelligence Tool    ║
    ╠═══════════════════════════════════════════╣
    ║   Server running on port ${PORT}             ║
    ║   http://localhost:${PORT}                   ║
    ╚═══════════════════════════════════════════╝
    `);
});

module.exports = app;
