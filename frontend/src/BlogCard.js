import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategoryColor } from "./config/categories";
import API_BASE_URL from "./config/api";

function BlogCard({ blog, isLoggedIn, onCategoryClick }) {
  const navigate = useNavigate();

  const [likeCount, setLikeCount] = useState(blog.likes?.length || 0);
  const [commentCount] = useState(blog.comments?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAuthRedirect = () => {
    navigate("/login", { state: { from: "/" } });
  };

  const handleReadMore = () => {
    navigate(`/blog/${blog._id}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) return handleAuthRedirect();

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/blogs/${blog._id}/like`,
        { method: "PATCH", credentials: "include" }
      );

      if (res.ok) {
        const data = await res.json();
        setLikeCount(data.totalLikes);
        setIsLiked(data.isLiked);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) return handleAuthRedirect();

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/blogs/${blog._id}/save`,
        { method: "PATCH", credentials: "include" }
      );

      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.isSaved);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const actionBtn = (active = false) => ({
    padding: "6px 12px",
    fontSize: "0.85rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: active ? "#4a6cff" : "#fff",
    color: active ? "#fff" : "#333",
    cursor: "pointer",
    whiteSpace: "nowrap",
  });

  return (
    <div
      onClick={handleReadMore}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        cursor: "pointer",
        boxShadow: isHovered
          ? "0 15px 35px rgba(0,0,0,0.12)"
          : "0 10px 20px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease",
      }}
    >
      {blog.image && (
        <img
          src={`${API_BASE_URL}/uploads/${blog.image}`}
          alt={blog.title}
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "12px",
            marginBottom: "15px",
          }}
        />
      )}

      <h3 style={{ marginBottom: "6px" }}>{blog.title}</h3>

      <small style={{ color: "#888", marginBottom: "10px" }}>
        By {blog.authorId?.name || "Unknown Author"}
      </small>

      {/* CATEGORY TAGS */}
      {blog.categories && blog.categories.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginBottom: "12px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {blog.categories.map((cat) => (
            <span
              key={cat}
              onClick={(e) => {
                e.stopPropagation();
                if (onCategoryClick) {
                  onCategoryClick(cat);
                }
              }}
              style={{
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "0.7rem",
                fontWeight: 600,
                backgroundColor: `${getCategoryColor(cat)}15`,
                color: getCategoryColor(cat),
                border: `1px solid ${getCategoryColor(cat)}40`,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = getCategoryColor(cat);
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = `${getCategoryColor(cat)}15`;
                e.target.style.color = getCategoryColor(cat);
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      <p
        style={{
          color: "#555",
          flexGrow: 1,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          marginBottom: "15px",
        }}
      >
        {blog.content}
      </p>

      {/* ACTION BUTTONS */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <button onClick={handleLike} style={actionBtn(isLiked)}>
          ❤️ {likeCount}
        </button>

        <button style={actionBtn()}>
          💬 {commentCount}
        </button>

        <button onClick={handleSave} style={actionBtn(isSaved)}>
          🔖 Save
        </button>

        <button
          onClick={handleReadMore}
          style={{
            ...actionBtn(true),
            flexGrow: 1,
          }}
        >
          Read More →
        </button>
      </div>
    </div>
  );
}

export default BlogCard;
