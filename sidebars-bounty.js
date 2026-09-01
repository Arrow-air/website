const sidebars = {
  BountySidebar: [
    // Category anchor links were removed when the board gained its own
    // category/discipline filters — the board is one filterable page now.
    { type: 'doc', id: 'index', label: 'Bounty Board' },
    {
      type: 'category',
      label: 'Bounties',
      collapsed: false,
      items: [
        { type: 'doc', id: 'bounties/what-are-bounties', label: 'What are Bounties' },
        { type: 'doc', id: 'bounties/how-to-claim', label: 'How to Claim' },
        { type: 'doc', id: 'creating-bounties', label: 'Creating Bounties' },
        { type: 'doc', id: 'bounties/previous-bounties', label: 'Previous Bounties' },
      ],
    },
    {
      type: 'category',
      label: 'Grants',
      link: { type: 'doc', id: 'grants/index' },
      collapsed: false,
      items: [
        { type: 'doc', id: 'grants/how-to-apply', label: 'How to Apply' },
        { type: 'doc', id: 'grants/previous-grants', label: 'Previous Grants' },
      ],
    },
    { type: 'doc', id: 'about', label: 'About Bounties & Grants' },
  ],
};

module.exports = sidebars;
