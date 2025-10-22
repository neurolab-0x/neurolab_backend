import calendarService from "../service/CalendarService.js";
import User from "../models/user.models.js";

export const CalendarController = {
    // Get authorization URL for Google Calendar
    async getAuthUrl(req, res) {
        try {
            const authUrl = calendarService.generateAuthUrl();
            return res.status(200).json({ authUrl });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Failed to generate authorization URL", error: error.message });
        }
    },

    // Handle OAuth callback and save tokens
    async handleCallback(req, res) {
        try {
            const { code } = req.query;
            
            if (!code) {
                return res.status(400).json({ message: "Authorization code is required" });
            }
            
            // Exchange code for tokens
            const tokens = await calendarService.getTokensFromCode(code);
            
            if (!tokens) {
                return res.status(500).json({ message: "Failed to get tokens from authorization code" });
            }
            
            // Save tokens to user profile
            await User.findByIdAndUpdate(req.user._id, { calendarTokens: tokens });
            
            return res.status(200).json({ message: "Calendar successfully connected" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Failed to connect calendar", error: error.message });
        }
    },

    // Disconnect calendar
    async disconnect(req, res) {
        try {
            await User.findByIdAndUpdate(req.user._id, { $unset: { calendarTokens: 1 } });
            return res.status(200).json({ message: "Calendar disconnected successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Failed to disconnect calendar", error: error.message });
        }
    }
};