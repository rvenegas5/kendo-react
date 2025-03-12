import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.scss";

// Import components
import FormStudent from "./components/FormStudents/FormStudent";
import TableStudents from "./components/TableStudents/TableStudents";
import FormSubject from "./components/FormSubject/FormSubject";
import TableSubjects from "./components/TableSubjects/TableSubjects";
import SubscriptionForm from "./components/Subscriptions/SubscriptionForm";
import { WelcomePage } from "./components/Welcome/WelcomePage";

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="app-nav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/students">Students</Link>
            </li>
            <li>
              <Link to="/add-student">Add Student</Link>
            </li>
            <li>
              <Link to="/subjects">Subjects</Link>
            </li>
            <li>
              <Link to="/subjects/add">Add Subject</Link>
            </li>
            <li>
              <Link to="/subscriptions">Subscriptions</Link>
            </li>
          </ul>
        </nav>

        <div className="app-content">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/students" element={<TableStudents />} />
            <Route path="/add-student" element={<FormStudent />} />
            <Route path="/subjects" element={<TableSubjects />} />
            <Route path="/subjects/add" element={<FormSubject />} />
            <Route path="/subscriptions" element={<SubscriptionForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
