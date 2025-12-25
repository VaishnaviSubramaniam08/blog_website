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

  if (loading) {
    return (
      <>
        <Navbar />
        <style>{editBlogStyles}</style>
        <div className="edit-blog-page">
          <div className="edit-blog-loading">
            <p>Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <style>{editBlogStyles}</style>
      <div className="edit-blog-page">
        <form className="edit-blog-form" onSubmit={handleSubmit}>
          <h2 className="edit-blog-title">Edit Blog Post</h2>

          <input
            className="edit-blog-input"
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="edit-blog-textarea"
            placeholder="Write your blog content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div className="edit-blog-categories-section">
            <label className="edit-blog-label">
              Categories (Select one or more)
            </label>
            <div className="edit-blog-categories-grid">
              {CATEGORIES.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => toggleCategory(category.name)}
                  className={`edit-blog-category-button ${
                    selectedCategories.includes(category.name) ? 'selected' : ''
                  }`}
                  style={{
                    borderColor: selectedCategories.includes(category.name)
                      ? category.color
                      : '#e0e0e0',
                    backgroundColor: selectedCategories.includes(category.name)
                      ? category.color
                      : 'white',
                    color: selectedCategories.includes(category.name) ? 'white' : '#2d3436',
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="edit-blog-image-section">
            <label className="edit-blog-label">
              Update Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="edit-blog-file-input"
            />
            {imagePreview && (
              <div className="edit-blog-image-preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="edit-blog-preview-image"
                />
              </div>
            )}
          </div>

          <div className="edit-blog-button-group">
            <button
              type="submit"
              className="edit-blog-submit-button"
              disabled={submitting}
            >
              {submitting ? "Saving Changes..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="edit-blog-cancel-button"
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

const editBlogStyles = `
  .edit-blog-page {
    min-height: 100vh;
    background-color: #f8f9fc;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .edit-blog-loading {
    text-align: center;
    padding: 40px;
  }

  .edit-blog-form {
    background-color: #fff;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    width: 100%;
    max-width: 700px;
  }

  .edit-blog-title {
    margin-bottom: 20px;
    color: #1e272e;
    font-size: 1.8rem;
    font-weight: 700;
  }

  .edit-blog-input,
  .edit-blog-textarea {
    width: 100%;
    padding: 12px 16px;
    margin-bottom: 20px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
    font-family: inherit;
    box-sizing: border-box;
    transition: border-color 0.3s ease;
  }

  .edit-blog-input:focus,
  .edit-blog-textarea:focus {
    outline: none;
    border-color: #4a6cff;
    box-shadow: 0 0 0 3px rgba(74, 108, 255, 0.1);
  }

  .edit-blog-textarea {
    min-height: 250px;
    resize: vertical;
  }

  .edit-blog-categories-section {
    margin-bottom: 20px;
  }

  .edit-blog-label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
    color: #2d3436;
    font-size: 0.95rem;
  }

  .edit-blog-categories-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }

  .edit-blog-category-button {
    padding: 8px 16px;
    border-radius: 20px;
    border: 2px solid;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    background-color: white;
    min-height: 36px;
  }

  .edit-blog-category-button.selected {
    font-weight: 600;
  }

  .edit-blog-category-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .edit-blog-image-section {
    margin-bottom: 20px;
  }

  .edit-blog-file-input {
    display: block;
    margin-bottom: 10px;
    font-size: 0.9rem;
  }

  .edit-blog-image-preview {
    margin-top: 10px;
  }

  .edit-blog-preview-image {
    max-width: 100%;
    max-height: 250px;
    border-radius: 8px;
    display: block;
  }

  .edit-blog-button-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .edit-blog-submit-button {
    padding: 12px 28px;
    background-color: #4a6cff;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 48px;
    flex: 1;
    min-width: 150px;
  }

  .edit-blog-submit-button:hover:not(:disabled) {
    background-color: #3a5ce5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 108, 255, 0.3);
  }

  .edit-blog-submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .edit-blog-cancel-button {
    padding: 12px 28px;
    background-color: white;
    color: #636e72;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 48px;
    flex: 1;
    min-width: 100px;
  }

  .edit-blog-cancel-button:hover {
    background-color: #f8f9fc;
    border-color: #d0d0d0;
  }

  /* Tablet Responsiveness */
  @media (max-width: 768px) {
    .edit-blog-page {
      padding: 30px 15px;
    }

    .edit-blog-form {
      padding: 30px 25px;
    }

    .edit-blog-title {
      font-size: 1.6rem;
    }

    .edit-blog-categories-grid {
      gap: 8px;
    }

    .edit-blog-category-button {
      padding: 7px 14px;
      font-size: 0.85rem;
    }

    .edit-blog-button-group {
      gap: 8px;
    }
  }

  /* Mobile Responsiveness */
  @media (max-width: 480px) {
    .edit-blog-page {
      padding: 20px 10px;
      align-items: flex-start;
    }

    .edit-blog-form {
      padding: 25px 20px;
      border-radius: 12px;
    }

    .edit-blog-title {
      font-size: 1.4rem;
      margin-bottom: 18px;
    }

    .edit-blog-input,
    .edit-blog-textarea {
      padding: 12px 14px;
      font-size: 16px;
      margin-bottom: 16px;
    }

    .edit-blog-textarea {
      min-height: 200px;
    }

    .edit-blog-label {
      font-size: 0.9rem;
      margin-bottom: 10px;
    }

    .edit-blog-categories-grid {
      gap: 6px;
    }

    .edit-blog-category-button {
      padding: 6px 12px;
      font-size: 0.8rem;
      flex: 1 1 auto;
      min-width: 90px;
    }

    .edit-blog-file-input {
      font-size: 0.85rem;
    }

    .edit-blog-preview-image {
      max-height: 180px;
    }

    .edit-blog-button-group {
      flex-direction: column;
      gap: 10px;
    }

    .edit-blog-submit-button,
    .edit-blog-cancel-button {
      width: 100%;
      padding: 14px 20px;
      min-width: unset;
    }
  }
`;

export default EditBlog;
