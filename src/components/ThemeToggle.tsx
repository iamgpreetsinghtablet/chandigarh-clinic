import React from 'react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        position: 'relative',
        width: 50,
        height: 26,
        borderRadius: 13,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
        transition: 'background-color 0.3s ease',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        outline: 'none',
      }}
    >
      {/* Sliding circle */}
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: isDark ? 26 : 2,
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: isDark ? '#334155' : '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'left 0.3s ease, background-color 0.3s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      >
        {isDark ? (
          // Moon icon
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
          </svg>
        ) : (
          // Sun icon
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#92400e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </span>
    </button>
  );
};
