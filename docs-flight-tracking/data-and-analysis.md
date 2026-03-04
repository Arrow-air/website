---
sidebar_position: 3
description: How flight data is structured, analyzed, and used to inform engineering decisions.
---

# Data & Analysis

The goal of the flight tracking platform is to close the loop between what happens in the air and what engineers do on the ground. This page explains how data flows through the system and how it's used.

## Flight Log Data

Flight controllers like PX4 and ArduPilot generate detailed log files on every flight. These files capture:

- IMU readings (accelerometer, gyroscope)
- GPS position and velocity
- Motor outputs and ESC telemetry
- Battery voltage and current draw
- Control inputs (RC or autonomous)
- System health and error events

The flight tracking app stores these files alongside the metadata entered by the operator, making them searchable and reviewable in one place.

## How Engineers Use the Data

Flight logs are analyzed to:

- **Identify anomalies** — unusual vibration, motor imbalance, unexpected attitude corrections
- **Validate design changes** — compare pre/post modification performance across matched conditions
- **Track component health** — correlate degradation signals with flight cycles on specific hardware
- **Inform future design decisions** — identify patterns across the fleet or across test phases

## Parts & Assembly Tracking *(planned)*

A future addition to the platform is assembly and parts tracking. Each component will have a record of:

- Manufacturing or sourcing date
- Which airframe it was installed in, and when
- Total flight hours and cycles accumulated
- Any maintenance events or replacements

This enables data-driven maintenance schedules and provides real lifecycle data to inform future hardware iterations.

## Data Access

All submitted flight data is accessible to the engineering team. Raw log files can be downloaded for offline analysis in tools like [Flight Review](https://logs.px4.io/) or [UAV Log Viewer](https://plot.ardupilot.org/).
