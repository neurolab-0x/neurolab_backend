const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const eegDataRoutes = require('./routes/eegData.routes');
require('dotenv').config();
const connectToDB = require('./config/db.config.js')

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/eegdata', eegDataRoutes);
// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.url} Not Found` });
});

const PORT = process.env.PORT || 500

app.listen(PORT, async () => {
  // Start the server then connectToDB();
  console.log(`server is running on port ${PORT}`);
  // await connectToDB()  
  require("./config/db.config.js")
  
})