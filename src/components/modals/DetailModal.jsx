import React, { useState } from 'react';
import { X, ShieldAlert, BookOpen, CheckCircle2, Circle, Trash2, Pencil, Check } from 'lucide-react';
import { ITEMS_LIST } from '../../constants/items';
import { enchantmentApi } from '../../api/enchantmentApi';

export default function DetailModal({
  enchantment,
  allEnchantments,
  onClose,
  onToggleFound,
  onConflictAdded,
  onDeleteEnchantment,
  isAdmin,
}) {
  if (!enchantment) return null;

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descText, setDescText] = useState(enchantment.description || '');
  const [savingDesc, setSavingDesc] = useState(false);

  const [isEditingItems, setIsEditingItems] = useState(false);
  const [tempItems, setTempItems] = useState({});
  const [savingItems, setSavingItems] = useState(false);

  const [selectedConflictId, setSelectedConflictId] = useState('');

  const handleSaveDescription = async () => {
    try {
      setSavingDesc(true);
      await enchantmentApi.updateDescription(enchantment.id, descText);
      onConflictAdded(enchantment.id);
      setIsEditingDesc(false);
    } catch (err) {
      alert(err.message || 'Error updating description.');
    } finally {
      setSavingDesc(false);
    }
  };

  const handleSaveItems = async () => {
    try {
      setSavingItems(true);
      await enchantmentApi.updateItems(enchantment.id, tempItems);
      onConflictAdded(enchantment.id);
      setIsEditingItems(false);
    } catch (err) {
      alert(err.message || 'Error updating compatible items.');
    } finally {
      setSavingItems(false);
    }
  };

  const handleAddConflict = async () => {
    if (!selectedConflictId) return;
    try {
      await enchantmentApi.addConflict(enchantment.id, selectedConflictId);
      onConflictAdded(enchantment.id);
      setSelectedConflictId('');
    } catch (err) {
      alert(err.message || 'Error adding the conflict.');
    }
  };

  const handleRemoveConflict = async (targetId, confirmName) => {
    if (!window.confirm(`Are you sure you want to remove the conflict with "${confirmName}"?`)) {
      return;
    }
    try {
      await enchantmentApi.removeConflict(targetId);
      onConflictAdded(enchantment.id);
    } catch (err) {
      alert(err.message || 'Error removing the conflict.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${
                  enchantment.source === 'custom'
                    ? 'bg-purple-950/50 text-purple-300 border-purple-800/40'
                    : 'bg-blue-950/50 text-blue-300 border-blue-800/40'
                }`}
              >
                {enchantment.source}
              </span>
              {isAdmin && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Admin Mode Active
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">{enchantment.name}</h2>
          </div>
        </div>

        {/* Description Box */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Description
            </span>
            {isAdmin &&
              (!isEditingDesc ? (
                <button
                  onClick={() => {
                    setDescText(enchantment.description || '');
                    setIsEditingDesc(true);
                  }}
                  className="text-slate-400 hover:text-indigo-400 transition-colors p-1 rounded hover:bg-slate-800/60 flex items-center gap-1 text-xs"
                  title="Edit description"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveDescription}
                    disabled={savingDesc}
                    className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-emerald-950/40 transition-colors flex items-center gap-1 text-xs"
                    title="Save"
                  >
                    <Check className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={() => setIsEditingDesc(false)}
                    className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>

          {!isEditingDesc ? (
            <p className="text-sm text-slate-300">
              {enchantment.description || 'No description specified for this enchantment.'}
            </p>
          ) : (
            <textarea
              rows="3"
              value={descText}
              onChange={(e) => setDescText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none mt-1"
              placeholder="Enter description..."
            />
          )}

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Max Level:</span>
            <span className="font-bold text-indigo-400 text-sm font-mono">
              {enchantment.max_level}
            </span>
          </div>
        </div>

        {/* Compatible Items Box */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Compatible Items
            </h4>
            {isAdmin &&
              (!isEditingItems ? (
                <button
                  onClick={() => {
                    const initialItems = {};
                    ITEMS_LIST.forEach((item) => {
                      initialItems[item.key] = Boolean(enchantment[item.key]);
                    });
                    setTempItems(initialItems);
                    setIsEditingItems(true);
                  }}
                  className="text-slate-400 hover:text-indigo-400 transition-colors p-1 rounded hover:bg-slate-800/60 flex items-center gap-1 text-xs"
                  title="Edit compatible items"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveItems}
                    disabled={savingItems}
                    className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-emerald-950/40 transition-colors flex items-center gap-1 text-xs"
                    title="Save"
                  >
                    <Check className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={() => setIsEditingItems(false)}
                    className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>

          {!isEditingItems ? (
            <div className="flex flex-wrap gap-1.5">
              {ITEMS_LIST.filter((item) => enchantment[item.key]).length > 0 ? (
                ITEMS_LIST.filter((item) => enchantment[item.key]).map((item) => (
                  <span
                    key={item.key}
                    className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700"
                  >
                    {item.label}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No items specified</span>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 mt-1">
              {ITEMS_LIST.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={tempItems[item.key] || false}
                    onChange={(e) => setTempItems({ ...tempItems, [item.key]: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Conflicts Box */}
        <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Conflicts
            </h4>
          </div>

{enchantment.conflicts && enchantment.conflicts.length > 0 ? (
            <div className="flex flex-col gap-2">
              {enchantment.conflicts.map((conflictItem, idx) => {
                const conflictEnchant = conflictItem;
                // L'ID del record di giunzione (da usare per la cancellazione)
                const pivotId = conflictItem.EnchantmentConflict?.id;
                
                // L'ID dell'incantesimo in conflitto (utile per la visualizzazione/fallback)
                const targetId = conflictItem.id;
                
                const confirmName = conflictEnchant ? conflictEnchant.name : `ID ${targetId}`;

                return (
                  <div
                    key={idx}
                    className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-2.5 text-xs text-amber-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {conflictEnchant ? conflictEnchant.name : `Conflict ID: ${targetId}`}
                      </span>

                      {conflictEnchant?.source && (
                        <span className="text-[10px] bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40 uppercase font-mono">
                          {conflictEnchant.source}
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleRemoveConflict(conflictItem.EnchantmentConflict.id, confirmName)}
                        className="text-amber-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-amber-900/30"
                        title="Remove conflict"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
              No incompatibilities registered.
            </p>
          )}

          {isAdmin && (
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-2 mt-1">
              <span className="text-[11px] text-slate-400 font-medium">Add new conflict:</span>
              <div className="flex gap-2">
                <select
                  value={selectedConflictId}
                  onChange={(e) => setSelectedConflictId(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select enchantment...</option>
                  {allEnchantments
                    .filter((item) => item.id !== enchantment.id)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.source})
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddConflict}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Associate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onToggleFound(enchantment.id, enchantment.found, e)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                enchantment.found
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {enchantment.found ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Mark as missing
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-white" />
                  Mark as found
                </>
              )}
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to delete "${enchantment.name}"? This action cannot be undone.`
                    )
                  ) {
                    onDeleteEnchantment(enchantment.id);
                  }
                }}
                className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/50 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                title="Delete Enchantment"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                Delete
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
