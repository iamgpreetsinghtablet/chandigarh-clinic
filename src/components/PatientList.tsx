import React from 'react';
import type { Patient } from '../types';
import type { ViewMode } from '../App';

interface PatientListProps {
  patients: Patient[];
  onDelete: (id: string) => void;
  viewMode: ViewMode;
  onSelect?: (patient: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ patients, onDelete, viewMode, onSelect }) => {
  if (patients.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No patients found. Add a patient to get started.</p>
      </div>
    );
  }

  const containerClass = 
    viewMode === 'list' ? 'patients-list' : 
    viewMode === 'compact' ? 'patients-compact' : 
    'patients-grid';

  return (
    <div className={containerClass}>
      {patients.map(patient => {
        const addressParts = [
          patient.building,
          patient.locality,
          patient.landmark ? `Near ${patient.landmark}` : '',
          patient.city,
          patient.state ? `${patient.state} - ${patient.pinCode}`.trim() : patient.pinCode,
          patient.country
        ].filter(Boolean);
        const fullAddress = addressParts.join(', ');

        return (
          <div key={patient.id} className="glass-card clickable" onClick={() => onSelect?.(patient)}>
            {patient.photoUrl ? (
              <img src={patient.photoUrl} alt={patient.name} className="patient-card-image" />
            ) : (
              <div className="patient-card-image">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            )}
            
            <div className="patient-content" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', width: '100%' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                    {patient.patientId || 'PT-LEGACY'}
                  </div>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {patient.name}
                    {patient.bloodGroup && (
                      <span className="hide-in-compact" style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        {patient.bloodGroup}
                      </span>
                    )}
                  </h3>
                  <p className="hide-in-compact" style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {patient.gender}, {patient.age} yrs
                  </p>
                </div>
                
                {viewMode !== 'list' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(patient.id); }}
                    className="btn outline danger hide-in-compact" 
                    style={{ padding: '0.25rem 0.5rem' }}
                    title="Delete Patient"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                )}
              </div>
              
              <div className="hide-in-compact">
                <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Contact:</span> {patient.contact || 'N/A'}
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Emergency:</span> {patient.emergencyContact || 'N/A'}
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Address:</span> {fullAddress || 'N/A'}
                  </div>
                </div>
                
                <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Medical History:</span>
                  <p style={{ margin: 0, background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                    {patient.medicalHistory || 'No history provided.'}
                  </p>
                </div>

                {patient.attachments && patient.attachments.length > 0 && (
                  <div style={{ fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Attachments:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {patient.attachments.map(att => (
                        <a 
                          key={att.id} 
                          href={att.data} 
                          download={att.name}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            background: 'rgba(255,255,255,0.05)', padding: '0.5rem', 
                            borderRadius: '6px', textDecoration: 'none', color: 'white',
                            border: '1px solid var(--glass-border)'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                          <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {att.tag}
                          </span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {att.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {viewMode === 'list' && (
              <div className="patient-actions" style={{ marginLeft: 'auto' }}>
                <button 
                  onClick={() => onDelete(patient.id)}
                  className="btn outline danger" 
                  style={{ padding: '0.5rem' }}
                  title="Delete Patient"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            )}
            
            {viewMode === 'compact' && (
              <button 
                onClick={() => onDelete(patient.id)}
                className="btn outline danger" 
                style={{ padding: '0.25rem', marginTop: '0.5rem', width: '100%' }}
                title="Delete Patient"
              >
                Delete
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
