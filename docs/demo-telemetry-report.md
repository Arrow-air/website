---
sidebar_position: 102
sidebar_custom_props:
  icon: code
---

# Flight Telemetry Analysis Report

Mission ID: `QV3-2026-0892`
Platform: Quiver PT3 Dev-Kit
Date: 2026-01-28
Duration: 00:34:17
Operator: Arrow Test Operations

---

## 1. Mission Summary

| Parameter | Value |
|-----------|-------|
| Launch Time | 14:32:07 UTC |
| Landing Time | 15:06:24 UTC |
| Total Flight Time | 34m 17s |
| Distance Traveled | 12.847 km |
| Max Altitude AGL | 98.4 m |
| Max Ground Speed | 14.2 m/s |
| Max Vertical Speed | 4.8 m/s |
| Takeoff Weight | 18.42 kg |
| Payload | Survey Camera (2.1 kg) |

### 1.1 Mission Profile

```
ALT(m)
  100 ┤                    ╭────────────────╮
   80 ┤               ╭────╯                ╰────╮
   60 ┤          ╭────╯                          ╰────╮
   40 ┤     ╭────╯                                    ╰────╮
   20 ┤╭────╯                                              ╰────╮
    0 ┼─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴────╯
      0    5    10   15   20   25   30   35   40   45   50 (min)

      TKOF  CLB   CRUISE/SURVEY                    DESC  LAND
```

### 1.2 Flight Phases

| Phase | Start | End | Duration | Notes |
|-------|-------|-----|----------|-------|
| Preflight | 14:30:00 | 14:32:07 | 02:07 | Systems check complete |
| Takeoff | 14:32:07 | 14:32:42 | 00:35 | Nominal vertical climb |
| Climb | 14:32:42 | 14:35:18 | 02:36 | Transit to survey altitude |
| Survey | 14:35:18 | 15:01:44 | 26:26 | Grid pattern complete |
| Descent | 15:01:44 | 15:05:12 | 03:28 | Controlled descent |
| Landing | 15:05:12 | 15:06:24 | 01:12 | Precision landing |

---

## 2. Power System Analysis

### 2.1 Battery Performance

| Metric | Value | Limit | Status |
|--------|-------|-------|--------|
| Initial Voltage | 50.2 V | — | — |
| Final Voltage | 44.8 V | >43.2 V | PASS |
| Energy Consumed | 892 Wh | — | — |
| Capacity Used | 78.4% | <85% | PASS |
| Peak Discharge | 42.1 A | <50 A | PASS |
| Cell Imbalance (final) | 38 mV | <100 mV | PASS |

### 2.2 Voltage Profile

```
VOLTS
 51 ┤●
 50 ┤ ●●●
 49 ┤    ●●●●
 48 ┤        ●●●●●●
 47 ┤              ●●●●●●●●
 46 ┤                      ●●●●●●●●●●
 45 ┤                                ●●●●●●●●●●●●
 44 ┤                                            ●●●●●
    └─────────────────────────────────────────────────────
    0         10        20        30        40 (min)
```

### 2.3 Current Distribution

Average motor current during cruise phase:

| Motor | Position | Avg Current | % of Total | Deviation |
|-------|----------|-------------|------------|-----------|
| M1 | Front-Left | 6.82 A | 24.8% | -0.8% |
| M2 | Front-Right | 7.14 A | 26.0% | +0.4% |
| M3 | Rear-Left | 6.91 A | 25.2% | -0.4% |
| M4 | Rear-Right | 6.58 A | 24.0% | +0.8% |
| **Total** | — | **27.45 A** | 100% | — |

> Motor current deviation within ±3% indicates balanced thrust and proper CG alignment.

---

## 3. Navigation Performance

### 3.1 GPS Quality

| Parameter | Min | Max | Mean | Std Dev |
|-----------|-----|-----|------|---------|
| Satellites | 14 | 19 | 16.4 | 1.2 |
| HDOP | 0.68 | 1.14 | 0.82 | 0.09 |
| VDOP | 1.02 | 1.87 | 1.34 | 0.18 |
| Fix Type | 3D RTK | 3D RTK | — | — |

### 3.2 Position Accuracy

Cross-track error during survey legs:

