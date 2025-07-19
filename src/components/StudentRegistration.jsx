import React, { useState, useEffect } from 'react';

function StudentRegistration() {
  const [offerings, setOfferings] = useState([]);
  const [registrations, setRegistrations] = useState(() => JSON.parse(localStorage.getItem('registrations')) || []);
  const [name, setName] = useState('');
  const [selectedOffering, setSelectedOffering] = useState('');
  const [filter, setFilter] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editName, setEditName] = useState('');
  const [editOffering, setEditOffering] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('courseOfferings')) || [];
    setOfferings(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('registrations', JSON.stringify(registrations));
  }, [registrations]);

  const handleRegister = () => {
  if (!name.trim() || !selectedOffering) return alert('Enter name and select an offering.');

  const isDuplicate = registrations.some(
    (reg) =>
      reg.name.trim().toLowerCase() === name.trim().toLowerCase() &&
      reg.offering === selectedOffering
  );

  if (isDuplicate) {
    return alert('This student is already registered for the selected course offering.');
  }

  setRegistrations([...registrations, { name: name.trim(), offering: selectedOffering }]);
  alert('Student registered.');
  setName('');
  setSelectedOffering('');
};


  const deleteRegistration = (index) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      const updated = registrations.filter((_, i) => i !== index);
      setRegistrations(updated);
      alert('Registration deleted.');
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditName(registrations[index].name);
    setEditOffering(registrations[index].offering);
  };

  const saveEdit = (index) => {
    if (!editName.trim() || !editOffering) return alert('Please complete both fields.');
    const updated = [...registrations];
    updated[index] = { name: editName.trim(), offering: editOffering };
    setRegistrations(updated);
    setEditingIndex(null);
    alert('Registration updated.');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const filteredOfferings = filter
    ? offerings.filter((o) => o.toLowerCase().startsWith(filter.toLowerCase()))
    : offerings;

  return (
    <div className="card">
      <h2>Student Registration</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Student Name" />
      <select value={selectedOffering} onChange={(e) => setSelectedOffering(e.target.value)}>
        <option value="">Select Offering</option>
        {filteredOfferings.map((o, idx) => <option key={idx} value={o}>{o}</option>)}
      </select>
      <button onClick={handleRegister}>Register</button>

      <h3>Filter Offerings by Type</h3>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="e.g. Group" />

      <h3>Registered Students</h3>
      <ul>
        {registrations.map((reg, idx) => (
          <li key={idx}>
            {editingIndex === idx ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Name"
                  style={{ marginRight: '5px' }}
                />
                <select value={editOffering} onChange={(e) => setEditOffering(e.target.value)}>
                  <option value="">Select Offering</option>
                  {offerings.map((o, i) => <option key={i} value={o}>{o}</option>)}
                </select>
                <button onClick={() => saveEdit(idx)} style={{ marginLeft: '5px' }}>Save</button>
                <button onClick={cancelEdit} style={{ marginLeft: '5px' }}>Cancel</button>
              </>
            ) : (
              <>
                - {reg.name} → {reg.offering}
                <button onClick={() => handleEdit(idx)} style={{ marginLeft: '10px' }}>Edit</button>
                <button onClick={() => deleteRegistration(idx)} style={{ marginLeft: '5px' }}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentRegistration;
