---
sidebar_position: 1
title: Power System Design
description: Comprehensive electrical, power distribution, and propulsion system design for Arrow Air eVTOL platforms.
---

# Power System Design

## Overview

This document captures the electrical system architecture, power distribution network, and propulsion integration for Arrow Air's eVTOL platforms. The design targets **Project Quiver** (25 kg quadcopter) with scaling considerations for **Project Spearhead** (fixed-wing VTOL).

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MAIN POWER ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Battery Pack (48V LiFePO4)                                     │
│       │                                                         │
│       ├── Main Power Bus (48V, 200A)                           │
│       │     ├── Motor ESC Array (×4, 48V, 50A each)           │
│       │     ├── Avionics DC-DC (48V → 12V, 30A, redundant)    │
│       │     ├── Payload Bus (48V, 15A)                         │
│       │     └── Emergency Reserve (isolated, 5A)               │
│       │                                                         │
│       └── BMS Interface (CAN, 250kbps)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Electrical System Design

### Primary Power Bus

| Parameter | Specification |
|-----------|--------------|
| Nominal Voltage | 48V DC |
| Operating Range | 42V – 54.6V |
| Maximum Current | 200A continuous |
| Bus Bar Material | Tinned copper, 10mm² cross-section |
| Insulation | Silicone, 200°C rated |

### Secondary Power Bus

| Parameter | Specification |
|-----------|--------------|
| Nominal Voltage | 12V DC |
| Source | Redundant DC-DC converters |
| Maximum Current | 30A per converter |
| Ripple | <50mV peak-to-peak |
| Regulation | ±2% over full load range |

### Circuit Protection

- **Main Fuse:** 225A ANL fuse, mid-air replaceable
- **Branch Fuses:** 60A per motor branch (×4)
- **Avionics Fuse:** 40A resettable PTC
- **Payload Fuse:** 20A slow-blow

### Redundancy Strategy

Critical flight systems (FCU, IMU, GPS, telemetry) draw from a **redundant 12V bus** fed by two independent DC-DC converters. A priority diode OR-ing scheme ensures seamless switchover without data interruption.

## 2. Power Distribution Network

### Load Analysis

| System | Peak Draw | Continuous | Duty Cycle |
|--------|-----------|------------|------------|
| Motors (×4) | 8.0 kW | 5.0 kW | 100% (hover) |
| Avionics | 0.4 kW | 0.36 kW | 100% |
| Payload | 0.7 kW | 0.3 kW | 50% |
| Telemetry | 0.05 kW | 0.03 kW | 100% |
| **Total** | **9.15 kW** | **5.69 kW** | — |

### Wire Sizing

Wire gauge selected for **<2% voltage drop** at maximum continuous current:

| Circuit | Wire Gauge | Length (max) | Drop @ Peak |
|---------|-----------|--------------|-------------|
| Motor ×4 | 10 AWG | 0.8 m | 1.4% |
| Avionics | 16 AWG | 1.2 m | 1.8% |
| Payload | 14 AWG | 1.0 m | 1.6% |
| Emergency | 18 AWG | 0.5 m | 1.1% |

### Connector Selection

| Application | Connector | Current Rating | IP Rating |
|-------------|-----------|----------------|-----------|
| Main power | XT90-S | 90A | IP65 |
| Motor phases | AS150 | 150A | IP67 |
| Signal / CAN | JST-GH | 1A | IP40 |
| Avionics | Molex Micro-Fit 3.0 | 5A | IP20 |

## 3. Propulsion Integration

### Motor Specifications

| Parameter | Value |
|-----------|-------|
| Type | Brushless DC (BLDC), outrunner |
| KV Rating | 180 RPM/V |
| Peak Power | 2.0 kW per motor |
| Continuous Power | 1.25 kW per motor |
| Efficiency | >92% at cruise (60% throttle) |
| Weight | 280 g |
| Shaft Diameter | 8 mm |
| Mounting | M3×4, 30 mm bolt circle |

### ESC / Motor Controller

