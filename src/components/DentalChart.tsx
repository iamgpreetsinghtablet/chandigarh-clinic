import React, { useState } from 'react';

interface DentalChartProps {
  notes: Record<number, string>;
  onChange: (notes: Record<number, string>) => void;
}

export const DentalChart: React.FC<DentalChartProps> = ({ notes, onChange }) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [currentNote, setCurrentNote] = useState('');

  const handleSelect = (num: number) => {
    setSelectedTooth(num);
    setCurrentNote(notes[num] || '');
  };

  const saveNote = () => {
    if (selectedTooth === null) return;
    const updated = { ...notes };
    if (!currentNote.trim()) {
      delete updated[selectedTooth];
    } else {
      updated[selectedTooth] = currentNote;
    }
    onChange(updated);
    setSelectedTooth(null);
  };

  // Top teeth: 1-16, Bottom teeth: 17-32
  const topTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const bottomTeeth = Array.from({ length: 16 }, (_, i) => i + 17);

  const renderTeethRow = (teeth: number[]) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
      {teeth.map(t => {
        const hasNote = !!notes[t];
        const isSelected = selectedTooth === t;
        return (
          <div
            key={t}
            onClick={() => handleSelect(t)}
            style={{
              width: 36, height: 44, 
              borderRadius: '8px 8px 16px 16px',
              border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--glass-border)'}`,
              background: hasNote ? 'var(--primary)' : 'var(--bg-dark)',
              color: hasNote ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              transition: 'all .2s'
            }}
          >
            {t}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)' }}>🦷 Dental Charting</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24, padding: 20, background: 'var(--bg-card)', borderRadius: 12 }}>
        {renderTeethRow(topTeeth)}
        <div style={{ height: 1, background: 'var(--glass-border)', margin: '4px 0' }} />
        {renderTeethRow(bottomTeeth)}
      </div>

      {selectedTooth !== null ? (
        <div style={{ background: 'var(--bg-dark)', padding: 16, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong style={{ color: 'var(--text-main)' }}>Notes for Tooth #{selectedTooth}</strong>
            <button className="close-btn" onClick={() => setSelectedTooth(null)}>✕</button>
          </div>
          <textarea 
            className="form-control" 
            rows={3} 
            value={currentNote} 
            onChange={e => setCurrentNote(e.target.value)} 
            placeholder="E.g., Cavity, Extraction, Filling required..."
          />
          <button className="btn" style={{ marginTop: 10 }} onClick={saveNote}>Save Note</button>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
          Click on any tooth to add or view specific notes.
        </p>
      )}
    </div>
  );
};
