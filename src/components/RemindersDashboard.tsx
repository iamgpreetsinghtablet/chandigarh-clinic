import React, { useMemo } from 'react';
import type { Appointment, Patient } from '../types';

interface RemindersProps {
  appointments: Appointment[];
  patients: Patient[];
}

export const RemindersDashboard: React.FC<RemindersProps> = ({ appointments, patients }) => {
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const upcoming = useMemo(() => {
    return appointments.filter(a => a.date === tomorrow && a.status === 'Scheduled');
  }, [appointments, tomorrow]);

  const getWhatsAppLink = (apt: Appointment) => {
    const patient = patients.find(p => p.id === apt.patientId);
    if (!patient || !patient.contact) return null;
    const digits = patient.contact.replace(/\D/g, '');
    const message = `Hello ${patient.name},\n\nThis is a friendly reminder from Chandigarh Clinic for your appointment tomorrow (${apt.date}) at ${apt.time}.\nReason: ${apt.reason || 'Consultation'}.\n\nPlease reply to this message to confirm.\nThank you!`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div>
      <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: 22, marginBottom: 16 }}>🔔 Automated Reminders</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Send 1-click WhatsApp reminders for all appointments scheduled for tomorrow ({tomorrow}).</p>

      {upcoming.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
          No appointments scheduled for tomorrow!
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {upcoming.map(apt => {
            const patient = patients.find(p => p.id === apt.patientId);
            const link = getWhatsAppLink(apt);
            return (
              <div key={apt.id} className="glass-card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{apt.patientName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    🕐 {apt.time} • {apt.reason || 'Consultation'}
                  </div>
                  {(!patient || !patient.contact) && (
                    <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>No contact number on file.</div>
                  )}
                </div>

                {link ? (
                  <a href={link} target="_blank" rel="noreferrer" className="btn" style={{ background: '#25d366', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.108 1.519 5.838L0 24l6.336-1.663A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.98 0-3.877-.56-5.516-1.614l-.396-.237-3.757.986 1.003-3.665-.26-.412A9.786 9.786 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z"/></svg>
                    Send Reminder
                  </a>
                ) : (
                  <button className="btn outline" disabled style={{ opacity: 0.5 }}>Cannot Send</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
