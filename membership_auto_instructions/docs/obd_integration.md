OBD-II / Reed Device Integration - Engineering Doc
==================================================

Supported PIDs (minimum):
- 010C Engine RPM
- 010D Vehicle Speed
- 0105 Coolant Temp
- 010F Intake Air Temp
- 012F Fuel Level Input
- 015E Fuel Rate (if available)
- 0131 Distance Since Codes Cleared
- 03 Request DTCs (diagnostic trouble codes)

Pairing Flow (app):
1. User chooses vehicle -> "Connect device"
2. Scan QR (dongleId) OR scan BLE devices (advertised name: MA-REED-XXXX)
3. POST /vehicles/{id}/link-dongle { dongleId, connectionType }

OBD sample payload (BLE app -> API):
{
  "vehicleId": "uuid",
  "startTimestamp": 1730001000,
  "endTimestamp": 1730002000,
  "samples": [
    { "t": 0, "speed": 12.3, "fuelRate": 2.1, "odometer": 12345.7 },
    { "t": 5, "speed": 14.0, "fuelRate": 2.3, "odometer": 12345.8 }
  ],
  "dtcList": ["P0300"]
}

Trip detection:
- Start: speed > 2 km/h or RPM change > 300
- End: speed == 0 for 120 seconds

Data handling:
- App buffers samples during trip
- On trip end, compress and send to /telematics/{vehicleId}
- Server stores raw, runs analytics, updates vehicle health

Security:
- BLE pairing handshake with short-lived pairing token from server
- All API calls use HTTPS + bearer JWT

