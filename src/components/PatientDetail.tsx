import React, { useState, useCallback, useMemo } from 'react';
import type { Patient, Visit, Vital, Note } from '../types';

interface PatientDetailProps {
  patient: Patient;
  onUpdate: (patient: Patient) => void;
  onClose: () => void;
}

type TabKey = 'visits' | 'vitals' | 'notes' | 'attachments';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'visits', label: 'Visits' },
  { key: 'vitals', label: 'Vitals' },
  { key: 'notes', label: 'Notes' },
  { key: 'attachments', label: 'Attachments' },
];

const today = () => new Date().toISOString().slice(0, 10);

const UserPlaceholder = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="var(--bg-card)" />
    <circle cx="40" cy="30" r="14" fill="var(--text-muted)" />
    <ellipse cx="40" cy="62" rx="22" ry="16" fill="var(--text-muted)" />
  </svg>
);

/* ── Trend Arrow ── */
const TrendArrow: React.FC<{ current?: number; previous?: number }> = ({ current, previous }) => {
  if (current == null || previous == null) return null;
  if (current > previous) return <span style={{ color: 'var(--danger)', fontSize: 14 }}>▲</span>;
  if (current < previous) return <span style={{ color: 'var(--success)', fontSize: 14 }}>▼</span>;
  return <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>━</span>;
};

