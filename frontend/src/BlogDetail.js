import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ChatIcon from "./components/ChatIcon";
import ChatPopup from "./components/ChatPopup";

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
      const res = await fetch(`http://localhost:5001/api/blogs/${id}`);
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
      const res = await fetch(`http://localhost:5001/api/blogs/${id}/like`, {
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
      const res = await fetch(`http://localhost:5001/api/blogs/${id}/save`, {
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
      const res = await fetch(`http://localhost:5001/api/blogs/${id}/comment`, {
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
      const res = await fetch(`http://localhost:5001/api/blogs/${id}`, {
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
        `http://localhost:5001/api/blogs/${id}/comment/${commentId}`,
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
        `http://localhost:5001/api/blogs/${id}/comment/${commentId}`,
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
      <div style={styles.container}>
        <p style={{ textAlign: "center" }}>Blog not found</p>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          ← Back to Home
        </button>

        <h1 style={styles.title}>{blog.title}</h1>

        <div style={styles.meta}>
          <span>By {blog.authorId?.name || "Unknown"}</span>
          <span>•</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>

        {blog.image && (
          <div style={styles.imageContainer}>
            <img
              src={`http://localhost:5001/uploads/${blog.image}`}
              alt={blog.title}
              style={styles.blogImage}
            />
          </div>
        )}

        <div style={styles.actions}>
          <button
            style={{
              ...styles.actionButton,
              backgroundColor: isLiked ? "#4a6cff" : "white",
              color: isLiked ? "white" : "#4a6cff",
            }}
            onClick={handleLike}
            disabled={!isLoggedIn}
          >
            ❤️ Like ({blog.likes?.length || 0})
          </button>

          <button
            style={{
              ...styles.actionButton,
              backgroundColor: isSaved ? "#4a6cff" : "white",
              color: isSaved ? "white" : "#4a6cff",
            }}
            onClick={handleSave}
            disabled={!isLoggedIn}
          >
            🔖 {isSaved ? "Saved" : "Save"}
          </button>

          {isLoggedIn && user && blog.authorId?._id === user._id && (
            <>
              <button
                style={{
                  ...styles.actionButton,
                  backgroundColor: "#ffa502",
                  color: "white",
                  border: "1px solid #ffa502",
                }}
                onClick={() => navigate(`/edit-blog/${id}`)}
              >
                ✏️ Edit
              </button>
              <button
                style={{
                  ...styles.actionButton,
                  backgroundColor: "#ff4757",
                  color: "white",
                  border: "1px solid #ff4757",
                }}
                onClick={handleDelete}
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>

        <div style={styles.blogContent}>
          <p>{blog.content}</p>
        </div>

        <div style={styles.commentsSection}>
          <h3>Comments ({blog.comments?.length || 0})</h3>

          <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
            <textarea
              style={styles.commentInput}
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
              style={styles.commentButton}
              disabled={!isLoggedIn}
            >
              Post Comment
            </button>
          </form>

          <div style={styles.commentsList}>
            {blog.comments && blog.comments.length > 0 ? (
              blog.comments.map((c) => (
                <div key={c._id} style={styles.comment}>
                  <div style={styles.commentHeader}>
                    <div>
                      <strong>{c.userId?.name || "Anonymous"}</strong>
                      <span style={styles.commentDate}>
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {isLoggedIn && user && c.userId?._id === user._id && (
                      <div style={styles.commentActions}>
                        <button
                          style={styles.commentActionBtn}
                          onClick={() => handleEditComment(c._id, c.message)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          style={{ ...styles.commentActionBtn, color: "#ff4757" }}
                          onClick={() => handleDeleteComment(c._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {editingCommentId === c._id ? (
                    <div style={styles.editCommentForm}>
                      <textarea
                        style={styles.editCommentInput}
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                      />
                      <div style={styles.editCommentButtons}>
                        <button
                          style={styles.updateButton}
                          onClick={() => handleUpdateComment(c._id)}
                        >
                          Update
                        </button>
                        <button
                          style={styles.cancelButton}
                          onClick={handleCancelEditComment}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={styles.commentText}>{c.message}</p>
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
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fc",
    padding: "40px 20px",
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  backButton: {
    padding: "8px 16px",
    backgroundColor: "white",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "20px",
    color: "#4a6cff",
    fontWeight: 600,
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 800,
    color: "#1e272e",
    marginBottom: "20px",
  },
  meta: {
    display: "flex",
    gap: "10px",
    fontSize: "0.9rem",
    color: "#95a5a6",
    marginBottom: "20px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
  },
  actionButton: {
    padding: "10px 20px",
    border: "1px solid #4a6cff",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
  },
  blogContent: {
    fontSize: "1.1rem",
    lineHeight: 1.8,
    color: "#2d3436",
    marginBottom: "40px",
    whiteSpace: "pre-wrap",
  },
  commentsSection: {
    borderTop: "2px solid #edf2f7",
    paddingTop: "30px",
  },
  commentForm: {
    marginTop: "20px",
    marginBottom: "30px",
  },
  commentInput: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "1rem",
    marginBottom: "10px",
    minHeight: "80px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  commentButton: {
    padding: "10px 20px",
    backgroundColor: "#4a6cff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  commentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  comment: {
    backgroundColor: "#f8f9fc",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #edf2f7",
  },
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  commentActions: {
    display: "flex",
    gap: "8px",
  },
  commentActionBtn: {
    padding: "4px 10px",
    fontSize: "0.75rem",
    fontWeight: 600,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "#f8f9fc",
    color: "#4a6cff",
    transition: "all 0.2s ease",
  },
  editCommentForm: {
    marginTop: "10px",
  },
  editCommentInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "0.95rem",
    minHeight: "80px",
    fontFamily: "inherit",
    resize: "vertical",
    marginBottom: "10px",
  },
  editCommentButtons: {
    display: "flex",
    gap: "10px",
  },
  updateButton: {
    padding: "8px 20px",
    backgroundColor: "#4a6cff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelButton: {
    padding: "8px 20px",
    backgroundColor: "#f8f9fc",
    color: "#636e72",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  commentDate: {
    fontSize: "0.8rem",
    color: "#95a5a6",
  },
  commentText: {
    margin: 0,
    color: "#2d3436",
  },
  imageContainer: {
    marginBottom: "30px",
    width: "100%",
    overflow: "hidden",
    borderRadius: "12px",
  },
  blogImage: {
    width: "100%",
    height: "auto",
    maxHeight: "500px",
    objectFit: "cover",
    borderRadius: "12px",
  },
};

export default BlogDetail;
