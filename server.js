import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import deviceRoutes from './routes/device.routes.js';
import sessionRoutes from './routes/session.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import fileUploadRoutes from './routes/fileUpload.routes.js';
import { connectToDB } from './config/db.config.js';
import { mqttService } from './config/mqtt/config.js';
import { sessionManager } from './config/session-manager/config.js';
import { dataProcessor } from './config/data-processor/config.js';

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/uploads', fileUploadRoutes);

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
        await mqttService.initialize();

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
        await mqttService.shutdown();
        await dataProcessor.shutdown();
        await sessionManager.shutdown();

        console.log('✅ All services shut down successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});