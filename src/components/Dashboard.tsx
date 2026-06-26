import { useMemo } from 'react';
import type { Patient, Appointment } from '../types';

interface DashboardProps {
  patients: Patient[];
  appointments: Appointment[];
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const AGE_RANGES = ['0-18', '19-35', '36-50', '51-65', '65+'] as const;
const BAR_COLORS = [
  '#818cf8', '#c084fc', '#f472b6', '#fb923c',
  '#34d399', '#38bdf8', '#fbbf24', '#a78bfa',
];

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  glass: {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    padding: '1.25rem 1.5rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  statIcon: {
    fontSize: '1.5rem',
    opacity: 0.5,
    position: 'absolute' as const,
    top: '1rem',
    right: '1.25rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#f8fafc',
    marginBottom: '1rem',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.6rem',
  },
  barLabel: {
    width: '3.5rem',
    textAlign: 'right' as const,
    fontSize: '0.8rem',
    color: '#94a3b8',
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: '1.25rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  barCount: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    width: '2rem',
    flexShrink: 0,
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
  },
  genderBar: {
    display: 'flex',
    height: '2rem',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  legendDot: {
    width: '0.6rem',
    height: '0.6rem',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '0.4rem',
  },
  legendRow: {
    display: 'flex',
    gap: '1.25rem',
    fontSize: '0.8rem',
    color: '#94a3b8',
    flexWrap: 'wrap' as const,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.85rem',
  },
  th: {
    textAlign: 'left' as const,
    padding: '0.6rem 0.75rem',
    color: '#94a3b8',
    fontWeight: 500,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  td: {
    padding: '0.6rem 0.75rem',
    color: '#f8fafc',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
};

const cssKeyframes = `
@keyframes dashBarGrow {
  from { width: 0; }
}
`;

function Bar({ pct, color, count }: { pct: number; color: string; count: number }) {
  return (
    <div style={styles.barTrack}>
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: '0.5rem',
          transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
          animation: 'dashBarGrow 0.8s cubic-bezier(.4,0,.2,1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: pct > 12 ? '0.5rem' : 0,
          fontSize: '0.7rem',
          color: '#fff',
          fontWeight: 600,
          minWidth: count > 0 ? '1.5rem' : 0,
        }}
      >
        {pct > 12 ? count : ''}
      </div>
    </div>
  );
}

export function Dashboard({ patients, appointments }: DashboardProps) {
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const todayAppts = appointments.filter((a) => a.date === today).length;

    const genderCounts: Record<string, number> = { Male: 0, Female: 0, Other: 0 };
    const bloodCounts: Record<string, number> = {};
    const ageBuckets: Record<string, number> = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };

    BLOOD_GROUPS.forEach((bg) => (bloodCounts[bg] = 0));

    patients.forEach((p) => {
      // Gender
      const g = p.gender;
      if (g === 'Male' || g === 'Female') genderCounts[g]++;
      else genderCounts['Other']++;

      // Blood group
      if (p.bloodGroup && bloodCounts[p.bloodGroup] !== undefined) {
        bloodCounts[p.bloodGroup]++;
      }

      // Age
      const age = typeof p.age === 'number' ? p.age : 0;
      if (age <= 18) ageBuckets['0-18']++;
      else if (age <= 35) ageBuckets['19-35']++;
      else if (age <= 50) ageBuckets['36-50']++;
      else if (age <= 65) ageBuckets['51-65']++;
      else ageBuckets['65+']++;
    });

    // Most common blood group
    let topBG = '—';
    let topBGCount = 0;
    for (const [bg, c] of Object.entries(bloodCounts)) {
      if (c > topBGCount) { topBGCount = c; topBG = bg; }
    }

