// The Medfast fold: a scripted, fictitious conversation drawn like the real Medfast chat (the bubble, the mark, the
// "Pensando…", the prompt bar with its modes): the student types and sends, the Medfast thinks and writes. Everything is local text; nothing is sent anywhere. It plays only while visible,
// moves on to the next conversation when one ends, and shows the whole conversation at once with reduced motion.
const fold = document.querySelector('#the-med-fast');
const log = fold?.querySelector('[data-fast-log]');
const draft = fold?.querySelector('[data-fast-draft]');
const send = fold?.querySelector('[data-fast-send]');
const transcript = fold?.querySelector('[data-fast-transcript]');
const modes = fold ? [...fold.querySelectorAll('[data-fast-modes] [data-mode]')] : [];
const buttons = fold ? [...fold.querySelectorAll('[data-fast-example]')] : [];

const conversations = {
  estagio: {
    turns: [
      ['Tô no ambulatório de clínica. Paciente de 58 anos, sem queixas, veio pra rotina e a PA deu 162/98. Já posso escrever hipertensão?',
        'Ainda não. Uma medida isolada mostra a PA elevada, mas o diagnóstico de hipertensão pede confirmação: medidas repetidas em outra consulta, ou MAPA ou MRPA. Foi a primeira vez que mediram? A técnica estava certa, com 5 minutos de repouso e o manguito do tamanho do braço?'],
      ['Foi a primeira. E ela subiu a escada correndo pra não perder a vez 😅',
        'Então repita depois de alguns minutos sentada, nos dois braços, e registre as duas medidas. No SOAP: em Objetivo, “PA 162/98 mmHg, 1ª medida, após esforço”; em Avaliação, “PA elevada, a confirmar”. Leve ao seu preceptor a proposta de nova medida em outra consulta ou de MRPA.'],
      ['Repeti agora: 148/92. Anoto as duas?',
        'Anote as duas, com o horário e o braço. A segunda continua acima de 140/90, então a hipótese segue de pé e a confirmação fica para a próxima consulta. Bom raciocínio.'],
    ],
    mode: 'practice', greeting: 'Traga a dúvida da sua prática.',
  },
  soap: {
    turns: [
      ['No estágio, uma pessoa relata cansaço há três dias. Como começo meu SOAP?',
        'Em Subjetivo, registre “relata cansaço há três dias”, nas palavras dela. Você tem medidas ou exame físico da consulta para a seção Objetivo?'],
      ['Ainda não tenho o exame físico. Deixo em branco?',
        'Escreva “não informado” em Objetivo. Assim, quem lê distingue um dado ausente de um exame feito e descrito como normal.'],
    ],
    mode: 'practice', greeting: 'Vamos organizar seu raciocínio?',
  },
  conceito: {
    turns: [
      ['Qual a diferença entre sensibilidade e especificidade? Sempre confundo.',
        'Sensibilidade é a capacidade do teste de dar positivo em quem tem a doença; especificidade, de dar negativo em quem não tem. Um teste muito sensível, quando dá negativo, ajuda a descartar. Quer um exemplo do estágio?'],
      ['Quero, com um teste rápido.',
        'Se um teste rápido tem sensibilidade de 95%, de cada 100 pessoas com a doença, 95 dão positivo e 5 ficam como falso negativo. Por isso, um negativo num quadro muito sugestivo ainda pede cautela.'],
    ],
    mode: 'study', greeting: 'Qual conceito vamos revisar?',
  },
};
const order = Object.keys(conversations);

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let visible = false;
let run = 0;

