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
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';
import appointmentRouter from './routes/appointment.routes.js';
import { logger } from './config/logger/config.js';

dotenv.config();

const app = express();

// Trust proxy configuration
//app.set('trust proxy', 1);

app.use(cors({
    origin: (origin, callback) => {
        return callback(null, true)
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    logger.info("Neurolab Backend API is running", {
        origin : req.headers.origin,
    });
    res.json({
        origin : req.headers.origin,
        message: 'Neurolab Backend API',
        version: '1.0.0',
        status: 'Up and running',
        documentation : 'https://neurolab-backend.onrender.com/api-docs'
    });
});
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
app.use('/api/appointments', appointmentRouter)

// Rate limiter configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all routes
app.use(limiter);

// Swagger UI
// Relax CSP only for /api-docs to allow Swagger inline assets over HTTP
// app.use('/api-docs', helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
//         "default-src": ["'self'"],
//         "script-src": ["'self'", "'unsafe-inline'"],
//         "style-src": ["'self'", "'unsafe-inline'"],
//         "img-src": ["'self'", 'data:']
//     }
// }));

// Minimal favicon to avoid console errors
app.get('/favicon.ico', (_req, res) => res.status(204).end());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #2c3e50; font-size: 2.5em; }
        .swagger-ui .info .description { font-size: 1.2em; }
        .swagger-ui .opblock.opblock-post { border-color: #2ecc71; background: rgba(46, 204, 113, 0.1); }
        .swagger-ui .opblock.opblock-get { border-color: #3498db; background: rgba(52, 152, 219, 0.1); }
        .swagger-ui .opblock.opblock-put { border-color: #f1c40f; background: rgba(241, 196, 15, 0.1); }
        .swagger-ui .opblock.opblock-delete { border-color: #e74c3c; background: rgba(231, 76, 60, 0.1); }
        .swagger-ui .btn.execute { background-color: #2c3e50; }
        .swagger-ui .btn.execute:hover { background-color: #34495e; }
        .swagger-ui .scheme-container { background-color: #f8f9fa; }
        .swagger-ui .info .base-url { font-size: 1.2em; }
        .swagger-ui .info .title small.version-stamp { background-color: #2c3e50; }
        .swagger-ui .opblock-tag { font-size: 1.2em; color: #2c3e50; }
        .swagger-ui .opblock .opblock-summary-method { font-weight: bold; }
        .swagger-ui .opblock-description-wrapper p { font-size: 1.1em; }
        .swagger-ui .parameters-container .parameters-col_description { width: 40%; }
        .swagger-ui .parameters-container .parameters-col_name { width: 20%; }
        .swagger-ui .parameters-container .parameters-col_type { width: 20%; }
        .swagger-ui .parameters-container .parameters-col_description input { width: 100%; }
        .swagger-ui .response-col_status { font-weight: bold; }
        .swagger-ui .response-col_description { width: 60%; }
        .swagger-ui .response .response-inner { padding: 1em; }
        .swagger-ui .response .response-inner .highlight-code { background: #f8f9fa; }
        .swagger-ui .response .response-inner .highlight-code pre { padding: 1em; }
        .swagger-ui .response .response-inner .highlight-code code { font-size: 1.1em; }
        .swagger-ui .response .response-inner .highlight-code code span { font-family: 'Fira Code', monospace; }
        .swagger-ui .response .response-inner .highlight-code code span.hljs-string { color: #2ecc71; }
        .swagger-ui .response .response-inner .highlight-code code span.hljs-number { color: #e74c3c; }
        .swagger-ui .response .response-inner .highlight-code code span.hljs-boolean { color: #f1c40f; }
        .swagger-ui .response .response-inner .highlight-code code span.hljs-null { color: #95a5a6; }
        .swagger-ui .response .response-inner .highlight-code code span.hljs-keyword { color: #3498db; }
        .swagger-ui .response .response-inner .highlight-code code span.hljs-property { color: #9b59b6; }
    `,
    customSiteTitle: "Neurolab API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        syntaxHighlight: {
            activated: true,
            theme: "monokai"
        },
        docExpansion: "list",
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
        displayOperationId: true,
        showExtensions: true,
        showCommonExtensions: true,
        supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
        validatorUrl: null
    }
}));

const PORT = process.env.PORT || 5000;

// Initialize services
async function initializeServices() {
    try {
        // Connect to database
        await connectToDB();

        // Initialize MQTT service
        // await mqttService.initialize();

        // Initialize data processor
        await dataProcessor.initialize();

        // Initialize session manager
        await sessionManager.initialize();

        console.log('✅ All services initialized successfully');

        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('❌ Service initialization failed:', error);
        process.exit(1);
    }
}

// Start server
initializeServices();

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