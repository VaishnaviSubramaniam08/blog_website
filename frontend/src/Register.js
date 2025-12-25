import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [hoverButton, setHoverButton] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const result = await register(name, email, password);

    if (result.success) {
      alert("Registration successful! Please login.");
      navigate("/login");
    } else {
      alert(result.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.splitLeft}>
        <img
          src="/what-is-a-blog-1.png" // replace with your image path
          alt="Register Illustration"
          style={styles.image}
        />
      </div>
      <div style={styles.splitRight}>
        <form onSubmit={handleRegister} style={styles.form}>
          <h2 style={styles.title}>Create an account</h2>

          <input type="text" name="name" placeholder="Full Name" required style={styles.input} />
          <input type="email" name="email" placeholder="Email Address" required style={styles.input} />
          <input type="password" name="password" placeholder="Password" required style={styles.input} />

          <button
            type="submit"
            style={hoverButton ? { ...styles.button, ...styles.buttonHover } : styles.button}
            onMouseEnter={() => setHoverButton(true)}
            onMouseLeave={() => setHoverButton(false)}
          >
            Register
          </button>

          <p style={styles.text}>
            Already have an account? <Link to="/login" style={styles.link}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  splitLeft: {
    flex: 1,
    background: "#afa4e8ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    
  },
  image: {
    width: "80%",
    height: "auto",
    objectFit: "cover",
  },
  splitRight: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#fff",
  },
  form: {
    width: "80%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },
  title: {
    marginBottom: 30,
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    marginBottom: 20,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
    outline: "none",
    transition: "0.3s",
  },
  button: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: 8,
    border: "none",
    background: "#667eea",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },
  buttonHover: {
    background: "#5a67d8",
    transform: "translateY(-2px)",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
  },
  text: {
    marginTop: 15,
    fontSize: 14,
    color: "#555",
  },
  link: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default Register;
