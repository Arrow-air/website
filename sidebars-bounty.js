const sidebars = {
  BountySidebar: [
    {
      type: 'category',
      label: 'Bounty Board',
      link: { type: 'doc', id: 'index' },
      collapsed: false,
      items: [
        { type: 'link', label: 'Engineering', href: '/bounty#engineering' },
        { type: 'link', label: 'Software', href: '/bounty#software' },
        { type: 'link', label: 'Growth & Media', href: '/bounty#growth--media' },
        { type: 'link', label: 'General DAO', href: '/bounty#general-dao' },
      ],
    },
    {
      type: 'category',
      label: 'Bounties',
      collapsed: false,
      items: [
        { type: 'doc', id: 'bounties/what-are-bounties', label: 'What are Bounties' },
        { type: 'doc', id: 'bounties/how-to-claim', label: 'How to Claim' },
        { type: 'doc', id: 'bounties/video-guide', label: 'Video Guide' },
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
