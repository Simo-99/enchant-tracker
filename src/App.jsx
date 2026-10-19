import React, { useState, useEffect } from 'react';
import { Search, Shield, Filter, CheckCircle2, Circle, BookOpen, Layers, Sparkles, RefreshCw, AlertCircle, Plus, X, Check } from 'lucide-react';
import DetailModal from './components/DetailModal';
import CreateEnchantModal from './components/CreateEnchantModal';
import EnchantmentCard from './components/EnchantmentCard';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

export default function App() {
  const [enchantments, setEnchantments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin & Modal states
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedEnchant, setSelectedEnchant] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state per nuovo incantesimo
  const [newEnchantName, setNewEnchantName] = useState('');
  const [newEnchantMaxLevel, setNewEnchantMaxLevel] = useState(1);
  const [newEnchantDesc, setNewEnchantDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemFilter, setItemFilter] = useState('all');

  const fetchEnchantments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/enchantments`);
      if (!res.ok) throw new Error('Error fetching enchantments from server.');
      const data = await res.json();
      setEnchantments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnchantments();
  }, []);

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      const pwd = prompt("Enter admin password:");
      if (!pwd) return;

      const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

      if (pwd === expectedPassword) {
        setIsAdmin(true);
      } else {
        alert("Incorrect password!");
      }
    }
  };

  const toggleFound = async (id, currentFound, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/api/enchantments/${id}/found`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ found: !currentFound })
      });
      if (!res.ok) throw new Error('Unable to update status.');
      
      setEnchantments(prev =>
        prev.map(item => item.id === id ? { ...item, found: !currentFound } : item)
      );

      if (selectedEnchant && selectedEnchant.id === id) {
        setSelectedEnchant(prev => ({ ...prev, found: !currentFound }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteEnchantment = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/enchantments/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error deleting enchantment.');

      setSelectedEnchant(null);
      fetchEnchantments();
    } catch (err) {
      alert(err.message);
    }
  };

  const refreshDetails = async (id) => {
    await fetchEnchantments();
    const res = await fetch(`${API_URL}/api/enchantments`);
    const data = await res.json();
    const updated = data.find(item => item.id === id);
    if (updated) setSelectedEnchant(updated);
  };

  const filteredEnchantments = enchantments.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSource = sourceFilter === 'all' || item.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'found' && item.found) || 
                          (statusFilter === 'missing' && !item.found);
    const matchesItem = itemFilter === 'all' || item[itemFilter] === true;

    return matchesSearch && matchesSource && matchesStatus && matchesItem;
  });

  // Statistiche separate Vanilla / Custom
  const vanillaItems = enchantments.filter(e => e.source === 'vanilla');
  const customItems = enchantments.filter(e => e.source === 'custom');

  const vanillaTotal = vanillaItems.length;
  const vanillaFound = vanillaItems.filter(e => e.found).length;
  const vanillaPercentage = vanillaTotal > 0 ? Math.round((vanillaFound / vanillaTotal) * 100) : 0;

  const customTotal = customItems.length;
  const customFound = customItems.filter(e => e.found).length;
  const customPercentage = customTotal > 0 ? Math.round((customFound / customTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
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
              onClick={handleAdminToggle}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors border ${
                isAdmin 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-lg shadow-amber-500/10' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isAdmin ? '🔓 Admin Mode: ON' : '🔒 Admin Mode: OFF'}
            </button>

            {/* New Enchantment Button (Visibile se Admin Mode è ON) */}
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
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
                  <span className="text-slate-400">Vanilla ({vanillaFound}/{vanillaTotal})</span>
                  <span className="font-medium text-blue-400">{vanillaPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-500" 
                    style={{ width: `${vanillaPercentage}%` }}
                  />
                </div>
              </div>

              <div className="h-8 w-px bg-slate-800" />

              {/* Custom Progress */}
              <div className="w-32">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Custom ({customFound}/{customTotal})</span>
                  <span className="font-medium text-purple-400">{customPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-500" 
                    style={{ width: `${customPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full flex flex-col gap-6">
        
        {/* Search and Filters Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 shadow-lg">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              onClick={fetchEnchantments}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Source</label>
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Sources</option>
                <option value="vanilla">Vanilla</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="found">Found Only</option>
                <option value="missing">Missing Only</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Compatible Item</label>
              <select
                value={itemFilter}
                onChange={e => setItemFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Items</option>
                {ITEMS_LIST.map(item => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Loading enchantments...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/40 border border-red-900/50 rounded-2xl p-6 text-center text-red-200 flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="font-medium">{error}</p>
            <button 
              onClick={fetchEnchantments}
              className="mt-2 bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-xl text-xs font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredEnchantments.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <p>No enchantments found matching current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEnchantments.map(item => {
              const compatibleItems = ITEMS_LIST.filter(obj => item[obj.key] === true);

              return (
                <EnchantmentCard 
              key={item.id} 
              item={item} 
              onToggleFound={toggleFound} 
              onOpenDetails={(id) => {
                // Qui gestisci l'apertura del modale dettagli, ad esempio:
                const foundEnchant = enchantments.find(e => e.id === id);
                setSelectedEnchant(foundEnchant);
                setShowDetailsModal(true);
      }}
                 />
              );
            })}
          </div>
        )}
      </main>

      {/* Modale Creazione Nuovo Incantesimo */}
      {showCreateModal && (
        <CreateEnchantModal 
          onClose={() => setShowCreateModal(false)} 
          onCreated={() => {
            setShowCreateModal(false);
            fetchEnchantments();}
        } 
        />
      )}

      {/* Details Modal */}
      {selectedEnchant && (
        <DetailModal
          enchantment={selectedEnchant}
          allEnchantments={enchantments}
          onClose={() => setSelectedEnchant(null)}
          onToggleFound={toggleFound}
          onConflictAdded={(id) => refreshDetails(id)}
          onDeleteEnchantment={deleteEnchantment}
          isAdmin={isAdmin}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        Minecraft Enchantment Tracker by BabyOner • React & Node.js Dashboard
      </footer>
    </div>
  );
}