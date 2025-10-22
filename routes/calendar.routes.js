import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { CalendarController } from "../controllers/calendar.controller.js";

const calendarRouter = express.Router();

calendarRouter.use(authenticate);

// Get authorization URL
calendarRouter.get("/auth-url", CalendarController.getAuthUrl);

// Handle OAuth callback
calendarRouter.get("/callback", CalendarController.handleCallback);

// Disconnect calendar
calendarRouter.post("/disconnect", CalendarController.disconnect);

export default calendarRouter;