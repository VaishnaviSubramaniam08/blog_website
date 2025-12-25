import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import BlogCard from "./BlogCard";

const styles = `
  @media (max-width: 1024px) {
    .card-wrapper {
      width: calc(50% - 13px) !important;
    }
  }

  @media (max-width: 768px) {
    .card-wrapper {
      width: 100% !important;
      max-width: 500px !important;
    }
  }
`;

function SavedBlogs() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/saved" } });
      return;
    }

    fetchSavedBlogs();
  }, [isLoggedIn, navigate]);

  const fetchSavedBlogs = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/blogs/saved/all", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setSavedBlogs(data);
      } else {
        console.error("Failed to fetch saved blogs");
      }
    } catch (error) {
      console.error("Error fetching saved blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const pageStyle = {
    minHeight: "100vh",
    backgroundColor: "#f8f9fc",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "40px 20px",
    color: "#2d3436",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: 50,
    position: "relative",
  };

  const backButtonStyle = {
    position: "absolute",
    left: "20px",
    top: "0",
    padding: "8px 20px",
    fontSize: "0.9rem",
    fontWeight: 600,
    backgroundColor: "white",
    color: "#4a6cff",
    border: "1px solid #4a6cff",
    borderRadius: "8px",
    cursor: "pointer",
  };

  const titleStyle = {
    fontSize: "2.5rem",
    fontWeight: 800,
    margin: "0 0 10px 0",
    color: "#1e272e",
  };

  const accentStyle = {
    color: "#4a6cff",
  };

  const subtitleStyle = {
    fontSize: "1.1rem",
    color: "#636e72",
    marginBottom: 25,
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  };

  const gridStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "25px",
    justifyContent: "center",
  };

  const cardWrapperStyle = {
    width: "calc(33.333% - 17px)",
    minWidth: "320px",
    maxWidth: "380px",
  };

  const emptyStateStyle = {
    textAlign: "center",
    padding: "60px 20px",
    gridColumn: "1 / -1",
  };

  const emptyIconStyle = {
    fontSize: "4rem",
    marginBottom: "20px",
  };

  const emptyTextStyle = {
    fontSize: "1.2rem",
    color: "#636e72",
    marginBottom: "15px",
  };

  const exploreButtonStyle = {
    padding: "12px 28px",
    fontSize: "1rem",
    fontWeight: 600,
    backgroundColor: "#4a6cff",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 4px 14px 0 rgba(74, 108, 255, 0.39)",
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading your saved blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div style={pageStyle}>
        <div style={headerStyle}>
        <button style={backButtonStyle} onClick={handleBack}>
          ← Back to Home
        </button>
        <h1 style={titleStyle}>
          My <span style={accentStyle}>Saved Blogs</span>
        </h1>
        <p style={subtitleStyle}>
          {savedBlogs.length > 0
            ? `You have ${savedBlogs.length} saved blog${savedBlogs.length > 1 ? "s" : ""}`
            : "No saved blogs yet"}
        </p>
      </div>

      <div style={containerStyle}>
        <section style={gridStyle}>
          {savedBlogs.length === 0 ? (
            <div style={{ ...emptyStateStyle, width: "100%" }}>
              <div style={emptyIconStyle}>🔖</div>
              <p style={emptyTextStyle}>You haven't saved any blogs yet</p>
              <p style={{ color: "#95a5a6", marginBottom: "30px" }}>
                Click the "Save" button on any blog to add it to your collection
              </p>
              <button style={exploreButtonStyle} onClick={handleBack}>
                Explore Blogs
              </button>
            </div>
          ) : (
            savedBlogs.map((blog) => (
              <div key={blog._id} className="card-wrapper" style={cardWrapperStyle}>
                <BlogCard
                  blog={blog}
                  isLoggedIn={isLoggedIn}
                  onUpdate={fetchSavedBlogs}
                />
              </div>
            ))
          )}
        </section>
      </div>
      </div>
    </>
  );
}

export default SavedBlogs;
