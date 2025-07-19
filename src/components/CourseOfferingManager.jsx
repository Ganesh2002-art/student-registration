import React, { useState, useEffect } from 'react';

function CourseOfferingManager() {
  const [offerings, setOfferings] = useState(() => JSON.parse(localStorage.getItem('courseOfferings')) || []);
  const [courses, setCourses] = useState([]);
  const [types, setTypes] = useState([]);
  const [course, setCourse] = useState('');
  const [type, setType] = useState('');

  // Sync courses and types dynamically
  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem('courses')) || [];
    const storedTypes = JSON.parse(localStorage.getItem('courseTypes')) || [];
    setCourses(storedCourses);
    setTypes(storedTypes);
  }, [offerings]); // refresh options whenever offerings change (optional)

  useEffect(() => {
    localStorage.setItem('courseOfferings', JSON.stringify(offerings));
  }, [offerings]);

  const addOffering = () => {
    if (!course || !type) return alert('Please select both course and type.');
    const entry = `${type} - ${course}`;
    setOfferings([...offerings, entry]);
    alert('Course offering added.');
    setCourse('');
    setType('');
  };

  const deleteOffering = (index) => {
    if (window.confirm('Delete this course offering?')) {
      const updated = offerings.filter((_, i) => i !== index);
      setOfferings(updated);
      alert('Course offering deleted.');
    }
  };

  return (
    <div className="card">
      <h2>Course Offerings</h2>
      <select onChange={(e) => setType(e.target.value)} value={type}>
        <option value="">Select Type</option>
        {types.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
      </select>
      <select onChange={(e) => setCourse(e.target.value)} value={course}>
        <option value="">Select Course</option>
        {courses.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
      </select>
      <button onClick={addOffering}>Add</button>

      <ul>
        {offerings.map((o, index) => (
          <li key={index}>
            - {o}
            <button onClick={() => deleteOffering(index)} style={{ marginLeft: '10px' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseOfferingManager;
