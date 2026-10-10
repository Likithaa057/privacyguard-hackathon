
import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function protectMessage() {
    if (!message.trim()) {
      setError("Please enter a message to protect.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/protect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to protect the message.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the Privacy Firewall. Check that the Python server is running and CORS is configured."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchLogs() {
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:4000/logs");

      if (!response.ok) {
        throw new Error("Unable to retrieve activity logs.");
      }

      const data = await response.json();
      setResult((previous) => ({
        ...(previous || {}),
        logs: data.logs || [],
      }));
    } catch {
      setError("Cannot connect to the external tool. Check the Node.js server.");
    }
  }

  const toolResponse = result?.external_tool_response;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🛡️</div>
          <div>
            <h2>PrivacyGuard</h2>
            <p>AI Security Layer</p>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <div className="nav-item active">
          <span>▦</span> Dashboard
        </div>

        <div className="nav-item">
          <span>🔐</span> Data Protection
        </div>

        <div className="nav-item">
          <span>📋</span> Activity Logs
        </div>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <div>
            <strong>Firewall Status</strong>
            <p>Ready for testing</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>Privacy Firewall Dashboard</h1>
          </div>

          <div className="system-status">
            <span className="status-dot" />
            Security Demo
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">AI DATA PROTECTION</p>
            <h2>Protect sensitive data before it leaves.</h2>
            <p>
              Detect personal information, replace it with secure tokens,
              and send protected data to external tools.
            </p>
          </div>

          <div className="welcome-icon">🔒</div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">🛡️</div>
            <p>Protection Layer</p>
            <h3>Active</h3>
            <span>Python Privacy Firewall</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">🌐</div>
            <p>External Tool</p>
            <h3>Port 4000</h3>
            <span>Node.js simulated service</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">🔑</div>
            <p>Protection Method</p>
            <h3>Tokenization</h3>
            <span>For detected email and phone data</span>
          </div>
        </section>

        <section className="workspace-grid">
          <div className="panel input-panel">
            <div className="panel-heading">
              <div>
                <h2>Protect Your Message</h2>
                <p>Enter text to scan for personal information.</p>
              </div>
              <span className="panel-icon">✎</span>
            </div>

            <label htmlFor="message">YOUR MESSAGE</label>

            <textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Example: Contact me at likitha@example.com or call 9876543210"
              rows={6}
            />

            <div className="input-footer">
              <span>{message.length} characters</span>
              <span>🔒 Protected processing</span>
            </div>

            <button
              className="protect-button"
              onClick={protectMessage}
              disabled={loading}
            >
              {loading ? "Protecting Data..." : "🛡️ Protect Data"}
            </button>

            {error && <div className="error-message">{error}</div>}

            <div className="privacy-note">
              <span>ⓘ</span>
              Detected information is tokenized before the external request.
            </div>
          </div>

          <div className="panel process-panel">
            <div className="panel-heading">
              <div>
                <h2>Protection Pipeline</h2>
                <p>How your message is processed.</p>
              </div>
            </div>

            <div className="pipeline-step">
              <div className="pipeline-number">1</div>
              <div>
                <strong>Message Submitted</strong>
                <p>Receive user input</p>
              </div>
              <span className="step-check">✓</span>
            </div>

            <div className="pipeline-line" />

            <div className="pipeline-step">
              <div className="pipeline-number">2</div>
              <div>
                <strong>PII Detection</strong>
                <p>Identify supported personal data</p>
              </div>
              <span className="step-check">✓</span>
            </div>

            <div className="pipeline-line" />

            <div className="pipeline-step">
              <div className="pipeline-number">3</div>
              <div>
                <strong>Tokenization</strong>
                <p>Replace detected values with tokens</p>
              </div>
              <span className="step-check">✓</span>
            </div>

            <div className="pipeline-line" />

            <div className="pipeline-step">
              <div className="pipeline-number">4</div>
              <div>
                <strong>External Tool</strong>
                <p>Process protected request</p>
              </div>
              <span className="step-check">✓</span>
            </div>

            <button className="logs-button" onClick={fetchLogs}>
              📋 View External Tool Logs
            </button>
          </div>
        </section>

        {result && (
          <section className="panel results-panel">
            <div className="panel-heading">
              <div>
                <h2>Protection Results</h2>
                <p>Response received from the Privacy Firewall.</p>
              </div>

              <span className="success-badge">
                ✓ {result.success ? "Request Successful" : "Check Result"}
              </span>
            </div>

            {result.protected_message && (
              <div className="result-box">
                <h3>🔐 Protected Message</h3>
                <pre>{result.protected_message}</pre>
              </div>
            )}

            {toolResponse && (
              <div className="result-box">
                <h3>🌐 External Tool Response</h3>
                <pre>{JSON.stringify(toolResponse, null, 2)}</pre>
              </div>
            )}

            {result.logs && (
              <div className="result-box">
                <h3>📋 Safe Activity Logs</h3>
                <pre>{JSON.stringify(result.logs, null, 2)}</pre>
              </div>
            )}
          </section>
        )}

        <footer>
          <span>PrivacyGuard · Hackathon Prototype</span>
          <span>Frontend · React + Vite</span>
        </footer>
      </main>
    </div>
  );
}

export default App;

