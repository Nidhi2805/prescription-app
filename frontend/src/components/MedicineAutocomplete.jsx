import React, { useState, useEffect } from 'react';
import { searchMedicines } from '../api/medicineApi';

export default function MedicineAutocomplete({ value, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      const res = await searchMedicines(query);
      setResults(res);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  function handleSelect(med) {
    setQuery(med.name);
    setResults([]);
    onSelect(med);
  }

  return (
    <div className="autocomplete">
      <input
        type="text"
        placeholder="Search medicine..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <ul className="suggestions">
          {results.map((med) => (
            <li key={med._id} onClick={() => handleSelect(med)}>
              {med.name} ({med.defaultTimes} x {med.defaultDays} days)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
