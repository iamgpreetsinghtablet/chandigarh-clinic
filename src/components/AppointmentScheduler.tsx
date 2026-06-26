import React, { useState, useMemo } from 'react';
import type { Appointment, Patient } from '../types';

interface AppointmentSchedulerProps {
  appointments: Appointment[];
  patients: Patient[];
  onAdd: (apt: Appointment) => void;
  onUpdate: (apt: Appointment) => void;
}

type FilterKey = 'all' | 'today' | 'upcoming' | 'completed' | 'cancelled';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<Appointment['status'], string> = {
  Scheduled: 'var(--primary)',
  Completed: 'var(--success)',
  Cancelled: 'var(--danger)',
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ appointments, patients, onAdd, onUpdate }) => {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ patientId: '', date: todayStr(), time: '09:00', reason: '' });

  /* ── Filter logic ── */
  const filtered = useMemo(() => {
    const now = todayStr();
    let list = [...appointments];

    switch (filter) {
      case 'today':
        list = list.filter(a => a.date === now);
        break;
      case 'upcoming':
        list = list.filter(a => a.date >= now && a.status === 'Scheduled');
        break;
      case 'completed':
        list = list.filter(a => a.status === 'Completed');
        break;
      case 'cancelled':
        list = list.filter(a => a.status === 'Cancelled');
        break;
    }

    return list.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }, [appointments, filter]);

  /* ── Group by date ── */
  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of filtered) {
      const arr = map.get(a.date);
      arr ? arr.push(a) : map.set(a.date, [a]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  /* ── Add appointment ── */
  const handleAdd = () => {
    const selected = patients.find(p => p.id === draft.patientId);
    if (!selected || !draft.date || !draft.time) return;

    const apt: Appointment = {
      id: crypto.randomUUID(),
      patientId: selected.id,
      patientName: selected.name,
      date: draft.date,
      time: draft.time,
      reason: draft.reason,
      status: 'Scheduled',
      createdAt: Date.now(),
    };
    onAdd(apt);
    setDraft({ patientId: '', date: todayStr(), time: '09:00', reason: '' });
    setShowForm(false);
  };

  /* ── Status change ── */
  const setStatus = (apt: Appointment, status: Appointment['status']) => {
    onUpdate({ ...apt, status });
  };

  return (
    <div>
      {/* ── Header Row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: 22 }}>📅 Appointments</h2>
        <button className="btn" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Schedule Appointment'}
        </button>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <select className="form-control" value={draft.patientId} onChange={e => setDraft({ ...draft, patientId: e.target.value })}>
            <option value="">Select Patient…</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>)}
          </select>
          <input className="form-control" type="date" value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })} />
          <input className="form-control" type="time" value={draft.time} onChange={e => setDraft({ ...draft, time: e.target.value })} />
          <input className="form-control" placeholder="Reason" value={draft.reason} onChange={e => setDraft({ ...draft, reason: e.target.value })} />
          <button className="btn" onClick={handleAdd} style={{ gridColumn: '1/-1' }}>Schedule</button>
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`btn ${filter === f.key ? '' : 'outline'}`}
            style={{ fontSize: 13, padding: '6px 14px' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Cards ── */}
      {grouped.length === 0 && (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
          No appointments {filter !== 'all' ? `in "${filter}" filter` : 'found'}.
        </div>
      )}

      {grouped.map(([date, apts]) => (
        <div key={date} style={{ marginBottom: 20 }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            {new Date(date + 'T00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
          </h4>

          {apts.map(a => (
            <div key={a.id} className="glass-card" style={{ padding: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>{a.patientName}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  🕐 {a.time}{a.reason ? ` · ${a.reason}` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Status badge */}
                <span style={{
                  display: 'inline-block',
                  padding: '3px 12px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#fff',
                  background: STATUS_COLORS[a.status],
                }}>
                  {a.status}
                </span>

                {a.status === 'Scheduled' && (
                  <>
                    <button className="btn" style={{ fontSize: 12, padding: '4px 10px', background: 'var(--success)', border: 'none' }} onClick={() => setStatus(a, 'Completed')}>
                      ✓ Complete
                    </button>
                    <button className="btn danger" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setStatus(a, 'Cancelled')}>
                      ✕ Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export { AppointmentScheduler };
