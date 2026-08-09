const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('[data-menu]');
const currentYear = document.getElementById('currentYear');
const checkoutLinks = document.querySelectorAll('[data-checkout]');

if (currentYear) currentYear.textContent = new Date().getFullYear();

menuToggle?.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('menu-open', isOpen);
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});

checkoutLinks.forEach((link) => {
  const key = link.dataset.checkout;
  const url = window.EA_STORE?.[key]?.trim();
  const readyLabel = link.dataset.readyLabel || 'Comprar';
  const pendingLabel = link.dataset.pendingLabel || 'Em breve';

  if (url) {
    link.href = url;
    link.textContent = readyLabel;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-disabled', 'false');
  } else {
    link.href = '#';
    link.textContent = pendingLabel;
    link.setAttribute('aria-disabled', 'true');
    link.addEventListener('click', (event) => event.preventDefault());
  }
});

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}
