"""
Bond Bridge Local API Mock Server
Mimics the Bond Local API exactly as per https://docs-local.appbond.com/
Run: python3 bond_mock_server.py
Test: http://localhost:80  (or use --port to change)

Supports multiple bridges via Host header:
  Host: 192.168.1.10  -> ZZBL12345
  Host: 192.168.1.11  -> ZZBL12346
  etc.
"""

from flask import Flask, request, jsonify, Response
import json
import time
import threading
import argparse
import copy
import hashlib
import random
import string
import socket
import select
import sys
import os

# Fix Windows console encoding issues
if sys.platform == "win32":
    import io

    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

app = Flask(__name__)

# ─────────────────────────────────────────────────────────────
#  INITIAL DATA
# ─────────────────────────────────────────────────────────────

BRIDGE_IP_MAP = {
    "192.168.1.10": "ZZBL12345",
    "192.168.1.11": "ZZBL12346",
    "192.168.1.12": "ZZBL12347",
    "192.168.1.13": "ZZBL12348",
    "192.168.1.14": "ZZBL12349",
    "192.168.1.15": "ZZBL12350",
}

BRIDGE_TOKEN_MAP = {
    "ZZBL12345": "f074b61f628018fd",
    "ZZBL12346": "a1b2c3d4e5f6a7b8",
    "ZZBL12347": "c9d8e7f6a5b4c3d2",
    "ZZBL12348": "1a2b3c4d5e6f7a8b",
    "ZZBL12349": "9f8e7d6c5b4a3928",
    "ZZBL12350": "abcdef0123456789",
}

# Lock state per bridge
BRIDGE_LOCKED = {bid: True for bid in BRIDGE_TOKEN_MAP}
BRIDGE_UNLOCK_EXPIRY = {}

# Store previous states for change detection
PREVIOUS_STATES = {}

# ─────────────────────────────────────────────────────────────
#  DEVICE DATA
# ─────────────────────────────────────────────────────────────

BRIDGES = {
    "ZZBL12345": {
        "devices": {
            "d001": {
                "name": "Living Room Fan",
                "type": "CF",
                "location": "Living Room",
                "actions": [
                    "TurnOn",
                    "TurnOff",
                    "TogglePower",
                    "SetSpeed",
                    "IncreaseSpeed",
                    "DecreaseSpeed",
                    "TurnLightOn",
                    "TurnLightOff",
                    "ToggleLight",
                    "SetBrightness",
                    "IncreaseBrightness",
                    "DecreaseBrightness",
                    "SetDirection",
                    "ToggleDirection",
                    "BreezeOn",
                    "BreezeOff",
                    "SetBreeze",
                ],
                "state": {
                    "power": 0,
                    "speed": 1,
                    "light": 0,
                    "brightness": 100,
                    "direction": 1,
                    "breeze": [0, 50, 50],
                },
            },
            "d002": {
                "name": "Master Bedroom Shades",
                "type": "MS",
                "location": "Master Bedroom",
                "actions": [
                    "Open",
                    "Close",
                    "Raise",
                    "Lower",
                    "SetPosition",
                    "ToggleOpen",
                    "SetTiltPosition",
                    "ToggleTilt",
                ],
                "state": {"open": 0, "position": 0, "tilt_position": 0},
            },
            "d003": {
                "name": "Patio Fireplace",
                "type": "FP",
                "location": "Patio",
                "actions": [
                    "TurnOn",
                    "TurnOff",
                    "SetFlame",
                    "IncreaseFlame",
                    "DecreaseFlame",
                    "TurnFpFanOn",
                    "TurnFpFanOff",
                    "SetFpFan",
                ],
                "state": {"power": 0, "flame": 50, "fpfan_power": 0, "fpfan_speed": 50},
            },
            "d004": {
                "name": "Garage Heater",
                "type": "HT",
                "location": "Garage",
                "actions": [
                    "TurnOn",
                    "TurnOff",
                    "SetHeat",
                    "IncreaseHeat",
                    "DecreaseHeat",
                    "SetTimer",
                ],
                "state": {"power": 0, "heat": 50, "timer": 0},
            },
            "d005": {
                "name": "Kitchen Island Lights",
                "type": "LT",
                "location": "Kitchen",
                "actions": [
                    "TurnLightOn",
                    "TurnLightOff",
                    "ToggleLight",
                    "SetBrightness",
                    "IncreaseBrightness",
                    "DecreaseBrightness",
                    "SetColorTemp",
                    "IncreaseColorTemp",
                    "DecreaseColorTemp",
                    "SetHSV",
                ],
                "state": {
                    "light": 0,
                    "brightness": 100,
                    "color_temp": 3000,
                    "hsv": {"h": 0, "s": 0, "v": 100},
                },
            },
            "d006": {
                "name": "Bedroom Ceiling Fan",
                "type": "CF",
                "location": "Bedroom",
                "actions": [
                    "TurnOn",
                    "TurnOff",
                    "TogglePower",
                    "SetSpeed",
                    "IncreaseSpeed",
                    "DecreaseSpeed",
                    "TurnLightOn",
                    "TurnLightOff",
                    "ToggleLight",
                    "SetBrightness",
                    "IncreaseBrightness",
                    "DecreaseBrightness",
                    "SetDirection",
                    "ToggleDirection",
                    "BreezeOn",
                    "BreezeOff",
                    "SetBreeze",
                ],
                "state": {
                    "power": 1,
                    "speed": 3,
                    "light": 1,
                    "brightness": 80,
                    "direction": 1,
                    "breeze": [0, 50, 50],
                },
            },
            "d007": {
                "name": "Guest Room Heater",
                "type": "HT",
                "location": "Guest Room",
                "actions": [
                    "TurnOn",
                    "TurnOff",
                    "SetHeat",
                    "IncreaseHeat",
                    "DecreaseHeat",
                    "SetTimer",
                ],
                "state": {"power": 1, "heat": 65, "timer": 30},
            },
            "d008": {
                "name": "Office Heater",
                "type": "HT",
                "location": "Office",
                "actions": [
                    "TurnOn",
                    "TurnOff",
                    "SetHeat",
                    "IncreaseHeat",
                    "DecreaseHeat",
                    "SetTimer",
                ],
                "state": {"power": 0, "heat": 40, "timer": 0},
            },
            "d009": {
                "name": "Guest Bedroom Shades",
                "type": "MS",
                "location": "Guest Bedroom",
                "actions": [
                    "Open",
                    "Close",
                    "Raise",
                    "Lower",
                    "SetPosition",
                    "ToggleOpen",
                    "SetTiltPosition",
                    "ToggleTilt",
                ],
                "state": {"open": 1, "position": 100, "tilt_position": 50},
            },
        },
        "groups": {
            "g001": {
                "name": "All Ceiling Fans",
                "type": "CF",
                "devices": ["d001", "d006"],
                "state": {
                    "power": 1,
                    "speed": 3,
                    "light": 1,
                    "brightness": 80,
                    "direction": 1,
                    "breeze": [0, 50, 50],
                },
            },
            "g002": {
                "name": "All Heaters",
                "type": "HT",
                "devices": ["d004", "d007", "d008"],
                "state": {"power": 1, "heat": 60, "timer": 30},
            },
        },
        "scenes": {
            "s001": {
                "name": "Movie Night",
                "devices": {
                    "d001": {"power": 1, "speed": 2, "light": 0},
                    "d005": {"light": 1, "brightness": 20, "color_temp": 2700},
                    "d002": {"position": 100},
                },
            },
            "s002": {
                "name": "Good Morning",
                "devices": {
                    "d002": {"position": 100},
                    "d001": {"power": 1, "speed": 3, "light": 1, "brightness": 100},
                    "d005": {"light": 1, "brightness": 100, "color_temp": 5000},
                },
            },
            "s003": {
                "name": "Winter Evening",
                "devices": {
                    "d004": {"power": 1, "heat": 70},
                    "d007": {"power": 1, "heat": 70},
                    "d003": {"power": 1, "flame": 80},
                    "d005": {"light": 1, "brightness": 40, "color_temp": 2700},
                },
            },
        },
    },
}

