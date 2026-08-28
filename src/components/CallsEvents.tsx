import React, { useEffect, useMemo, useState } from 'react';
import eventsData from '@site/src/data/events.generated.json';

type EventItem = {
    id: string;
    name: string;
    description: string | null;
    start: string;
    end?: string | null;
    url: string;
    user_count?: number;
};

function formatUtc(dateIso: string) {
    try {
        const d = new Date(dateIso);
        return d.toUTCString().replace(' GMT', ' UTC');
    } catch {
        return dateIso;
    }
}

export default function CallsEvents() {
    const events: EventItem[] = (eventsData as any) || [];
    const [now, setNow] = useState<Date | null>(null);

    // compute local-times on the client to avoid SSR timezone mismatches
    const localTimes = useMemo(() => {
        if (!now) return {} as Record<string, string>;
        const map: Record<string, string> = {};
        for (const ev of events) {
            try {
                map[ev.id] = new Date(ev.start).toLocaleString();
            } catch {
                map[ev.id] = ev.start;
            }
        }
        return map;
    }, [events, now]);

    useEffect(() => {
        setNow(new Date());
    }, []);

    if (!events.length) {
        return (
            <div style={{ border: '1px solid var(--ifm-color-emphasis-300)', padding: '18px', background: 'var(--docs-bg-subtle)' }}>
                <h2>Calls & events this week</h2>
                <p style={{ color: 'var(--docs-text-secondary)' }}>
                    Nothing is scheduled right now. Join us on Discord — the community is active and calls are announced there.
                </p>
                <p>
                    <a href="https://discord.com/invite/arrow">Join Discord</a> and check the Events tab, or return here later — this page updates automatically.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h2>Upcoming calls & events</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {events.map(ev => (
                    <li key={ev.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--ifm-color-emphasis-300)' }}>
                        <a href={ev.url} style={{ fontSize: '16px', fontWeight: 600 }}>{ev.name}</a>
                        <div style={{ color: 'var(--docs-text-secondary)', marginTop: '6px' }}>
                            <div>UTC: {formatUtc(ev.start)}</div>
                            <div>{now ? `Local: ${localTimes[ev.id]}` : 'Local: calculating…'}</div>
                            {ev.description && <div style={{ marginTop: '8px' }}>{ev.description}</div>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
