import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ChatIcon from "./components/ChatIcon";
import ChatPopup from "./components/ChatPopup";
import API_BASE_URL from "./config/api";

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchBlogDetail();
  }, [id]);

  const fetchBlogDetail = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`);
      const data = await res.json();
      setBlog(data);
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/blog/${id}` } });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/${id}/like`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.isLiked);
        fetchBlogDetail();
      }
    } catch (error) {
      console.error("Error liking blog:", error);
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/blog/${id}` } });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/${id}/save`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.isSaved);
        alert(data.message);
      }
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/blog/${id}` } });
      return;
    }

    if (!comment.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/${id}/comment`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: comment }),
      });

      if (res.ok) {
        setComment("");
        fetchBlogDetail(); // Refresh to get updated comments
        alert("Comment added successfully!");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        alert("Blog deleted successfully!");
        navigate("/");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog");
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditCommentText(currentText);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/blogs/${id}/comment/${commentId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: editCommentText }),
        }
      );

      if (res.ok) {
        setEditingCommentId(null);
        setEditCommentText("");
        fetchBlogDetail();
        alert("Comment updated successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update comment");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/blogs/${id}/comment/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        fetchBlogDetail();
        alert("Comment deleted successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  const handleChatClick = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/blog/${id}` } });
    } else {
      setIsChatOpen(true);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: "center" }}>Loading blog...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <>
        <style>{blogDetailStyles}</style>
        <div className="blog-detail-container">
          <div className="blog-detail-content">
            <p style={{ textAlign: "center" }}>Blog not found</p>
            <button className="blog-detail-back-button" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{blogDetailStyles}</style>
      <div className="blog-detail-container">
        <div className="blog-detail-content">
          <button className="blog-detail-back-button" onClick={() => navigate("/")}>
            ← Back to Home
          </button>

          <h1 className="blog-detail-title">{blog.title}</h1>

          <div className="blog-detail-meta">
            <span>By {blog.authorId?.name || "Unknown"}</span>
            <span>•</span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>

          {blog.image && (
            <div className="blog-detail-image-container">
              <img
                src={`${API_BASE_URL}/uploads/${blog.image}`}
                alt={blog.title}
                className="blog-detail-image"
              />
            </div>
          )}

          <div className="blog-detail-actions">
            <button
              className={`blog-detail-action-button ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={!isLoggedIn}
            >
              ❤️ Like ({blog.likes?.length || 0})
            </button>

            <button
              className={`blog-detail-action-button ${isSaved ? 'saved' : ''}`}
              onClick={handleSave}
              disabled={!isLoggedIn}
            >
              🔖 {isSaved ? "Saved" : "Save"}
            </button>

            {isLoggedIn && user && blog.authorId?._id === user._id && (
              <>
                <button
                  className="blog-detail-action-button edit"
                  onClick={() => navigate(`/edit-blog/${id}`)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="blog-detail-action-button delete"
                  onClick={handleDelete}
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>

          <div className="blog-detail-blog-content">
            <p>{blog.content}</p>
          </div>

          <div className="blog-detail-comments-section">
            <h3>Comments ({blog.comments?.length || 0})</h3>

            <form onSubmit={handleCommentSubmit} className="blog-detail-comment-form">
              <textarea
                className="blog-detail-comment-input"
                placeholder={
                  isLoggedIn
                    ? "Write a comment..."
                    : "Login to write a comment"
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!isLoggedIn}
              />
              <button
                type="submit"
                className="blog-detail-comment-button"
                disabled={!isLoggedIn}
              >
                Post Comment
              </button>
            </form>

            <div className="blog-detail-comments-list">
              {blog.comments && blog.comments.length > 0 ? (
                blog.comments.map((c) => (
                  <div key={c._id} className="blog-detail-comment">
                    <div className="blog-detail-comment-header">
                      <div>
                        <strong>{c.userId?.name || "Anonymous"}</strong>
                        <span className="blog-detail-comment-date">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {isLoggedIn && user && c.userId?._id === user._id && (
                        <div className="blog-detail-comment-actions">
                          <button
                            className="blog-detail-comment-action-btn"
                            onClick={() => handleEditComment(c._id, c.message)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="blog-detail-comment-action-btn delete"
                            onClick={() => handleDeleteComment(c._id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {editingCommentId === c._id ? (
                      <div className="blog-detail-edit-comment-form">
                        <textarea
                          className="blog-detail-edit-comment-input"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                        />
                        <div className="blog-detail-edit-comment-buttons">
                          <button
                            className="blog-detail-update-button"
                            onClick={() => handleUpdateComment(c._id)}
                          >
                            Update
                          </button>
                          <button
                            className="blog-detail-cancel-button"
                            onClick={handleCancelEditComment}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="blog-detail-comment-text">{c.message}</p>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: "#999", textAlign: "center" }}>
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Chat Components */}
        <ChatIcon onClick={handleChatClick} />
        {isChatOpen && (
          <ChatPopup
            room={`post-${id}`}
            roomTitle={`Chat: ${blog?.title || "Blog Discussion"}`}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>
    </>
  );
}

const blogDetailStyles = `
  .blog-detail-container {
    min-height: 100vh;
    background-color: #f8f9fc;
    padding: 40px 20px;
  }

  .blog-detail-content {
    max-width: 800px;
    margin: 0 auto;
    background-color: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .blog-detail-back-button {
    padding: 8px 16px;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 20px;
    color: #4a6cff;
    font-weight: 600;
    min-height: 40px;
  }

  .blog-detail-back-button:hover {
    background-color: #f8f9fc;
  }

  .blog-detail-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e272e;
    margin-bottom: 20px;
    line-height: 1.2;
  }

  .blog-detail-meta {
    display: flex;
    gap: 10px;
    font-size: 0.9rem;
    color: #95a5a6;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .blog-detail-image-container {
    margin-bottom: 30px;
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
  }

  .blog-detail-image {
    width: 100%;
    height: auto;
    max-height: 500px;
    object-fit: cover;
    border-radius: 12px;
  }

  .blog-detail-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  .blog-detail-action-button {
    padding: 10px 20px;
    border: 1px solid #4a6cff;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    background-color: white;
    color: #4a6cff;
    min-height: 40px;
  }

  .blog-detail-action-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(74, 108, 255, 0.2);
  }

  .blog-detail-action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .blog-detail-action-button.liked,
  .blog-detail-action-button.saved {
    background-color: #4a6cff;
    color: white;
  }

  .blog-detail-action-button.edit {
    background-color: #ffa502;
    color: white;
    border: 1px solid #ffa502;
  }

  .blog-detail-action-button.delete {
    background-color: #ff4757;
    color: white;
    border: 1px solid #ff4757;
  }

  .blog-detail-blog-content {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #2d3436;
    margin-bottom: 40px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .blog-detail-comments-section {
    border-top: 2px solid #edf2f7;
    padding-top: 30px;
  }

  .blog-detail-comment-form {
    margin-top: 20px;
    margin-bottom: 30px;
  }

  .blog-detail-comment-input {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    font-size: 1rem;
    margin-bottom: 10px;
    min-height: 80px;
    font-family: inherit;
    resize: vertical;
    box-sizing: border-box;
  }

  .blog-detail-comment-input:focus {
    outline: none;
    border-color: #4a6cff;
    box-shadow: 0 0 0 3px rgba(74, 108, 255, 0.1);
  }

  .blog-detail-comment-button {
    padding: 10px 20px;
    background-color: #4a6cff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    min-height: 40px;
  }

  .blog-detail-comment-button:hover:not(:disabled) {
    background-color: #3a5ce5;
  }

  .blog-detail-comment-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .blog-detail-comments-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .blog-detail-comment {
    background-color: #f8f9fc;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #edf2f7;
  }

  .blog-detail-comment-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    gap: 10px;
  }

  .blog-detail-comment-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .blog-detail-comment-action-btn {
    padding: 4px 10px;
    font-size: 0.75rem;
    font-weight: 600;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background-color: #f8f9fc;
    color: #4a6cff;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .blog-detail-comment-action-btn:hover {
    background-color: #e8ecff;
  }

  .blog-detail-comment-action-btn.delete {
    color: #ff4757;
  }

  .blog-detail-comment-date {
    font-size: 0.8rem;
    color: #95a5a6;
    display: block;
    margin-top: 4px;
  }

  .blog-detail-comment-text {
    margin: 0;
    color: #2d3436;
    word-wrap: break-word;
  }

  .blog-detail-edit-comment-form {
    margin-top: 10px;
  }

  .blog-detail-edit-comment-input {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    font-size: 0.95rem;
    min-height: 80px;
    font-family: inherit;
    resize: vertical;
    margin-bottom: 10px;
    box-sizing: border-box;
  }

  .blog-detail-edit-comment-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .blog-detail-update-button {
    padding: 8px 20px;
    background-color: #4a6cff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    min-height: 36px;
  }

  .blog-detail-cancel-button {
    padding: 8px 20px;
    background-color: #f8f9fc;
    color: #636e72;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    min-height: 36px;
  }

  /* Tablet Responsiveness */
  @media (max-width: 768px) {
    .blog-detail-container {
      padding: 20px 15px;
    }

    .blog-detail-content {
      padding: 25px 20px;
      border-radius: 12px;
    }

    .blog-detail-title {
      font-size: 1.8rem;
      margin-bottom: 15px;
    }

    .blog-detail-meta {
      font-size: 0.85rem;
    }

    .blog-detail-image {
      max-height: 350px;
    }

    .blog-detail-actions {
      gap: 8px;
    }

    .blog-detail-action-button {
      padding: 8px 14px;
      font-size: 0.85rem;
    }

    .blog-detail-blog-content {
      font-size: 1rem;
      line-height: 1.7;
    }

    .blog-detail-comment-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .blog-detail-comment-actions {
      margin-top: 8px;
    }
  }

  /* Mobile Responsiveness */
  @media (max-width: 480px) {
    .blog-detail-container {
      padding: 15px 10px;
    }

    .blog-detail-content {
      padding: 20px 15px;
      border-radius: 8px;
    }

    .blog-detail-title {
      font-size: 1.5rem;
      margin-bottom: 12px;
    }

    .blog-detail-meta {
      font-size: 0.8rem;
      gap: 8px;
    }

    .blog-detail-image {
      max-height: 250px;
    }

    .blog-detail-actions {
      gap: 6px;
    }

    .blog-detail-action-button {
      padding: 8px 12px;
      font-size: 0.8rem;
      flex: 1 1 auto;
      min-width: 80px;
    }

    .blog-detail-blog-content {
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .blog-detail-comment-input {
      font-size: 0.95rem;
      padding: 10px;
    }

    .blog-detail-comment-button {
      width: 100%;
    }

    .blog-detail-comment {
      padding: 12px;
    }

    .blog-detail-comment-action-btn {
      font-size: 0.7rem;
      padding: 4px 8px;
    }
  }
`;

export default BlogDetail;
