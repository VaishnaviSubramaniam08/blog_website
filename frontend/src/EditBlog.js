import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Navbar from "./Navbar";
import { CATEGORIES } from "./config/categories";
import API_BASE_URL from "./config/api";

function EditBlog() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoggedIn, user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/edit-blog/${id}` } });
      return;
    }
    fetchBlog();
  }, [isLoggedIn, id, navigate]);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`);
      const data = await res.json();

      // Check if user is the author
      if (user && data.authorId._id !== user._id) {
        alert("You are not authorized to edit this post");
        navigate("/");
        return;
      }

      setTitle(data.title);
      setContent(data.content);
      setExistingImage(data.image);
      setSelectedCategories(data.categories || []);
      if (data.image) {
        setImagePreview(`${API_BASE_URL}/uploads/${data.image}`);
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      alert("Failed to load blog");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

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

      const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        alert("Blog updated successfully!");
        navigate(`/blog/${id}`);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update blog");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Failed to update blog. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/blog/${id}`);
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
    maxWidth: 700,
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
    padding: "12px 28px",
    backgroundColor: "#4a6cff",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    marginRight: "10px",
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: "white",
    color: "#636e72",
    border: "2px solid #e0e0e0",
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={pageStyle}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={pageStyle}>
        <form style={formStyle} onSubmit={handleSubmit}>
          <h2 style={{ marginBottom: 20, color: "#1e272e" }}>Edit Blog Post</h2>

          <input
            style={inputStyle}
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            style={{ ...inputStyle, height: 250 }}
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
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#2d3436" }}>
              Update Image (Optional)
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
                  style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "8px" }}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              style={{
                ...buttonStyle,
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
              disabled={submitting}
            >
              {submitting ? "Saving Changes..." : "Save Changes"}
            </button>
            <button
              type="button"
              style={cancelButtonStyle}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditBlog;
