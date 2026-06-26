import React, { useState } from 'react';
import type { Medicine } from '../types';

interface PharmacyProps {
  inventory: Medicine[];
  onUpdate: (inventory: Medicine[]) => void;
}

export const Pharmacy: React.FC<PharmacyProps> = ({ inventory, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Omit<Medicine, 'id'>>({
    name: '',
    stock: 0,
    unit: '',
    cost: 0,
    expiry: ''
  });

  const handleAdd = () => {
    if (!draft.name || draft.stock < 0) return;
    const newMed: Medicine = {
      ...draft,
      id: crypto.randomUUID()
    };
    onUpdate([newMed, ...inventory]);
    setDraft({ name: '', stock: 0, unit: '', cost: 0, expiry: '' });
    setShowForm(false);
  };

  const adjustStock = (id: string, delta: number) => {
    onUpdate(inventory.map(m => {
      if (m.id === id) {
        return { ...m, stock: Math.max(0, m.stock + delta) };
      }
      return m;
    }));
  };

  const deleteMed = (id: string) => {
    if (confirm('Delete this medicine?')) {
      onUpdate(inventory.filter(m => m.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: 22 }}>💊 Pharmacy Inventory</h2>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Medicine'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input className="form-control" placeholder="Medicine Name" value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} style={{ gridColumn: '1/-1' }} />
          <input className="form-control" placeholder="Stock Quantity" type="number" value={draft.stock || ''} onChange={e => setDraft({...draft, stock: +e.target.value})} />
          <input className="form-control" placeholder="Unit (e.g. tablet, bottle)" value={draft.unit} onChange={e => setDraft({...draft, unit: e.target.value})} />
          <input className="form-control" placeholder="Cost per unit" type="number" step="0.01" value={draft.cost || ''} onChange={e => setDraft({...draft, cost: +e.target.value})} />
          <input className="form-control" type="date" placeholder="Expiry Date" value={draft.expiry} onChange={e => setDraft({...draft, expiry: e.target.value})} />
          <button className="btn" onClick={handleAdd} style={{ gridColumn: '1/-1' }}>Save Medicine</button>
        </div>
      )}

      {inventory.length === 0 ? (
         <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
           <div style={{ fontSize: 36, marginBottom: 8 }}>🏥</div>
           Inventory is empty. Add your first medicine!
         </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Stock</th>
                <th style={{ padding: '12px 16px' }}>Unit</th>
                <th style={{ padding: '12px 16px' }}>Cost</th>
                <th style={{ padding: '12px 16px' }}>Expiry</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(med => (
                <tr key={med.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-main)', fontWeight: 500 }}>{med.name}</td>
                  <td style={{ padding: '12px 16px', color: med.stock < 10 ? 'var(--danger)' : 'var(--text-main)', fontWeight: med.stock < 10 ? 700 : 400 }}>
                    {med.stock} {med.stock < 10 && '⚠️'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{med.unit}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>₹{med.cost}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{med.expiry || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button className="btn outline" style={{ padding: '2px 8px' }} onClick={() => adjustStock(med.id, -1)}>-</button>
                      <button className="btn outline" style={{ padding: '2px 8px' }} onClick={() => adjustStock(med.id, 1)}>+</button>
                      <button className="btn danger" style={{ padding: '2px 8px', marginLeft: 8 }} onClick={() => deleteMed(med.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