# ─────────────────────────────────────────────────────────────
#  BPUP UDP SERVER
# ─────────────────────────────────────────────────────────────


class BPUPServer:
    def __init__(self, port=30007):
        self.port = port
        self.clients = {}
        self.running = True
        self.sock = None
        self.thread = None
        self.bridge_id = "ZZBL12345"
        self.last_update_time = {}

    def start(self):
        """Start the UDP server in a background thread."""
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        print(f"[BPUP] UDP server started on port {self.port}")

    def _run(self):
        """Main UDP server loop."""
        try:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.sock.bind(("0.0.0.0", self.port))
            self.sock.setblocking(False)

            while self.running:
                try:
                    ready = select.select([self.sock], [], [], 0.1)
                    if not ready[0]:
                        continue

                    data, addr = self.sock.recvfrom(4096)
                    self._handle_client(data, addr)
                except socket.error as e:
                    if self.running:
                        print(f"[BPUP] Socket error: {e}")
                except Exception as e:
                    if self.running:
                        print(f"[BPUP] Error: {e}")

        except Exception as e:
            print(f"[BPUP] Failed to start: {e}")

    def _handle_client(self, data, addr):
        """Handle incoming UDP messages from clients."""
        if data.strip() == b"" or data.strip() == b"\n":
            self.clients[addr] = time.time()
            self._send_bond_id(addr)
            print(f"[BPUP] Client {addr} subscribed (active: {len(self.clients)})")
        else:
            try:
                msg = json.loads(data.decode("utf-8"))
                if msg.get("subscribe"):
                    self.clients[addr] = time.time()
                    self._send_bond_id(addr)
            except:
                pass

    def _send_bond_id(self, addr):
        """Send bond ID to client."""
        if self.sock:
            try:
                response = json.dumps({"B": self.bridge_id}) + "\n"
                self.sock.sendto(response.encode("utf-8"), addr)
            except Exception as e:
                print(f"[BPUP] Failed to send bond ID to {addr}: {e}")

    # def send_update(self, topic, body, method=2, status=200):
        """
        Send BPUP update to all subscribed clients only if state changed.
        """
        if not self.sock or not self.clients:
            return

        # Create a hash of the body to check if state changed
        body_hash = make_hash(body) if body else ""

        # Check if we've sent this exact state before
        cache_key = f"{topic}_{body_hash}"
        if cache_key in self.last_update_time:
            # Don't send duplicate updates
            return

        self.last_update_time[cache_key] = time.time()

        # Clean up expired clients
        now = time.time()
        expired = []
        for addr, last_time in self.clients.items():
            if now - last_time > 125:
                expired.append(addr)
        for addr in expired:
            del self.clients[addr]

        if not self.clients:
            return

        # Build the update message
        update = {
            "B": self.bridge_id,
            "d": 0,
            "v": "v3.0.0-mock",
            "t": topic,
            "i": "".join(random.choices("0123456789abcdef", k=16)),
            "s": status,
            "m": method,
            "f": 255,
            "x": "http",
            "b": body if isinstance(body, dict) else {"_": body},
        }

        # Add hash if body has content
        if "b" in update and update["b"]:
            try:
                update["b"]["_"] = make_hash(update["b"])
            except:
                pass

        message = json.dumps(update) + "\n"

        print(f"[BPUP] Sending update to {len(self.clients)} clients: {topic}")

        # Send to all clients
        for addr in list(self.clients.keys()):
            try:
                self.sock.sendto(message.encode("utf-8"), addr)
                print(f"[BPUP] Sent to {addr}")
            except Exception as e:
                print(f"[BPUP] Failed to send update to {addr}: {e}")

    # def send_update(self, topic, body, method=2, status=200):
        """Send BPUP update — improved duplicate logic + no mutation."""
        if not self.sock or not self.clients:
            return

        # Clean expired clients
        now = time.time()
        expired = [addr for addr, ts in self.clients.items() if now - ts > 125]
        for addr in expired:
            self.clients.pop(addr, None)

        if not self.clients:
            return

        # Make a deep copy so we don't mutate the original state
        body_copy = copy.deepcopy(body) if isinstance(body, dict) else body

        # Create hash for deduplication (but keep a short history)
        body_hash = make_hash(body_copy) if body_copy else "00000000"
        cache_key = f"{topic}_{body_hash}"

        # Allow re-sending the same state after 3 seconds (useful for testing)
        if cache_key in self.last_update_time:
            if now - self.last_update_time[cache_key] < 3.0:
                return  # still too recent

        self.last_update_time[cache_key] = now

        # Optional: prune very old cache entries
        if len(self.last_update_time) > 200:
            oldest_keys = sorted(self.last_update_time.items(), key=lambda x: x[1])[:50]
            for k, _ in oldest_keys:
                self.last_update_time.pop(k, None)

        # Build update (do NOT mutate body_copy)
        update = {
            "B": self.bridge_id,
            "d": 0,
            "v": "v3.0.0-mock",
            "t": topic,
            "i": "".join(random.choices("0123456789abcdef", k=16)),
            "s": status,
            "m": method,
            "f": 255,
            "x": "http",
            "b": body_copy,
        }

        # Add hash at top level of "b" (standard Bond format)
        if isinstance(update["b"], dict):
            update["b"] = {**update["b"], "_": make_hash(update["b"])}

        message = json.dumps(update) + "\n"

        print(f"[BPUP] Sending update → {topic} | clients: {len(self.clients)} | hash: {body_hash[:8]}")

        for addr in list(self.clients.keys()):
            try:
                self.sock.sendto(message.encode("utf-8"), addr)
            except Exception as e:
                print(f"[BPUP] Failed to send to {addr}: {e}")

    def send_update(self, topic, body, method=2, status=200):
        if not self.sock or not self.clients:
            print(f"[BPUP] No socket or clients for {topic}")
            return

        # Clean expired clients
        now = time.time()
        expired = [addr for addr, ts in list(self.clients.items()) if now - ts > 125]
        for addr in expired:
            self.clients.pop(addr, None)

        if not self.clients:
            print(f"[BPUP] No active clients for {topic}")
            return

        body_copy = copy.deepcopy(body) if isinstance(body, dict) else body
        body_hash = make_hash(body_copy) if body_copy else "00000000"
        cache_key = f"{topic}_{body_hash}"

        # Allow updates more often during testing
        if cache_key in self.last_update_time and now - self.last_update_time[cache_key] < 2.0:
            print(f"[BPUP] Duplicate skipped: {topic}")
            return

        self.last_update_time[cache_key] = now

        update = {
            "B": self.bridge_id,
            "d": 0,
            "v": "v3.0.0-mock",
            "t": topic,
            "i": "".join(random.choices("0123456789abcdef", k=16)),
            "s": status,
            "m": method,
            "f": 255,
            "x": "http",
            "b": body_copy,
        }

        if isinstance(update.get("b"), dict):
            update["b"]["_"] = make_hash(update["b"])   # standard format

        message = json.dumps(update) + "\n"

        print(f"[BPUP] >>> SENDING UPDATE >>> {topic} | hash={body_hash[:8]} | clients={len(self.clients)}")

        sent_count = 0
        for addr in list(self.clients.keys()):
            try:
                self.sock.sendto(message.encode("utf-8"), addr)
                sent_count += 1
                print(f"[BPUP] Sent to {addr}")
            except Exception as e:
                print(f"[BPUP] Failed to send to {addr}: {e}")

        print(f"[BPUP] Successfully sent to {sent_count} client(s)")
    def stop(self):
        """Stop the UDP server."""
        self.running = False
        if self.sock:
            self.sock.close()
        if self.thread:
            self.thread.join(timeout=1)


