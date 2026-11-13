import { apiRequest } from './client';

export const enchantmentApi = {
  getAll: () => apiRequest('/api/enchantments'),

  create: (data) =>
    apiRequest('/api/enchantments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  toggleFound: (id, found) =>
    apiRequest(`/api/enchantments/${id}/found`, {
      method: 'PATCH',
      body: JSON.stringify({ found }),
    }),

  updateDescription: (id, description) =>
    apiRequest(`/api/enchantments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ description }),
    }),

updateItems: (id, itemsData) =>
    apiRequest(`/api/enchantments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemsData),
    }),

  delete: (id) =>
    apiRequest(`/api/enchantments/${id}`, {
      method: 'DELETE',
    }),

addConflict: (id, conflictsWithId) =>
    apiRequest('/api/conflicts', {
      method: 'POST',
      body: JSON.stringify({ 
        enchantment_id: Number(id), 
        conflicts_with_id: Number(conflictsWithId) 
      }),
    }),

  removeConflict: (conflictRowId) =>
    apiRequest(`/api/conflicts/${conflictRowId}`, {
      method: 'DELETE',
    }),
};
