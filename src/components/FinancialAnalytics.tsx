import React, { useMemo } from 'react';
import type { Patient } from '../types';

export const FinancialAnalytics: React.FC<{ patients: Patient[] }> = ({ patients }) => {
  const stats = useMemo(() => {
    let total = 0, discount = 0, net = 0, received = 0, pending = 0;
    
    patients.forEach(p => {
      p.visits?.forEach(v => {
        total += Number(v.totalAmount) || 0;
        discount += Number(v.discountAmount) || 0;
        net += Number(v.netAmount) || 0;
        received += Number(v.receivedAmount) || 0;
        pending += Number(v.pendingAmount) || 0;
      });
    });

    return { total, discount, net, received, pending };
  }, [patients]);

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 20px 0' }}>📈 Financial Analytics & Revenue</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
        <div style={{ padding: 16, background: 'var(--bg-dark)', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase' }}>Total Billed</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>₹{stats.total.toLocaleString()}</div>
        </div>
        <div style={{ padding: 16, background: 'var(--bg-dark)', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase' }}>Discounts</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>₹{stats.discount.toLocaleString()}</div>
        </div>
        <div style={{ padding: 16, background: 'var(--bg-dark)', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase' }}>Net Revenue</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>₹{stats.net.toLocaleString()}</div>
        </div>
        <div style={{ padding: 16, background: 'var(--bg-dark)', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase' }}>Received</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>₹{stats.received.toLocaleString()}</div>
        </div>
        <div style={{ padding: 16, background: 'var(--bg-dark)', borderRadius: 12, textAlign: 'center', border: '1px solid var(--danger)' }}>
          <div style={{ color: 'var(--danger)', fontSize: 13, textTransform: 'uppercase', fontWeight: 600 }}>Pending</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--danger)' }}>₹{stats.pending.toLocaleString()}</div>
        </div>
      </div>
      
      <p style={{ marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
        This module aggregates billing data across all patient visits. 
        Only Admins can view this sensitive financial data.
      </p>
    </div>
  );
};
