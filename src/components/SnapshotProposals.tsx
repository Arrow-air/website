import React, { useEffect, useState } from 'react';

const HUB = 'https://hub.snapshot.org/graphql';
const SPACE = 'arrowair.eth';
const SPACE_URL = `https://snapshot.org/#/s:${SPACE}`;

type Proposal = {
  id: string;
  title: string;
  state: 'active' | 'pending' | 'closed';
  end: number;
  choices: string[];
  scores: number[];
  scores_total: number;
};

const QUERY = `{
  proposals(first: 8, where: {space: "${SPACE}"}, orderBy: "created", orderDirection: desc) {
    id title state end choices scores scores_total
  }
}`;

function leadingChoice(p: Proposal): string {
  if (!p.scores?.length || p.scores_total === 0) return 'no votes yet';
  const max = Math.max(...p.scores);
  const i = p.scores.indexOf(max);
  const pct = Math.round((max / p.scores_total) * 100);
  return `${p.choices[i]} · ${pct}%`;
}

function endLabel(p: Proposal): string {
  const date = new Date(p.end * 1000).toISOString().slice(0, 10);
  return p.state === 'active' ? `ends ${date}` : `ended ${date}`;
}

export default function SnapshotProposals(): JSX.Element {
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(HUB, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((json) => {
        const items: Proposal[] = json?.data?.proposals ?? [];
        if (items.length === 0) throw new Error('empty');
        setProposals(items);
      })
      .catch(() => setFailed(true));
    return () => controller.abort();
  }, []);

  if (failed) {
    return (
      <p>
        Couldn't reach Snapshot just now — the full voting record is always at{' '}
        <a href={SPACE_URL}>the Arrow Snapshot space</a>.
      </p>
    );
  }

  if (!proposals) return <p>Loading proposals from Snapshot…</p>;

  const active = proposals.filter((p) => p.state === 'active' || p.state === 'pending');
  const recent = proposals.filter((p) => p.state === 'closed').slice(0, 5);

  const stateDot = (state: Proposal['state']) => {
    const color =
      state === 'active'
        ? 'var(--ifm-color-success)'
        : state === 'pending'
          ? 'var(--ifm-color-warning)'
          : 'var(--ifm-color-emphasis-400)';
    return (
      <span style={{ whiteSpace: 'nowrap' }}>
        <span
          aria-hidden="true"
          style={{
            background: color,
            borderRadius: '50%',
            display: 'inline-block',
            height: '0.55em',
            marginRight: '0.4em',
            width: '0.55em',
          }}
        />
        {state}
      </span>
    );
  };

  const row = (p: Proposal) => (
    <tr key={p.id}>
      <td>
        <a href={`${SPACE_URL}/proposal/${p.id}`}>{p.title}</a>
      </td>
      <td>{stateDot(p.state)}</td>
      <td>{leadingChoice(p)}</td>
      <td>{endLabel(p)}</td>
    </tr>
  );

  return (
    <>
      {active.length > 0 ? (
        <p>
          <strong>
            {active.length === 1 ? 'One vote is open right now.' : `${active.length} votes are open right now.`}
          </strong>{' '}
          Token holders: this is the moment your vote counts.
        </p>
      ) : (
        <p>No votes are open right now. Recent results below.</p>
      )}
      <table>
        <thead>
          <tr>
            <th>Proposal</th>
            <th>State</th>
            <th>Leading</th>
            <th>Closes</th>
          </tr>
        </thead>
        <tbody>
          {active.map(row)}
          {recent.map(row)}
        </tbody>
      </table>
      <p>
        <em>Live from the <a href={SPACE_URL}>Arrow Snapshot space</a>.</em>
      </p>
    </>
  );
}
