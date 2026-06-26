import React, { useState, useRef } from 'react';
import type { Patient, Attachment } from '../types';
import { CameraCapture } from './CameraCapture';

interface PatientFormProps {
  onSave: (patient: Omit<Patient, 'id' | 'patientId' | 'createdAt'>) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '' as number | '',
    gender: 'Male',
    bloodGroup: '',
    contact: '',
    emergencyContact: '',
    building: '',
    locality: '',
    landmark: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    allergies: '',
    medicalHistory: ''
  });
  
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [currentTag, setCurrentTag] = useState('Prescription');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check size limit (e.g. 1MB for local storage safety)
    if (file.size > 1024 * 1024) {
      alert("File is too large! Please select a file under 1MB for this local demo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newAttachment: Attachment = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          data: event.target.result as string,
          tag: currentTag
        };
        setAttachments(prev => [...prev, newAttachment]);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    onSave({
      ...formData,
      photoUrl,
      attachments,
      visits: [],
      vitals: [],
      notes: []
    });

    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      bloodGroup: '',
      contact: '',
      emergencyContact: '',
      building: '',
      locality: '',
      landmark: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India',
      allergies: '',
      medicalHistory: ''
    });
    setPhotoUrl(null);
    setAttachments([]);
  };

  return (
    <div>
      {showCamera ? (
        <CameraCapture 
          onCapture={(src) => {
            setPhotoUrl(src);
            setShowCamera(false);
          }} 
          onCancel={() => setShowCamera(false)} 
        />
      ) : (
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {photoUrl ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={photoUrl} alt="Patient" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', border: '4px solid var(--primary)' }} />
              <button 
                type="button"
                onClick={() => setPhotoUrl(null)}
                style={{ position: 'absolute', top: 0, right: 0, background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
          ) : (
            <button type="button" className="btn outline" onClick={() => setShowCamera(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l2 3h6l2-3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Take Patient Photo
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            className="form-control"
            required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Rahul Sharma"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Age</label>
            <input 
              type="number" 
              className="form-control"
              required 
              min="0"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || ''})}
              placeholder="30"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Gender</label>
            <select 
              className="form-control"
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Blood Group</label>
            <select 
              className="form-control"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
            >
              <option value="">Select...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.4)' }}>
          <h4 style={{ marginBottom: '1rem', marginTop: 0 }}>Address Details (India)</h4>
          
          <div className="form-group">
            <label>Flat No. / Building Name</label>
            <input 
              type="text" 
              className="form-control"
              value={formData.building}
              onChange={(e) => setFormData({...formData, building: e.target.value})}
              placeholder="Flat 101, Sunshine Apartments"
            />
          </div>

          <div className="form-group">
            <label>Street / Area / Locality</label>
            <input 
              type="text" 
              className="form-control"
              value={formData.locality}
              onChange={(e) => setFormData({...formData, locality: e.target.value})}
              placeholder="MG Road, Indiranagar"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>City / Town</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Bengaluru"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>State</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                placeholder="Karnataka"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>PIN Code</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.pinCode}
                onChange={(e) => setFormData({...formData, pinCode: e.target.value})}
                placeholder="560038"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Medical History & Notes</label>
          <textarea 
            className="form-control"
            rows={4}
            value={formData.medicalHistory}
            onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
            placeholder="Previous conditions, current medications, specific symptoms..."
          ></textarea>
        </div>

        <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.4)' }}>
          <h4 style={{ marginBottom: '1rem', marginTop: 0 }}>Medical Attachments (Notes, PDFs, Images)</h4>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <select 
                className="form-control"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
              >
                <option value="Prescription">Prescription</option>
                <option value="Lab Report">Lab Report</option>
                <option value="X-Ray / Scan">X-Ray / Scan</option>
                <option value="Doctor's Note">Doctor's Note</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ flex: 2 }}>
              <input 
                type="file" 
                className="form-control"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </div>
          </div>

          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {attachments.map(att => (
                <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {att.tag}
                    </span>
                    <span style={{ fontSize: '0.875rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                      {att.name}
                    </span>
                  </div>
                  <button type="button" onClick={() => removeAttachment(att.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn" style={{ width: '100%' }}>
          Save Patient Record
        </button>
      </form>
    </div>
  );
};