    const recentPatients = [...patients]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    return { todayAppts, genderCounts, bloodCounts, ageBuckets, topBG, recentPatients };
  }, [patients, appointments, today]);

  const totalPatients = patients.length;
  const genderTotal = stats.genderCounts.Male + stats.genderCounts.Female + stats.genderCounts.Other;
  const maxBlood = Math.max(...Object.values(stats.bloodCounts), 1);
  const maxAge = Math.max(...Object.values(stats.ageBuckets), 1);
  const maleRatio = totalPatients > 0
    ? `${stats.genderCounts.Male}:${stats.genderCounts.Female}`
    : '—';

  return (
    <>
      <style>{cssKeyframes}</style>
      <div style={styles.wrapper}>
        {/* Stats Row */}
        <div style={styles.statsRow}>
          {[
            { value: totalPatients, label: 'Total Patients', icon: '👥' },
            { value: stats.todayAppts, label: "Today's Appointments", icon: '📅' },
            { value: maleRatio, label: 'Male / Female', icon: '⚧' },
            { value: stats.topBG, label: 'Top Blood Group', icon: '🩸' },
          ].map((s) => (
            <div key={s.label} style={{ ...styles.glass, position: 'relative' }}>
              <span style={styles.statIcon}>{s.icon}</span>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div style={styles.chartsGrid}>
          {/* Gender Distribution */}
          <div style={styles.glass}>
            <div style={styles.sectionTitle}>Gender Distribution</div>
            <div style={styles.genderBar}>
              {genderTotal > 0 && (
                <>
                  <div
                    style={{
                      width: `${(stats.genderCounts.Male / genderTotal) * 100}%`,
                      background: 'linear-gradient(90deg, #818cf8, #6366f1)',
                      transition: 'width 0.8s ease',
                    }}
                  />
                  <div
                    style={{
                      width: `${(stats.genderCounts.Female / genderTotal) * 100}%`,
                      background: 'linear-gradient(90deg, #f472b6, #ec4899)',
                      transition: 'width 0.8s ease',
                    }}
                  />
                  <div
                    style={{
                      width: `${(stats.genderCounts.Other / genderTotal) * 100}%`,
                      background: 'linear-gradient(90deg, #34d399, #10b981)',
                      transition: 'width 0.8s ease',
                    }}
                  />
                </>
              )}
            </div>
            <div style={styles.legendRow}>
              <span style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: '#818cf8' }} />
                Male {stats.genderCounts.Male}
              </span>
              <span style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: '#f472b6' }} />
                Female {stats.genderCounts.Female}
              </span>
              <span style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: '#34d399' }} />
                Other {stats.genderCounts.Other}
              </span>
            </div>
          </div>

          {/* Blood Group Chart */}
          <div style={styles.glass}>
            <div style={styles.sectionTitle}>Blood Group Distribution</div>
            {BLOOD_GROUPS.map((bg, i) => (
              <div key={bg} style={styles.barRow}>
                <span style={styles.barLabel}>{bg}</span>
                <Bar
                  pct={(stats.bloodCounts[bg] / maxBlood) * 100}
                  color={BAR_COLORS[i]}
                  count={stats.bloodCounts[bg]}
                />
                <span style={styles.barCount}>{stats.bloodCounts[bg]}</span>
              </div>
            ))}
          </div>

          {/* Age Distribution */}
          <div style={styles.glass}>
            <div style={styles.sectionTitle}>Age Distribution</div>
            {AGE_RANGES.map((range, i) => (
              <div key={range} style={styles.barRow}>
                <span style={styles.barLabel}>{range}</span>
                <Bar
                  pct={(stats.ageBuckets[range] / maxAge) * 100}
                  color={BAR_COLORS[i + 3]}
                  count={stats.ageBuckets[range]}
                />
                <span style={styles.barCount}>{stats.ageBuckets[range]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Patients */}
        <div style={styles.glass}>
          <div style={styles.sectionTitle}>Recent Patients</div>
          {stats.recentPatients.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No patients yet.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Patient ID</th>
                  <th style={styles.th}>Added</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPatients.map((p) => (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.name}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          background: 'rgba(99,102,241,0.15)',
                          color: '#818cf8',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '0.35rem',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                        }}
                      >
                        {p.patientId}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