# Global BPUP server instance
bpup_server = BPUPServer()

# ─────────────────────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────────────────────


def make_hash(data):
    """Generate an 8-char hex hash from data."""
    if not data:
        return "00000000"
    s = json.dumps(data, sort_keys=True)
    return hashlib.md5(s.encode()).hexdigest()[:8]


def ok(data):
    data["_"] = make_hash(data)
    return jsonify(data), 200


def err(code, msg, err_id=1):
    return jsonify({"_error_id": err_id, "_error_msg": msg}), code


def get_bridge_id():
    target = request.headers.get("X-Bond-Target") or request.args.get("bridge_id")
    if target:
        if target in BRIDGES:
            return target
        return BRIDGE_IP_MAP.get(target)

    host = request.headers.get("Host", "").split(":")[0]
    bid = BRIDGE_IP_MAP.get(host)
    if bid:
        return bid

    return "ZZBL12345"


def check_token(bridge_id):
    token = request.headers.get("BOND-Token") or ""
    if not token:
        try:
            body = request.get_json(silent=True) or {}
            token = body.get("_token", "")
        except Exception:
            pass
    return token == BRIDGE_TOKEN_MAP.get(bridge_id, "")


def require_token(bridge_id):
    if not check_token(bridge_id):
        return err(401, "You need authentication credentials to continue")
    return None


