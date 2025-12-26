import React from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config/api";

function RecentPosts({ blogs, onCategoryClick, selectedCategory }) {
  const navigate = useNavigate();
  const recentBlogs = blogs.slice(0, 5);

  // Get unique categories from all blogs with counts
  const categoryStats = blogs.reduce((acc, blog) => {
    if (blog.categories) {
      blog.categories.forEach((cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const categoriesWithCounts = Object.entries(categoryStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <>
      <style>{sidebarStyles}</style>
      <div className="sidebar-widget">
        <h3 className="sidebar-title">Recent Posts</h3>
        <div className="recent-posts-list">
          {recentBlogs.map((blog) => (
            <div
              key={blog._id}
              className="recent-post-item"
              onClick={() => navigate(`/blog/${blog._id}`)}
            >
              {blog.image && (
                <div className="recent-post-thumbnail">
                  <img
                    src={blog.image}
                    alt={blog.title}
                  />
                </div>
              )}
              <div className="recent-post-content">
                <h4 className="recent-post-title">{blog.title}</h4>
                <span className="recent-post-date">
                  {new Date(blog.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-widget">
        <h3 className="sidebar-title">Categories</h3>
        <div className="categories-list">
          {categoriesWithCounts.length > 0 ? (
            <>
              {selectedCategory && (
                <div
                  className="category-item"
                  onClick={() => onCategoryClick(null)}
                  style={{
                    backgroundColor: "#4a6cff",
                    color: "white",
                    marginBottom: "10px",
                  }}
                >
                  <span>✕ Show All Posts</span>
                </div>
              )}
              {categoriesWithCounts.map(({ name, count }) => (
                <div
                  key={name}
                  className="category-item"
                  onClick={() => onCategoryClick(name)}
                  style={{
                    backgroundColor:
                      selectedCategory === name ? "#4a6cff" : "#f8f9fc",
                    color: selectedCategory === name ? "white" : "#2d3436",
                  }}
                >
                  <span>{name}</span>
                  <span
                    className="category-count"
                    style={{
                      backgroundColor: "white",
                      color: selectedCategory === name ? "#4a6cff" : "#4a6cff",
                    }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <p style={{ textAlign: "center", color: "#95a5a6", fontSize: "0.9rem" }}>
              No categories yet
            </p>
          )}
        </div>
      </div>
    </>
  );
}

const sidebarStyles = `
  .sidebar-widget {
    background: #ffffff;
    border-radius: 16px;
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border: 1px solid #edf2f7;
  }

  .sidebar-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e272e;
    margin: 0 0 20px 0;
    padding-bottom: 15px;
    border-bottom: 2px solid #4a6cff;
  }

  .recent-posts-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .recent-post-item {
    display: flex;
    gap: 12px;
    cursor: pointer;
    padding: 10px;
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .recent-post-item:hover {
    background-color: #f8f9fc;
    transform: translateX(5px);
  }

  .recent-post-thumbnail {
    width: 70px;
    height: 70px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .recent-post-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .recent-post-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .recent-post-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #2d3436;
    margin: 0 0 5px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .recent-post-date {
    font-size: 0.75rem;
    color: #95a5a6;
  }

  .categories-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #f8f9fc;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    font-weight: 500;
    color: #2d3436;
  }

  .category-item:hover {
    background-color: #4a6cff;
    color: white;
    transform: translateX(5px);
  }

  .category-count {
    background-color: white;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #4a6cff;
  }

  .category-item:hover .category-count {
    background-color: white;
    color: #4a6cff;
  }

  @media (max-width: 1024px) {
    .sidebar-widget {
      display: none;
    }
  }
`;

export default RecentPosts;
