import React from "react";
import { Link } from "react-router-dom";

export const WelcomePage = () => {
  return (
    <div className="welcome-page">
      <div className="welcome-hero">
        <h1>By William Venegas</h1>
      </div>

      <div className="feature-cards">
        <div className="feature-card">
          <div className="card-icon">👨‍🎓</div>
          <h3>Students</h3>
          <p>
            Manage student profiles, view their enrollments, and track their
            academic journey
          </p>
          <Link to="/students" className="feature-link">
            View Students
          </Link>
        </div>
        <div className="feature-card">
          <div className="card-icon">📚</div>
          <h3>Subjects</h3>
          <p>
            Create and manage course subjects, set credit values, and see
            enrolled students
          </p>
          <Link to="/subjects" className="feature-link">
            View Subjects
          </Link>
        </div>
        <div className="feature-card">
          <div className="card-icon">🔗</div>
          <h3>Subscriptions</h3>
          <p>
            Easily enroll students in subjects and manage their course
            registrations
          </p>
          <Link to="/subscriptions" className="feature-link">
            Manage Subscriptions
          </Link>
        </div>
      </div>
    </div>
  );
};