def is_locked(bridge_id):
    expiry = BRIDGE_UNLOCK_EXPIRY.get(bridge_id)
    if expiry and time.time() < expiry:
        return False
    if bridge_id in BRIDGE_UNLOCK_EXPIRY:
        del BRIDGE_UNLOCK_EXPIRY[bridge_id]
    return BRIDGE_LOCKED.get(bridge_id, True)


def log_req():
    bid = get_bridge_id()
    print(f"[{bid}] {request.method} {request.path}")


def send_bpup_update_for_device(bridge_id, device_id, action_name, argument, state):
    """Send BPUP update for device state change."""
    topic = f"devices/{device_id}/state"
    bpup_server.bridge_id = bridge_id
    bpup_server.send_update(topic, state, method=2, status=200)


def send_bpup_update_for_group(bridge_id, group_id, action_name, argument, state):
    """Send BPUP update for group state change."""
    topic = f"groups/{group_id}/state"
    bpup_server.bridge_id = bridge_id
    bpup_server.send_update(topic, state, method=2, status=200)


def send_bpup_update_for_scene(bridge_id, scene_id):
    """Send BPUP update for scene execution."""
    topic = f"scenes/{scene_id}/run"
    bpup_server.bridge_id = bridge_id
    bpup_server.send_update(topic, {"executed": True}, method=2, status=200)


# ─────────────────────────────────────────────────────────────
#  TOKEN ENDPOINTS
# ─────────────────────────────────────────────────────────────


@app.route("/v2/token", methods=["GET"])
def get_token():
    log_req()
    bid = get_bridge_id()
    locked = 1 if is_locked(bid) else 0

    resp = {
        "locked": locked,
        "pin_attempts_left": 10,
        "nonce": "0000000000000000",
        "v1_nonce": "0000000000000000",
        "account_code": "",
        "v1_email": "",
    }
    if not locked:
        resp["token"] = BRIDGE_TOKEN_MAP[bid]

    resp["_"] = make_hash(resp)
    return jsonify(resp), 200


@app.route("/v2/token", methods=["PATCH"])
def patch_token():
    log_req()
    bid = get_bridge_id()
    body = request.get_json(silent=True) or {}
    pin = str(body.get("pin", ""))

    if pin == "1234":
        BRIDGE_LOCKED[bid] = False
        BRIDGE_UNLOCK_EXPIRY[bid] = time.time() + 600
        print(f"[{bid}] Token UNLOCKED via PIN for 10 minutes")
        return jsonify({"locked": 0, "_": make_hash({"locked": 0})}), 200

    if body.get("locked") == 1:
        BRIDGE_LOCKED[bid] = True
        if bid in BRIDGE_UNLOCK_EXPIRY:
            del BRIDGE_UNLOCK_EXPIRY[bid]
        return jsonify({"locked": 1, "_": make_hash({"locked": 1})}), 200

    return err(400, "Invalid PIN or request")


# ─────────────────────────────────────────────────────────────
#  POWER CYCLE SIMULATION
# ─────────────────────────────────────────────────────────────


@app.route("/sim/power_cycle", methods=["POST"])
def sim_power_cycle():
    bid = request.args.get("bridge_id", "ZZBL12345")
    if bid not in BRIDGES:
        return err(404, "Bridge not found")

    factory_reset = request.args.get("factory_reset", "false").lower() == "true"

    if factory_reset:
        new_token = "".join(random.choices(string.hexdigits[:16], k=16)).lower()
        BRIDGE_TOKEN_MAP[bid] = new_token
        print(f"[{bid}] FACTORY RESET -- new token: {new_token}")

    BRIDGE_LOCKED[bid] = False
    BRIDGE_UNLOCK_EXPIRY[bid] = time.time() + 600

    return (
        jsonify(
            {
                "message": "Power cycle simulated. Token endpoint unlocked for 10 minutes.",
                "bridge_id": bid,
                "factory_reset": factory_reset,
                "token": BRIDGE_TOKEN_MAP[bid],
                "window_secs": 600,
            }
        ),
        200,
    )


@app.route("/sim/status", methods=["GET"])
def sim_status():
    result = {}
    for bid in BRIDGES:
        locked = is_locked(bid)
        expiry = BRIDGE_UNLOCK_EXPIRY.get(bid)
        remaining = max(0, int(expiry - time.time())) if expiry else 0
        result[bid] = {
            "token": BRIDGE_TOKEN_MAP[bid],
            "locked": locked,
            "unlock_remaining_s": remaining,
            "device_count": len(BRIDGES[bid]["devices"]),
            "scene_count": len(BRIDGES[bid]["scenes"]),
            "group_count": len(BRIDGES[bid]["groups"]),
        }
    return jsonify(result), 200