/* ── Print Prescription ── */
function printPrescription(visit: Visit, patient: Patient) {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`
    <html><head><title>Prescription – ${patient.name}</title>
    <style>body{font-family:system-ui,sans-serif;padding:40px;color:#1a1a2e}
    h1{font-size:20px;margin-bottom:4px}h2{font-size:15px;color:#555;margin-bottom:24px}
    .field{margin-bottom:12px}.label{font-weight:600;display:inline-block;width:120px}
    hr{border:none;border-top:1px solid #ddd;margin:20px 0}
    .rx{white-space:pre-wrap;background:#f8f8fc;padding:16px;border-radius:8px;border:1px solid #e0e0e8}
    </style></head><body>
    <h1>Prescription</h1>
    <h2>Patient: ${patient.name} (${patient.patientId})</h2>
    <div class="field"><span class="label">Date:</span> ${visit.date}</div>
    <div class="field"><span class="label">Doctor:</span> ${visit.doctor || '—'}</div>
    <div class="field"><span class="label">Diagnosis:</span> ${visit.diagnosis || '—'}</div>
    <div class="field"><span class="label">Symptoms:</span> ${visit.symptoms || '—'}</div>
    <hr/>
    <div class="field"><span class="label">Prescription:</span></div>
    <div class="rx">${visit.prescription || '—'}</div>
    <hr/>
    <div class="field"><span class="label">Follow-up:</span> ${visit.followUp || '—'}</div>
    <div class="field"><span class="label">Notes:</span> ${visit.notes || '—'}</div>
    <script>window.onload=()=>window.print()</script>
    </body></html>
  `);
  w.document.close();
}

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */
const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('visits');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...patient });

  /* ── Visit form ── */
  const emptyVisit: Omit<Visit, 'id'> = { date: today(), diagnosis: '', symptoms: '', prescription: '', doctor: '', followUp: '', notes: '' };
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitDraft, setVisitDraft] = useState(emptyVisit);

  /* ── Vitals form ── */
  const emptyVital: Omit<Vital, 'id'> = { date: today(), bp: '', temperature: undefined as unknown as number, weight: undefined as unknown as number, heartRate: undefined as unknown as number, spo2: undefined as unknown as number, notes: '' };
  const [showVitalForm, setShowVitalForm] = useState(false);
  const [vitalDraft, setVitalDraft] = useState(emptyVital);

  /* ── Notes form ── */
  const [noteContent, setNoteContent] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('');

  /* ── Expanded visits ── */
  const [expandedVisits, setExpandedVisits] = useState<Set<string>>(new Set());

  /* ── helpers ── */
  const whatsAppUrl = useMemo(() => {
    const digits = (patient.contact || '').replace(/\D/g, '');
    return `https://wa.me/${digits}`;
  }, [patient.contact]);

  const toggleVisit = useCallback((id: string) => {
    setExpandedVisits(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  /* ── Save edit ── */
  const saveEdit = () => {
    onUpdate({ ...patient, name: draft.name, age: draft.age, gender: draft.gender, bloodGroup: draft.bloodGroup, contact: draft.contact, emergencyContact: draft.emergencyContact, allergies: draft.allergies });
    setEditing(false);
  };

  /* ── Add visit ── */
  const addVisit = () => {
    const visit: Visit = { ...visitDraft, id: crypto.randomUUID() } as Visit;
    onUpdate({ ...patient, visits: [visit, ...patient.visits] });
    setVisitDraft(emptyVisit);
    setShowVisitForm(false);
  };

  /* ── Add vital ── */
  const addVital = () => {
    const vital: Vital = { ...vitalDraft, id: crypto.randomUUID() } as Vital;
    onUpdate({ ...patient, vitals: [vital, ...patient.vitals] });
    setVitalDraft(emptyVital);
    setShowVitalForm(false);
  };

  /* ── Add note ── */
  const addNote = () => {
    if (!noteContent.trim()) return;
    const note: Note = { id: crypto.randomUUID(), date: new Date().toISOString(), content: noteContent, author: noteAuthor || 'Staff' };
    onUpdate({ ...patient, notes: [note, ...patient.notes] });
    setNoteContent('');
    setNoteAuthor('');
  };

  /* ── sorted vitals for trend ── */
  const sortedVitals = useMemo(() => [...(patient.vitals || [])].sort((a, b) => b.date.localeCompare(a.date)), [patient.vitals]);
  const latestVital = sortedVitals[0];
  const prevVital = sortedVitals[1];

  /* ═══════ RENDER ═══════ */
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 900 }} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flex: 1 }}>
            {/* Photo */}
            <div style={{ flexShrink: 0, borderRadius: '50%', overflow: 'hidden', width: 80, height: 80, background: 'var(--bg-card)' }}>
              {patient.photoUrl
                ? <img src={patient.photoUrl} alt={patient.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <UserPlaceholder />}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              {!editing ? (
                <>
                  <h2 style={{ margin: 0, color: 'var(--text-main)' }}>{patient.name}</h2>
                  <span style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 12, marginTop: 4 }}>{patient.patientId}</span>
                  <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 14, display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                    <span>{patient.age}y, {patient.gender}</span>
                    <span>Blood: {patient.bloodGroup || '—'}</span>
                    <span>📞 {patient.contact || '—'}</span>
                    {patient.emergencyContact && <span>🚨 {patient.emergencyContact}</span>}
                    {patient.allergies && <span style={{ color: 'var(--danger)' }}>⚠ {patient.allergies}</span>}
                  </div>
                </>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input className="form-control" placeholder="Name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
                  <input className="form-control" placeholder="Age" type="number" value={draft.age} onChange={e => setDraft({ ...draft, age: +e.target.value })} />
                  <select className="form-control" value={draft.gender} onChange={e => setDraft({ ...draft, gender: e.target.value })}>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                  <input className="form-control" placeholder="Blood Group" value={draft.bloodGroup || ''} onChange={e => setDraft({ ...draft, bloodGroup: e.target.value })} />
                  <input className="form-control" placeholder="Contact" value={draft.contact || ''} onChange={e => setDraft({ ...draft, contact: e.target.value })} />
                  <input className="form-control" placeholder="Emergency Contact" value={draft.emergencyContact || ''} onChange={e => setDraft({ ...draft, emergencyContact: e.target.value })} />
                  <input className="form-control" placeholder="Allergies" value={draft.allergies || ''} onChange={e => setDraft({ ...draft, allergies: e.target.value })} style={{ gridColumn: '1/-1' }} />
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 12 }}>
            {editing ? (
              <>
                <button className="btn" onClick={saveEdit}>Save</button>
                <button className="btn outline" onClick={() => { setEditing(false); setDraft({ ...patient }); }}>Cancel</button>
              </>
            ) : (
              <button className="btn outline" onClick={() => setEditing(true)}>✎ Edit</button>
            )}
            <a href={whatsAppUrl} target="_blank" rel="noreferrer" className="btn" style={{ background: '#25d366', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.108 1.519 5.838L0 24l6.336-1.663A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.98 0-3.877-.56-5.516-1.614l-.396-.237-3.757.986 1.003-3.665-.26-.412A9.786 9.786 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z"/></svg>
              WhatsApp
            </a>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: 16 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activeTab === t.key ? 600 : 400,
              color: activeTab === t.key ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all .2s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>

          {/* ═══ VISITS ═══ */}
          {activeTab === 'visits' && (
            <div>
              <button className="btn" onClick={() => setShowVisitForm(v => !v)} style={{ marginBottom: 12 }}>
                {showVisitForm ? '✕ Cancel' : '+ Add Visit'}
              </button>

              {showVisitForm && (
                <div className="glass-card" style={{ padding: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input className="form-control" type="date" value={visitDraft.date} onChange={e => setVisitDraft({ ...visitDraft, date: e.target.value })} />
                  <input className="form-control" placeholder="Doctor" value={visitDraft.doctor} onChange={e => setVisitDraft({ ...visitDraft, doctor: e.target.value })} />
                  <input className="form-control" placeholder="Diagnosis" value={visitDraft.diagnosis} onChange={e => setVisitDraft({ ...visitDraft, diagnosis: e.target.value })} style={{ gridColumn: '1/-1' }} />
                  <input className="form-control" placeholder="Symptoms" value={visitDraft.symptoms} onChange={e => setVisitDraft({ ...visitDraft, symptoms: e.target.value })} style={{ gridColumn: '1/-1' }} />
                  <textarea className="form-control" placeholder="Prescription" rows={3} value={visitDraft.prescription} onChange={e => setVisitDraft({ ...visitDraft, prescription: e.target.value })} style={{ gridColumn: '1/-1' }} />
                  <input className="form-control" placeholder="Follow-up date" type="date" value={visitDraft.followUp} onChange={e => setVisitDraft({ ...visitDraft, followUp: e.target.value })} />
                  <input className="form-control" placeholder="Notes" value={visitDraft.notes} onChange={e => setVisitDraft({ ...visitDraft, notes: e.target.value })} />
                  <button className="btn" onClick={addVisit} style={{ gridColumn: '1/-1' }}>Save Visit</button>
                </div>
              )}

              {(!patient.visits || patient.visits.length === 0) && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No visits recorded.</p>}

              {(patient.visits || []).map(v => {
                const expanded = expandedVisits.has(v.id);
                return (
                  <div key={v.id} className="glass-card" style={{ padding: 14, marginBottom: 10, cursor: 'pointer' }}>
                    <div onClick={() => toggleVisit(v.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{v.date}</span>
                        <span style={{ margin: '0 10px', color: 'var(--text-muted)' }}>|</span>
                        <span style={{ color: 'var(--primary)' }}>{v.diagnosis || '—'}</span>
                        {v.doctor && <span style={{ marginLeft: 12, color: 'var(--text-muted)', fontSize: 13 }}>Dr. {v.doctor}</span>}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
                    </div>

                    {expanded && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--glass-border)', fontSize: 14, color: 'var(--text-muted)' }}>
                        {v.symptoms && <p><strong>Symptoms:</strong> {v.symptoms}</p>}
                        {v.prescription && <div style={{ background: 'var(--bg-dark)', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap', margin: '8px 0' }}><strong>Prescription:</strong><br />{v.prescription}</div>}
                        {v.followUp && <p><strong>Follow-up:</strong> {v.followUp}</p>}
                        {v.notes && <p><strong>Notes:</strong> {v.notes}</p>}
                        <button className="btn outline" style={{ marginTop: 8, fontSize: 13 }} onClick={e => { e.stopPropagation(); printPrescription(v, patient); }}>🖨 Print Prescription</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ VITALS ═══ */}
          {activeTab === 'vitals' && (
            <div>
              <button className="btn" onClick={() => setShowVitalForm(v => !v)} style={{ marginBottom: 12 }}>
                {showVitalForm ? '✕ Cancel' : '+ Add Vitals'}
              </button>

              {showVitalForm && (
                <div className="glass-card" style={{ padding: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <input className="form-control" type="date" value={vitalDraft.date} onChange={e => setVitalDraft({ ...vitalDraft, date: e.target.value })} />
                  <input className="form-control" placeholder="BP (e.g. 120/80)" value={vitalDraft.bp} onChange={e => setVitalDraft({ ...vitalDraft, bp: e.target.value })} />
                  <input className="form-control" placeholder="Temp °F" type="number" step="0.1" value={vitalDraft.temperature || ''} onChange={e => setVitalDraft({ ...vitalDraft, temperature: +e.target.value })} />
                  <input className="form-control" placeholder="Weight kg" type="number" step="0.1" value={vitalDraft.weight || ''} onChange={e => setVitalDraft({ ...vitalDraft, weight: +e.target.value })} />
                  <input className="form-control" placeholder="Heart Rate" type="number" value={vitalDraft.heartRate || ''} onChange={e => setVitalDraft({ ...vitalDraft, heartRate: +e.target.value })} />
                  <input className="form-control" placeholder="SpO2 %" type="number" value={vitalDraft.spo2 || ''} onChange={e => setVitalDraft({ ...vitalDraft, spo2: +e.target.value })} />
                  <input className="form-control" placeholder="Notes" value={vitalDraft.notes} onChange={e => setVitalDraft({ ...vitalDraft, notes: e.target.value })} style={{ gridColumn: '1/-1' }} />
                  <button className="btn" onClick={addVital} style={{ gridColumn: '1/-1' }}>Save Vitals</button>
                </div>
              )}

              {(!patient.vitals || patient.vitals.length === 0)
                ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No vitals recorded.</p>
                : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                          <th style={{ padding: '8px 10px' }}>Date</th>
                          <th style={{ padding: '8px 10px' }}>BP</th>
                          <th style={{ padding: '8px 10px' }}>Temp</th>
                          <th style={{ padding: '8px 10px' }}>Weight</th>
                          <th style={{ padding: '8px 10px' }}>HR</th>
                          <th style={{ padding: '8px 10px' }}>SpO2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedVitals.map((v, i) => (
                          <tr key={v.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <td style={{ padding: '8px 10px', color: 'var(--text-main)' }}>{v.date}</td>
                            <td style={{ padding: '8px 10px' }}>{v.bp || '—'}</td>
                            <td style={{ padding: '8px 10px' }}>
                              {v.temperature ?? '—'}
                              {i === 0 && <> <TrendArrow current={latestVital?.temperature} previous={prevVital?.temperature} /></>}
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              {v.weight ?? '—'}
                              {i === 0 && <> <TrendArrow current={latestVital?.weight} previous={prevVital?.weight} /></>}
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              {v.heartRate ?? '—'}
                              {i === 0 && <> <TrendArrow current={latestVital?.heartRate} previous={prevVital?.heartRate} /></>}
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              {v.spo2 ?? '—'}
                              {i === 0 && <> <TrendArrow current={latestVital?.spo2} previous={prevVital?.spo2} /></>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

          {/* ═══ NOTES ═══ */}
          {activeTab === 'notes' && (
            <div>
              {/* Add note form */}
              <div className="glass-card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input className="form-control" placeholder="Author" value={noteAuthor} onChange={e => setNoteAuthor(e.target.value)} style={{ width: 140 }} />
                <input className="form-control" placeholder="Write a note…" value={noteContent} onChange={e => setNoteContent(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
                <button className="btn" onClick={addNote}>Add</button>
              </div>

              {/* Timeline */}
              {(!patient.notes || patient.notes.length === 0)
                ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No notes yet.</p>
                : (
                  <div style={{ position: 'relative', paddingLeft: 28 }}>
                    {/* Vertical line */}
                    <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, background: 'var(--glass-border)' }} />

                    {(patient.notes || []).map(n => (
                      <div key={n.id} style={{ position: 'relative', marginBottom: 20, paddingBottom: 4 }}>
                        {/* Dot */}
                        <div style={{ position: 'absolute', left: -22, top: 6, width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--bg-dark)' }} />

                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                          {new Date(n.date).toLocaleString()}
                          <span style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '1px 8px', fontSize: 11, marginLeft: 8 }}>{n.author}</span>
                        </div>
                        <div style={{ color: 'var(--text-main)', fontSize: 14, lineHeight: 1.5 }}>{n.content}</div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* ═══ ATTACHMENTS ═══ */}
          {activeTab === 'attachments' && (
            <div>
              {(!patient.attachments || patient.attachments.length === 0)
                ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No attachments.</p>
                : (patient.attachments || []).map(a => (
                  <div key={a.id} className="glass-card" style={{ padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>📎</span>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{a.name}</div>
                        {a.tag && <span style={{ display: 'inline-block', background: 'var(--bg-dark)', borderRadius: 10, padding: '1px 8px', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.tag}</span>}
                      </div>
                    </div>
                    <a href={a.url} download className="btn outline" style={{ fontSize: 13 }}>⬇ Download</a>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { PatientDetail };
