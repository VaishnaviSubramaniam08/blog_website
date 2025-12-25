// AddBlogButton.js
import React from "react";

function AddBlogButton({ onClick }) {
  const style = {
    padding: "12px 30px",
    fontSize: "1rem",
    fontWeight: "bold",
    background: "linear-gradient(90deg, #4a6cff, #6c9eff)",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
  };

  return (
    <button style={style} onClick={onClick}>
      ➕ Add Blog
    </button>
  );
}

export default AddBlogButton;