# ─────────────────────────────────────────────────────────────
#  SYSTEM VERSION
# ─────────────────────────────────────────────────────────────


@app.route("/v2/sys/version", methods=["GET"])
def sys_version():
    log_req()
    bid = get_bridge_id()
    return ok(
        {
            "target": "mock",
            "fw_ver": "v3.0.0-mock",
            "fw_date": "Mon Jan 01 00:00:00 -00 2025",
            "make": "Miantic AV Distribution",
            "model": bid,
            "branding_profile": "MOCK",
            "uptime_s": int(time.time() % 86400),
            "bond_id": bid,
        }
    )


# ─────────────────────────────────────────────────────────────
#  DEVICES
# ─────────────────────────────────────────────────────────────


@app.route("/v2/devices", methods=["GET"])
def list_devices():
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    devs = BRIDGES[bid]["devices"]
    resp = {}
    for dev_id, dev in devs.items():
        resp[dev_id] = {"_": make_hash(dev)}
    return ok(resp)


@app.route("/v2/devices/<device_id>", methods=["GET"])
def get_device(device_id):
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    dev = BRIDGES[bid]["devices"].get(device_id)
    if not dev:
        return err(404, f"Device {device_id} not found")

    return ok(
        {
            "name": dev["name"],
            "type": dev["type"],
            "location": dev.get("location", ""),
            "actions": dev["actions"],
            "properties": {"_": make_hash(dev.get("properties", {}))},
            "state": {"_": make_hash(dev["state"])},
        }
    )


@app.route("/v2/devices/<device_id>/state", methods=["GET", "POST", "PUT", "PATCH"])
def device_state(device_id):
    """Handle all state operations."""
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    dev = BRIDGES[bid]["devices"].get(device_id)
    if not dev:
        return err(404, f"Device {device_id} not found")

    # GET - Return current state
    if request.method == "GET":
        return ok(copy.deepcopy(dev["state"]))

    # POST, PUT, PATCH - Update state
    body = request.get_json(silent=True) or {}
    old_state = copy.deepcopy(dev["state"])

    for k, v in body.items():
        if not k.startswith("_"):
            if k in dev["state"]:
                dev["state"][k] = v

    # Send BPUP update if state changed
    if dev["state"] != old_state:
        send_bpup_update_for_device(bid, device_id, "state_update", None, dev["state"])

    return ok(copy.deepcopy(dev["state"]))


@app.route("/v2/devices/<device_id>/state", methods=["PATCH"])
def patch_device_state(device_id):
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    dev = BRIDGES[bid]["devices"].get(device_id)
    if not dev:
        return err(404, f"Device {device_id} not found")

    body = request.get_json(silent=True) or {}
    old_state = copy.deepcopy(dev["state"])

    for k, v in body.items():
        if not k.startswith("_"):
            dev["state"][k] = v

    # Send BPUP update if state changed
    if dev["state"] != old_state:
        send_bpup_update_for_device(bid, device_id, "patch", None, dev["state"])

    return ok(copy.deepcopy(dev["state"]))


@app.route("/v2/devices/<device_id>/properties", methods=["GET"])
def get_device_properties(device_id):
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    dev = BRIDGES[bid]["devices"].get(device_id)
    if not dev:
        return err(404, f"Device {device_id} not found")

    props = {"trust_state": False}
    if dev["type"] == "CF":
        props["max_speed"] = 6
    return ok(props)


# ─────────────────────────────────────────────────────────────
#  ACTIONS
# ─────────────────────────────────────────────────────────────


# @app.route("/v2/devices/<device_id>/actions/<action_name>", methods=["PUT"])
# def execute_action(device_id, action_name):
#     log_req()
#     bid = get_bridge_id()
#     r = require_token(bid)
#     if r:
#         return r

#     dev = BRIDGES[bid]["devices"].get(device_id)
#     if not dev:
#         return err(404, f"Device {device_id} not found")

#     if action_name not in dev["actions"]:
#         return err(400, f"Action {action_name} not available on this device")

#     body = request.get_json(silent=True) or {}
#     argument = body.get("argument")
#     state = dev["state"]
#     old_state = copy.deepcopy(state)

#     print(f"[{bid}] Before action {action_name}: {state}")

#     # ── Apply action to state ──
#     a = action_name

