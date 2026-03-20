// ===== DR. MENCA – SHARED JAVASCRIPT =====

// ---- NAVBAR HAMBURGER ----
document.addEventListener('DOMContentLoaded', () => {
  const ham = document.getElementById('hamburger');
  const mMenu = document.getElementById('mobileMenu');
  if (ham && mMenu) {
    ham.addEventListener('click', () => mMenu.classList.toggle('open'));
  }

  // Active nav link
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // FAQ
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const was = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!was) item.classList.add('open');
    });
  });

  // Scroll reveal
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Date min
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type=date]').forEach(i => i.min = today);

  // Build temoignages if track exists
  buildTemos();
});

// ---- TEMOIGNAGES ----
const TEMOS = [
  {stars:5, text:"Dr. Menca est une perle rare ! J'avais tellement peur du dentiste et elle m'a mise complètement à l'aise. Résultat impeccable.", name:"Aminata K.", date:"Il y a 2 semaines", color:"#5bbf4e", init:"A"},
  {stars:5, text:"Cabinet très propre, équipe accueillante et dentiste super professionnelle. Mon blanchiment est magnifique !", name:"Jean-Paul M.", date:"Il y a 1 mois", color:"#1a6fb5", init:"J"},
  {stars:5, text:"Mes enfants adorent Dr. Menca ! Elle sait comment les mettre en confiance. Plus de peur du dentiste à la maison 😊", name:"Cécile T.", date:"Il y a 3 semaines", color:"#e63946", init:"C"},
  {stars:5, text:"Service de qualité, prix raisonnables et disponibilité remarquable. Je recommande à toute ma famille !", name:"Rodrigue F.", date:"Il y a 1 semaine", color:"#7c3aed", init:"R"},
  {stars:5, text:"J'ai fait mes implants ici et le résultat est bluffant. Indiscernable de mes dents naturelles.", name:"Nathalie B.", date:"Il y a 2 mois", color:"#0891b2", init:"N"},
  {stars:5, text:"Rendez-vous facile via WhatsApp, ponctuelle et très à l'écoute. Ma meilleure expérience chez un dentiste !", name:"Patrick N.", date:"Il y a 5 jours", color:"#d97706", init:"P"},
  {stars:5, text:"Détartrage indolore et dents nickel ! La salle d'attente est super confortable.", name:"Solange E.", date:"Il y a 3 mois", color:"#059669", init:"S"},
  {stars:5, text:"Le professionnalisme de Dr. Menca est exemplaire. Elle explique chaque étape du traitement. Merci !", name:"Hervé D.", date:"Il y a 2 semaines", color:"#dc2626", init:"H"},
];
function buildTemos() {
  const track = document.getElementById('temoTrack');
  if (!track) return;
  const all = [...TEMOS, ...TEMOS];
  track.innerHTML = all.map(x => `
    <div class="temo-card">
      <div class="temo-stars">${'★'.repeat(x.stars)}</div>
      <div class="temo-text">"${x.text}"</div>
      <div class="temo-author">
        <div class="temo-avatar" style="background:${x.color}">${x.init}</div>
        <div><div class="temo-name">${x.name}</div><div class="temo-date">${x.date}</div></div>
      </div>
    </div>`).join('');
}

// ---- MODAL RDV ----
function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

// ---- TOAST ----
function showToast(msg) {
  const t = document.getElementById('toast');
  if (msg) t.querySelector ? (t.textContent = msg) : null;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}

// ---- FORM SUBMIT (WhatsApp redirect) ----
function submitRDV(prefix) {
  const p = (prefix||'');
  const prenom = document.getElementById(p+'prenom').value.trim();
  const nom = document.getElementById(p+'nom').value.trim();
  const tel = document.getElementById(p+'tel').value.trim();
  if (!prenom || !nom || !tel) { alert('Veuillez remplir tous les champs obligatoires (*)'); return; }
  const service = (document.getElementById(p+'service')||{}).value || 'Non précisé';
  const date = (document.getElementById(p+'date')||{}).value || '';
  const msg = (document.getElementById(p+'message')||{}).value || '';
  const wa = encodeURIComponent(`Bonjour Dr. Menca 👋\n\nJe suis ${prenom} ${nom} (${tel}) et je souhaite prendre rendez-vous.\nService : ${service}${date ? '\nDate souhaitée : '+date : ''}${msg ? '\nMessage : '+msg : ''}`);
  window.open(`https://wa.me/237698726922?text=${wa}`, '_blank');
  const ok = document.getElementById(p+'success');
  if (ok) { ok.style.display = 'block'; }
  showToast('✅ Demande envoyée ! Dr. Menca vous contactera bientôt.');
  if (document.getElementById('modalOverlay')) closeModal();
}

function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}
