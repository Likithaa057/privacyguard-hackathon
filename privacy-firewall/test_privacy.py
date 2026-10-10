
import unittest
from unittest.mock import patch, Mock

import app


class PrivacyFirewallIntegrationTests(unittest.TestCase):

    def run_protection_test(self, message, original_pii):
        captured = {}

        # Simulate the external tool and capture its incoming request.
        def fake_external_tool(url, json, headers, timeout):
            captured["payload"] = json

            response = Mock()
            response.ok = True
            response.status_code = 200
            response.json.return_value = {
                "success": True,
                "tool": "SimulatedExternalTool",
                "received": json,
                "message": "Request processed successfully"
            }

            return response

        # Intercept the outgoing HTTP request for testing.
        with patch(
            "app.requests.post",
            side_effect=fake_external_tool
        ):
            client = app.app.test_client()

            response = client.post(
                "/protect",
                json={"message": message}
            )

        # Check the firewall response.
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json["success"])

        # Check what would be sent to the external tool.
        sent_message = captured["payload"]["message"]

        # The original personal information must not be present.
        self.assertNotIn(original_pii, sent_message)

        # The protected message must contain a generated token.
        self.assertRegex(
            sent_message,
            r"TOKEN-[0-9a-f]{12}"
        )

        return sent_message

    def test_email_is_protected_before_external_request(self):
        sent_message = self.run_protection_test(
            "Contact me at likitha@example.com",
            "likitha@example.com"
        )

        print("\nPASS: Email protection verified.")
        print("Protected message:", sent_message)

    def test_phone_number_is_protected_before_external_request(self):
        sent_message = self.run_protection_test(
            "Call me at 9876543210",
            "9876543210"
        )

        print("\nPASS: Phone number protection verified.")
        print("Protected message:", sent_message)


if __name__ == "__main__":
    unittest.main(verbosity=2)

