import React from 'react';

export interface DiscordEvent {
  id: string;
  name: string;
  description: string;
  scheduledStartTime: string;
  scheduledEndTime: string | null;
  startDate: string;
  startTimeUtc: string;
  endDate: string | null;
  endTimeUtc: string | null;
  privacyLevel: number;
  status: number;
  entityType: number;
  entityMetadata: Record<string, string> | null;
  url: string | null;
  userCount: number;
  image: string | null;
  recurrenceRule: Record<string, unknown> | null;
}

export interface DiscordEventsData {
  fetchedAt: string;
  guildId: string;
  upcoming: DiscordEvent[];
  recent: DiscordEvent[];
  metadata: {
    totalEvents: number;
    upcomingCount: number;
    recentCount: number;
  };
}

interface CommunityCallsProps {
  events: DiscordEventsData;
}

const FONT = "'Neue Haas Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const CARD_STYLE: React.CSSProperties = {
  border: '1px solid var(--ifm-color-emphasis-300, #d1d5db)',
  padding: '16px 20px',
  marginBottom: '12px',
  background: 'var(--ifm-background-color, #fff)',
};

const CARD_TITLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 6px 0',
  color: 'var(--docs-text-primary, #111827)',
};

const META_LABEL: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: '12px',
  color: 'var(--docs-text-secondary, #6b7280)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  marginRight: '16px',
};

const STATUS_BADGE: Record<number, React.CSSProperties> = {
  1: { background: '#dbeafe', color: '#1d4ed8' },   // Scheduled
  2: { background: '#dcfce7', color: '#16a34a' },   // Active
  3: { background: '#f3f4f6', color: '#6b7280' },   // Completed
  4: { background: '#fee2e2', color: '#dc2626' },   // Cancelled
};

const STATUS_LABEL: Record<number, string> = {
  1: 'Upcoming',
  2: 'Live now',
  3: 'Done',
  4: 'Cancelled',
};

function formatDate(dateStr: string, timeStr: string): string {
  const date = new Date(`${dateStr}T${timeStr}:00Z`);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
}

function EventCard({ event }: { event: DiscordEvent }) {
  const status = event.status as keyof typeof STATUS_BADGE;
  const badgeStyle = STATUS_BADGE[status] ?? STATUS_BADGE[1];
  const label = STATUS_LABEL[status] ?? 'Unknown';
  const startFormatted = formatDate(event.startDate, event.startTimeUtc);
  const endFormatted = event.endDate
    ? formatDate(event.endDate, event.endTimeUtc ?? '00:00')
    : null;

  return (
    <div style={CARD_STYLE}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={CARD_TITLE}>{event.name}</h3>
          {event.description && (
            <p style={{ fontFamily: FONT, fontSize: '14px', color: 'var(--docs-text-secondary, #6b7280)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
              {event.description}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ ...META_LABEL }}>
              🗓 {startFormatted}
            </span>
            {endFormatted && (
              <span style={META_LABEL}>
                → {endFormatted}
              </span>
            )}
            {event.userCount > 0 && (
              <span style={META_LABEL}>
                👤 {event.userCount} {event.userCount === 1 ? 'attendee' : 'attendees'}
              </span>
            )}
          </div>
        </div>
        <span
          style={{
            ...badgeStyle,
            fontFamily: FONT,
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 24px',
        border: '1px dashed var(--ifm-color-emphasis-300, #d1d5db)',
        color: 'var(--docs-text-secondary, #6b7280)',
        fontFamily: FONT,
      }}
    >
      <p style={{ fontSize: '16px', margin: '0 0 8px 0', fontWeight: 500 }}>
        Nothing scheduled right now
      </p>
      <p style={{ fontSize: '14px', margin: 0 }}>
        Check back soon — new calls are announced on Discord. In the meantime, most
        coordination happens async in the text channels.
      </p>
    </div>
  );
}

export default function CommunityCalls({ events }: CommunityCallsProps) {
  const hasUpcoming = events.upcoming.length > 0;
  const hasRecent = events.recent.length > 0;

  if (!hasUpcoming && !hasRecent) {
    return <EmptyState />;
  }

  return (
    <div>
      {hasUpcoming && (
        <section style={{ marginBottom: '32px' }}>
          <h2>Upcoming Calls & Events</h2>
          <p style={{ fontFamily: FONT, fontSize: '14px', color: 'var(--docs-text-secondary, #6b7280)', marginBottom: '16px' }}>
            All times shown in UTC. Join the Discord voice channel at the scheduled time — no agenda required.
          </p>
          {events.upcoming.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}

      {hasRecent && (
        <section style={{ marginBottom: '32px' }}>
          <h2>Recent Events</h2>
          <p style={{ fontFamily: FONT, fontSize: '14px', color: 'var(--docs-text-secondary, #6b7280)', marginBottom: '16px' }}>
            Events from the past 24 hours. Recordings are posted in Discord afterward.
          </p>
          {events.recent.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}
    </div>
  );
}