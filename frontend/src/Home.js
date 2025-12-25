import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import BlogCard from "./BlogCard";
import Navbar from "./Navbar";
import FeaturedPost from "./FeaturedPost";
import RecentPosts from "./RecentPosts";
import ChatIcon from "./components/ChatIcon";
import ChatPopup from "./components/ChatPopup";
import API_BASE_URL from "./config/api";

const styles = `
  .main-content-area {
    display: flex;
    gap: 40px;
  }

  .content-area {
    flex: 1;
  }

  .sidebar-area {
    width: 300px;
  }

  @media (max-width: 1024px) {
    .card-wrapper {
      width: calc(50% - 13px) !important;
    }

    .main-content-area {
      flex-direction: column;
    }

    .sidebar-area {
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    .card-wrapper {
      width: 100% !important;
      max-width: 500px !important;
    }
  }
`;

function Home() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/getblog`);
      const data = await res.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlog = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/" } });
    } else {
      navigate("/add-blog");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleViewSaved = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/" } });
    } else {
      navigate("/saved");
    }
  };

  const pageStyle = {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#2d3436",
  };

  const mainContentStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px 20px",
    display: "flex",
    gap: "40px",
  };

  const contentAreaStyle = {
    flex: "1",
  };

  const sidebarStyle = {
    width: "300px",
    position: "sticky",
    top: "80px",
    height: "fit-content",
  };

  const headerStyle = { textAlign: "center", marginBottom: 50, position: "relative" };
  const titleStyle = { fontSize: "2.5rem", fontWeight: 800, margin: "0 0 10px 0", color: "#1e272e" };
  const accentStyle = { color: "#4a6cff" };
  const subtitleStyle = { fontSize: "1.1rem", color: "#636e72", marginBottom: 25 };
  const mainButtonStyle = {
    padding: "12px 28px",
    fontSize: "1rem",
    fontWeight: 600,
    backgroundColor: "#4a6cff",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 4px 14px 0 rgba(74, 108, 255, 0.39)",
    marginRight: "10px",
  };
  const logoutButtonStyle = {
    position: "absolute",
    top: 0,
    right: "20px",
    padding: "8px 20px",
    fontSize: "0.9rem",
    fontWeight: 600,
    backgroundColor: "#ff4757",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  };

  const savedButtonStyle = {
    padding: "10px 24px",
    fontSize: "0.95rem",
    fontWeight: 600,
    backgroundColor: "white",
    color: "#4a6cff",
    border: "2px solid #4a6cff",
    borderRadius: "12px",
    cursor: "pointer",
    marginLeft: "10px",
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

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  // Filter blogs based on category and search
  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory =
      !selectedCategory || blog.categories?.includes(selectedCategory);
    const matchesSearch =
      !searchQuery ||
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.categories?.some((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // Deselect if clicking same category
    } else {
      setSelectedCategory(category);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedCategory(null); // Reset category when searching
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const handleChatClick = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/" } });
    } else {
      setIsChatOpen(true);
    }
  };

  const featuredBlog = filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  const otherBlogs = filteredBlogs.slice(1);

  return (
    <>
      <style>{styles}</style>
      <Navbar onSearch={handleSearch} />
      <div style={pageStyle}>
        <div style={mainContentStyle}>
          <div className="content-area" style={contentAreaStyle}>
            <FeaturedPost blog={featuredBlog} />

            <div style={{ marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#1e272e", margin: 0 }}>
                {selectedCategory ? `${selectedCategory} Articles` : searchQuery ? "Search Results" : "Latest Articles"}
              </h2>
              {(selectedCategory || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#636e72",
                  }}
                >
                  ✕ Clear Filters
                </button>
              )}
            </div>

            <div style={containerStyle}>
              <section style={gridStyle}>
                {otherBlogs.length === 0 ? (
                  <p style={{ textAlign: "center", width: "100%" }}>
                    No more blogs available. Create a new one!
                  </p>
                ) : (
                  otherBlogs.map((blog) => (
                    <div key={blog._id} className="card-wrapper" style={cardWrapperStyle}>
                      <BlogCard
                        blog={blog}
                        isLoggedIn={isLoggedIn}
                        onCategoryClick={handleCategoryClick}
                      />
                    </div>
                  ))
                )}
              </section>
            </div>
          </div>

          <div className="sidebar-area" style={sidebarStyle}>
            <RecentPosts
              blogs={blogs}
              onCategoryClick={handleCategoryClick}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>
      </div>

      {/* Chat Components */}
      <ChatIcon onClick={handleChatClick} />
      {isChatOpen && (
        <ChatPopup
          room="general"
          roomTitle="General Discussion"
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
}

export default Home;
