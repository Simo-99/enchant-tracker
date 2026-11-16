// Modello Litness.gg (vedi LitnessGG_Prompt_Ottimizzazione_Enchantments.txt)
//   costo fusione = C(DX) + P(SX) + P(DX)
//   P(n) = 2^n - 1
//   n(risultato) = max(n(SX), n(DX)) + 1
//   limite: ogni fusione deve costare <= 39
// Ogni "libro" è un singolo enchant: { name, cost, work }.
// L'oggetto parte senza enchant, con `itemWork` lavorazioni precedenti.

export const MAX_COST = 39;
export const MAX_ENCHANTS = 12;

export const penalty = (n) => 2 ** n - 1;

const NB = 6; // lavorazioni dei libri: 0..5 (con n>=6 la penalità è 63 > 39: inutilizzabile)
const NI = 7; // lavorazioni dell'oggetto: 0..6
const INF = 1e9;

const lowIdx = (m) => 31 - Math.clz32(m & -m);

function solve(books, itemWork, objective) {
  const k = books.length;
  if (k === 0) return null;
  if (itemWork < 0 || itemWork >= NI) return null;
  if (books.some((b) => b.work < 0 || b.work >= NB)) return null;

  const size = 1 << k;
  const better =
    objective === 'safety'
      ? (t1, m1, t2, m2) => m1 < m2 || (m1 === m2 && t1 < t2)
      : (t1, m1, t2, m2) => t1 < t2 || (t1 === t2 && m1 < m2);

  // costo base complessivo di ogni sottoinsieme
  const base = new Int32Array(size);
  for (let m = 1; m < size; m++) base[m] = base[m & (m - 1)] + books[lowIdx(m)].cost;

  // ---- Stadio 1: costruzione di un singolo libro intermedio per ogni sottoinsieme ----
  const bt = new Int32Array(size * NB).fill(INF); // costo totale di costruzione
  const bm = new Int32Array(size * NB); // costo massimo di un singolo passaggio
  const bl = new Int32Array(size * NB); // sottoinsieme messo a SINISTRA
  const bnl = new Int8Array(size * NB);
  const bnr = new Int8Array(size * NB);

  for (let i = 0; i < k; i++) bt[(1 << i) * NB + books[i].work] = 0;

  for (let mask = 1; mask < size; mask++) {
    if ((mask & (mask - 1)) === 0) continue;
    for (let a = (mask - 1) & mask; a > 0; a = (a - 1) & mask) {
      const b = mask ^ a; // a = sinistro, b = destro (si provano tutti gli orientamenti)
      for (let nl = 0; nl < NB; nl++) {
        const ta = bt[a * NB + nl];
        if (ta >= INF) continue;
        for (let nr = 0; nr < NB; nr++) {
          const tb = bt[b * NB + nr];
          if (tb >= INF) continue;
          const cost = base[b] + penalty(nl) + penalty(nr);
          if (cost > MAX_COST) continue;
          const nn = Math.max(nl, nr) + 1;
          if (nn >= NB) continue;
          const tot = ta + tb + cost;
          const mx = Math.max(bm[a * NB + nl], bm[b * NB + nr], cost);
          const idx = mask * NB + nn;
          if (bt[idx] >= INF || better(tot, mx, bt[idx], bm[idx])) {
            bt[idx] = tot;
            bm[idx] = mx;
            bl[idx] = a;
            bnl[idx] = nl;
            bnr[idx] = nr;
          }
        }
      }
    }
  }

  // ---- Stadio 2: applicazione dei gruppi all'oggetto (oggetto sempre a SINISTRA) ----
  const full = size - 1;
  const it = new Int32Array(size * NI).fill(INF);
  const im = new Int32Array(size * NI);
  const ip = new Int32Array(size * NI);
  const ipn = new Int8Array(size * NI);
  const ig = new Int32Array(size * NI);
  const ign = new Int8Array(size * NI);
  it[itemWork] = 0;

  for (let used = 0; used < full; used++) {
    const rem = full ^ used;
    for (let n = 0; n < NI; n++) {
      const cur = it[used * NI + n];
      if (cur >= INF) continue;
      const pn = penalty(n);
      if (pn > MAX_COST) continue;
      for (let g = rem; g > 0; g = (g - 1) & rem) {
        for (let nb = 0; nb < NB; nb++) {
          const tb = bt[g * NB + nb];
          if (tb >= INF) continue;
          const cost = base[g] + pn + penalty(nb);
          if (cost > MAX_COST) continue;
          const n2 = Math.max(n, nb) + 1;
          if (n2 >= NI) continue;
          const tot = cur + tb + cost;
          const mx = Math.max(im[used * NI + n], bm[g * NB + nb], cost);
          const idx = (used | g) * NI + n2;
          if (it[idx] >= INF || better(tot, mx, it[idx], im[idx])) {
            it[idx] = tot;
            im[idx] = mx;
            ip[idx] = used;
            ipn[idx] = n;
            ig[idx] = g;
            ign[idx] = nb;
          }
        }
      }
    }
  }

  let bestN = -1;
  for (let n = 0; n < NI; n++) {
    const idx = full * NI + n;
    if (it[idx] >= INF) continue;
    if (bestN < 0 || better(it[idx], im[idx], it[full * NI + bestN], im[full * NI + bestN])) bestN = n;
  }
  if (bestN < 0) return null;

  // ---- Ricostruzione ----
  const groups = [];
  let used = full;
  let n = bestN;
  while (used > 0) {
    const idx = used * NI + n;
    groups.push({ g: ig[idx], nb: ign[idx] });
    const pu = ip[idx];
    const pnn = ipn[idx];
    used = pu;
    n = pnn;
  }
  groups.reverse();

  const names = (mask) => books.filter((_, i) => mask & (1 << i)).map((b) => b.name);
  const steps = [];
  let bCount = 0;

  const emit = (mask, nw) => {
    if ((mask & (mask - 1)) === 0) {
      const i = lowIdx(mask);
      return { label: `L${i + 1}`, contents: [books[i].name], work: nw };
    }
    const idx = mask * NB + nw;
    const a = bl[idx];
    const b = mask ^ a;
    const L = emit(a, bnl[idx]);
    const R = emit(b, bnr[idx]);
    const cost = base[b] + penalty(bnl[idx]) + penalty(bnr[idx]);
    const label = `B${++bCount}`;
    steps.push({
      left: L,
      right: R,
      cost,
      result: { label, contents: names(mask), work: nw },
      penalty: penalty(nw),
    });
    return { label, contents: names(mask), work: nw };
  };

  let itemN = itemWork;
  let itemMask = 0;
  groups.forEach((grp, j) => {
    const R = emit(grp.g, grp.nb);
    const cost = base[grp.g] + penalty(itemN) + penalty(grp.nb);
    const n2 = Math.max(itemN, grp.nb) + 1;
    const leftLabel = `S${j}`;
    itemMask |= grp.g;
    steps.push({
      left: { label: leftLabel, contents: j === 0 ? [] : names(itemMask ^ grp.g), work: itemN, isItem: true },
      right: R,
      cost,
      result: { label: `S${j + 1}`, contents: names(itemMask), work: n2, isItem: true },
      penalty: penalty(n2),
    });
    itemN = n2;
  });

  const totalCost = steps.reduce((s, st) => s + st.cost, 0);
  const maxCost = steps.reduce((m, st) => Math.max(m, st.cost), 0);
  return {
    steps,
    totalCost,
    maxCost,
    itemOps: groups.length,
    finalWork: itemN,
    finalPenalty: penalty(itemN),
  };
}

