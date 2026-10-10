
const express = require("express");

const {
    recordSafeLog,
    getSafeLogs
} = require("./toolLogs");

const {
    containsUnprotectedPII
} = require("./privacyGuard");

const app = express();

app.use(express.json());

// Demo secret shared with the privacy middleware.
// In production, configure this through an environment variable.
const MIDDLEWARE_SECRET =
    process.env.MIDDLEWARE_SECRET || "demo-middleware-secret";

// Simulated external tool endpoint
app.post("/external-tool", (req, res) => {

    // Step 1: Verify middleware authorization
    const authToken = req.get("x-middleware-token");

    if (authToken !== MIDDLEWARE_SECRET) {

        // Record only safe metadata
        recordSafeLog({
            status: "unauthorized"
        });

        return res.status(401).json({
            success: false,
            error: "Unauthorized: middleware access required"
        });
    }

    // Step 2: Check for unprotected personal information
    if (containsUnprotectedPII(req.body)) {

        recordSafeLog({
            status: "rejected"
        });

        return res.status(400).json({
            success: false,
            error: "Unprotected personal information detected"
        });
    }

    // Step 3: Record successful processing
    recordSafeLog({
        status: "processed"
    });

    // Step 4: Return the structured response
    return res.json({
        success: true,
        tool: "SimulatedExternalTool",
        received: req.body,
        message: "Request processed successfully"
    });
});

// Endpoint to view safe logs
app.get("/logs", (req, res) => {
    res.json({
        logs: getSafeLogs()
    });
});

module.exports = app;
