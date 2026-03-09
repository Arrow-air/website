---
sidebar_position: 100
sidebar_custom_props:
  icon: doc
---

# XR-7 Propulsion Module Technical Specification

Document ID: `ARROW-SPEC-2026-0142`
Classification: **PUBLIC**
Revision: 3.2.1
Last Updated: 2026-02-02

---

## 1. Overview

The XR-7 Propulsion Module is a high-efficiency brushless motor assembly designed for sustained autonomous flight operations in variable atmospheric conditions. This document defines the technical parameters, operational limits, and integration requirements for deployment in Arrow platform configurations.

| Parameter | Value | Unit | Tolerance |
|-----------|-------|------|-----------|
| Rated Power | 2,400 | W | ±2% |
| Max Continuous Current | 45 | A | — |
| Peak Current (10s) | 62 | A | — |
| KV Rating | 170 | rpm/V | ±5% |
| Operating Voltage | 44.4–58.8 | V | — |
| Mass (bare motor) | 438 | g | ±3g |
| Stator Diameter | 56 | mm | ±0.1mm |
| Stator Length | 30 | mm | ±0.1mm |

## 2. Performance Characteristics

### 2.1 Thrust Curve

Measured at sea level, 15°C, 1013.25 hPa with standard 22×7.2 propeller.

| Throttle | Current | Power | Thrust | Efficiency |
|----------|---------|-------|--------|------------|
| 25% | 8.2 A | 410 W | 1.82 kg | 4.44 g/W |
| 50% | 18.6 A | 930 W | 4.21 kg | 4.53 g/W |
| 75% | 32.4 A | 1,620 W | 6.89 kg | 4.25 g/W |
| 100% | 48.1 A | 2,405 W | 9.34 kg | 3.88 g/W |

### 2.2 Thermal Limits

> **CAUTION:** Exceeding thermal limits will trigger automatic power derating. Sustained operation above 95°C stator temperature will result in permanent degradation.

- **Maximum Stator Temperature:** 120°C
- **Maximum Bearing Temperature:** 85°C
- **Recommended Operating Range:** -20°C to +45°C ambient

## 3. Mechanical Interface

### 3.1 Mounting Pattern

The XR-7 uses a standard 4-bolt radial mounting pattern compatible with Arrow Universal Motor Mount (AUMM) specification.

```
        [FRONT]
           ○
     M4×0.7  19mm
    ○───────────○
    │           │
    │     ●     │  ← Shaft centerline
    │   (∅8mm)  │
    ○───────────○
         19mm
        [REAR]
```

**Bolt Specification:**
- Thread: M4×0.7
- Length: 12mm minimum engagement
- Grade: 12.9 or equivalent
- Torque: 3.2 N·m ± 0.2 N·m

### 3.2 Shaft Details

| Feature | Specification |
|---------|---------------|
| Diameter | 8.00 mm h6 |
| Length (exposed) | 22 mm |
| Thread | M8×1.0 LH |
| Keyway | 3×3 mm, 12mm length |
| Material | 4140 steel, hardened |

## 4. Electrical Interface

### 4.1 Power Connections

Three-phase winding connection using 4mm gold-plated bullet connectors.

```
Phase A ──[YEL]──●
Phase B ──[ORG]──●  → ESC Input
Phase C ──[RED]──●
```

### 4.2 Sensor Interface

Optional hall sensor package available. 6-pin JST-SH connector.

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | VCC | 5V supply (10mA max) |
| 2 | GND | Ground reference |
| 3 | HA | Hall A output |
| 4 | HB | Hall B output |
| 5 | HC | Hall C output |
| 6 | TEMP | NTC thermistor (10kΩ @ 25°C) |

## 5. Quality Assurance

### 5.1 Acceptance Criteria

Each unit undergoes the following validation sequence:

1. **Visual Inspection** — Surface defects, winding integrity, bearing alignment
2. **Electrical Test** — Phase resistance (±3%), inductance (±10%), insulation (>100MΩ @ 500VDC)
3. **Dynamic Balance** — G2.5 or better per ISO 1940-1
4. **Run-in Test** — 30 minutes at 50% load, thermal stability verification
5. **Final Inspection** — Dimensional verification, documentation package

### 5.2 Traceability

All units are laser-marked with:

```
ARROW│XR-7│SN:YYWW-NNNNN│LOT:XXXXXX
```

- `YY` — Year of manufacture
- `WW` — Week of manufacture
- `NNNNN` — Sequential unit number
- `XXXXXX` — Production lot identifier

---

##### Document Control

| Rev | Date | Author | Description |
|-----|------|--------|-------------|
| 3.2.1 | 2026-02-02 | Systems Engineering | Updated thermal limits |
| 3.2.0 | 2026-01-15 | Systems Engineering | Added sensor interface |
| 3.1.0 | 2025-11-20 | Propulsion Team | Initial release |
