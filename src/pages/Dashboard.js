import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { linksAPI } from '../services/api';
import './Dashboard.css'; // Import external CSS

const Dashboard = () => {
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    originalUrl: '',
    description: ''
  });
  const [quickUrl, setQuickUrl] = useState('');
  const [quickShortUrl, setQuickShortUrl] = useState(''); // Store the generated short URL
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingLink, setEditingLink] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchLinks();
  }, []);

  // Filter links based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLinks(links);
    } else {
      const filtered = links.filter(link =>
        link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLinks(filtered);
    }
  }, [links, searchQuery]);

  const fetchLinks = async () => {
    try {
      const response = await linksAPI.getLinks();
      setLinks(response.data.links);
    } catch (error) {
      console.error('Error fetching links:', error);
      setError('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingLink) {
        const response = await linksAPI.updateLink(editingLink.id, formData);
        setLinks(links.map(link => 
          link.id === editingLink.id ? response.data.link : link
        ));
        setSuccess('Link updated successfully!');
        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
        setEditingLink(null);
      } else {
        const response = await linksAPI.createLink(formData);
        setLinks([response.data.link, ...links]);
        setSuccess('Link created successfully!');
        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
      setFormData({ name: '', originalUrl: '', description: '' });
      setShowForm(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save link');
    }
  };

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!quickUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Validate URL format
    try {
      new URL(quickUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    try {
      // Create a temporary link data for quick link generation
      // This assumes your API has a method to create quick links that don't get saved to user's list
      // If not, you might need to modify your API or use a different endpoint
      const domain = new URL(quickUrl).hostname.replace('www.', '');
      const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const quickLinkData = {
        name: `Quick-${domain}-${timestamp}`,
        originalUrl: quickUrl,
        description: 'Temporary quick link',
        temporary: true // Flag to indicate this is a temporary link
      };

      // If you have a separate endpoint for temporary links, use that
      // Otherwise, you might need to create and then delete from the main list
      const response = await linksAPI.createQuickLink 
        ? await linksAPI.createQuickLink(quickLinkData)
        : await linksAPI.createLink(quickLinkData);
      
      // Store the short URL for display
      setQuickShortUrl(response.data.link.shortUrl);
      
      // Auto-copy the short URL to clipboard
      navigator.clipboard.writeText(response.data.link.shortUrl);
      setSuccess('Quick link created and copied to clipboard!');
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
      // Don't add to links list - this is the key change
      // setLinks([response.data.link, ...links]); // REMOVED THIS LINE
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create quick link');
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      originalUrl: link.originalUrl,
      description: link.description || ''
    });
    setShowForm(true);
    setShowQuickForm(false);
  };

  const handleDelete = async (linkId) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await linksAPI.deleteLink(linkId);
        setLinks(links.filter(link => link.id !== linkId));
        setSuccess('Link deleted successfully!');
        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete link');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
    setFormData({ name: '', originalUrl: '', description: '' });
    setShowForm(false);
    setError('');
  };

  const handleCancelQuick = () => {
    setQuickUrl('');
    setQuickShortUrl(''); // Clear the generated short URL
    setShowQuickForm(false);
    setError('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Short URL copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const copyQuickLink = () => {
    if (quickShortUrl) {
      navigator.clipboard.writeText(quickShortUrl);
      setSuccess('Quick link copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="url(#gradient)"/>
              <path d="M12 20L18 14L28 24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 14L28 14L28 20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#667eea"/>
                  <stop offset="1" stopColor="#764ba2"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-text">
            <h1 className="dashboard-title">LinkKeep</h1>
            <p className="brand-tagline">Keep Your Links Short & Smart</p>
          </div>
        </div>
        <div className="dashboard-user-info">
          <span>Welcome, {user?.username}!</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      {error && <div className="dashboard-error">{error}</div>}
      {success && <div className="dashboard-success">{success}</div>}

      <div className="dashboard-actions">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setShowQuickForm(false);
            setEditingLink(null);
          }}
          className="add-button"
        >
          {showForm ? 'Cancel' : 'Add New Link'}
        </button>
        <button
          onClick={() => {
            setShowQuickForm(!showQuickForm);
            setShowForm(false);
            setEditingLink(null);
            setQuickShortUrl(''); // Clear previous quick link
          }}
          className="quick-button"
        >
          {showQuickForm ? 'Cancel' : '⚡ Quick Short Link'}
        </button>
      </div>

      {showQuickForm && (
        <div className="form-container quick-form">
          <h3>⚡ Quick Short Link</h3>
          <p className="quick-description">
            Create a temporary short link without saving to your list!
          </p>
          <form onSubmit={handleQuickSubmit} className="form">
            <div className="form-group">
              <label className="label">Paste your URL:</label>
              <input
                type="url"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                required
                className="input"
                placeholder="https://example.com"
                autoFocus
              />
            </div>
            
            {quickShortUrl && (
              <div className="quick-result">
                <label className="label">Your Quick Short Link:</label>
                <div className="url-container">
                  <a 
                    href={quickShortUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="short-url"
                  >
                    {quickShortUrl}
                  </a>
                  <button
                    type="button"
                    onClick={copyQuickLink}
                    className="copy-button"
                  >
                    Copy
                  </button>
                </div>
                <p className="quick-note">
                  ℹ️ This link is temporary and won't appear in your saved links list.
                </p>
              </div>
            )}
            
            <div className="form-buttons">
              <button type="submit" className="quick-submit-button">
                ⚡ Create Quick Link
              </button>
              <button 
                type="button" 
                onClick={handleCancelQuick}
                className="cancel-button"
              >
                {quickShortUrl ? 'Create Another' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h3>{editingLink ? 'Edit Link' : 'Add New Link'}</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label className="label">Link Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g., My Website"
              />
            </div>

            <div className="form-group">
              <label className="label">Original URL:</label>
              <input
                type="url"
                name="originalUrl"
                value={formData.originalUrl}
                onChange={handleChange}
                required
                className="input"
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group">
              <label className="label">Description (optional):</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="textarea"
                placeholder="Brief description of the link"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="save-button">
                {editingLink ? 'Update Link' : 'Create Link'}
              </button>
              {editingLink && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="cancel-button"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="links-container">
        <div className="links-header">
          <h2>Your Saved Links ({filteredLinks.length})</h2>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="🔍 Search links by name, description, or URL..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="clear-search-button"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="search-results-info">
                Showing {filteredLinks.length} of {links.length} links
              </div>
            )}
          </div>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? (
              <div>
                <p>No links found matching "{searchQuery}"</p>
                <button onClick={clearSearch} className="clear-search-link">
                  Clear search to see all links
                </button>
              </div>
            ) : (
              <div>
                <p>No saved links yet. Click "Add New Link" to save links to your list!</p>
                <p><small>Use "⚡ Quick Short Link" for temporary links that won't be saved.</small></p>
              </div>
            )}
          </div>
        ) : (
          <div className="links-list">
            {filteredLinks.map((link) => (
              <div key={link.id} className="link-card">
                <div className="link-info">
                  <h3 className="link-name">{link.name}</h3>
                  <div className="urls">
                    <div className="url-row">
                      <strong>Short URL:</strong>
                      <div className="url-container">
                        <a 
                          href={link.shortUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="short-url"
                        >
                          {link.shortUrl}
                        </a>
                        <button
                          onClick={() => copyToClipboard(link.shortUrl)}
                          className="copy-button"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="url-row">
                      <strong>Original URL:</strong>
                      <a 
                        href={link.originalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="original-url"
                      >
                        {link.originalUrl}
                      </a>
                    </div>
                  </div>
                  {link.description && (
                    <p className="description">{link.description}</p>
                  )}
                  <div className="stats">
                    <span>Clicks: {link.clicks}</span>
                    <span>Created: {new Date(link.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="link-actions">
                  <button
                    onClick={() => handleEdit(link)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;