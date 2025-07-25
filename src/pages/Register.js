import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css'; // Import the external CSS

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register(formData.username, formData.email, formData.password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2 className="register-title">Create Account</h2>
        
        {error && <div className="register-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-form-group">
            <label className="register-label">Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <div className="register-form-group">
            <label className="register-label">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <div className="register-form-group">
            <label className="register-label">Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <div className="register-form-group">
            <label className="register-label">Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="register-button"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="register-link-text">
          Already have an account? <Link to="/login" className="register-link">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;