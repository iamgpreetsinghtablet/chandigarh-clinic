import { useState, useEffect, useMemo } from 'react';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';
import { Dashboard } from './components/Dashboard';
import { ExportTools } from './components/ExportTools';
import { PatientDetail } from './components/PatientDetail';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { ThemeToggle } from './components/ThemeToggle';
import { SortFilter } from './components/SortFilter';
import type { Patient, Appointment } from './types';

export type ViewMode = 'grid' | 'list' | 'compact';
type ActiveTab = 'dashboard' | 'patients' | 'appointments';

function App() {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('patients');
    return saved ? JSON.parse(saved) : [];
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('appointments');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDark, setIsDark] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Sort & Filter state
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterGender, setFilterGender] = useState('All');
  const [filterBloodGroup, setFilterBloodGroup] = useState('All');

  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    document.body.className = isDark ? '' : 'light';
  }, [isDark]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'patientId' | 'createdAt'>) => {
    const uniqueId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPatient: Patient = {
      ...patientData,
      id: crypto.randomUUID(),
      patientId: uniqueId,
      createdAt: Date.now()
    };
    setPatients(prev => [newPatient, ...prev]);
    setIsModalOpen(false);
    showToast(`Patient ${uniqueId} added successfully!`);
  };

  const handleUpdatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedPatient(updated);
    showToast('Patient record updated.');
  };

  const handleDeletePatient = (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      setPatients(prev => prev.filter(p => p.id !== id));
      showToast('Patient record deleted.');
    }
  };

  const handleAddAppointment = (apt: Appointment) => {
    setAppointments(prev => [apt, ...prev]);
    showToast('Appointment scheduled!');
  };

  const handleUpdateAppointment = (apt: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === apt.id ? apt : a));
    showToast(`Appointment marked as ${apt.status}.`);
  };

  const filteredPatients = useMemo(() => {
    let result = patients.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contact.includes(searchQuery) ||
      (p.patientId && p.patientId.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (filterGender !== 'All') {
      result = result.filter(p => p.gender === filterGender);
    }
    if (filterBloodGroup !== 'All') {
      result = result.filter(p => p.bloodGroup === filterBloodGroup);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'age': cmp = (Number(a.age) || 0) - (Number(b.age) || 0); break;
        case 'date': cmp = a.createdAt - b.createdAt; break;
        case 'patientId': cmp = (a.patientId || '').localeCompare(b.patientId || ''); break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [patients, searchQuery, filterGender, filterBloodGroup, sortBy, sortDir]);

  return (
    <div className="app-container">
      <header>
        <div className="header-left">
          <h1>Chandigarh Clinic Patients</h1>
          <p>Advanced Patient Management System</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ExportTools patients={patients} selectedPatient={selectedPatient} />
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav-tabs">
        <button className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </button>
        <button className={`nav-tab ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Patients
        </button>
        <button className={`nav-tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Appointments
        </button>
      </nav>

      <main>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <Dashboard patients={patients} appointments={appointments} />
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <>
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search by ID, name or contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn" onClick={() => setIsModalOpen(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Patient
              </button>
            </div>

            <SortFilter
              sortBy={sortBy}
              sortDir={sortDir}
              filterGender={filterGender}
              filterBloodGroup={filterBloodGroup}
              onSortChange={setSortBy}
              onSortDirToggle={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              onFilterGender={setFilterGender}
              onFilterBloodGroup={setFilterBloodGroup}
              onClearFilters={() => { setFilterGender('All'); setFilterBloodGroup('All'); setSortBy('name'); setSortDir('asc'); }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Patient Directory</h2>
                <span style={{ background: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500 }}>
                  {filteredPatients.length} Total
                </span>
              </div>

              <div className="view-controls">
                <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </button>
                <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List View">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
                <button className={`view-btn ${viewMode === 'compact' ? 'active' : ''}`} onClick={() => setViewMode('compact')} title="Compact View">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg>
                </button>
              </div>
            </div>

            <PatientList patients={filteredPatients} onDelete={handleDeletePatient} viewMode={viewMode} onSelect={setSelectedPatient} />
          </>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <AppointmentScheduler
            appointments={appointments}
            patients={patients}
            onAdd={handleAddAppointment}
            onUpdate={handleUpdateAppointment}
          />
        )}
      </main>

      {/* Add Patient Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ margin: 0 }}>Add New Patient</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <PatientForm onSave={handleAddPatient} />
            </div>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetail
          patient={selectedPatient}
          onUpdate={handleUpdatePatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