| Parameter | Value |
|-----------|-------|
| Input Voltage | 48V (42–54.6V) |
| Max Current | 50A continuous, 60A peak (10s) |
| Protocol | DShot600, Oneshot125 |
| BEC | 5V/3A linear, 12V/2A switching |
| FETs | 75V 180A MOSFET, ×3 phase |
| Firmware | Betaflight / custom Arrow fork |

### Propeller

| Parameter | Value |
|-----------|-------|
| Diameter | 13 × 5.5 inch (foldable) |
| Material | Carbon-fibre composite |
| Max RPM | 8,500 |
| Thrust @ 60% | 3.2 kg per motor |
| Noise | <85 dBA at 2 m |

### Thermal Management

| Component | Sensor Type | Threshold | Action |
|-----------|-------------|-----------|--------|
| Motor windings | NTC thermistor | 85°C | Throttle derate |
| ESC MOSFETs | NTC thermistor | 75°C | Current limit |
| Battery cells | NTC (BMS) | 45°C | Discharge cut-off |
| Ambient | BME280 | 50°C | Flight abort |

Cooling is passive for motors (ducted propeller flow) and active for ESCs (aluminum heat sink + 5V fan at 50% duty cycle).

## 4. Battery Management System

### Cell Configuration

| Parameter | Value |
|-----------|-------|
| Chemistry | LiFePO₄ (LFP) |
| Configuration | 15S1P |
| Nominal Voltage | 48V (3.2V × 15) |
| Capacity | 20 Ah |
| Energy | 960 Wh |
| Continuous Discharge | 20C (400A) |
| Peak Discharge | 30C (600A, 10s) |
| Cycle Life | >2,000 cycles @ 80% DOD |

### BMS Features

- Cell-level voltage monitoring (±5mV accuracy)
- Current integration (Coulomb counting)
- Temperature monitoring (×4 cells)
- Over-voltage / under-voltage protection
- Over-current / short-circuit protection
- Cell balancing (passive, 100mA shunt)
- CAN bus interface at 250kbps
- Precharge circuit for inrush limiting

## 5. Wiring Diagram

```
                        ┌─────────────┐
                        │  Battery    │
                        │  48V 20Ah   │
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │ 225A ANL    │
                        │   Fuse      │
                        └──────┬──────┘
                               │
                        ┌──────▼──────────────────────────────────┐
                        │           +48V Main Bus Bar            │
                        │          (tinned copper, 10mm²)        │
                        └──────┬──────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
    ┌─────▼─────┐      ┌──────▼──────┐      ┌──────▼──────┐
    │ Breaker   │      │  Breaker    │      │  Breaker    │
    │  180A     │      │   180A      │      │   180A      │
    └─────┬─────┘      └──────┬──────┘      └──────┬──────┘
          │                    │                    │
    ┌─────▼─────┐      ┌──────▼──────┐      ┌──────▼──────┐
    │  Motor    │      │   Motor     │      │   Motor     │
    │  ESC 1    │      │   ESC 2     │      │   ESC 3     │
    │  (M1)     │      │   (M2)      │      │   (M3)      │
    └───────────┘      └─────────────┘      └─────────────┘

          │                    │                    │
    ┌─────▼─────┐      ┌──────▼──────┐      ┌──────▼──────┐
    │  Motor    │      │  DC-DC      │      │  DC-DC      │
    │  ESC 4    │      │  Conv 1     │      │  Conv 2     │
    │  (M4)     │      │  48→12V     │      │  48→12V     │
    └───────────┘      │  30A (Pri)  │      │  30A (Red)  │
                       └──────┬──────┘      └──────┬──────┘
                              │                    │
                       ┌──────▼──────┐             │
                       │   +12V Bus  │◄────────────┘
                       │  (Avionics) │
                       └──────┬──────┘
                              │
                       ┌──────▼──────┐
                       │  Breaker    │
                       │   40A       │
                       └──────┬──────┘
                              │
                       ┌──────▼──────┐
                       │ Payload     │
                       │   Bus       │
                       └─────────────┘
```

## 6. Schematic

![Power System Schematic](/img/bounty-201-schematic.svg)

## 7. Testing & Validation

### Bench Tests

