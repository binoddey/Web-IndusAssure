/* =========================================================
   INDUSASSURE — SCRIPT.JS
   Lightweight vanilla JS: nav, scroll reveal, counters,
   accordion, smooth scroll, scroll-to-top.
========================================================= */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. STICKY NAVBAR SHADOW ON SCROLL
  --------------------------------------------------------- */
  var navbar = document.getElementById('navbar');
  function handleNavShadow() {
    if (window.scrollY > 8) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  handleNavShadow();
  window.addEventListener('scroll', handleNavShadow, { passive: true });

  /* ---------------------------------------------------------
     2. MOBILE HAMBURGER MENU
  --------------------------------------------------------- */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');

  function closeMenu() {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu() {
    var isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  }
  hamburger.addEventListener('click', toggleMenu);

  // Close mobile menu after a link is tapped
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click / escape
  document.addEventListener('click', function (e) {
    if (!mobileMenu.classList.contains('open')) return;
    if (mobileMenu.contains(e.target) || hamburger.contains(e.target)) return;
    closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------------------------------------------------------
     3. SMOOTH SCROLL FOR IN-PAGE ANCHOR LINKS
  --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return; // "#" alone
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navHeight = navbar.offsetHeight;
      var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 12;
      window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
      // Move focus for accessibility after scroll settles
      window.setTimeout(function () {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }, 400);
    });
  });

  /* ---------------------------------------------------------
     4. SCROLL-REVEAL ANIMATIONS (Intersection Observer)
  --------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal-up');

  if ('IntersectionObserver' in window && !reducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // No IO support or reduced motion preferred: show everything immediately
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------------------------------------------------------
     5. ANIMATED STAT COUNTERS
  --------------------------------------------------------- */
  var counters = document.querySelectorAll('.stat-num');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1600;
    var startTime = null;

    if (reducedMotion) {
      el.textContent = target.toLocaleString('en-IN') + suffix;
      return;
    }

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current.toLocaleString('en-IN') + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('en-IN') + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------------------------------------------------------
     6. PROTECTION SCORE RING + PROGRESS BAR TRIGGER
  --------------------------------------------------------- */
  var scoreRing = document.querySelector('.score-ring');
  var overviewPanel = document.querySelector('.overview-panel');

  [scoreRing, overviewPanel].forEach(function (el) {
    if (!el) return;
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(
        function (entries, o) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              o.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      obs.observe(el);
    } else {
      el.classList.add('in-view');
    }
  });

  /* ---------------------------------------------------------
     7. FAQ ACCORDION
  --------------------------------------------------------- */
  var accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(function (item) {
    var trigger = item.querySelector('.accordion-trigger');
    var panel = item.querySelector('.accordion-panel');

    trigger.addEventListener('click', function () {
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Close all other panels (single-open accordion)
      accordionItems.forEach(function (other) {
        if (other === item) return;
        var otherTrigger = other.querySelector('.accordion-trigger');
        var otherPanel = other.querySelector('.accordion-panel');
        otherTrigger.setAttribute('aria-expanded', 'false');
        otherPanel.style.maxHeight = null;
      });

      // Toggle current panel
      trigger.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = null;
      }
    });
  });

  /* ---------------------------------------------------------
     8. SCROLL-TO-TOP BUTTON
  --------------------------------------------------------- */
  var scrollTopBtn = document.getElementById('scrollTop');

  function toggleScrollTop() {
    if (window.scrollY > 480) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }
  toggleScrollTop();
  window.addEventListener('scroll', toggleScrollTop, { passive: true });

  scrollTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  /* ---------------------------------------------------------
     9. ACTIVE NAV LINK ON SCROLL (subtle UX enhancement)
  --------------------------------------------------------- */
  var sections = document.querySelectorAll('main section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a');

  if ('IntersectionObserver' in window && sections.length && navAnchors.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute('id');
          var link = document.querySelector('.nav-links a[href="#' + id + '"]');
          if (!link) return;
          if (entry.isIntersecting) {
            navAnchors.forEach(function (a) { a.style.color = ''; });
            link.style.color = 'var(--primary)';
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------------------------------------------------
     10. RECALC OPEN ACCORDION HEIGHT ON RESIZE
  --------------------------------------------------------- */
  window.addEventListener('resize', function () {
    var openPanel = document.querySelector('.accordion-trigger[aria-expanded="true"]');
    if (openPanel) {
      var panel = openPanel.parentElement.querySelector('.accordion-panel');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });

})();
