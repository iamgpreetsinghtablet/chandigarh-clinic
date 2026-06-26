import type { Patient } from '../types';

interface ExportToolsProps {
  patients: Patient[];
  selectedPatient?: Patient | null;
}

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.65rem 1.25rem',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.75rem',
  background: 'rgba(30, 41, 59, 0.7)',
  backdropFilter: 'blur(12px)',
  color: '#f8fafc',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'Inter, sans-serif',
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  csvBtn: {
    ...btnBase,
    borderColor: 'rgba(34,197,94,0.3)',
    background: 'rgba(34,197,94,0.1)',
  },
  printBtn: {
    ...btnBase,
    borderColor: 'rgba(129,140,248,0.3)',
    background: 'rgba(129,140,248,0.1)',
  },
  pdfBtn: {
    ...btnBase,
    borderColor: 'rgba(244,114,182,0.3)',
    background: 'rgba(244,114,182,0.1)',
  },
};

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function exportCsv(patients: Patient[]) {
  const headers = [
    'Name', 'Patient ID', 'Age', 'Gender', 'Blood Group',
    'Contact', 'City', 'State', 'Pin Code',
  ];

  const rows = patients.map((p) => [
    escapeCsv(p.name),
    escapeCsv(p.patientId),
    String(p.age),
    escapeCsv(p.gender),
    escapeCsv(p.bloodGroup),
    escapeCsv(p.contact),
    escapeCsv(p.city),
    escapeCsv(p.state),
    escapeCsv(p.pinCode),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `patients_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function printPatientCard(patient: Patient) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(patient.patientId)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Patient Card – ${patient.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { display: flex; justify-content: center; align-items: flex-start; padding: 2rem; background: #f1f5f9; }
    .card {
      width: 420px; background: #fff; border-radius: 1rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1); overflow: hidden;
    }
    .card-header {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; padding: 1.5rem; text-align: center;
    }
    .card-header img.photo {
      width: 80px; height: 80px; border-radius: 50%;
      object-fit: cover; border: 3px solid rgba(255,255,255,0.4);
      margin-bottom: 0.75rem;
    }
    .card-header h1 { font-size: 1.3rem; font-weight: 700; }
    .card-header .pid {
      font-size: 0.85rem; opacity: 0.85; margin-top: 0.25rem;
    }
    .card-body { padding: 1.5rem; }
    .field { margin-bottom: 0.75rem; }
    .field-label {
      font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
      color: #64748b; font-weight: 600;
    }
    .field-value { font-size: 0.95rem; color: #1e293b; margin-top: 0.15rem; }
    .blood-badge {
      display: inline-block; background: #fee2e2; color: #dc2626;
      font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 0.5rem;
      font-size: 1rem;
    }
    .qr-section { text-align: center; padding: 1rem 0 1.5rem; }
    .qr-section img { border-radius: 0.5rem; }
    @media print {
      body { padding: 0; background: #fff; }
      .card { box-shadow: none; border: 1px solid #e2e8f0; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header">
      ${patient.photoUrl ? `<img class="photo" src="${patient.photoUrl}" alt="Photo" />` : ''}
      <h1>${patient.name}</h1>
      <div class="pid">${patient.patientId}</div>
    </div>
    <div class="card-body">
      <div class="field">
        <div class="field-label">Blood Group</div>
        <div class="field-value"><span class="blood-badge">${patient.bloodGroup || '—'}</span></div>
      </div>
      <div class="field">
        <div class="field-label">Contact</div>
        <div class="field-value">${patient.contact || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Emergency Contact</div>
        <div class="field-value">${patient.emergencyContact || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Allergies</div>
        <div class="field-value">${patient.allergies || 'None'}</div>
      </div>
      <div class="qr-section">
        <img src="${qrUrl}" alt="QR Code" width="150" height="150" />
      </div>
    </div>
  </div>
  <script>window.onload = () => setTimeout(() => window.print(), 500);</script>
</body>
</html>`;

  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

export function ExportTools({ patients, selectedPatient }: ExportToolsProps) {
  return (
    <div style={styles.wrapper}>
      <button
        style={styles.csvBtn}
        onClick={() => exportCsv(patients)}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(34,197,94,0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        disabled={patients.length === 0}
        title="Download all patients as CSV"
      >
        📥 Export to CSV
      </button>

      <button
        style={{
          ...styles.printBtn,
          ...(selectedPatient ? {} : { opacity: 0.4, cursor: 'not-allowed' }),
        }}
        onClick={() => selectedPatient && printPatientCard(selectedPatient)}
        onMouseEnter={(e) => { if (selectedPatient) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(129,140,248,0.2)'; } }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        disabled={!selectedPatient}
        title={selectedPatient ? `Print card for ${selectedPatient.name}` : 'Select a patient first'}
      >
        🪪 Print Patient Card
      </button>

      <button
        style={styles.pdfBtn}
        onClick={() => window.print()}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(244,114,182,0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        title="Print current page as PDF"
      >
        📄 Export All to PDF
      </button>
    </div>
  );
}
