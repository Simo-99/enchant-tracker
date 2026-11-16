import React, { useState, useMemo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useEnchantments } from './hooks/useEnchantments';
import { useAdminAuth } from './hooks/useAdminAuth';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FilterBar from './components/enchantments/FilterBar';
import EnchantmentCard from './components/enchantments/EnchantmentCard';
import CreateEnchantModal from './components/modals/CreateEnchantModal';
import DetailModal from './components/modals/DetailModal';
import PlannerView from './components/planner/PlannerView';

export default function App() {
  const {
    enchantments,
    loading,
    error,
    selectedEnchant,
    setSelectedEnchant,
    fetchEnchantments,
    toggleFound,
    deleteEnchantment,
    refreshDetails,
  } = useEnchantments();

  const { isAdmin, handleAdminToggle } = useAdminAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [view, setView] = useState('tracker'); // 'tracker' | 'planner'

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemFilter, setItemFilter] = useState('all');

  const filteredEnchantments = useMemo(() => {
    return enchantments.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSource = sourceFilter === 'all' || item.source === sourceFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'found' && item.found) ||
        (statusFilter === 'missing' && !item.found);
      const matchesItem = itemFilter === 'all' || item[itemFilter] === true;

      return matchesSearch && matchesSource && matchesStatus && matchesItem;
    });
  }, [enchantments, searchQuery, sourceFilter, statusFilter, itemFilter]);

  const { vanillaStats, customStats } = useMemo(() => {
    const vanillaItems = enchantments.filter((e) => e.source === 'vanilla');
    const customItems = enchantments.filter((e) => e.source === 'custom');

    const vanillaTotal = vanillaItems.length;
    const vanillaFound = vanillaItems.filter((e) => e.found).length;
    const vanillaPercentage =
      vanillaTotal > 0 ? Math.round((vanillaFound / vanillaTotal) * 100) : 0;

    const customTotal = customItems.length;
    const customFound = customItems.filter((e) => e.found).length;
    const customPercentage =
      customTotal > 0 ? Math.round((customFound / customTotal) * 100) : 0;

    return {
      vanillaStats: { total: vanillaTotal, found: vanillaFound, percentage: vanillaPercentage },
      customStats: { total: customTotal, found: customFound, percentage: customPercentage },
    };
  }, [enchantments]);

  const tabCls = (active) =>
    `px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
      active
        ? 'bg-indigo-600 text-white border-indigo-500'
        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
    }`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        isAdmin={isAdmin}
        onAdminToggle={handleAdminToggle}
        onOpenCreateModal={() => setShowCreateModal(true)}
        vanillaStats={vanillaStats}
        customStats={customStats}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full flex flex-col gap-6">
        <div className="flex gap-2">
          <button onClick={() => setView('tracker')} className={tabCls(view === 'tracker')}>
            Tracker
          </button>
          <button onClick={() => setView('planner')} className={tabCls(view === 'planner')}>
            Planner fusioni
          </button>
        </div>

        {view === 'planner' ? (
          loading ? (
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
          ) : (
            <PlannerView enchantments={enchantments} />
          )
        ) : (
          <>
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sourceFilter={sourceFilter}
              setSourceFilter={setSourceFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              itemFilter={itemFilter}
              setItemFilter={setItemFilter}
              onRefresh={fetchEnchantments}
            />

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
                {filteredEnchantments.map((item) => (
                  <EnchantmentCard
                    key={item.id}
                    item={item}
                    onToggleFound={toggleFound}
                    onOpenDetails={(id) => {
                      const found = enchantments.find((e) => e.id === id);
                      setSelectedEnchant(found);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showCreateModal && (
        <CreateEnchantModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchEnchantments();
          }}
        />
      )}

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

      <Footer />
    </div>
  );
}
