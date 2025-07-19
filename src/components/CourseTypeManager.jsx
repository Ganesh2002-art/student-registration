import React, { useState, useEffect } from 'react';

function CourseTypeManager() {
  const [types, setTypes] = useState(() => JSON.parse(localStorage.getItem('courseTypes')) || []);
  const [name, setName] = useState('');

  useEffect(() => {
    localStorage.setItem('courseTypes', JSON.stringify(types));
  }, [types]);

  const addType = () => {
    if (!name.trim()) return alert('Please enter a course type.');
    setTypes([...types, name.trim()]);
    alert('Course type added.');
    setName('');
  };

  const updateType = (index) => {
    const newName = prompt('Update course type:', types[index]);
    if (newName && newName.trim()) {
      const updated = [...types];
      updated[index] = newName.trim();
      setTypes(updated);
      alert('Course type updated.');
    }
  };

  const deleteType = (index) => {
    if (window.confirm('Are you sure you want to delete this course type?')) {
      const updated = types.filter((_, i) => i !== index);
      setTypes(updated);
      alert('Course type deleted.');
    }
  };

  return (
    <div className="card">
      <h2>Course Types</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add Course Type" />
      <button onClick={addType}>Add</button>
      <ul>
        {types.map((type, index) => (
          <li key={index}>
            - {type}
            <button onClick={() => updateType(index)} style={{ marginLeft: '10px' }}>Edit</button>
            <button onClick={() => deleteType(index)} style={{ marginLeft: '5px' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseTypeManager;
