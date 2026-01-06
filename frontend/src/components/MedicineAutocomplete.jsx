import React, { useState, useEffect, useRef } from 'react';
import { searchMedicines } from '../api/medicineApi';

export default function MedicineAutocomplete({ value, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [showList, setShowList] = useState(false);
  const containerRef = useRef(null);

  // 🔹 Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await searchMedicines(query);
        setResults(res);
        setShowList(true);
      } catch (err) {
        console.error('Error fetching medicines', err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // 🔹 Hide suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔹 Handle selection
  function handleSelect(med) {
    setQuery(med.name);
    setResults([]);
    setShowList(false);
    onSelect(med);
  }

  return (
    <div className="autocomplete" ref={containerRef}>
      <input
        type="text"
        placeholder="Search medicine..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setShowList(true)}
      />
      {showList && results.length > 0 && (
        <ul className="suggestions">
          {results.map((med) => (
            <li key={med._id} onClick={() => handleSelect(med)}>
              {med.name} ({med.defaultTimes} × {med.defaultDays} days)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}