import React from 'react';

interface SortFilterProps {
  sortBy: string;
  sortDir: 'asc' | 'desc';
  filterGender: string;
  filterBloodGroup: string;
  onSortChange: (field: string) => void;
  onSortDirToggle: () => void;
  onFilterGender: (val: string) => void;
  onFilterBloodGroup: (val: string) => void;
  onClearFilters: () => void;
}

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'age', label: 'Age' },
  { value: 'dateAdded', label: 'Date Added' },
  { value: 'patientId', label: 'Patient ID' },
];

const GENDER_OPTIONS = ['All', 'Male', 'Female', 'Other'];

const BLOOD_GROUP_OPTIONS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const SortFilter: React.FC<SortFilterProps> = ({
  sortBy,
  sortDir,
  filterGender,
  filterBloodGroup,
  onSortChange,
  onSortDirToggle,
  onFilterGender,
  onFilterBloodGroup,
  onClearFilters,
}) => {
  const hasActiveFilters = filterGender !== '' && filterGender !== 'All'
    || filterBloodGroup !== '' && filterBloodGroup !== 'All';

  return (
    <div
      className="glass-card"
      style={{
        padding: '0.75rem',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Sort field */}
      <select
        className="form-control"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        style={{ minWidth: 120 }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Sort direction toggle */}
      <button
        className="btn outline"
        onClick={onSortDirToggle}
        aria-label={sortDir === 'asc' ? 'Sort ascending' : 'Sort descending'}
        style={{ padding: '0.4rem 0.5rem', display: 'flex', alignItems: 'center' }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: sortDir === 'desc' ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s ease',
          }}
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>

      {/* Gender filter */}
      <select
        className="form-control"
        value={filterGender}
        onChange={(e) => onFilterGender(e.target.value)}
        style={{ minWidth: 100 }}
      >
        {GENDER_OPTIONS.map((g) => (
          <option key={g} value={g}>
            {g === 'All' ? 'All Genders' : g}
          </option>
        ))}
      </select>

      {/* Blood group filter */}
      <select
        className="form-control"
        value={filterBloodGroup}
        onChange={(e) => onFilterBloodGroup(e.target.value)}
        style={{ minWidth: 110 }}
      >
        {BLOOD_GROUP_OPTIONS.map((bg) => (
          <option key={bg} value={bg}>
            {bg === 'All' ? 'All Blood Groups' : bg}
          </option>
        ))}
      </select>

      {/* Clear filters — only visible when filters active */}
      {hasActiveFilters && (
        <button className="btn danger" onClick={onClearFilters} style={{ whiteSpace: 'nowrap' }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: 4, verticalAlign: 'middle' }}
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear Filters
        </button>
      )}
    </div>
  );
};
