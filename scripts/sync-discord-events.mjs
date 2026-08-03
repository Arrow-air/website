#!/usr/bin/env node
/**
 * sync-discord-events.mjs
 *
 * Fetches Discord Guild Scheduled Events via the Discord API and writes them
 * to src/data/discord-events.generated.json, which is consumed by the
 * CommunityCalls React component.
 *
 * Environment variables:
 *   DISCORD_GUILD_ID   — The Discord server (guild) ID
 *   DISCORD_BOT_TOKEN  — A bot token with `guilds.scheduled_events.read` scope
 *
 * Called from .github/workflows/sync-discord-events.yml on a schedule.
 */

import { writeFileSync } from 'node:fs';

const DISCORD_API = 'https://discord.com/api/v10';
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const OUTPUT_PATH = 'src/data/discord-events.generated.json';

if (!GUILD_ID) {
  console.error('::error::DISCORD_GUILD_ID is not set');
  process.exit(1);
}
if (!BOT_TOKEN) {
  console.error('::error::DISCORD_BOT_TOKEN is not set');
  process.exit(1);
}

/**
 * Fetch paginated results from the Discord API.
 */
async function fetchDiscordEvents() {
  const url = `${DISCORD_API}/guilds/${GUILD_ID}/scheduled-events?with_user_count=true`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord API returned ${response.status}: ${text}`);
  }

  return response.json();
}

/**
 * Convert a Discord scheduled event to our output format.
 */
function transformEvent(event) {
  const startTime = new Date(event.scheduled_start_time);
  const endTime = event.scheduled_end_time ? new Date(event.scheduled_end_time) : null;

  return {
    id: event.id,
    name: event.name,
    description: event.description || '',
    scheduledStartTime: event.scheduled_start_time,
    scheduledEndTime: event.scheduled_end_time || null,
    startDate: startTime.toISOString().slice(0, 10),
    startTimeUtc: startTime.toISOString().slice(11, 16),
    endDate: endTime ? endTime.toISOString().slice(0, 10) : null,
    endTimeUtc: endTime ? endTime.toISOString().slice(11, 16) : null,
    privacyLevel: event.privacy_level,
    status: event.status,
    entityType: event.entity_type,
    entityMetadata: event.entity_metadata || null,
    url: event.entity_type === 3 && event.entity_metadata?.location
      ? event.entity_metadata.location
      : null,
    userCount: event.user_count ?? 0,
    image: event.image || null,
    // Recurrence is kept as-is for the component to render
    recurrenceRule: event.recurrence_rule || null,
  };
}

/**
 * Get a human-readable status label.
 */
function statusLabel(status) {
  switch (status) {
    case 1: return 'Scheduled';
    case 2: return 'Active';
    case 3: return 'Completed';
    case 4: return 'Cancelled';
    default: return 'Unknown';
  }
}

/**
 * Get a human-readable entity type label.
 */
function entityTypeLabel(type) {
  switch (type) {
    case 1: return 'Stage Instance';
    case 2: return 'Voice';
    case 3: return 'External';
    default: return 'Unknown';
  }
}

async function main() {
  console.log(`Fetching scheduled events for guild ${GUILD_ID}...`);

  let events;
  try {
    events = await fetchDiscordEvents();
  } catch (error) {
    console.error(`::error::Failed to fetch Discord events: ${error.message}`);
    process.exit(1);
  }

  // Filter to only upcoming/active events (status 1 = SCHEDULED, 2 = ACTIVE)
  const upcoming = events.filter(e => e.status === 1 || e.status === 2);
  // Also include recently completed events (within the last 24 hours)
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const recent = events.filter(e => {
    if (e.status !== 3) return false;
    const start = new Date(e.scheduled_start_time).getTime();
    return start > dayAgo;
  });

  const transformed = {
    fetchedAt: new Date().toISOString(),
    guildId: GUILD_ID,
    upcoming: upcoming.map(transformEvent),
    recent: recent.map(transformEvent),
    metadata: {
      totalEvents: events.length,
      upcomingCount: upcoming.length,
      recentCount: recent.length,
    },
  };

  // Sort upcoming by start time (earliest first)
  transformed.upcoming.sort(
    (a, b) => new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime(),
  );
  // Sort recent by start time (most recent first)
  transformed.recent.sort(
    (a, b) => new Date(b.scheduledStartTime).getTime() - new Date(a.scheduledStartTime).getTime(),
  );

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(transformed, null, 2)}\n`);
  console.log(`Wrote ${transformed.upcoming.length} upcoming + ${transformed.recent.length} recent events to ${OUTPUT_PATH}`);

  if (events.length === 0) {
    console.log('No events found — the empty state will show a "Nothing scheduled" message.');
  }
}

main().catch(error => {
  console.error(`::error::${error.message}`);
  process.exit(1);
});