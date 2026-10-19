import React from 'react';
import { CheckCircle2, Circle, Info } from 'lucide-react';

const ITEMS_LIST = [
  { key: 'sword', label: 'Sword' },
  { key: 'axe', label: 'Axe' },
  { key: 'pickaxe', label: 'Pickaxe' },
  { key: 'shovel', label: 'Shovel' },
  { key: 'hoe', label: 'Hoe' },
  { key: 'helmet', label: 'Helmet' },
  { key: 'chestplate', label: 'Chestplate' },
  { key: 'leggings', label: 'Leggings' },
  { key: 'boots', label: 'Boots' },
  { key: 'bow', label: 'Bow' },
  { key: 'crossbow', label: 'Crossbow' },
  { key: 'trident', label: 'Trident' },
  { key: 'mace', label: 'Mace' },
  { key: 'shield', label: 'Shield' },
  { key: 'fishing_rod', label: 'Fishing Rod' },
  { key: 'elytra', label: 'Elytra' }
];

export default function EnchantmentCard({ item, onToggleFound, onOpenDetails }) {
  const compatibleItems = ITEMS_LIST.filter(obj => item[obj.key] === true);

  return (
    <div 
      onClick={() => onOpenDetails(item.id)}
      className={`cursor-pointer bg-slate-900/70 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:scale-[1.01] hover:border-slate-700 shadow-md ${
        item.found ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800'
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${
              item.source === 'custom' 
                ? 'bg-purple-950/50 text-purple-300 border-purple-800/40' 
                : 'bg-blue-950/50 text-blue-300 border-blue-800/40'
            }`}>
              {item.source}
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">{item.name}</h3>
          </div>
          <span className="text-xs bg-slate-800/90 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
            Max: {item.max_level}
          </span>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
          {item.description || "No description available."}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/60">
        {compatibleItems.length > 0 ? (
          compatibleItems.slice(0, 6).map(obj => (
            <span key={obj.key} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/50">
              {obj.label}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-slate-500 italic">No compatible items</span>
        )}
        {compatibleItems.length > 6 && (
          <span className="text-[10px] bg-slate-800/50 text-slate-400 px-1.5 py-0.5 rounded">
            +{compatibleItems.length - 6}
          </span>
        )}
      </div>

      <div className="pt-2 flex items-center justify-between">
        <button
          onClick={(e) => onToggleFound(item.id, item.found, e)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            item.found 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30' 
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'
          }`}
        >
          {item.found ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Found
            </>
          ) : (
            <>
              <Circle className="w-4 h-4 text-slate-500" />
              Missing
            </>
          )}
        </button>
        <span className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-medium">
          <Info className="w-3.5 h-3.5" /> Details
        </span>
      </div>
    </div>
  );
}