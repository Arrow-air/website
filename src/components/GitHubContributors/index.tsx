import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// Everyone who has landed a commit on Arrow's main repos, read live from the
// GitHub contributors API and merged by login. Same approach as the AIP
// index: render a snapshot, replace it once GitHub answers.

const REPOS = [
  'project-quiver',
  'project-spearhead',
  'project-caribou',
  'project-longshot',
  'project-quiver-mini',
  'flight-tracking',
  'website',
  'dao-aips',
];

/** GitHub login -> contributor profile page in these docs. */
const PROFILES: Record<string, string> = {
  sl33ty: 'sleety',
  thomasgarrison: 'thomasg',
  errrks: 'errrks',
  alperenag: 'alperenag',
  owlot: 'owlot',
  'amsmith-pro': 'amsmith',
  mahmudsudo: 'mahmudsudo',
};

type Person = { login: string; commits: number; repos: string[] };

/** Snapshot as of October 2026, kept if the fetch fails. */
const FALLBACK: Person[] = [
  { login: 'thomasgarrison', commits: 335, repos: ['dao-aips', 'flight-tracking', 'project-caribou', 'project-longshot', 'project-quiver', 'project-quiver-mini', 'project-spearhead', 'website'] },
  { login: 'vector-arrow', commits: 251, repos: ['dao-aips', 'project-caribou', 'project-longshot', 'project-quiver', 'project-quiver-mini', 'project-spearhead', 'website'] },
  { login: 'errrks', commits: 222, repos: ['dao-aips', 'project-quiver', 'project-spearhead', 'website'] },
  { login: 'sl33ty', commits: 217, repos: ['dao-aips', 'project-quiver', 'website'] },
  { login: 'alperenag', commits: 205, repos: ['dao-aips', 'project-quiver', 'project-spearhead', 'website'] },
  { login: 'DowFisherKBM', commits: 202, repos: ['project-quiver'] },
  { login: 'Julius-eng', commits: 100, repos: ['project-caribou', 'project-longshot', 'project-quiver'] },
  { login: 'ZeynepB5793', commits: 78, repos: ['project-quiver', 'project-spearhead'] },
  { login: 'owlot', commits: 36, repos: ['dao-aips', 'website'] },
  { login: 'GoodluckH', commits: 35, repos: ['website'] },
  { login: 'amsmith-pro', commits: 31, repos: ['website'] },
  { login: 'alexdada555', commits: 26, repos: ['project-quiver', 'website'] },
  { login: 'KCerveny', commits: 12, repos: ['dao-aips', 'project-quiver'] },
  { login: 'romanmandryk', commits: 7, repos: ['website'] },
  { login: 'mahmudsudo', commits: 2, repos: ['website'] },
  { login: '0xSig', commits: 1, repos: ['website'] },
  { login: 'BrassLion', commits: 1, repos: ['website'] },
  { login: 'adampaigge', commits: 1, repos: ['website'] },
];

type ApiContributor = { login: string; type: string; contributions: number };

async function fetchPeople(signal: AbortSignal): Promise<Person[]> {
  const lists = await Promise.all(
    REPOS.map(async (repo) => {
      const res = await fetch(`https://api.github.com/repos/Arrow-air/${repo}/contributors?per_page=100`, { signal });
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const list: ApiContributor[] = await res.json();
      return list.map((c) => ({ ...c, repo }));
    }),
  );
  const byLogin = new Map<string, Person>();
  for (const c of lists.flat()) {
    if (c.type === 'Bot' || c.login.endsWith('[bot]')) continue;
    const p = byLogin.get(c.login) ?? { login: c.login, commits: 0, repos: [] };
    p.commits += c.contributions;
    p.repos.push(c.repo);
    byLogin.set(c.login, p);
  }
  return [...byLogin.values()].sort((a, b) => b.commits - a.commits);
}

function shortRepo(repo: string): string {
  return repo.replace(/^project-/, '');
}

export default function GitHubContributors(): React.JSX.Element {
  const [people, setPeople] = useState<Person[]>(FALLBACK);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchPeople(controller.signal)
      .then((list) => {
        if (list.length === 0) throw new Error('no contributors');
        setPeople(list);
        setLive(true);
      })
      .catch(() => {
        /* keep the snapshot */
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      <div className={styles.grid}>
        {people.map((p) => {
          const profile = PROFILES[p.login];
          return (
            <div key={p.login} className={styles.card}>
              <img
                className={styles.avatar}
                src={`https://github.com/${p.login}.png?size=96`}
                alt=""
                loading="lazy"
              />
              <div className={styles.body}>
                <a className={styles.login} href={`https://github.com/${p.login}`}>@{p.login}</a>
                <div className={styles.meta}>
                  {p.commits.toLocaleString()} commit{p.commits === 1 ? '' : 's'} · {p.repos.map(shortRepo).join(', ')}
                </div>
                {profile && (
                  <Link className={styles.profile} to={`/docs/contributing/contributors/${profile}`}>
                    Read profile
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p>
        <em>
          {live
            ? <>{people.length} contributors, listed live from GitHub across {REPOS.length} Arrow repos.</>
            : <>Snapshot from GitHub as of October 2026.</>}
        </em>
      </p>
    </>
  );
}
