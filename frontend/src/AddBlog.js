import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { CATEGORIES } from "./config/categories";

function AddBlog() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/add-blog" } });
    }
  }, [isLoggedIn, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleCategory = (categoryName) => {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryName));
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("categories", JSON.stringify(selectedCategories));
      if (image) {
        formData.append("image", image);
      }

      const res = await fetch("http://localhost:5001/api/blogs/addblog", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        alert("Blog created successfully!");
        navigate("/");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create blog");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Failed to create blog. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const pageStyle = {
    minHeight: "100vh",
    backgroundColor: "#f8f9fc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  const formStyle = {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: 500,
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    marginBottom: 20,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: "1rem",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "#4a6cff",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  };

  return (
    <div style={pageStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: 20, color: "#1e272e" }}>Add New Blog</h2>

        <input
          style={inputStyle}
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          style={{ ...inputStyle, height: 200 }}
          placeholder="Write your blog content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 12, fontWeight: 600, color: "#2d3436" }}>
            Categories (Select one or more)
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: 20 }}>
            {CATEGORIES.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => toggleCategory(category.name)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: selectedCategories.includes(category.name)
                    ? `2px solid ${category.color}`
                    : "2px solid #e0e0e0",
                  backgroundColor: selectedCategories.includes(category.name)
                    ? category.color
                    : "white",
                  color: selectedCategories.includes(category.name) ? "white" : "#2d3436",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: selectedCategories.includes(category.name) ? 600 : 500,
                  transition: "all 0.2s ease",
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
          {selectedCategories.length > 0 && (
            <div style={{ marginBottom: 15 }}>
              <span style={{ fontSize: "0.9rem", color: "#636e72", marginRight: 10 }}>
                Selected ({selectedCategories.length}):
              </span>
              {selectedCategories.map((cat) => (
                <span
                  key={cat}
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    marginRight: "8px",
                    borderRadius: "12px",
                    backgroundColor: "#f0f0f0",
                    fontSize: "0.85rem",
                    color: "#2d3436",
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#2d3436" }}>
            Upload Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "block", marginBottom: 10 }}
          />
          {imagePreview && (
            <div style={{ marginTop: 10 }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          style={{
            ...buttonStyle,
            opacity: submitting ? 0.6 : 1,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Submit Blog"}
        </button>
      </form>
    </div>
  );
}

export default AddBlog;
