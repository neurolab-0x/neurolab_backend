require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db;


// require('dotenv').config();
// const MongoClient = require("mongodb")
// const mongoose = require('mongoose');

// async function connectToDB() {
//   try{
//     await MongoClient.connect(process.env.MONGO_URI).then(() => console.log("Connected to MongoDB"));
//   }catch(error){
//     console.error(error)
//   }

// }

// module.exports = connectToDB;




















// config/db.js
// const mongoose = require('mongoose');
// const logger = require('../utils/logger');

// const connectDB = async () => {
//   try {
//     // Validate environment variables
//     if (!process.env.MONGODB_URI) {
//       throw new Error('MONGODB_URI environment variable is not defined');
//     }

//     // Connection configuration
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 5000, // 5 seconds timeout for initial connection
//       maxPoolSize: 10, // Maximum number of sockets in the connection pool
//     });

//     logger.info(`MongoDB Connected: ${conn.connection.host}`);
//     console.log(`MongoDB Connected: ${conn.connection.host}`);

//     // Event listeners for connection monitoring
//     mongoose.connection.on('connected', () => {
//       logger.info('MongoDB connection established');
//     });

//     mongoose.connection.on('error', (err) => {
//       logger.error(`MongoDB connection error: ${err.message}`);
//       process.exit(1); // Exit process on critical errors
//     });

//     mongoose.connection.on('disconnected', () => {
//       logger.warn('MongoDB connection disconnected');
//     });

//     // Graceful shutdown
//     process.on('SIGINT', async () => {
//       await mongoose.connection.close();
//       logger.info('MongoDB connection closed due to app termination');
//       process.exit(0);
//     });

//   } catch (err) {
//     logger.error(`MongoDB connection failed: ${err.message}`);
//     console.error(`MongoDB connection failed: ${err.message}`);
    
//     setTimeout(connectDB, 5000); 
//   }
// };

// const checkDBConnection = (req, res, next) => {
//   if (mongoose.connection.readyState !== 1) {
//     return res.status(503).json({
//       success: false,
//       error: 'Database connection not established'
//     });
//   }
//   next();
// };

// module.exports = {
//   connectDB,
//   checkDBConnection,
//   connection: mongoose.connection
// };