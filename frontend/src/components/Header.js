import React, { useState } from 'react';

export default function Header({ onAdd, onSearch }) {
  const [searchId, setSearchId] = useState('');

  // in Header.js
const handleSearch = () => {
  const val = searchId.trim();
  if (!val) return;
  if (typeof onSearch === 'function') onSearch(val);
  else console.warn('onSearch not provided');
}


  return (
    <header className="header">
      <div className="header-left">
        <div className="search">
          <input
            placeholder="Search by Employee ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      <div className="header-right">
        <button className="btn add" onClick={onAdd}>
          + Add New Employee
        </button>
      </div>
    </header>
  );
}
