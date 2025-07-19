import React, { useState, useEffect } from 'react';

function CourseManager() {
  const [courses, setCourses] = useState(() => JSON.parse(localStorage.getItem('courses')) || []);
  const [name, setName] = useState('');

  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  const addCourse = () => {
    if (!name.trim()) return alert('Please enter a course name.');
    setCourses([...courses, name.trim()]);
    alert('Course added.');
    setName('');
  };

  const updateCourse = (index) => {
    const newName = prompt('Update course name:', courses[index]);
    if (newName && newName.trim()) {
      const updated = [...courses];
      updated[index] = newName.trim();
      setCourses(updated);
      alert('Course updated.');
    }
  };

  const deleteCourse = (index) => {
    if (window.confirm('Delete this course?')) {
      const updated = courses.filter((_, i) => i !== index);
      setCourses(updated);
      alert('Course deleted.');
    }
  };

  return (
    <div className="card">
      <h2>Courses</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add Course" />
      <button onClick={addCourse}>Add</button>
      <ul>
        {courses.map((course, index) => (
          <li key={index}>
            - {course}
            <button onClick={() => updateCourse(index)} style={{ marginLeft: '10px' }}>Edit</button>
            <button onClick={() => deleteCourse(index)} style={{ marginLeft: '5px' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseManager;