#     # Power
#     if a == "TurnOn":
#         state["power"] = 1
#     elif a == "TurnOff":
#         state["power"] = 0
#     elif a == "TogglePower":
#         state["power"] = 1 - state.get("power", 0)
#     # Speed (CF)
#     elif a == "SetSpeed":
#         state["speed"] = max(1, min(6, int(argument or 1)))
#         state["power"] = 1
#     elif a == "IncreaseSpeed":
#         state["speed"] = min(6, state.get("speed", 1) + int(argument or 1))
#         state["power"] = 1
#     elif a == "DecreaseSpeed":
#         state["speed"] = max(1, state.get("speed", 1) - int(argument or 1))
#     # Direction (CF)
#     elif a == "SetDirection":
#         state["direction"] = int(argument or 1)
#     elif a == "ToggleDirection":
#         state["direction"] = -state.get("direction", 1)
#     # Breeze (CF)
#     elif a == "BreezeOn":
#         state["breeze"] = [
#             1,
#             state["breeze"][1] if "breeze" in state else 50,
#             state["breeze"][2] if "breeze" in state else 50,
#         ]
#     elif a == "BreezeOff":
#         if "breeze" in state:
#             state["breeze"][0] = 0
#     elif a == "SetBreeze":
#         state["breeze"] = argument if isinstance(argument, list) else [1, 50, 50]
#     # Light
#     elif a == "TurnLightOn":
#         state["light"] = 1
#     elif a == "TurnLightOff":
#         state["light"] = 0
#     elif a == "ToggleLight":
#         state["light"] = 1 - state.get("light", 0)
#     elif a == "TurnUpLightOn":
#         state["up_light"] = 1
#     elif a == "TurnUpLightOff":
#         state["up_light"] = 0
#     elif a == "TurnDownLightOn":
#         state["down_light"] = 1
#     elif a == "TurnDownLightOff":
#         state["down_light"] = 0
#     # Brightness
#     elif a == "SetBrightness":
#         state["brightness"] = max(1, min(100, int(argument or 100)))
#     elif a == "IncreaseBrightness":
#         state["brightness"] = min(
#             100, state.get("brightness", 100) + int(argument or 10)
#         )
#     elif a == "DecreaseBrightness":
#         state["brightness"] = max(1, state.get("brightness", 100) - int(argument or 10))
#     elif a == "SetUpLightBrightness":
#         state["up_light_brightness"] = max(1, min(100, int(argument or 100)))
#     elif a == "SetDownLightBrightness":
#         state["down_light_brightness"] = max(1, min(100, int(argument or 100)))
#     elif a == "IncreaseUpLightBrightness":
#         state["up_light_brightness"] = min(
#             100, state.get("up_light_brightness", 100) + int(argument or 10)
#         )
#     elif a == "DecreaseUpLightBrightness":
#         state["up_light_brightness"] = max(
#             1, state.get("up_light_brightness", 100) - int(argument or 10)
#         )
#     elif a == "IncreaseDownLightBrightness":
#         state["down_light_brightness"] = min(
#             100, state.get("down_light_brightness", 100) + int(argument or 10)
#         )
#     elif a == "DecreaseDownLightBrightness":
#         state["down_light_brightness"] = max(
#             1, state.get("down_light_brightness", 100) - int(argument or 10)
#         )
#     # ColorTemp (LT)
#     elif a == "SetColorTemp":
#         state["color_temp"] = int(argument or 3000)
#     elif a == "IncreaseColorTemp":
#         state["color_temp"] = state.get("color_temp", 3000) + int(argument or 100)
#     elif a == "DecreaseColorTemp":
#         state["color_temp"] = state.get("color_temp", 3000) - int(argument or 100)
#     # HSV (LT/CF)
#     elif a == "SetHSV":
#         if isinstance(argument, dict):
#             hsv = state.get("hsv", {"h": 0, "s": 0, "v": 100})
#             hsv.update(argument)
#             state["hsv"] = hsv
#     # Flame (FP)
#     elif a == "SetFlame":
#         state["flame"] = max(1, min(100, int(argument or 50)))
#         state["power"] = 1
#     elif a == "IncreaseFlame":
#         state["flame"] = min(100, state.get("flame", 50) + int(argument or 10))
#         state["power"] = 1
#     elif a == "DecreaseFlame":
#         state["flame"] = max(1, state.get("flame", 50) - int(argument or 10))
#     elif a == "TurnFpFanOn":
#         state["fpfan_power"] = 1
#     elif a == "TurnFpFanOff":
#         state["fpfan_power"] = 0
#     elif a == "SetFpFan":
#         state["fpfan_speed"] = max(1, min(100, int(argument or 50)))
#     # Heat (HT)
#     elif a == "SetHeat":
#         state["heat"] = max(1, min(100, int(argument or 50)))
#         state["power"] = 1
#     elif a == "IncreaseHeat":
#         state["heat"] = min(100, state.get("heat", 50) + int(argument or 10))
#         state["power"] = 1
#     elif a == "DecreaseHeat":
#         state["heat"] = max(1, state.get("heat", 50) - int(argument or 10))
#     elif a == "SetTimer":
#         state["timer"] = max(0, int(argument or 0))
#     # Shades (MS)
#     elif a == "Open":
#         state["open"] = 1
#         state["position"] = 100
#     elif a == "Close":
#         state["open"] = 0
#         state["position"] = 0
#     elif a == "ToggleOpen":
#         state["open"] = 1 - state.get("open", 0)
#     elif a == "Raise":
#         state["position"] = min(100, state.get("position", 0) + 10)
#     elif a == "Lower":
#         state["position"] = max(0, state.get("position", 100) - 10)
#     elif a == "SetPosition":
#         pos = max(0, min(100, int(argument or 0)))
#         state["position"] = pos
#         state["open"] = 1 if pos > 0 else 0
#     elif a == "SetTiltPosition":
#         state["tilt_position"] = max(0, min(90, int(argument or 0)))
#     elif a == "ToggleTilt":
#         state["tilt_position"] = 0 if state.get("tilt_position", 0) > 0 else 90
#     elif a == "SetUpperRailPosition":
#         state["upper_rail_position"] = max(0, min(100, int(argument or 0)))
#     elif a == "SetLowerRailPosition":
#         state["lower_rail_position"] = max(0, min(100, int(argument or 0)))
#     elif a == "Hold":
#         pass
#     elif a == "Preset":
#         state["position"] = -1
#     else:
#         print(f"[{bid}] Action {action_name} not specifically handled -- returning 200")

