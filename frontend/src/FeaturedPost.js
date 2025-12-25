import React from "react";
import { useNavigate } from "react-router-dom";

function FeaturedPost({ blog }) {
  const navigate = useNavigate();

  if (!blog) return null;

  return (
    <>
      <style>{featuredStyles}</style>
      <div className="featured-post" onClick={() => navigate(`/blog/${blog._id}`)}>
        {blog.image && (
          <div className="featured-image">
            <img
              src={`http://localhost:5001/uploads/${blog.image}`}
              alt={blog.title}
            />
          </div>
        )}
        <div className="featured-content">
          <span className="featured-badge">Featured Post</span>
          <h1 className="featured-title">{blog.title}</h1>
          <div className="featured-meta">
            <span className="featured-author">
              By {blog.authorId?.name || "Unknown"}
            </span>
            <span className="featured-date">
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <p className="featured-description">
            {blog.content.substring(0, 200)}
            {blog.content.length > 200 ? "..." : ""}
          </p>
          <button className="featured-button">Read Full Article →</button>
        </div>
      </div>
    </>
  );
}

const featuredStyles = `
  .featured-post {
    background: linear-gradient(135deg, #f8f9fc 0%, #ffffff 100%);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid #edf2f7;
  }

  .featured-post:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .featured-image {
    width: 100%;
    height: 450px;
    overflow: hidden;
  }

  .featured-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .featured-post:hover .featured-image img {
    transform: scale(1.05);
  }

  .featured-content {
    padding: 40px;
  }

  .featured-badge {
    display: inline-block;
    padding: 6px 16px;
    background-color: #4a6cff;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-radius: 20px;
    margin-bottom: 20px;
  }

  .featured-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e272e;
    margin: 15px 0;
    line-height: 1.2;
  }

  .featured-meta {
    display: flex;
    gap: 15px;
    align-items: center;
    margin-bottom: 20px;
    font-size: 0.95rem;
    color: #636e72;
  }

  .featured-author {
    font-weight: 600;
    color: #2d3436;
  }

  .featured-date {
    padding-left: 15px;
    border-left: 2px solid #e0e0e0;
  }

  .featured-description {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #2d3436;
    margin-bottom: 30px;
  }

  .featured-button {
    padding: 12px 30px;
    background-color: #4a6cff;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .featured-button:hover {
    background-color: #3a5ce5;
    transform: translateX(5px);
  }

  @media (max-width: 768px) {
    .featured-image {
      height: 250px;
    }

    .featured-content {
      padding: 25px;
    }

    .featured-title {
      font-size: 1.8rem;
    }

    .featured-description {
      font-size: 1rem;
    }
  }
`;

export default FeaturedPost;
