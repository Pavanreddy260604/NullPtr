import SystemConfig from "../models/SystemConfig.js";

// Get SMTP Configuration
export const getSMTPConfig = async (req, res) => {
    try {
        const config = await SystemConfig.findOne({ key: 'smtp' });
        if (!config) {
            return res.status(200).json({ smtp: null });
        }
        // Mask password for security
        const safeConfig = { ...config.value };
        if (safeConfig.pass) {
            safeConfig.pass = '********';
        }
        res.status(200).json(safeConfig);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update SMTP Configuration
export const updateSMTPConfig = async (req, res) => {
    try {
        const { host, port, user, pass, secure } = req.body;

        let updateData = { host, port, user, secure };

        // Only update password if provided (don't overwrite with masked value)
        if (pass && pass !== '********') {
            updateData.pass = pass;
        } else {
            // Retrieve existing password if not provided
            const existing = await SystemConfig.findOne({ key: 'smtp' });
            if (existing && existing.value) {
                updateData.pass = existing.value.pass;
            }
        }

        const config = await SystemConfig.findOneAndUpdate(
            { key: 'smtp' },
            { value: updateData, updatedBy: req.user ? req.user.email : 'admin' },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "SMTP Configuration updated successfully", config });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send Test Email
import { sendEmail } from "../services/emailService.js";

export const sendTestEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await sendEmail(email, "Test Email from NullPtr", "<h1>It Works!</h1><p>Your SMTP settings are configured correctly.</p>");

        if (result.success) {
            res.status(200).json({ message: "Test email sent successfully" });
        } else {
            res.status(500).json({ message: "Failed to send email", error: result.error });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