#     print(f"[{bid}] After action {action_name}: {state}")

#     # Check if state actually changed
#     if state != old_state:
#         print(f"[{bid}] State changed for {device_id}: {old_state} -> {state}")
#         # Send BPUP update only on state change
#         send_bpup_update_for_device(bid, device_id, action_name, argument, state)
#     else:
#         print(f"[{bid}] State did NOT change for {device_id}")

#     resp = {"argument": argument}
#     resp["_"] = make_hash(resp)
#     return jsonify(resp), 200


@app.route("/v2/devices/<device_id>/actions/<action_name>", methods=["PUT"])
def execute_action(device_id, action_name):
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    dev = BRIDGES[bid]["devices"].get(device_id)
    if not dev:
        return err(404, f"Device {device_id} not found")

    if action_name not in dev["actions"]:
        return err(400, f"Action {action_name} not available on this device")

    body = request.get_json(silent=True) or {}
    argument = body.get("argument")
    state = dev["state"]
    old_state = copy.deepcopy(state)

    print(f"[{bid}] Before action {action_name}: {state}")

    # ── Apply action to state ──
    a = action_name
    if a == "TurnOn":
        state["power"] = 1
    elif a == "TurnOff":
        state["power"] = 0
    elif a == "TogglePower":
        state["power"] = 1 - state.get("power", 0)
    # (… keep all your other action cases here …)

    # ── After applying action ──
    if state != old_state:
        print(f"[{bid}] State CHANGED for {device_id}")
        send_bpup_update_for_device(bid, device_id, action_name, argument, copy.deepcopy(state))
    else:
        print(f"[{bid}] State did NOT change for {device_id}")

    print(f"[{bid}] After action {action_name}: {state}")
    return ok(copy.deepcopy(state))


# ─────────────────────────────────────────────────────────────
#  SCENES
# ─────────────────────────────────────────────────────────────


@app.route("/v2/scenes", methods=["GET"])
def list_scenes():
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    scns = BRIDGES[bid]["scenes"]
    resp = {}
    for sid, scn in scns.items():
        resp[sid] = {"_": make_hash(scn)}
    return ok(resp)


@app.route("/v2/scenes", methods=["POST"])
def create_scene():
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    body = request.get_json(silent=True) or {}
    post_id = body.get("_post_id") or "".join(random.choices("0123456789abcdef", k=16))
    name = body.get("name", "New Scene")
    actors = body.get("actors", [])

    BRIDGES[bid]["scenes"][post_id] = {"name": name, "actors": actors}
    return jsonify({"_post_id": post_id}), 201


@app.route("/v2/scenes/<scene_id>", methods=["GET"])
def get_scene(scene_id):
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    scn = BRIDGES[bid]["scenes"].get(scene_id)
    if not scn:
        return err(404, f"Scene {scene_id} not found")

    return ok(copy.deepcopy(scn))


@app.route("/v2/scenes/<scene_id>/run", methods=["PUT"])
def execute_scene(scene_id):
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    scn = BRIDGES[bid]["scenes"].get(scene_id)
    if not scn:
        return err(404, f"Scene {scene_id} not found")

    print(f"[{bid}] Executing scene {scene_id}: {scn.get('name')}")

    scene_devices = scn.get("devices", {})
    for device_id, device_state in scene_devices.items():
        if device_id in BRIDGES[bid]["devices"]:
            dev = BRIDGES[bid]["devices"][device_id]
            old_state = copy.deepcopy(dev["state"])
            for key, value in device_state.items():
                if key in dev["state"]:
                    dev["state"][key] = value
            if dev["state"] != old_state:
                send_bpup_update_for_device(
                    bid, device_id, "scene_execute", None, dev["state"]
                )

    send_bpup_update_for_scene(bid, scene_id)
    return jsonify({"status": "executed"}), 200


@app.route("/v2/scenes/<scene_id>", methods=["DELETE"])
def delete_scene(scene_id):
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    if scene_id not in BRIDGES[bid]["scenes"]:
        return err(404, f"Scene {scene_id} not found")

    del BRIDGES[bid]["scenes"][scene_id]
    return Response(status=204)


# ─────────────────────────────────────────────────────────────
#  GROUPS
# ─────────────────────────────────────────────────────────────


@app.route("/v2/groups", methods=["GET"])
def list_groups():
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    grps = BRIDGES[bid]["groups"]
    resp = {}
    for gid, grp in grps.items():
        resp[gid] = {"_": make_hash(grp)}
    return ok(resp)


@app.route("/v2/groups", methods=["POST"])
def create_group():
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    body = request.get_json(silent=True) or {}
    post_id = body.get("_post_id") or "".join(random.choices("0123456789abcdef", k=16))
    name = body.get("name", "New Group")
    devices = body.get("devices", [])

    BRIDGES[bid]["groups"][post_id] = {
        "name": name,
        "devices": devices,
        "types": [],
        "actions": [],
    }
    return jsonify({"_post_id": post_id}), 201


@app.route("/v2/groups/<group_id>", methods=["GET"])
def get_group(group_id):
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    grp = BRIDGES[bid]["groups"].get(group_id)
    if not grp:
        return err(404, f"Group {group_id} not found")

    return ok(copy.deepcopy(grp))


