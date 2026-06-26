import React, { useState } from 'react';
import type { Patient } from '../types';

interface DischargeProps {
  patients: Patient[];
  onDelete: (id: string) => void;
}

export const DischargeLAMA: React.FC<DischargeProps> = ({ patients, onDelete }) => {
  const [selectedId, setSelectedId] = useState('');
  const [lamaReason, setLamaReason] = useState('Patient and/or relatives wish to leave the clinic against the medical advice of the treating doctor.');
  const [adviceGiven, setAdviceGiven] = useState('Advised admission / evaluation at a higher medical center. Fully explained the medical risks of leaving.');

  const patient = patients.find(p => p.id === selectedId);

  const printLama = () => {
    if (!patient) return;
    const w = window.open('', '_blank');
    if (!w) return;
    
    let historyHtml = '';
    patient.visits?.forEach(v => {
      historyHtml += `
        <div style="margin-bottom: 10px;">
          <strong>Date:</strong> ${v.date}<br/>
          <strong>Complaint:</strong> ${v.diagnosis}<br/>
          <strong>Advice:</strong> ${v.prescription}
        </div><hr/>
      `;
    });

    w.document.write(`
      <html><head><title>LAMA Report - ${patient.name}</title>
      <style>body{font-family:sans-serif;padding:40px;color:#000}</style>
      </head><body>
      <h2 style="text-align:center;">CHANDIGARH CLINIC HEALTHCARE CENTER</h2>
      <h3 style="text-align:center;text-decoration:underline;">LEFT AGAINST MEDICAL ADVICE (LAMA) REPORT</h3>
      
      <p><strong>Patient ID:</strong> ${patient.patientId}</p>
      <p><strong>Patient Name:</strong> ${patient.name}</p>
      <p><strong>Age/Gender:</strong> ${patient.age} / ${patient.gender}</p>
      <p><strong>Contact:</strong> ${patient.contact}</p>
      
      <hr/>
      <h4>CLINICAL HISTORY</h4>
      ${historyHtml || '<p>No previous visits.</p>'}
      
      <h4>LAMA DETAILS</h4>
      <p><strong>Date of LAMA:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Reason for LAMA:</strong><br/>${lamaReason}</p>
      <p><strong>Final Medical Advice / Warnings Given:</strong><br/>${adviceGiven}</p>
      
      <hr/>
      <h4>DECLARATION</h4>
      <p>
        I, the undersigned, am taking the above-named patient away from 
        Chandigarh Clinic HealthCare Center against the advice of the doctor. 
        The risks and possible consequences of this action, including the 
        possibility of severe deterioration of health or death, have been 
        fully explained to me. I take full responsibility for this decision 
        and will not hold the clinic or the doctor responsible for any 
        adverse outcome.
      </p>
      <br/><br/>
      <p>Signature of Patient/Relative: ___________________________</p>
      <p>Name of Relative (if applicable): ________________________</p>
      <p>Date & Time: _______________________________________</p>
      
      <br/><br/>
      <p>Dr. Amit Dayal<br/>Chandigarh Clinic HealthCare Center</p>
      
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    w.document.close();
  };

  const handleDischarge = () => {
    if (!patient) return;
    if (confirm('Are you sure you want to permanently delete this patient record?')) {
      onDelete(patient.id);
      setSelectedId('');
    }
  };

  return (
    <div className="glass-card" style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-main)' }}>📄 Discharge / LAMA Summary</h2>
      
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-muted)' }}>Select Patient to Discharge</label>
        <select className="form-control" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">-- Select Patient --</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>
          ))}
        </select>
      </div>

      {patient && (
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-muted)' }}>Reason for LAMA</label>
            <textarea className="form-control" rows={3} value={lamaReason} onChange={e => setLamaReason(e.target.value)} />
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-muted)' }}>Final Advice / Warnings</label>
            <textarea className="form-control" rows={3} value={adviceGiven} onChange={e => setAdviceGiven(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn outline" onClick={printLama}>🖨️ Print LAMA Report</button>
            <button className="btn danger" onClick={handleDischarge}>🗑️ Permanently Delete Record</button>
          </div>
        </div>
      )}
    </div>
  );
};
