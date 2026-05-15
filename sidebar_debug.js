const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/docs/kitchen-sink', { waitUntil: 'networkidle' });

  const info = await page.evaluate(() => {
    const sidebarInner = document.querySelector('[class*="sidebar_njMd"], [class*="sidebar_"]');
    const menu = document.querySelector('nav.menu');
    const s1 = getComputedStyle(sidebarInner);
    const s2 = getComputedStyle(menu);
    return {
      sidebarInner: {
        paddingTop: s1.paddingTop, paddingBottom: s1.paddingBottom,
        marginTop: s1.marginTop, gap: s1.gap, rowGap: s1.rowGap,
        top: Math.round(sidebarInner.getBoundingClientRect().top),
        h: Math.round(sidebarInner.getBoundingClientRect().height),
      },
      menu: {
        paddingTop: s2.paddingTop, marginTop: s2.marginTop,
        top: Math.round(menu.getBoundingClientRect().top),
      },
      // Also check all elements between aside top and menu top
      allSiblings: (() => {
        const aside = document.querySelector('aside.theme-doc-sidebar-container');
        const els = aside ? aside.querySelectorAll('*') : [];
        return [...els].slice(0, 10).map(el => ({
          tag: el.tagName, classes: [...el.classList].slice(0,2).join(' '),
          top: Math.round(el.getBoundingClientRect().top),
          h: Math.round(el.getBoundingClientRect().height),
          paddingTop: getComputedStyle(el).paddingTop,
          marginTop: getComputedStyle(el).marginTop,
        }));
      })(),
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
