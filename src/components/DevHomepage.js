import React from 'react';

export default function DevHomepage() {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '4rem auto',
      padding: '0 1.5rem',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1>Arrow Dev Server</h1>
      <p style={{color: '#666'}}>
        The custom homepage is only available in production builds.
        Use these links to navigate to pages with live CSS reloading.
      </p>
      <h2>Custom Pages</h2>
      <ul style={{lineHeight: 2}}>
        <li><a href="/engineering.html">Engineering</a></li>
        <li><a href="/community.html">Community</a></li>
        <li><a href="/dao.html">DAO Governance</a></li>
        <li><a href="/quiver.html">Quiver</a></li>
      </ul>
      <h2>Docusaurus Pages</h2>
      <ul style={{lineHeight: 2}}>
        <li><a href="/docs/intro">Docs</a></li>
        <li><a href="/blog">Blog</a></li>
      </ul>
      <p style={{color: '#999', fontSize: '0.875rem', marginTop: '2rem'}}>
        To test the homepage: <code>npm run build && npx docusaurus serve</code>
      </p>
    </div>
  );
}
