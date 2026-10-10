function containsUnprotectedPII(value) {

    // Check strings for recognizable personal information
    if (typeof value === "string") {

        // Email address pattern
        const emailPattern =
            /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

        // Indian mobile number pattern
        const phonePattern =
            /(?<!\d)(?:\+91[- ]?)?[6-9]\d{9}(?!\d)/;

        // Demonstration-only 12-digit ID pattern
        const idPattern =
            /(?<!\d)\d{12}(?!\d)/;

        return (
            emailPattern.test(value) ||
            phonePattern.test(value) ||
            idPattern.test(value)
        );
    }

    // Check every element inside an array
    if (Array.isArray(value)) {
        return value.some(containsUnprotectedPII);
    }

    // Check every value inside an object
    if (value && typeof value === "object") {
        return Object.values(value).some(
            containsUnprotectedPII
        );
    }

    return false;
}

module.exports = {
    containsUnprotectedPII
};

console.log(
    containsUnprotectedPII({
        email: "likitha@example.com",
        phone: "9876543210"
    })
);