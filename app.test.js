
const request = require("supertest");
const app = require("./app");

// Demo authorization token configured in app.js
const AUTH_TOKEN = "demo-middleware-secret";

describe("Simulated External Tool - Security Tests", () => {

    // Test 1: Reject requests without authorization
    test("Rejects requests without middleware authorization", async () => {
        const response = await request(app)
            .post("/external-tool")
            .send({
                email: "likitha@example.com"
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(
            "Unauthorized: middleware access required"
        );
    });

    // Test 2: Reject requests with an invalid authorization token
    test("Rejects requests with an invalid middleware token", async () => {
        const response = await request(app)
            .post("/external-tool")
            .set("x-middleware-token", "wrong-token")
            .send({
                message: "Test request"
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(
            "Unauthorized: middleware access required"
        );
    });

    // Test 3: Reject an unprotected email
    test("Rejects requests containing an unprotected email", async () => {
        const response = await request(app)
            .post("/external-tool")
            .set("x-middleware-token", AUTH_TOKEN)
            .send({
                email: "likitha@example.com"
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(
            "Unprotected personal information detected"
        );
    });

    // Test 4: Accept protected tokens
    test("Accepts requests containing protected tokens", async () => {
        const response = await request(app)
            .post("/external-tool")
            .set("x-middleware-token", AUTH_TOKEN)
            .send({
                email: "[EMAIL_1]",
                phone: "[PHONE_1]"
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    // Test 5: Reject multiple unprotected PII values
    test("Rejects multiple unprotected PII values", async () => {
        const response = await request(app)
            .post("/external-tool")
            .set("x-middleware-token", AUTH_TOKEN)
            .send({
                email: "likitha@example.com",
                phone: "9876543210",
                alternateEmail: "student@example.com"
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // Test 6: Reject PII inside nested JSON
    test("Rejects PII inside nested JSON objects", async () => {
        const response = await request(app)
            .post("/external-tool")
            .set("x-middleware-token", AUTH_TOKEN)
            .send({
                user: {
                    profile: {
                        email: "likitha@example.com"
                    }
                }
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // Test 7: Prevent PII from appearing in rejected responses
    test("Does not expose personal information in rejected responses", async () => {
        const email = "likitha@example.com";
        const phone = "9876543210";

        const response = await request(app)
            .post("/external-tool")
            .set("x-middleware-token", AUTH_TOKEN)
            .send({
                email: email,
                phone: phone
            });

        expect(response.status).toBe(400);

        const responseBody = JSON.stringify(response.body);

        expect(responseBody).not.toContain(email);
        expect(responseBody).not.toContain(phone);
    });

    // Test 8: Prevent PII from appearing in tool logs
    test("Does not store personal information in tool logs", async () => {
        const email = "likitha@example.com";
        const phone = "9876543210";

        await request(app)
            .post("/external-tool")
            .set("x-middleware-token", AUTH_TOKEN)
            .send({
                email: email,
                phone: phone
            });

        const response = await request(app).get("/logs");

        const logs = JSON.stringify(response.body);

        expect(logs).not.toContain(email);
        expect(logs).not.toContain(phone);
    });

});
