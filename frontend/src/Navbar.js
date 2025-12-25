import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Navbar({ onSearch }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Real-time search
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <style>{navbarStyles}</style>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => navigate("/")}>
            <h2>BlogTalentio</h2>
          </div>

          <ul className="navbar-menu">
            <li onClick={() => navigate("/")}>Home</li>
            <li>About Us</li>
            <li>Features</li>
          </ul>

          <div className="navbar-actions">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
              <button type="submit" className="search-button">
                🔍
              </button>
            </form>

            {isLoggedIn ? (
              <>
                <button
                  className="navbar-button primary"
                  onClick={() => navigate("/add-blog")}
                >
                  Create Post
                </button>
                <button
                  className="navbar-button secondary"
                  onClick={() => navigate("/saved")}
                >
                  Saved
                </button>
                <button
                  className="navbar-button logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                className="navbar-button primary"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            )}
          </div>

          {/* Hamburger Menu Button */}
          <button
            className={`hamburger-menu ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
              <ul className="mobile-menu-list">
                <li onClick={() => handleNavigation("/")}>Home</li>
                <li>About Us</li>
                <li>Features</li>
              </ul>

              <div className="mobile-menu-actions">
                {isLoggedIn ? (
                  <>
                    <button
                      className="navbar-button primary mobile-full"
                      onClick={() => handleNavigation("/add-blog")}
                    >
                      Create Post
                    </button>
                    <button
                      className="navbar-button secondary mobile-full"
                      onClick={() => handleNavigation("/saved")}
                    >
                      Saved
                    </button>
                    <button
                      className="navbar-button logout mobile-full"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    className="navbar-button primary mobile-full"
                    onClick={() => handleNavigation("/login")}
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

const navbarStyles = `
  .navbar {
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 1000;
    border-bottom: 1px solid #edf2f7;
  }

  .navbar-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 15px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .navbar-logo {
    cursor: pointer;
    z-index: 1002;
  }

  .navbar-logo h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e272e;
  }

  .navbar-menu {
    display: flex;
    list-style: none;
    gap: 30px;
    margin: 0;
    padding: 0;
  }

  .navbar-menu li {
    font-size: 0.95rem;
    font-weight: 500;
    color: #2d3436;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .navbar-menu li:hover {
    color: #4a6cff;
  }

  .navbar-actions {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .search-form {
    display: flex;
    align-items: center;
    position: relative;
  }

  .search-input {
    padding: 8px 35px 8px 15px;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    font-size: 0.9rem;
    width: 200px;
    transition: all 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #4a6cff;
    width: 250px;
  }

  .search-button {
    position: absolute;
    right: 5px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 5px 10px;
  }

  .navbar-button {
    padding: 8px 20px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    min-height: 40px;
  }

  .navbar-button.primary {
    background-color: #4a6cff;
    color: white;
    border: 2px solid #4a6cff;
  }

  .navbar-button.primary:hover {
    background-color: #3a5ce5;
    transform: translateY(-1px);
  }

  .navbar-button.secondary {
    background-color: white;
    color: #4a6cff;
    border: 2px solid #4a6cff;
  }

  .navbar-button.secondary:hover {
    background-color: #f8f9fc;
  }

  .navbar-button.logout {
    background-color: white;
    color: #ff4757;
    border: 2px solid #ff4757;
  }

  .navbar-button.logout:hover {
    background-color: #fff5f5;
  }

  /* Hamburger Menu Button */
  .hamburger-menu {
    display: none;
    flex-direction: column;
    justify-content: space-around;
    width: 30px;
    height: 25px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 1002;
  }

  .hamburger-menu span {
    width: 30px;
    height: 3px;
    background-color: #2d3436;
    border-radius: 10px;
    transition: all 0.3s ease;
    transform-origin: center;
  }

  .hamburger-menu.open span:nth-child(1) {
    transform: rotate(45deg) translateY(8px);
  }

  .hamburger-menu.open span:nth-child(2) {
    opacity: 0;
  }

  .hamburger-menu.open span:nth-child(3) {
    transform: rotate(-45deg) translateY(-8px);
  }

  /* Mobile Menu Overlay */
  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1001;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .mobile-menu {
    position: fixed;
    top: 0;
    right: 0;
    width: 80%;
    max-width: 300px;
    height: 100vh;
    background-color: #ffffff;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    padding: 80px 20px 20px;
    overflow-y: auto;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .mobile-menu-list {
    list-style: none;
    padding: 0;
    margin: 0 0 30px 0;
  }

  .mobile-menu-list li {
    padding: 15px 10px;
    font-size: 1.1rem;
    font-weight: 500;
    color: #2d3436;
    cursor: pointer;
    border-bottom: 1px solid #edf2f7;
    transition: background-color 0.2s ease;
  }

  .mobile-menu-list li:hover {
    background-color: #f8f9fc;
    color: #4a6cff;
  }

  .mobile-menu-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .navbar-button.mobile-full {
    width: 100%;
    padding: 12px 20px;
    font-size: 1rem;
  }

  @media (max-width: 1024px) {
    .navbar-menu {
      display: none;
    }

    .search-input {
      width: 150px;
    }

    .search-input:focus {
      width: 180px;
    }
  }

  @media (max-width: 768px) {
    .navbar-container {
      padding: 12px 20px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .navbar-actions {
      display: none;
    }

    .hamburger-menu {
      display: flex;
    }

    .search-form {
      width: 100%;
      order: 3;
      margin-top: 10px;
    }

    .search-input {
      width: 100%;
    }

    .mobile-menu {
      width: 85%;
    }
  }

  @media (max-width: 480px) {
    .navbar-container {
      padding: 10px 15px;
    }

    .navbar-logo h2 {
      font-size: 1.3rem;
    }

    .mobile-menu {
      width: 90%;
      padding: 70px 15px 15px;
    }

    .mobile-menu-list li {
      font-size: 1rem;
      padding: 12px 8px;
    }
  }
`;

export default Navbar;
