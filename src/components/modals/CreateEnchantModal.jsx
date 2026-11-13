import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ITEMS_LIST } from '../../constants/items';
import { enchantmentApi } from '../../api/enchantmentApi';

const INITIAL_FORM_STATE = {
  name: '',
  source: 'custom',
  max_level: 1,
  description: '',
  sword: false,
  axe: false,
  pickaxe: false,
  shovel: false,
  hoe: false,
  helmet: false,
  chestplate: false,
  leggings: false,
  boots: false,
  bow: false,
  crossbow: false,
  trident: false,
  mace: false,
  shield: false,
  fishing_rod: false,
  elytra: false,
};

export default function CreateEnchantModal({ onClose, onCreated }) {
  const [newEnchant, setNewEnchant] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEnchant.name.trim()) {
      alert('Enchantment name is required.');
      return;
    }

    try {
      setSubmitting(true);
      await enchantmentApi.create(newEnchant);
      onCreated();
      onClose();
    } catch (err) {
      alert(err.message || 'Error creating the enchantment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-8 p-6 shadow-2xl flex flex-col gap-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" /> Add New Enchantment
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Register a new custom or vanilla enchantment on the server.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Enchantment Name *</label>
              <input
                type="text"
                required
                placeholder="Ex. Super Strike"
                value={newEnchant.name}
                onChange={(e) => setNewEnchant({ ...newEnchant, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Source</label>
              <select
                value={newEnchant.source}
                onChange={(e) => setNewEnchant({ ...newEnchant, source: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="custom">Custom</option>
                <option value="vanilla">Vanilla</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Max Level</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newEnchant.max_level}
                onChange={(e) =>
                  setNewEnchant({ ...newEnchant, max_level: parseInt(e.target.value) || 1 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Description</label>
            <textarea
              rows="2"
              placeholder="Describe what the enchantment does..."
              value={newEnchant.description}
              onChange={(e) => setNewEnchant({ ...newEnchant, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Compatible Items
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
              {ITEMS_LIST.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none hover:text-indigo-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={newEnchant[item.key]}
                    onChange={(e) =>
                      setNewEnchant({ ...newEnchant, [item.key]: e.target.checked })
                    }
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Create Enchantment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
