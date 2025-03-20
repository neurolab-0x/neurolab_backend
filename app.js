const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const eegDataRoutes = require('./routes/eegData.routes');
require('dotenv').config();
const connectToDB = require('./config/db.config.js');
const authRoutes = require('./routes/auth/auth.routes.js');
const Response = require('./models/response.model.js');
const responseRoutes = require('./routes/response.routes.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
// require("./config/db.config.js");

// Routes
app.use('/api/response', responseRoutes);
app.use('/api/eegdata', eegDataRoutes);
app.use('/api', authRoutes);

// Corrected profile route (added leading slash)
app.get('/api/profile', (req, res) => {
  res.json({ message: "protected route accessed" });
});

// 404 handler - MUST COME AFTER ALL ROUTES
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.url} Not Found` });
});


// After route registration
console.log('Registered routes:');
authRoutes.stack.forEach((layer) => {
  console.log(`- ${layer.route.stack[0].method.toUpperCase()} /api${layer.route.path}`);
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectToDB();
});