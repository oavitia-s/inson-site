/* ================================================================
   LANDING PAGE TEMPLATE — main.js
   ================================================================
   Features:
   1. Navbar: solid → translucent on scroll
   2. Mobile hamburger menu toggle
   3. Smooth active-link highlighting on scroll
   4. Scroll-reveal animations (Intersection Observer)
   5. Contact form validation + submission feedback
   6. Navbar closes on link click (mobile)
================================================================ */

'use strict';

/* ----------------------------------------------------------------
   1. NAVBAR — scroll state & active section tracking
---------------------------------------------------------------- */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (!navbar) return;

  /* Toggle "scrolled" class when page moves */
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* Highlight nav link whose section is in view */
  function highlightActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current   = '';

    sections.forEach(sec => {
      const top = sec.offsetTop - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) - 20;
      if (window.scrollY >= top) current = sec.id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  /* Active link style (injected here so it lives with the logic) */
  const style = document.createElement('style');
  style.textContent = '.nav-links a.active { color: #fff !important; } .nav-links a.active::after { right: 0 !important; }';
  document.head.appendChild(style);
})();


/* ----------------------------------------------------------------
   2. MOBILE MENU TOGGLE
---------------------------------------------------------------- */
(function initMobileMenu() {
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  /* Close menu when any nav link is clicked */
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-label', 'Open menu');
    });
  });

  /* Close menu when clicking outside */
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
    }
  });
})();


/* ----------------------------------------------------------------
   3. SCROLL-REVEAL ANIMATIONS
   Add class "reveal" to any element in HTML to make it animate in.
   Automatically applied to major section children below.
---------------------------------------------------------------- */
(function initScrollReveal() {
  /* Auto-tag elements we want to reveal */
  const targets = [
    '.hero-eyebrow', '.hero-headline', '.hero-sub', '.hero-actions',
    '.desc-block',
    '.section-header', '.card', '.portfolio-card',
    '.contact-item', '.contact-form-wrap',
  ];

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      /* Stagger siblings */
      el.style.transitionDelay = `${i * 0.07}s`;
    });
  });

  /* Inject reveal CSS */
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.65s ease, transform 0.65s ease;
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  /* Observe */
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); /* fire once */
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ----------------------------------------------------------------
   4. CONTACT FORM — validation & simulated submission
   Replace the simulateSubmit() body with your real fetch/AJAX call.
---------------------------------------------------------------- */
(function initContactForm() {
  const btn  = document.getElementById('submitBtn');
  const note = document.getElementById('formNote');

  if (!btn) return;

  const fields = {
    firstName: { el: document.getElementById('firstName'), label: 'First name'  },
    lastName:  { el: document.getElementById('lastName'),  label: 'Last name'   },
    email:     { el: document.getElementById('email'),     label: 'Email'        },
    subject:   { el: document.getElementById('subject'),   label: 'Subject'      },
    message:   { el: document.getElementById('message'),   label: 'Message'      },
  };

  function showNote(msg, type) {
    note.textContent = msg;
    note.className   = `form-note ${type}`;
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validate() {
    for (const [key, { el, label }] of Object.entries(fields)) {
      if (!el) continue;
      const val = el.value.trim();
      if (!val) { showNote(`${label} is required.`, 'error'); el.focus(); return false; }
      if (key === 'email' && !isValidEmail(val)) {
        showNote('Please enter a valid email address.', 'error');
        el.focus();
        return false;
      }
    }
    return true;
  }

  /* ── Replace this function with your real API call ── */
  function simulateSubmit() {
    return new Promise(resolve => setTimeout(resolve, 1400));
  }

  btn.addEventListener('click', async () => {
    showNote('', '');
    if (!validate()) return;

    btn.disabled    = true;
    btn.textContent = 'Sending…';

    try {
      await simulateSubmit();

      /* Collect data (pass to your API here) */
      const payload = {};
      Object.entries(fields).forEach(([key, { el }]) => {
        if (el) payload[key] = el.value.trim();
      });
      console.log('Form payload:', payload); /* ← send to your backend */

      showNote('✓ Message sent! We\'ll be in touch soon.', 'success');
      Object.values(fields).forEach(({ el }) => { if (el) el.value = ''; });

    } catch (err) {
      showNote('Something went wrong. Please try again.', 'error');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Send Message';
    }
  });
})();


/* ----------------------------------------------------------------
   5. SMOOTH SCROLL — polyfill for browsers that need it
   (Modern browsers handle scroll-behavior: smooth in CSS,
    but this JS fallback ensures edge-case support.)
---------------------------------------------------------------- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 72;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


// Smart redirect
  function openSmartRedirect() {
        const PHONE = "5216453327207"
        const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
        
        if (isMobile) {
            window.location.href = `whatsapp://send?phone=${PHONE}&text=${encodeURIComponent('Hola, me gustaría recibir información sobre su escuela, por favor.')}`;
        } else {
            window.open(`https://web.whatsapp.com/send?phone=${PHONE}&text=${encodeURIComponent('Hola, me gustaría recibir información sobre su escuela, por favor.')}`, '_blank');
        }
    }
