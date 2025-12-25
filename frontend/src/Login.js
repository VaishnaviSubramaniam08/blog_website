import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useState } from "react";


function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [hoverButton, setHoverButton] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const result = await login(email, password);

    if (result.success) {
      alert("Login successful");
      navigate("/");
    } else {
      alert(result.message);
    }
  };

  return (
    <>
      <style>{responsiveStyles}</style>
      <div className="login-container">
        <div className="login-split-left">
          <img
            src="/blog_1.jpg"
            alt="Login Illustration"
            className="login-image"
          />
        </div>
        <div className="login-split-right">
          <form onSubmit={handleLogin} className="login-form">
            <h2 className="login-title">Login</h2>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className="login-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="login-input"
            />

            <button
              type="submit"
              className={`login-button ${hoverButton ? 'login-button-hover' : ''}`}
              onMouseEnter={() => setHoverButton(true)}
              onMouseLeave={() => setHoverButton(false)}
            >
              Login
            </button>

            <p className="login-text">
              Don't have an account? <Link to="/register" className="login-link">Register</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

const responsiveStyles = `
  .login-container {
    display: flex;
    min-height: 100vh;
    fontFamily: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .login-split-left {
    flex: 1;
    background: #b6a9e5ff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
  }

  .login-image {
    width: 80%;
    max-width: 500px;
    height: auto;
    object-fit: cover;
    border-radius: 5px;
  }

  .login-split-right {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    padding: 40px 20px;
  }

  .login-form {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .login-title {
    margin-bottom: 30px;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .login-input {
    width: 100%;
    padding: 12px 15px;
    margin-bottom: 20px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 16px;
    outline: none;
    transition: 0.3s;
    box-sizing: border-box;
  }

  .login-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .login-button {
    width: 100%;
    padding: 12px 15px;
    border-radius: 8px;
    border: none;
    background: #667eea;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
    min-height: 48px;
  }

  .login-button-hover {
    background: #5a67d8;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }

  .login-text {
    margin-top: 15px;
    font-size: 14px;
    color: #555;
  }

  .login-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
  }

  .login-link:hover {
    text-decoration: underline;
  }

  /* Tablet - Stack vertically */
  @media (max-width: 768px) {
    .login-container {
      flex-direction: column;
    }

    .login-split-left {
      min-height: 200px;
      padding: 30px 20px;
    }

    .login-image {
      width: 60%;
      max-width: 250px;
    }

    .login-split-right {
      padding: 40px 20px;
    }

    .login-form {
      max-width: 100%;
      padding: 0 10px;
    }

    .login-title {
      font-size: 22px;
      margin-bottom: 25px;
    }
  }

  /* Mobile - Compact layout */
  @media (max-width: 480px) {
    .login-split-left {
      min-height: 150px;
      padding: 20px;
    }

    .login-image {
      width: 50%;
      max-width: 180px;
    }

    .login-split-right {
      padding: 30px 15px;
    }

    .login-title {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .login-input {
      padding: 14px 15px;
      font-size: 16px;
      margin-bottom: 15px;
    }

    .login-button {
      padding: 14px 15px;
      font-size: 16px;
    }

    .login-text {
      font-size: 13px;
    }
  }
`;

export default Login;
