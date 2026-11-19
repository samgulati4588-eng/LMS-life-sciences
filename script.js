// Mobile menu
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Marquee: duplicate content so the loop is seamless
const track = document.getElementById('marquee');
track.innerHTML += track.innerHTML;

// Active nav link on scroll
const sections = ['home', 'about', 'products', 'why', 'contact'].map(id => document.getElementById(id));
const links = [...navLinks.querySelectorAll('a')];
window.addEventListener('scroll', () => {
  const y = window.scrollY + 140;
  let current = sections[0].id;
  sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}, { passive: true });

// Reveal on scroll
document.querySelectorAll('.why-card,.step,.price-card,.stat,.tile,.form').forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Count-up stats
const countIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

// Pricing buttons pre-select plan in the form message
document.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', () => {
  sessionStorage.setItem('plan', b.dataset.plan);
}));

// Enquiry form (front-end only – no backend; wire up to your API where noted)
const form = document.getElementById('enquiryForm');
const msg = document.getElementById('formMsg');
form.addEventListener('submit', e => {
  e.preventDefault();
  msg.className = 'form-msg';
  form.querySelectorAll('input').forEach(i => i.classList.remove('err'));

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const consent = form.consent.checked;

  const bad = [];
  if (name.length < 2) bad.push(form.name);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push(form.email);
  if (!/^[6-9]\d{9}$/.test(phone)) bad.push(form.phone);

  if (bad.length) {
    bad.forEach(i => i.classList.add('err'));
    msg.textContent = 'Please enter a valid name, email and 10-digit mobile number.';
    bad[0].focus();
    return;
  }
  if (!consent) {
    msg.textContent = 'Please agree to be contacted so we can respond to your enquiry.';
    return;
  }

  // TODO: send { name, email, phone, plan } to your backend / form service here.
  const plan = sessionStorage.getItem('plan');
  console.log('Enquiry', { name, email, phone, plan });
  msg.className = 'form-msg ok';
  msg.textContent = 'Thank you! Our team will get in touch with you shortly.';
  form.reset();
});