1. **Continuity & Insulation** — Megger test >10 MΩ between power and airframe
2. **Voltage Regulation** — Measure bus voltage from 42V to 54.6V input
3. **Current Limiting** — Verify breaker trip at 110% rated current
4. **Thermal Profile** — IR camera survey at 80% continuous load
5. **EMI Emissions** — Conducted & radiated, DO-160 Category H thresholds
6. **BMS Accuracy** — Cell voltage error <10mV across 2.5V–3.6V range

### Integration Tests

1. **Motor Startup Sequence** — Staggered spin-up, 100ms delay between arms
2. **Telemetry Accuracy** — Current/voltage sensor calibration against reference meter
3. **Fault Injection** — Simulate over-current, verify breaker trip <5ms
4. **Emergency Stop** — Verify all ESCs respond <100ms
5. **Redundancy Verification** — Disconnect primary DC-DC, confirm backup takes load
6. **Vibration Profile** — Power system survives 2.5 grms, 20–2000 Hz per DO-27

### Flight Tests

| Phase | Duration | Objective |
|-------|----------|-----------|
| Hover | 2 min | Power draw baseline, thermal equilibrium |
| Figure-8 | 3 min | Transient load profile, ESC response |
| Full Throttle | 10 s | Peak power validation, breaker hold |
| Failsafe | 1 min | Auto-land on low battery, power budget |

## 8. Safety Features

- **BMS Cell Balancing:** Passive shunt, 100mA per cell, triggered at >50mV delta
- **Over-current Protection:** Active current limiting + passive fuse per branch
- **Under-voltage Lockout:** Hard cutoff at 3.0V/cell; soft warning at 3.2V/cell
- **Over-temperature:** Derate at 75°C, hard cutoff at 85°C
- **Redundant Avionics Power:** Dual DC-DC with ideal diode OR-ing
- **Emergency Power-off:** Pilot-accessible master switch, breaks all positive leads
- **Precharge Circuit:** 100Ω/5W resistor, 500ms delay before main contactor close
- **Reverse Polarity Protection:** MOSFET ideal diode on battery input

## 9. Bill of Materials

| Component | Specification | Qty | Unit Cost | Source |
|-----------|---------------|-----|-----------|--------|
| Battery Pack | 48V 20Ah LiFePO₄, 15S1P | 1 | $320 | Self-assembled |
| BMS | 16S 200A, CAN-enabled | 1 | $45 | AliExpress / open-source |
| Motor | 180KV 2kW BLDC | 4 | $38 | T-Motor / SunnySky |
| ESC | 48V 50A BLHeli_32 | 4 | $22 | APD F40 / Hobbywing |
| DC-DC Conv | 48V→12V 30A, redundant | 2 | $18 | RECOM R-78E12-30R0 |
| Main Fuse | ANL 225A | 1 | $6 | Audio-grade |
| Branch Fuses | ATC 60A, slow-blow | 4 | $2 each | Standard auto |
| Bus Bar | Copper 10mm², tinned | 1 | $12 | Local supplier |
| Wire | 10 AWG silicone, red/black | 25 m | $0.80/m | wireandcable.com |
| Wire | 16 AWG silicone, red/black | 15 m | $0.40/m | wireandcable.com |
| Connectors | XT90-S | 12 | $1.20 each | Amass |
| Connectors | AS150 | 8 | $2.50 each | Amass |
| Connectors | JST-GH 4-pin | 20 | $0.35 each | DigiKey |
| Heat Shrink | 1/2" to 1", assorted | 1 kit | $15 | Any electronics supplier |
| **Estimated Total** | | | **~$950** | |

## 10. Documentation References

- **SAE AS50881:** Aerospace wiring standard
- **DO-160:** Environmental Conditions and Test Procedures for Airborne Equipment
- **IEEE 315-1975:** Circuit Symbols
- **MIL-DTL-38999:** Connector specification reference
- **RTCA DO-178:** Software considerations (for FCU firmware)

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-07-31 | wasim-builds | Initial design for bounty #201 |

---

**Design Status:** Complete  
**Reviewed By:** Pending community review  
**Approved By:** Pending engineering lead sign-off
