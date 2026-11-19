import React, { useMemo, useState } from 'react';
import { Plus, X, Calculator, AlertTriangle, CheckCircle2, Search, RefreshCw } from 'lucide-react';
import { ITEMS_LIST } from '../../constants/items';
import { MAX_COST, MAX_ENCHANTS, planAll } from '../../utils/anvil';

const inputCls =
  'bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500';

export default function PlannerView({ enchantments }) {
  const [itemKey, setItemKey] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [costs, setCosts] = useState({}); // id -> string
  const [works, setWorks] = useState({}); // id -> string
  const [itemWork, setItemWork] = useState('0');
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [computing, setComputing] = useState(false);
  const [formError, setFormError] = useState('');
  const [tab, setTab] = useState('total');

  // Mappa conflitti simmetrica (un conflitto salvato in una sola direzione vale in entrambe)
  const conflictMap = useMemo(() => {
    const map = new Map();
    const add = (a, b) => {
      if (!map.has(a)) map.set(a, new Set());
      map.get(a).add(b);
    };
    enchantments.forEach((e) => {
      (e.conflicts || []).forEach((c) => {
        const other = c.id ?? c.conflicts_with_id;
        if (other == null) return;
        add(e.id, other);
        add(other, e.id);
      });
    });
    return map;
  }, [enchantments]);

  const selected = useMemo(
    () => selectedIds.map((id) => enchantments.find((e) => e.id === id)).filter(Boolean),
    [selectedIds, enchantments]
  );

  const { available, hiddenByConflict } = useMemo(() => {
    if (!itemKey) return { available: [], hiddenByConflict: 0 };
    const q = search.trim().toLowerCase();
    const compatible = enchantments.filter(
      (e) => e[itemKey] === true && !selectedIds.includes(e.id)
    );
    let hidden = 0;
    const list = compatible.filter((e) => {
      const clash = selectedIds.some((s) => conflictMap.get(e.id)?.has(s));
      if (clash) hidden++;
      return !clash;
    });
    const filtered = q
      ? list.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            (e.description && e.description.toLowerCase().includes(q))
        )
      : list;
    return { available: filtered, hiddenByConflict: hidden };
  }, [enchantments, itemKey, selectedIds, conflictMap, search]);

  const resetResult = () => {
    setResult(null);
    setFormError('');
  };

  const chooseItem = (key) => {
    setItemKey(key);
    setSelectedIds([]);
    setSearch('');
    resetResult();
  };

  const addEnchant = (e) => {
    if (selectedIds.length >= MAX_ENCHANTS) return;
    setSelectedIds([...selectedIds, e.id]);
    // precompila l'Anvil cost dal campo "cost" dell'API (resta modificabile)
    if (costs[e.id] === undefined && e.cost !== null && e.cost !== undefined && Number.isInteger(Number(e.cost))) {
      setCosts((c) => ({ ...c, [e.id]: String(e.cost) }));
    }
    resetResult();
  };

  const removeEnchant = (id) => {
    setSelectedIds(selectedIds.filter((x) => x !== id));
    resetResult();
  };

  const parseIntStrict = (s) => (/^\d+$/.test(String(s).trim()) ? Number(s) : NaN);

  const handleCalculate = () => {
    setFormError('');
    const w0 = parseIntStrict(itemWork);
    if (Number.isNaN(w0) || w0 > 6) {
      setFormError("Lavorazioni precedenti dell'oggetto: inserisci un intero tra 0 e 6.");
      return;
    }
    const books = [];
    for (const e of selected) {
      const cost = parseIntStrict(costs[e.id] ?? '');
      const work = parseIntStrict(works[e.id] ?? '0');
      if (Number.isNaN(cost) || cost < 1) {
        setFormError(`Inserisci l'Anvil cost (intero ≥ 1) per "${e.name}".`);
        return;
      }
      if (Number.isNaN(work) || work > 5) {
        setFormError(`Lavorazioni precedenti di "${e.name}": intero tra 0 e 5.`);
        return;
      }
      books.push({ name: e.name, cost, work });
    }
    setComputing(true);
    setResult(null);
    // lascia a React il tempo di mostrare lo spinner prima del calcolo
    setTimeout(() => {
      try {
        setResult({ ...planAll(books, w0), books, w0 });
        setTab('total');
      } catch (err) {
        setFormError(err.message || 'Errore nel calcolo.');
      } finally {
        setComputing(false);
      }
    }, 30);
  };

  const plan = result ? (tab === 'safety' ? result.safety : result.total) : null;
  const sameSolution =
    result?.total &&
    result?.safety &&
    result.total.totalCost === result.safety.totalCost &&
    result.total.maxCost === result.safety.maxCost;

  return (
    <div className="flex flex-col gap-6">
      {/* Scelta item */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-200">1. Scegli l'item da enchantare</h2>
        <div className="flex flex-wrap gap-2">
          {ITEMS_LIST.map((item) => (
            <button
              key={item.key}
              onClick={() => chooseItem(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                itemKey === item.key
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {!itemKey ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
          Seleziona un item per vedere gli enchant compatibili.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Enchant disponibili */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">2. Enchant disponibili</h2>
              <span className="text-[11px] text-slate-500">{available.length} selezionabili</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            {hiddenByConflict > 0 && (
              <p className="text-[11px] text-amber-300/80">
                {hiddenByConflict} enchant nascosti perché in conflitto con quelli già scelti.
              </p>
            )}
            {selectedIds.length >= MAX_ENCHANTS && (
              <p className="text-[11px] text-amber-300/80">
                Raggiunto il limite di {MAX_ENCHANTS} enchant per oggetto.
              </p>
            )}
            <div className="flex flex-col gap-2 max-h-[28rem] overflow-y-auto pr-1">
              {available.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3">Nessun enchant disponibile.</p>
              ) : (
                available.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => addEnchant(e)}
                    disabled={selectedIds.length >= MAX_ENCHANTS}
                    className="text-left bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800 rounded-xl p-3 flex items-start justify-between gap-3 transition-colors disabled:opacity-40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-100">{e.name}</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                            e.source === 'custom'
                              ? 'bg-purple-950/50 text-purple-300 border-purple-800/40'
                              : 'bg-blue-950/50 text-blue-300 border-blue-800/40'
                          }`}
                        >
                          {e.source}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">max {e.max_level}</span>
                      </div>
                      {e.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{e.description}</p>
                      )}
                    </div>
                    <Plus className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Lista scelta */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">3. La tua lista</h2>
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedIds.length}/{MAX_ENCHANTS}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
              <label className="text-[11px] text-slate-400">Lavorazioni precedenti dell'oggetto</label>
              <input
                value={itemWork}
                onChange={(e) => {
                  setItemWork(e.target.value);
                  resetResult();
                }}
                className={`${inputCls} w-14 text-center font-mono`}
              />
            </div>

            <div className="flex flex-col gap-2 max-h-[22rem] overflow-y-auto pr-1">
              {selected.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3">Aggiungi enchant dalla colonna a sinistra.</p>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_4.5rem_4.5rem_1.5rem] gap-2 text-[10px] uppercase tracking-wider text-slate-500 px-1">
                    <span>Enchant</span>
                    <span className="text-center">Anvil cost</span>
                    <span className="text-center">Lavor. prec.</span>
                    <span />
                  </div>
                  {selected.map((e) => (
                    <div
                      key={e.id}
                      className="grid grid-cols-[1fr_4.5rem_4.5rem_1.5rem] gap-2 items-center bg-slate-950/60 border border-slate-800 rounded-xl p-2"
                    >
                      <span className="text-sm text-slate-100 truncate">{e.name}</span>
                      <input
                        value={costs[e.id] ?? ''}
                        onChange={(ev) => {
                          setCosts({ ...costs, [e.id]: ev.target.value });
                          resetResult();
                        }}
                        placeholder="?"
                        className={`${inputCls} text-center font-mono`}
                      />
                      <input
                        value={works[e.id] ?? '0'}
                        onChange={(ev) => {
                          setWorks({ ...works, [e.id]: ev.target.value });
                          resetResult();
                        }}
                        className={`${inputCls} text-center font-mono`}
                      />
                      <button
                        onClick={() => removeEnchant(e.id)}
                        className="text-slate-500 hover:text-red-400"
                        title="Rimuovi"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              L'Anvil cost è il valore "+X levels" del tooltip del libro. Le lavorazioni precedenti sono 0 solo se il
              libro è nuovo: modificale se non lo è.
            </p>

            {formError && (
              <p className="text-xs text-red-300 bg-red-950/40 border border-red-900/50 rounded-xl p-2.5">
                {formError}
              </p>
            )}

            <button
              onClick={handleCalculate}
              disabled={selected.length === 0 || computing}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
            >
              {computing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              {computing ? 'Calcolo in corso...' : 'Calcola le fusioni'}
            </button>
          </div>
        </div>
      )}

      {/* Risultato */}
      {result && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-200">4. Sequenza di fusioni</h2>

          {!result.total ? (
            <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/50 rounded-xl p-4 text-sm text-red-200">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <p>
                Con questi dati nessuna sequenza resta sotto {MAX_COST + 1} livelli per fusione (limite {MAX_COST}).
                Controlla costi e lavorazioni inseriti, oppure rimuovi un enchant.
              </p>
            </div>
          ) : (
            <>
              {!sameSolution && (
                <div className="flex gap-2">
                  {[
                    ['total', 'Costo totale minimo'],
                    ['safety', 'Massimo margine di sicurezza'],
                  ].map(([k, label]) => (
                    <button
                      key={k}
                      onClick={() => setTab(k)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                        tab === k
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {plan && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <Stat label="Livelli totali" value={plan.totalCost} />
                    <Stat label="Costo max per fusione" value={`${plan.maxCost} / ${MAX_COST}`} warn={plan.maxCost >= 35} />
                    <Stat label="Lavorazioni finali oggetto" value={plan.finalWork} />
                    <Stat label="Penalità finale" value={`+${plan.finalPenalty}`} />
                  </div>

                  <div
                    className={`flex items-start gap-2 text-xs rounded-xl p-3 border ${
                      plan.verification.ok
                        ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-200'
                        : 'bg-red-950/40 border-red-900/50 text-red-200'
                    }`}
                  >
                    {plan.verification.ok ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    )}
                    <div>
                      {plan.verification.ok
                        ? 'Verifica indipendente superata: la tabella è stata ri-simulata passo per passo (costi, lavorazioni, enchant conservati, nessun libro riusato, nessun costo ≥ 40).'
                        : plan.verification.errors.map((er, i) => <p key={i}>{er}</p>)}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                          <th className="py-2 pr-3">#</th>
                          <th className="py-2 pr-3">Slot sinistro</th>
                          <th className="py-2 pr-3">Slot destro</th>
                          <th className="py-2">Costo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.steps.map((st, i) => (
                          <tr key={i} className="border-b border-slate-800/60 align-top">
                            <td className="py-2 pr-3 text-slate-500 font-mono">{i + 1}</td>
                            <td className="py-2 pr-3"><Slot s={st.left} /></td>
                            <td className="py-2 pr-3"><Slot s={st.right} /></td>
                            <td
                              className={`py-2 font-mono font-bold ${
                                st.cost >= 35 ? 'text-amber-300' : 'text-slate-100'
                              }`}
                            >
                              {st.cost}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Gli enchant tra parentesi, per esempio (A + B), sono un libro già combinato nei passaggi
                    precedenti. Prima di confermare ogni fusione confronta il costo con l'anteprima
                    dell'incudine: se differisce, fermati. Il modello è quello descritto nelle regole fornite;
                    comportamenti custom non verificati restano da controllare in gioco.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, warn }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-lg font-bold font-mono ${warn ? 'text-amber-300' : 'text-slate-100'}`}>{value}</p>
    </div>
  );
}

function Slot({ s }) {
  if (s.isItem) return <span className="font-bold text-indigo-300">Item</span>;
  const text = s.contents.length > 1 ? `(${s.contents.join(' + ')})` : s.contents[0];
  return <span className="font-medium text-slate-100">{text}</span>;
}
