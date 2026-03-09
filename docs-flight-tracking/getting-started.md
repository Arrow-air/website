---
sidebar_position: 2
description: How to log your first flight using the Arrow Flight Tracking app.
---

# Getting Started

The Flight Tracking app is a web-based tool — no installation required. Visit [project-flight-tracking.vercel.app](https://project-flight-tracking.vercel.app/) to get started.

## Logging a Flight

1. **Open the app** and sign in (or create an account)
2. **Create a new flight log** — fill in the basic details: date, drone/platform, pilot, location
3. **Upload log data** from your flight controller (e.g. a `.ulg` or `.bin` file from PX4 or ArduPilot)
4. **Add notes** — any relevant observations, anomalies, or context from the flight
5. **Submit** — the log is stored and made available for analysis

## What Gets Logged

At minimum, a flight record captures:

- Flight date and duration
- Platform / drone identifier
- Pilot
- Flight controller log file
- Free-form notes

Additional metadata fields will be added as the project matures.

## Viewing Past Flights

The app's dashboard lists all submitted flights. Selecting a flight shows its full log, uploaded data, and any notes. Engineers can filter and review across flights to identify patterns.

## Tips

- Log every flight, even routine ones — aggregate data is more useful than individual data points
- Note anything unusual in the freeform notes field, even if it seems minor
- If you're unsure what log format to use, ask in `#flight-tracking-public` on Discord
