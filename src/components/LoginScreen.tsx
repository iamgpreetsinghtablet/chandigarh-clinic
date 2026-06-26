import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (role: 'Admin' | 'Staff') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded auth based on the provided python logic
    if (username === 'admin' && password === 'admin123') {
      onLogin('Admin');
    } else if (username === 'staff' && password === 'staff123') {
      onLogin('Staff');
    } else {
      setError('❌ Incorrect Username or Password.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: 32, textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 24px 0', fontSize: 28 }}>🏥 Clinic Login</h1>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: 16, background: 'rgba(239,68,68,0.1)', padding: 10, borderRadius: 8 }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input 
            className="form-control" 
            placeholder="Username (admin or staff)" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
          />
          <input 
            className="form-control" 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="btn" style={{ marginTop: 8, padding: 12, fontSize: 16 }}>
            Access System
          </button>
        </form>
      </div>
    </div>
  );
};
