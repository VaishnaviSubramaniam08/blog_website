import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Navbar({ onSearch }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
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
        </div>
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
  }

  .navbar-logo {
    cursor: pointer;
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
      flex-wrap: wrap;
      gap: 8px;
    }

    .search-form {
      width: 100%;
      order: 3;
    }

    .search-input {
      width: 100%;
    }

    .navbar-button {
      padding: 6px 12px;
      font-size: 0.85rem;
    }
  }
`;

export default Navbar;
