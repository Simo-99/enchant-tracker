import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

export default function Header({
  isAdmin,
  onAdminToggle,
  onOpenCreateModal,
  vanillaStats,
  customStats,
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Minecraft Enchantment Tracker</h1>
            <p className="text-xs text-slate-400">Server Dashboard & Database Monitor</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Admin Mode Button */}
          <button
            onClick={onAdminToggle}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors border ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isAdmin ? '🔓 Admin Mode: ON' : '🔒 Admin Mode: OFF'}
          </button>

          {/* New Enchantment Button (Visible if Admin Mode is ON) */}
          {isAdmin && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-medium transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              New Enchantment
            </button>
          )}

          {/* Quick Stats & Progress Bars (Vanilla & Custom) */}
          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm">
            {/* Vanilla Progress */}
            <div className="w-32">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">
                  Vanilla ({vanillaStats.found}/{vanillaStats.total})
                </span>
                <span className="font-medium text-blue-400">{vanillaStats.percentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={{ width: `${vanillaStats.percentage}%` }}
                />
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            {/* Custom Progress */}
            <div className="w-32">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">
                  Custom ({customStats.found}/{customStats.total})
                </span>
                <span className="font-medium text-purple-400">{customStats.percentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all duration-500"
                  style={{ width: `${customStats.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
