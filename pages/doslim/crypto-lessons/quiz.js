// Quiz engine. Each page sets window.QUIZ = { id, items: [[question, [options], correctIndex, why], ...] }.
(function () {
  const { id } = window.QUIZ;
  // Shuffle each question's options with a fixed seed, so the order is the same on every visit.
  let seed = [...id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const items = window.QUIZ.items.map(([q, opts, ok, why]) => {
    const order = opts.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    return [q, order.map((i) => opts[i]), order.indexOf(ok), why];
  });
  const KEY = 'doslim-crypto-quiz-' + id;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { saved = {}; }
  const root = document.getElementById('quiz');
  const bar = document.createElement('div');
  bar.className = 'quizbar';
  bar.innerHTML = '<span class="score" id="score"></span><div class="meter" aria-hidden="true"><i id="meter"></i></div>' +
    '<span><button class="btn" type="button" id="onlyWrong" aria-pressed="false">Only wrong ones</button> ' +
    '<button class="btn" type="button" id="reset">Start over</button></span>';
  root.appendChild(bar);
  const list = document.createElement('div');
  root.appendChild(list);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function store() { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* private mode */ } }
  function score() {
    const answered = Object.keys(saved).length;
    const right = Object.keys(saved).filter((k) => saved[k] === items[k][2]).length;
    document.getElementById('score').textContent = right + ' right · ' + (answered - right) + ' wrong · ' + (items.length - answered) + ' to go';
    document.getElementById('meter').style.width = (100 * right / items.length) + '%';
  }
  function paint(i) {
    const box = list.children[i];
    const [, opts, ok, why] = items[i];
    const pick = saved[i];
    box.className = 'q' + (pick === undefined ? '' : pick === ok ? ' right' : ' wrong');
    [...box.querySelectorAll('button.opt')].forEach((b, j) => {
      b.disabled = pick !== undefined;
      b.classList.toggle('is-right', pick !== undefined && j === ok);
      b.classList.toggle('is-wrong', pick !== undefined && j === pick && pick !== ok);
    });
    const w = box.querySelector('.why');
    w.hidden = pick === undefined;
    w.innerHTML = (pick === ok ? '<b>[x] Right.</b> ' : '<b>[!] Not quite.</b> The answer is "' + esc(opts[ok]) + '". ') + esc(why);
  }
  items.forEach(([q, opts], i) => {
    const box = document.createElement('div');
    box.innerHTML = '<h3><span class="num">' + (i + 1) + '.</span>' + esc(q) + '</h3><div class="opts">' +
      opts.map((o, j) => '<button class="opt" type="button" data-j="' + j + '">' + String.fromCharCode(65 + j) + '. ' + esc(o) + '</button>').join('') +
      '</div><div class="why" hidden></div>';
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button.opt');
      if (!b || saved[i] !== undefined) return;
      saved[i] = +b.dataset.j; store(); paint(i); score();
    });
    list.appendChild(box);
    paint(i);
  });
  document.getElementById('reset').onclick = () => { saved = {}; store(); items.forEach((_, i) => paint(i)); score(); filter(false); };
  const ow = document.getElementById('onlyWrong');
  function filter(on) {
    ow.setAttribute('aria-pressed', on);
    items.forEach((it, i) => { list.children[i].hidden = on && !(saved[i] !== undefined && saved[i] !== it[2]); });
  }
  ow.onclick = () => filter(ow.getAttribute('aria-pressed') !== 'true');
  score();
})();

// Small helpers shared by the demos.
window.hex = (buf, max) => {
  const b = new Uint8Array(buf);
  const s = [...b.slice(0, max || b.length)].map((x) => x.toString(16).padStart(2, '0')).join(' ');
  return max && b.length > max ? s + ' … (' + b.length + ' bytes)' : s;
};
window.enc = new TextEncoder();
window.dec = new TextDecoder();
