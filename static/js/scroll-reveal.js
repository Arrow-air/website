(function () {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    var delay = el.getAttribute('data-reveal-delay');
    if (delay) el.style.transitionDelay = (parseFloat(delay) * 0.1) + 's';
    observer.observe(el);
  });
})();