@app.route("/v2/groups/<group_id>/state", methods=["GET"])
def get_group_state(group_id):
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    grp = BRIDGES[bid]["groups"].get(group_id)
    if not grp:
        return err(404, f"Group {group_id} not found")

    devs = BRIDGES[bid]["devices"]
    members = grp.get("devices", [])
    merged = {}

    for dev_id in members:
        dev = devs.get(dev_id)
        if not dev:
            continue
        st = dev["state"]
        for k, v in st.items():
            if k not in merged:
                merged[k] = v
            elif merged[k] != v:
                merged[k] = None

    return ok(merged)


@app.route("/v2/groups/<group_id>/state", methods=["PATCH"])
def patch_group_state(group_id):
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    group = BRIDGES[bid]["groups"].get(group_id)
    if not group:
        return err(404, f"Group {group_id} not found")

    body = request.get_json(silent=True) or {}
    old_state = copy.deepcopy(group["state"])

    for k, v in body.items():
        if not k.startswith("_"):
            group["state"][k] = v

    if group["state"] != old_state:
        send_bpup_update_for_group(bid, group_id, "patch", None, group["state"])

    return ok(copy.deepcopy(group["state"]))


@app.route("/v2/groups/<group_id>/actions/<action_name>", methods=["PUT"])
def execute_group_action(group_id, action_name):
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    grp = BRIDGES[bid]["groups"].get(group_id)
    if not grp:
        return err(404, f"Group {group_id} not found")

    body = request.get_json(silent=True) or {}
    argument = body.get("argument")
    devs = BRIDGES[bid]["devices"]

    for dev_id in grp.get("devices", []):
        dev = devs.get(dev_id)
        if dev and action_name in dev["actions"]:
            old_state = copy.deepcopy(dev["state"])

            # Apply action directly
            a = action_name
            state = dev["state"]

            # Simplified action handling for groups
            if a == "TurnOn":
                state["power"] = 1
            elif a == "TurnOff":
                state["power"] = 0
            elif a == "TogglePower":
                state["power"] = 1 - state.get("power", 0)
            elif a == "SetSpeed":
                state["speed"] = max(1, min(6, int(argument or 1)))
                state["power"] = 1
            elif a == "TurnLightOn":
                state["light"] = 1
            elif a == "TurnLightOff":
                state["light"] = 0
            elif a == "ToggleLight":
                state["light"] = 1 - state.get("light", 0)
            elif a == "SetBrightness":
                state["brightness"] = max(1, min(100, int(argument or 100)))

            if dev["state"] != old_state:
                send_bpup_update_for_device(
                    bid, dev_id, action_name, argument, dev["state"]
                )

    return jsonify({"argument": argument, "_": make_hash({"argument": argument})}), 200


@app.route("/v2/groups/<group_id>", methods=["DELETE"])
def delete_group(group_id):
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r

    if group_id not in BRIDGES[bid]["groups"]:
        return err(404, f"Group {group_id} not found")

    del BRIDGES[bid]["groups"][group_id]
    return Response(status=204)


# ─────────────────────────────────────────────────────────────
#  BPUP CONFIG
# ─────────────────────────────────────────────────────────────


@app.route("/v2/api/bpup", methods=["GET"])
def get_bpup():
    log_req()
    bid = get_bridge_id()
    r = require_token(bid)
    if r:
        return r
    return ok({"broadcast": True, "port": 30007})


# ─────────────────────────────────────────────────────────────
#  ROOT / HEALTH
# ─────────────────────────────────────────────────────────────


@app.route("/", methods=["GET"])
def root():
    return (
        jsonify(
            {
                "message": "Bond Bridge Mock Server",
                "version": "1.0.0",
                "bridges": list(BRIDGES.keys()),
                "tip": "Use X-Bond-Target: ZZBL12345 header to target a specific bridge",
                "sim": {
                    "power_cycle": "POST /sim/power_cycle?bridge_id=ZZBL12345",
                    "factory_reset": "POST /sim/power_cycle?bridge_id=ZZBL12345&factory_reset=true",
                    "status": "GET /sim/status",
                },
                "bpup": {
                    "port": 30007,
                    "status": "running" if bpup_server.running else "stopped",
                    "clients": len(bpup_server.clients),
                },
            }
        ),
        200,
    )


@app.route("/v2", methods=["GET"])
def v2_root():
    return root()


# ─────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Bond Bridge Mock Server")
    parser.add_argument(
        "--port", type=int, default=8080, help="Port to listen on (default: 8080)"
    )
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host to listen on")
    parser.add_argument("--bpup-port", type=int, default=30007, help="BPUP UDP port")
    args = parser.parse_args()

    # Start BPUP server
    bpup_server.port = args.bpup_port
    bpup_server.start()

    print("=" * 60)
    print("  Bond Bridge Mock Server with BPUP Support")
    print("=" * 60)
    print(f"  HTTP URL:     http://localhost:{args.port}")
    print(f"  BPUP UDP:     port {args.bpup_port}")
    print(f"  Bridges:      {', '.join(BRIDGES.keys())}")
    print("")
    print("  To test BPUP:")
    print("  1. Run: python test_bpup.py")
    print("  2. Send a PUT request:")
    print(
        f"     curl -X PUT http://localhost:{args.port}/v2/devices/d001/actions/TurnOn -H 'BOND-Token: f074b61f628018fd'"
    )
    print("")
    print("  Token PIN: 1234")
    print("=" * 60)

    try:
        app.run(host=args.host, port=args.port, debug=True, threaded=True)
    finally:
        bpup_server.stop()