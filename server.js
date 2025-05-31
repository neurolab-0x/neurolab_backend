import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
import doctorRouter from './routes/doctor.routes.js';
import deviceRouter from './routes/device.routes.js';
import sessionRouter from './routes/session.routes.js';
import analysisRouter from './routes/analysis.routes.js';
import reviewRouter from './routes/review.routes.js';
import partnershipRouter from './routes/partnership.routes.js';
import fileUploadRouter from './routes/fileUpload.routes.js';
import { connectToDB } from './config/db.config.js';
import { mqttService } from './config/mqtt/config.js';
import { sessionManager } from './config/session-manager/config.js';
import { dataProcessor } from './config/data-processor/config.js';

dotenv.config();

const app = express();

// Trust proxy configuration
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/devices', deviceRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/uploads', fileUploadRouter);
app.use('/api/partnerships', partnershipRouter);

// Rate limiter configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all routes
app.use(limiter);

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        services: {
            mqtt: mqttService.isConnected,
            dataProcessor: true,
            sessionManager: true
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5000;

// Initialize services
async function initializeServices() {
    try {
        // Connect to database
        await connectToDB();

        // Initialize MQTT service
        //await mqttService.initialize();

        // Initialize data processor
        await dataProcessor.initialize();

        // Initialize session manager
        await sessionManager.initialize();

        console.log('✅ All services initialized successfully');
    } catch (error) {
        console.error('❌ Service initialization failed:', error);
        process.exit(1);
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    initializeServices();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');

    try {
        //await mqttService.shutdown();
        await dataProcessor.shutdown();
        await sessionManager.shutdown();

        console.log('✅ All services shut down successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});