| Leg | Length | Mean Error | Max Error | RMS |
|-----|--------|------------|-----------|-----|
| 1 | 423 m | 0.04 m | 0.12 m | 0.05 m |
| 2 | 423 m | 0.03 m | 0.09 m | 0.04 m |
| 3 | 423 m | 0.05 m | 0.14 m | 0.06 m |
| 4 | 423 m | 0.03 m | 0.11 m | 0.04 m |
| 5 | 423 m | 0.04 m | 0.08 m | 0.04 m |
| 6 | 423 m | 0.06 m | 0.18 m | 0.07 m |
| **Overall** | 2,538 m | 0.04 m | 0.18 m | 0.05 m |

### 3.3 Altitude Hold Performance

```
Target: 80.0m AGL

ERROR(m)
 +1.0 ┤      ╷   ╷      ╷        ╷
 +0.5 ┤──╷───┼───┼──╷───┼────╷───┼───╷──
  0.0 ┼──┼───┼───┼──┼───┼────┼───┼───┼──
 -0.5 ┤──┼───┼───┼──┼───┼────┼───┼───┼──
 -1.0 ┤  ╵       ╵  ╵        ╵       ╵
      └────────────────────────────────────

Mean: +0.08m | Std Dev: 0.31m | Max: +0.92m / -0.84m
```

---

## 4. Environmental Data

### 4.1 Atmospheric Conditions

| Time | Temp | Humidity | Pressure | Wind Dir | Wind Spd |
|------|------|----------|----------|----------|----------|
| 14:30 | 12.4°C | 58% | 1018.2 hPa | 245° | 3.2 m/s |
| 14:45 | 12.8°C | 56% | 1018.1 hPa | 238° | 4.1 m/s |
| 15:00 | 13.1°C | 54% | 1018.0 hPa | 242° | 3.8 m/s |

### 4.2 Wind Estimation (onboard)

Derived from flight controller state estimation:

| Altitude Band | Direction | Speed | Gust |
|---------------|-----------|-------|------|
| 0-25m AGL | 241° | 3.4 m/s | 5.1 m/s |
| 25-50m AGL | 238° | 4.2 m/s | 6.3 m/s |
| 50-75m AGL | 235° | 5.1 m/s | 7.8 m/s |
| 75-100m AGL | 232° | 5.8 m/s | 8.4 m/s |

---

## 5. Anomalies & Events

| Time | Severity | Code | Description |
|------|----------|------|-------------|
| 14:47:32 | INFO | NAV-101 | RTK float → RTK fix transition |
| 14:52:18 | WARN | PWR-203 | Cell 4 temp elevated (38°C) |
| 14:58:41 | INFO | NAV-101 | RTK fix → RTK float transition |
| 14:59:02 | INFO | NAV-101 | RTK float → RTK fix transition |

### 5.1 Event Analysis

**PWR-203 (Cell 4 Temperature)**

Cell 4 reached 38°C at 14:52:18, triggering a warning. Temperature returned to nominal (<35°C) within 4 minutes. Root cause: momentary high-current demand during wind gust compensation coinciding with reduced airflow from survey speed reduction.

**Recommendation:** No action required. Temperature remained well below 45°C threshold.

---

## 6. Maintenance Indicators

| Component | Metric | Current | Limit | Remaining |
|-----------|--------|---------|-------|-----------|
| Battery | Cycles | 47 | 300 | 253 |
| Battery | Flight hours | 18.2 h | 100 h | 81.8 h |
| Motors (all) | Flight hours | 42.6 h | 200 h | 157.4 h |
| Props (all) | Flight hours | 12.4 h | 50 h | 37.6 h |
| FC firmware | Version | 4.5.1 | — | Current |
| Compass | Last cal | 2026-01-15 | 30 days | 17 days |

---

##### Data Files

| File | Format | Size | Hash (SHA-256) |
|------|--------|------|----------------|
| `QV3-2026-0892.bin` | DataFlash | 48.2 MB | `a3f8c2...` |
| `QV3-2026-0892.tlog` | MAVLink | 12.7 MB | `7b2e91...` |
| `QV3-2026-0892.kmz` | KML Archive | 1.4 MB | `c94d03...` |

---

##### Report Generated

```
Timestamp: 2026-01-28T16:45:22Z
Generator: Arrow Telemetry Analyzer v2.4.1
Operator: J. Martinez
Reviewed: K. Chen (Flight Ops Lead)
```
