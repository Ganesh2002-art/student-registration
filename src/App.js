import React from 'react';
import CourseTypeManager from './components/CourseTypeManager';
import CourseManager from './components/CourseManager';
import CourseOfferingManager from './components/CourseOfferingManager';
import StudentRegistration from './components/StudentRegistration';
import './App.css';

function App() {
  return (
    <div className="container">
      <h1>Student Registration System</h1>
      <CourseTypeManager />
      <CourseManager />
      <CourseOfferingManager />
      <StudentRegistration />
    </div>
  );
}

export default App;