// Verifica indipendente: ri-simula la tabella passo per passo, senza usare gli array della DP.
export function verifyPlan(plan, books, itemWork) {
  const errors = [];
  const store = new Map();
  books.forEach((b, i) => store.set(`L${i + 1}`, { set: new Set([b.name]), cost: b.cost, work: b.work }));
  store.set('S0', { set: new Set(), cost: 0, work: itemWork });

  let sum = 0;
  plan.steps.forEach((st, i) => {
    const L = store.get(st.left.label);
    const R = store.get(st.right.label);
    const tag = `Passaggio ${i + 1}`;
    if (!L || !R) {
      errors.push(`${tag}: oggetto già consumato o inesistente (${st.left.label} / ${st.right.label}).`);
      return;
    }
    store.delete(st.left.label);
    store.delete(st.right.label);
    const cost = R.cost + penalty(L.work) + penalty(R.work);
    if (cost !== st.cost) errors.push(`${tag}: costo ricalcolato ${cost} ≠ ${st.cost}.`);
    if (cost > MAX_COST) errors.push(`${tag}: costo ${cost} supera ${MAX_COST}.`);
    const merged = new Set([...L.set, ...R.set]);
    if (merged.size !== L.set.size + R.set.size) errors.push(`${tag}: enchant duplicati.`);
    const work = Math.max(L.work, R.work) + 1;
    if (work !== st.result.work) errors.push(`${tag}: lavorazioni ricalcolate ${work} ≠ ${st.result.work}.`);
    if (penalty(work) !== st.penalty) errors.push(`${tag}: penalità errata.`);
    store.set(st.result.label, { set: merged, cost: L.cost + R.cost, work });
    sum += cost;
  });

  if (sum !== plan.totalCost) errors.push(`Somma righe ${sum} ≠ totale dichiarato ${plan.totalCost}.`);
  const lastItem = plan.steps[plan.steps.length - 1]?.result.label;
  const fin = store.get(lastItem);
  if (!fin || fin.set.size !== books.length) errors.push('Oggetto finale senza tutti gli enchant richiesti.');
  if (store.size !== 1) errors.push('Restano libri non utilizzati.');
  return { ok: errors.length === 0, errors };
}

// Restituisce le due soluzioni (costo totale minimo / margine di sicurezza massimo).
export function planAll(books, itemWork) {
  const mk = (objective) => {
    const plan = solve(books, itemWork, objective);
    if (!plan) return null;
    return { ...plan, verification: verifyPlan(plan, books, itemWork) };
  };
  return { total: mk('total'), safety: mk('safety') };
}
