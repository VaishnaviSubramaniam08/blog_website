import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { CATEGORIES } from "./config/categories";
import API_BASE_URL from "./config/api";

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

      const res = await fetch(`${API_BASE_URL}/api/blogs/addblog`, {
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

  return (
    <>
      <style>{addBlogStyles}</style>
      <div className="add-blog-page">
        <form className="add-blog-form" onSubmit={handleSubmit}>
          <h2 className="add-blog-title">Add New Blog</h2>

          <input
            className="add-blog-input"
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="add-blog-textarea"
            placeholder="Write your blog content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div className="add-blog-categories-section">
            <label className="add-blog-label">
              Categories (Select one or more)
            </label>
            <div className="add-blog-categories-grid">
              {CATEGORIES.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => toggleCategory(category.name)}
                  className={`add-blog-category-button ${
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
            {selectedCategories.length > 0 && (
              <div className="add-blog-selected-categories">
                <span className="add-blog-selected-label">
                  Selected ({selectedCategories.length}):
                </span>
                {selectedCategories.map((cat) => (
                  <span key={cat} className="add-blog-selected-tag">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="add-blog-image-section">
            <label className="add-blog-label">
              Upload Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="add-blog-file-input"
            />
            {imagePreview && (
              <div className="add-blog-image-preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="add-blog-preview-image"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="add-blog-submit-button"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Submit Blog"}
          </button>
        </form>
      </div>
    </>
  );
}

const addBlogStyles = `
  .add-blog-page {
    min-height: 100vh;
    background-color: #f8f9fc;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .add-blog-form {
    background-color: #fff;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    width: 100%;
    max-width: 600px;
  }

  .add-blog-title {
    margin-bottom: 20px;
    color: #1e272e;
    font-size: 1.8rem;
    font-weight: 700;
  }

  .add-blog-input,
  .add-blog-textarea {
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

  .add-blog-input:focus,
  .add-blog-textarea:focus {
    outline: none;
    border-color: #4a6cff;
    box-shadow: 0 0 0 3px rgba(74, 108, 255, 0.1);
  }

  .add-blog-textarea {
    min-height: 200px;
    resize: vertical;
  }

  .add-blog-categories-section {
    margin-bottom: 20px;
  }

  .add-blog-label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
    color: #2d3436;
    font-size: 0.95rem;
  }

  .add-blog-categories-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }

  .add-blog-category-button {
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

  .add-blog-category-button.selected {
    font-weight: 600;
  }

  .add-blog-category-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .add-blog-selected-categories {
    margin-bottom: 15px;
  }

  .add-blog-selected-label {
    font-size: 0.9rem;
    color: #636e72;
    margin-right: 10px;
    display: inline-block;
    margin-bottom: 8px;
  }

  .add-blog-selected-tag {
    display: inline-block;
    padding: 4px 12px;
    margin-right: 8px;
    margin-bottom: 8px;
    border-radius: 12px;
    background-color: #f0f0f0;
    font-size: 0.85rem;
    color: #2d3436;
  }

  .add-blog-image-section {
    margin-bottom: 20px;
  }

  .add-blog-file-input {
    display: block;
    margin-bottom: 10px;
    font-size: 0.9rem;
  }

  .add-blog-image-preview {
    margin-top: 10px;
  }

  .add-blog-preview-image {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    display: block;
  }

  .add-blog-submit-button {
    width: 100%;
    padding: 12px 16px;
    background-color: #4a6cff;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 48px;
  }

  .add-blog-submit-button:hover:not(:disabled) {
    background-color: #3a5ce5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 108, 255, 0.3);
  }

  .add-blog-submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* Tablet Responsiveness */
  @media (max-width: 768px) {
    .add-blog-page {
      padding: 30px 15px;
    }

    .add-blog-form {
      padding: 30px 25px;
    }

    .add-blog-title {
      font-size: 1.6rem;
    }

    .add-blog-categories-grid {
      gap: 8px;
    }

    .add-blog-category-button {
      padding: 7px 14px;
      font-size: 0.85rem;
    }
  }

  /* Mobile Responsiveness */
  @media (max-width: 480px) {
    .add-blog-page {
      padding: 20px 10px;
      align-items: flex-start;
    }

    .add-blog-form {
      padding: 25px 20px;
      border-radius: 12px;
    }

    .add-blog-title {
      font-size: 1.4rem;
      margin-bottom: 18px;
    }

    .add-blog-input,
    .add-blog-textarea {
      padding: 12px 14px;
      font-size: 16px;
      margin-bottom: 16px;
    }

    .add-blog-textarea {
      min-height: 180px;
    }

    .add-blog-label {
      font-size: 0.9rem;
      margin-bottom: 10px;
    }

    .add-blog-categories-grid {
      gap: 6px;
    }

    .add-blog-category-button {
      padding: 6px 12px;
      font-size: 0.8rem;
      flex: 1 1 auto;
      min-width: 90px;
    }

    .add-blog-selected-label {
      font-size: 0.85rem;
    }

    .add-blog-selected-tag {
      font-size: 0.8rem;
      padding: 3px 10px;
    }

    .add-blog-file-input {
      font-size: 0.85rem;
    }

    .add-blog-preview-image {
      max-height: 150px;
    }

    .add-blog-submit-button {
      padding: 14px 16px;
      font-size: 1rem;
    }
  }
`;

export default AddBlog;
