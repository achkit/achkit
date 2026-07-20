"""Client for the achkit hosted API (paid). The rest of this package is free and
runs locally; this talks to the hosted service for live routing verification
against the FedACH directory. Get an API key at https://achkit.com/dashboard."""
from __future__ import annotations

import json
import urllib.request
import urllib.error
from typing import Any, Dict

from .fields import AchError


class AchkitClient:
    def __init__(self, api_key: str, base_url: str = "https://achkit.com") -> None:
        if not api_key:
            raise AchError("NO_API_KEY", "An API key is required. Get one at https://achkit.com/dashboard")
        self.key = api_key
        self.base = base_url.rstrip("/")

    def _req(self, req: urllib.request.Request) -> Dict[str, Any]:
        try:
            with urllib.request.urlopen(req) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            raise AchError("API_ERROR", f"request failed ({e.code})")

    def verify_routing(self, routing: str) -> Dict[str, Any]:
        """Verify a routing number against the live FedACH participant directory."""
        req = urllib.request.Request(f"{self.base}/api/routing/{routing}", headers={"x-api-key": self.key})
        return self._req(req)

    def validate(self, file_text: str) -> Dict[str, Any]:
        """Validate an ACH file on the hosted API - reconciliation plus live routing checks."""
        req = urllib.request.Request(
            f"{self.base}/api/validate",
            data=file_text.encode("utf-8"),
            method="POST",
            headers={"x-api-key": self.key, "content-type": "text/plain"},
        )
        return self._req(req)
