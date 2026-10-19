/* Deux petites aides, toutes deux facultatives : apparitions au défilement, et indicateur « ouvert / fermé »
   calculé à partir des horaires affichés (heure de Paris). Sans JavaScript, la page reste complète. */
(function () {
  'use strict';
  // Horaires : mardi (2) à samedi (6), 12 h – 14 h et 19 h 30 – 22 h.
  var SLOTS = [[12 * 60, 14 * 60], [19 * 60 + 30, 22 * 60]];
  var OPEN_DAYS = [2, 3, 4, 5, 6];
  var NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  function hm(m) { var h = Math.floor(m / 60), r = m % 60; return h + ' h' + (r ? ' ' + (r < 10 ? '0' : '') + r : ''); }
  function status() {
    var box = document.querySelector('[data-status]'), txt = document.querySelector('[data-status-text]');
    if (!box || !txt || !window.Intl) return;
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    var now = (+get('hour') % 24) * 60 + +get('minute'), msg = '', open = false;
    if (OPEN_DAYS.indexOf(day) >= 0) {
      for (var i = 0; i < SLOTS.length; i++) {
        if (now >= SLOTS[i][0] && now < SLOTS[i][1]) { open = true; msg = 'Ouvert maintenant, service jusqu’à ' + hm(SLOTS[i][1]) + '.'; break; }
        if (now < SLOTS[i][0]) { msg = 'Fermé pour le moment, réouverture à ' + hm(SLOTS[i][0]) + '.'; break; }
      }
    }
    if (!msg) {
      var next = day;
      do { next = (next + 1) % 7; } while (OPEN_DAYS.indexOf(next) < 0);
      msg = 'Fermé aujourd’hui, réouverture ' + NAMES[next] + ' à ' + hm(SLOTS[0][0]) + '.';
    }
    txt.textContent = msg; box.setAttribute('data-open', open ? '1' : '0');
  }
  status();

  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var vh = window.innerHeight || 800;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) {
    if (el.getBoundingClientRect().top < vh) return;
    el.classList.add('will'); io.observe(el);
  });
})();
