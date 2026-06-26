import React, { useState } from 'react';
import type { Patient, Visit } from '../types';

interface HistoryProps {
  patients: Patient[];
  onUpdatePatient: (patient: Patient) => void;
}

export const MedicalHistory: React.FC<HistoryProps> = ({ patients, onUpdatePatient }) => {
  const [selectedId, setSelectedId] = useState('');
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);

  const patient = patients.find(p => p.id === selectedId);

  const handleSaveEdit = () => {
    if (!patient || !editingVisit) return;
    
    // Update the visit in the patient's record
    const updatedVisits = patient.visits.map(v => 
      v.id === editingVisit.id ? editingVisit : v
    );
    
    onUpdatePatient({ ...patient, visits: updatedVisits });
    setEditingVisit(null);
  };

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-main)' }}>📂 Patient Medical History</h2>
      
      <div style={{ marginBottom: 24, maxWidth: 400 }}>
        <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-muted)' }}>Search & Select Patient</label>
        <select className="form-control" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">-- Select Patient --</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>
          ))}
        </select>
      </div>

      {patient && (
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            {patient.photoUrl ? (
              <img src={patient.photoUrl} alt={patient.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
            )}
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{patient.name}</h3>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>ID: {patient.patientId} • Age: {patient.age} • Blood: {patient.bloodGroup || 'N/A'}</div>
            </div>
          </div>

          {!patient.visits || patient.visits.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', background: 'var(--bg-dark)', borderRadius: 12, color: 'var(--text-muted)' }}>
              No visit history found for this patient.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {patient.visits.map(visit => (
                <div key={visit.id} style={{ background: 'var(--bg-dark)', borderRadius: 12, padding: 16, borderLeft: '4px solid var(--primary)' }}>
                  
                  {editingVisit?.id === visit.id ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <input className="form-control" type="date" value={editingVisit.date} onChange={e => setEditingVisit({...editingVisit, date: e.target.value})} />
                      <input className="form-control" placeholder="Diagnosis" value={editingVisit.diagnosis} onChange={e => setEditingVisit({...editingVisit, diagnosis: e.target.value})} />
                      <input className="form-control" placeholder="Symptoms" value={editingVisit.symptoms} onChange={e => setEditingVisit({...editingVisit, symptoms: e.target.value})} style={{ gridColumn: '1/-1' }} />
                      <textarea className="form-control" placeholder="Prescription" rows={3} value={editingVisit.prescription} onChange={e => setEditingVisit({...editingVisit, prescription: e.target.value})} style={{ gridColumn: '1/-1' }} />
                      
                      {visit.totalAmount !== undefined && (
                        <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, background: 'var(--bg-card)', padding: 10, borderRadius: 8 }}>
                           <input className="form-control" type="number" placeholder="Total" value={editingVisit.totalAmount} onChange={e => setEditingVisit({...editingVisit, totalAmount: +e.target.value})} />
                           <input className="form-control" type="number" placeholder="Received" value={editingVisit.receivedAmount} onChange={e => setEditingVisit({...editingVisit, receivedAmount: +e.target.value})} />
                        </div>
                      )}

                      <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="btn" onClick={handleSaveEdit}>Save Changes</button>
                        <button className="btn outline" onClick={() => setEditingVisit(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <strong style={{ fontSize: 16, color: 'var(--text-main)' }}>{visit.date}</strong>
                          <span style={{ margin: '0 10px', color: 'var(--glass-border)' }}>|</span>
                          <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{visit.diagnosis || 'Consultation'}</span>
                        </div>
                        <button className="btn outline" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => setEditingVisit(visit)}>✎ Edit Visit</button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, color: 'var(--text-muted)', fontSize: 14 }}>
                        {visit.symptoms && <div><strong style={{ color: 'var(--text-main)' }}>Symptoms:</strong><br/>{visit.symptoms}</div>}
                        {visit.prescription && <div><strong style={{ color: 'var(--text-main)' }}>Prescription:</strong><br/><span style={{ whiteSpace: 'pre-wrap' }}>{visit.prescription}</span></div>}
                        {visit.notes && <div><strong style={{ color: 'var(--text-main)' }}>Notes:</strong><br/>{visit.notes}</div>}
                      </div>

                      {visit.totalAmount !== undefined && (
                        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed var(--glass-border)', display: 'flex', gap: 16, fontSize: 13 }}>
                           <span><strong>Total:</strong> ₹{visit.totalAmount}</span>
                           <span style={{ color: 'var(--success)' }}><strong>Received:</strong> ₹{visit.receivedAmount}</span>
                           <span style={{ color: 'var(--danger)' }}><strong>Pending:</strong> ₹{visit.pendingAmount}</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
