from flask import Flask, request
from flask_cors import CORS
import re
import uuid
import time
import requests
from cryptography.fernet import Fernet

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Encryption key for this demo session
cipher = Fernet(Fernet.generate_key())

# Store encrypted personal information
token_vault = {}

# Node.js simulated external tool configuration
EXTERNAL_TOOL_URL = "http://127.0.0.1:4000/external-tool"
MIDDLEWARE_SECRET = "demo-middleware-secret"


def protect_message(message):
    """Detect personal information and replace it with tokens."""

    patterns = [
        (r'\b[\w.-]+@[\w.-]+\.[A-Za-z]{2,}\b', "EMAIL"),
        (r'\+?\d[\d\s-]{8,}\d', "PHONE")
    ]

    for pattern, pii_type in patterns:

        def replace_match(match):
            original_value = match.group(0)

            token = f"TOKEN-{uuid.uuid4().hex[:12]}"

            encrypted_value = cipher.encrypt(
                original_value.encode("utf-8")
            )

            token_vault[token] = {
                "value": encrypted_value,
                "type": pii_type,
                "created_at": time.time()
            }

            return token

        message = re.sub(pattern, replace_match, message)

    return message


def restore_tokens(value):
    """Restore unexpired tokens in the external tool response."""

    if isinstance(value, str):
        for token, data in list(token_vault.items()):

            if time.time() - data["created_at"] > 60:
                del token_vault[token]
                continue

            original_value = cipher.decrypt(
                data["value"]
            ).decode("utf-8")

            value = value.replace(token, original_value)

        return value

    if isinstance(value, list):
        return [restore_tokens(item) for item in value]

    if isinstance(value, dict):
        return {
            key: restore_tokens(item)
            for key, item in value.items()
        }

    return value


@app.route("/", methods=["GET"])
def home():
    return """
    <h1>Privacy Firewall</h1>
    <p>Privacy Firewall is running successfully!</p>
    <p>POST a JSON message to /protect to test the firewall.</p>
    """


@app.route("/protect", methods=["POST"])
def protect():
    data = request.get_json(silent=True) or {}

    message = data.get("message", "")

    if not isinstance(message, str) or not message.strip():
        return {
            "success": False,
            "error": "Please provide a non-empty message."
        }, 400

    # Step 1: Detect PII and replace it with tokens
    protected_message = protect_message(message)

    # Step 2: Send only the protected message to Node.js
    try:
        external_response = requests.post(
            EXTERNAL_TOOL_URL,
            json={"message": protected_message},
            headers={
                "x-middleware-token": MIDDLEWARE_SECRET
            },
            timeout=5
        )

        # Step 3: Check the external tool's response
        if not external_response.ok:
            return {
                "success": False,
                "protected_message": protected_message,
                "external_status": external_response.status_code,
                "error": "External tool rejected the request."
            }, 502

        # Step 4: Read the response
        tool_response = external_response.json()

        # Step 5: Restore tokens in the response
        restored_response = restore_tokens(tool_response)

        return {
            "success": True,
            "protected_message": protected_message,
            "external_tool_response": restored_response
        }, 200

    except requests.RequestException:
        return {
            "success": False,
            "error": (
                "Could not connect to the external tool. "
                "Check that the Node.js server is running."
            )
        }, 502

    except ValueError:
        return {
            "success": False,
            "error": "The external tool returned an invalid response."
        }, 502


if __name__ == "__main__":
    print("Starting Privacy Firewall...")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )