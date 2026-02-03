---
sidebar_position: 101
sidebar_custom_props:
  icon: gear
---

# Pre-Flight Operations Procedure

Document ID: `ARROW-OPS-2026-0087`
Classification: **OPERATIONAL**
Effective Date: 2026-01-01
Supersedes: ARROW-OPS-2025-0087 Rev 4

---

## 1. Purpose

This procedure establishes the standardized sequence for pre-flight verification of Arrow Quiver-class unmanned aircraft systems. Compliance is mandatory for all flight operations.

## 2. Applicability

| Platform | Configuration | Applicable |
|----------|---------------|------------|
| Quiver PT3 | All variants | Yes |
| Quiver Dev-Kit | All variants | Yes |
| Quiver PT2 | Standard only | Partial — see Appendix C |
| Quiver PT1 | — | No |

## 3. Prerequisites

Before initiating this procedure, verify:

- [ ] Pilot-in-command (PIC) holds current certification
- [ ] Airspace authorization confirmed for planned operation area
- [ ] Weather conditions within operational envelope
- [ ] Aircraft maintenance status: **FLIGHT READY**
- [ ] Battery state-of-charge ≥ 90%
- [ ] Ground control station operational

## 4. Equipment Required

| Item | Quantity | Notes |
|------|----------|-------|
| Calibrated multimeter | 1 | For voltage verification |
| Torque wrench (2-10 N·m) | 1 | For fastener checks |
| Inspection mirror | 1 | For underside inspection |
| Logbook | 1 | Current aircraft logbook |
| Checklist card | 1 | Laminated quick-reference |

## 5. Procedure

### 5.1 Phase 1 — Documentation Review

**Estimated time:** 5 minutes

1. Verify aircraft identification matches assignment
2. Review maintenance logbook for:
   - Last inspection date (must be within 25 flight hours)
   - Open discrepancies or MEL items
   - Component life limits
3. Confirm weight and balance within limits for planned payload
4. Document weather conditions:

```
METAR: _________________ Time: _______
Wind: _____ kts @ _____°  Gusts: _____ kts
Visibility: _____ SM  Ceiling: _____ ft AGL
Temperature: _____°C  Humidity: _____%
```

### 5.2 Phase 2 — Structural Inspection

**Estimated time:** 10 minutes

#### 5.2.1 Airframe

| Checkpoint | Criteria | Pass |
|------------|----------|------|
| Frame tubes | No cracks, dents, or deformation | ☐ |
| Motor arms | Secure, fold mechanism locked | ☐ |
| Landing gear | Secure mounting, no damage | ☐ |
| Fasteners | All present, torque marks aligned | ☐ |
| Enclosure | Sealed, latches secure | ☐ |

#### 5.2.2 Propulsion

For each motor position (1-4):

| Motor | Propeller | Mounting | Spin Test | Status |
|-------|-----------|----------|-----------|--------|
| M1 (FL) | ☐ CW secure | ☐ Tight | ☐ Free | ______ |
| M2 (FR) | ☐ CCW secure | ☐ Tight | ☐ Free | ______ |
| M3 (RL) | ☐ CCW secure | ☐ Tight | ☐ Free | ______ |
| M4 (RR) | ☐ CW secure | ☐ Tight | ☐ Free | ______ |

> **WARNING:** Verify propeller rotation direction matches motor position. Incorrect installation will result in loss of control.

### 5.3 Phase 3 — Electrical Verification

**Estimated time:** 8 minutes

#### 5.3.1 Battery System

1. Remove battery from aircraft
2. Perform visual inspection:
   - No swelling, damage, or corrosion
   - Connector pins clean and straight
   - Balance lead intact
3. Record measurements:

| Cell | Voltage | Limit | Status |
|------|---------|-------|--------|
| S1 | _____ V | 3.7-4.2V | ☐ |
| S2 | _____ V | 3.7-4.2V | ☐ |
| S3 | _____ V | 3.7-4.2V | ☐ |
| S4 | _____ V | 3.7-4.2V | ☐ |
| S5 | _____ V | 3.7-4.2V | ☐ |
| S6 | _____ V | 3.7-4.2V | ☐ |
| **Total** | _____ V | 22.2-25.2V | ☐ |
| **Imbalance** | _____ mV | <50mV max | ☐ |

#### 5.3.2 Avionics Power-On

Execute in sequence:

```
1. Connect battery         → Main LED: AMBER
2. Wait 5 seconds          → System initialization
3. Verify GPS lock         → GPS LED: GREEN (>8 sats)
4. Verify telemetry link   → RC LED: GREEN
5. Verify GCS connection   → Heartbeat active
```

### 5.4 Phase 4 — Functional Test

**Estimated time:** 5 minutes

#### 5.4.1 Control Surface Verification

With throttle at zero and aircraft **DISARMED**:

| Input | Expected Response | Verified |
|-------|-------------------|----------|
| Roll right | Motors 1,3 increase indication | ☐ |
| Roll left | Motors 2,4 increase indication | ☐ |
| Pitch forward | Motors 3,4 increase indication | ☐ |
| Pitch back | Motors 1,2 increase indication | ☐ |
| Yaw right | Motors 1,4 increase indication | ☐ |
| Yaw left | Motors 2,3 increase indication | ☐ |

#### 5.4.2 Failsafe Verification

1. With GCS connected, disable RC transmitter
2. Verify failsafe activates within 1.5 seconds
3. Verify configured failsafe action (RTL/Land/Hold)
4. Re-enable RC transmitter
5. Verify normal control restored

### 5.5 Phase 5 — Final Authorization

**All items must be marked complete before flight authorization.**

```
PIC Verification:

I have personally verified completion of all checklist items.
Aircraft is airworthy and safe for the planned operation.

PIC Name: _________________________
PIC Signature: ____________________
Date/Time: ________________________

Authorization Status: [ ] CLEARED FOR FLIGHT
                      [ ] FLIGHT NOT AUTHORIZED

If not authorized, reason: _______________________
```

---

## 6. Abort Criteria

Immediately terminate the pre-flight sequence if any of the following are observed:

- Battery cell voltage <3.5V or imbalance >100mV
- Structural damage or loose fasteners
- Control response incorrect or erratic
- GPS satellites <6 or HDOP >2.0
- Telemetry link loss >3 seconds
- Weather deterioration below minimums

---

##### References

- ARROW-SPEC-2026-0142 — XR-7 Propulsion Module Technical Specification
- ARROW-MNT-2026-0023 — Scheduled Maintenance Requirements
- ARROW-SAF-2026-0011 — Emergency Procedures Manual
