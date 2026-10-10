const logs = [];

function recordSafeLog(entry) {
    logs.push({
        timestamp: new Date().toISOString(),
        tool: "SimulatedExternalTool",
        status: entry.status
    });
}

function getSafeLogs() {
    return [...logs];
}

function clearLogs() {
    logs.length = 0;
}

module.exports = {
    recordSafeLog,
    getSafeLogs,
    clearLogs
};