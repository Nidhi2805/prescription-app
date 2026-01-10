import React, { useState, useEffect } from "react";
import axios from "axios";

export default function MoleculeAutocomplete({ onSelectTrade }) {
  const [query, setQuery] = useState("");
  const [molecules, setMolecules] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tradeList, setTradeList] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/molecules")
      .then(res => {
        setMolecules(res.data.molecules ?? res.data ?? []);
      });
  }, []);

  function handleMoleculeInput(v) {
    setQuery(v);

    if (v.length < 2) {
      setFiltered([]);
      setTradeList([]);
      return;
    }

    const temp = molecules.filter(m =>
      m.molecule.toLowerCase().includes(v.toLowerCase())
    );

    setFiltered(temp);
  }

  function chooseMolecule(mol) {
    setQuery(mol.molecule);
    setFiltered([]);
    setTradeList(mol.trades ?? []);
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      
      {/* Molecule Search Box */}
      <input
        value={query}
        onChange={e => handleMoleculeInput(e.target.value)}
        placeholder="Search molecule..."
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "6px"
        }}
      />

      {/* Dropdown of molecules */}
      {filtered.length > 0 && (
        <div style={{
          position: "absolute",
          top: "45px",
          width: "100%",
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "6px",
          maxHeight: "180px",
          overflowY: "auto",
          zIndex: 9999,
        }}>
          {filtered.map((m, i) => (
            <div
              key={i}
              onClick={() => chooseMolecule(m)}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee"
              }}
            >
              {m.molecule}
            </div>
          ))}
        </div>
      )}

      {/* Trade Name Dropdown */}
      {tradeList.length > 0 && (
        <div style={{
          marginTop: "8px",
          border: "1px solid #007bff",
          background: "#f8faff",
          borderRadius: "6px",
          padding: "10px"
        }}>
          <strong>Select Trade Name:</strong>

          {tradeList.map((t, i) => (
            <div
              key={i}
              onClick={() => onSelectTrade(t)}
              style={{
                padding: "8px 6px",
                cursor: "pointer",
                borderBottom: "1px solid #eee"
              }}
            >
              {t}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