const SVG = 'http://www.w3.org/2000/svg';
const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; };
// The Medfast mark, as in the chat (the same path, in wine).
const mark = () => {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'medfast-mark'); svg.setAttribute('viewBox', '0 0 38 32'); svg.setAttribute('fill', 'none'); svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', 'M2 21c6-1 8-15 13-15 5 0-2 20 3 20 4 0 8-19 13-19 3 0 0 9 5 9');
  path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '3.6'); path.setAttribute('stroke-linecap', 'round');
  svg.append(path);
  return svg;
};
const placeholder = () => el('span', 'medfast-placeholder', 'Pergunte ao Medfast…');
const welcome = text => { const box = el('div', 'medfast-empty'); box.append(mark(), el('p', '', text)); return box; };
const toBottom = () => { log.scrollTop = log.scrollHeight; };

// Waits the time while the fold is on screen and the tab is open; a new run cancels the old one.
function wait(ms, id) {
  return new Promise((resolve, reject) => {
    let left = ms, last = performance.now();
    const tick = now => {
      if (id !== run) return reject(new Error('stop'));
      if (visible && !document.hidden) left -= now - last;
      last = now;
      if (left <= 0) resolve(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function select(key) {
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.fastExample === key)));
  const item = conversations[key];
  modes.forEach(chip => chip.classList.toggle('is-on', chip.dataset.mode === item.mode));
  transcript.textContent = item.turns.map(([q, a]) => `Estudante: ${q} Medfast: ${a}`).join(' ');
}

function still(key) {
  select(key);
  log.replaceChildren();
  for (const [q, a] of conversations[key].turns) {
    const turn = el('div', 'medfast-turn'); const reply = el('div', 'medfast-reply');
    reply.append(mark(), el('p', '', a)); turn.append(el('p', 'medfast-bubble', q), reply); log.append(turn);
  }
  draft.replaceChildren(placeholder());
  log.scrollTop = 0;
}

async function play(key) {
  const id = ++run;
  select(key);
  const item = conversations[key];
  log.replaceChildren(welcome(item.greeting));
  draft.replaceChildren(placeholder());
  try {
    await wait(900, id);
    for (const [q, a] of item.turns) {
      // The student types in the prompt bar, then sends.
      const typed = el('span', 'medfast-typed'); const caret = el('i', 'medfast-caret');
      draft.replaceChildren(typed, caret);
      for (let i = 0; i < q.length;) { i = Math.min(q.length, i + 2); typed.textContent = q.slice(0, i); draft.scrollTop = draft.scrollHeight; await wait(52, id); }
      await wait(450, id);
      send.classList.add('is-sent');
      await wait(180, id);
      send.classList.remove('is-sent');
      draft.replaceChildren(placeholder());
      log.querySelector('.medfast-empty')?.remove();
      const turn = el('div', 'medfast-turn');
      const bubble = el('p', 'medfast-bubble medfast-enter', q);
      turn.append(bubble); log.append(turn); toBottom();
      // "Pensando…" with the mark, then the reply is written.
      await wait(350, id);
      const thinking = el('div', 'medfast-thinking medfast-enter');
      thinking.append(mark(), el('span', 'medfast-shine', 'Pensando…'));
      turn.append(thinking); toBottom();
      await wait(1200, id);
      thinking.remove();
      const reply = el('div', 'medfast-reply'); const text = el('p');
      reply.append(mark(), text); turn.append(reply);
      for (let i = 0; i < a.length;) { i = Math.min(a.length, i + 2); text.textContent = a.slice(0, i); toBottom(); await wait(30, id); }
      // Time to read what was written: about 18 characters a second, as a person reads on screen.
      await wait(1400 + a.length * 26, id);
    }
    await wait(3500, id);
    play(order[(order.indexOf(key) + 1) % order.length]);
  } catch { /* a newer run took over */ }
}

if (fold && log && draft && send && transcript) {
  buttons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.fastExample;
    if (!conversations[key]) return;
    if (reduced.matches) still(key); else play(key);
  }));
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.3 }).observe(log);
  if (reduced.matches) still('estagio'); else play('estagio');
  reduced.addEventListener?.('change', () => { run++; if (reduced.matches) still('estagio'); else play('estagio'); });
}
