#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const CONFIG_PATH = 'events-sources.yml';
const OUTPUT_PATH = 'src/data/events.generated.json';

function parseConfig(raw) {
    const obj = {};
    for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const m = trimmed.match(/^([A-Za-z0-9_\-]+):\s*(.+)$/);
        if (m) obj[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
    return obj;
}

async function fetchEvents(guildId, token) {
    const url = `https://discord.com/api/v10/guilds/${guildId}/scheduled-events?with_user_count=true`;
    const res = await fetch(url, { headers: { Authorization: `Bot ${token}` } });
    if (!res.ok) {
        throw new Error(`Discord API ${res.status} ${res.statusText}: ${await res.text()}`);
    }
    return res.json();
}

function normalizeEvent(ev) {
    // Map Discord event shape to a compact, serializable object used by the UI
    return {
        id: ev.id,
        name: ev.name,
        description: ev.description || null,
        start: ev.scheduled_start_time,
        end: ev.scheduled_end_time || null,
        status: ev.status, // numeric Discord enum
        channel_id: ev.channel_id || null,
        guild_id: ev.guild_id,
        entity_type: ev.entity_type,
        user_count: ev.user_count || 0,
        url: `https://discord.com/events/${ev.guild_id}/${ev.id}`,
    };
}

async function main() {
    const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;
    if (!token) throw new Error('DISCORD_BOT_TOKEN or DISCORD_TOKEN is required in the environment');

    let config = {};
    try {
        config = parseConfig(readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
        // No config file is fine; we'll prefer environment variables
    }

    const guild = process.env.GUILD_ID || config.guild || config.guild_id;
    if (!guild) throw new Error('Guild ID must be provided via env GUILD_ID or events-sources.yml (guild: <id>)');

    let events;
    try {
        events = await fetchEvents(guild, token);
    } catch (err) {
        console.error(`Failed to fetch events: ${err.message}`);
        process.exit(1);
    }

    // Keep scheduled and active events; Discord status: 1 = SCHEDULED, 2 = ACTIVE, 3 = COMPLETED, 4 = CANCELED
    const relevant = (events || []).filter(e => e && [1, 2].includes(Number(e.status)));

    relevant.sort((a, b) => String(a.scheduled_start_time || '').localeCompare(String(b.scheduled_start_time || '')));

    const out = relevant.map(normalizeEvent);

    writeFileSync(OUTPUT_PATH, `${JSON.stringify(out, null, 2)}\n`);

    if (out.length === 0) {
        console.error('::warning::No events found for the configured guild. Wrote an empty src/data/events.generated.json');
    } else {
        console.log(`Wrote ${out.length} event(s) to ${OUTPUT_PATH}`);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
