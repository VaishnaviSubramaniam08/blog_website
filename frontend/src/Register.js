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
    <>
      <style>{responsiveStyles}</style>
      <div className="register-container">
        <div className="register-split-left">
          <img
            src="/what-is-a-blog-1.png"
            alt="Register Illustration"
            className="register-image"
          />
        </div>
        <div className="register-split-right">
          <form onSubmit={handleRegister} className="register-form">
            <h2 className="register-title">Create an account</h2>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              className="register-input"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className="register-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="register-input"
            />

            <button
              type="submit"
              className={`register-button ${hoverButton ? 'register-button-hover' : ''}`}
              onMouseEnter={() => setHoverButton(true)}
              onMouseLeave={() => setHoverButton(false)}
            >
              Register
            </button>

            <p className="register-text">
              Already have an account? <Link to="/login" className="register-link">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

const responsiveStyles = `
  .register-container {
    display: flex;
    min-height: 100vh;
    fontFamily: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .register-split-left {
    flex: 1;
    background: #afa4e8ff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
  }

  .register-image {
    width: 80%;
    max-width: 500px;
    height: auto;
    object-fit: cover;
    border-radius: 5px;
  }

  .register-split-right {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    padding: 40px 20px;
  }

  .register-form {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .register-title {
    margin-bottom: 30px;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .register-input {
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

  .register-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .register-button {
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

  .register-button-hover {
    background: #5a67d8;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }

  .register-text {
    margin-top: 15px;
    font-size: 14px;
    color: #555;
  }

  .register-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
  }

  .register-link:hover {
    text-decoration: underline;
  }

  /* Tablet - Stack vertically */
  @media (max-width: 768px) {
    .register-container {
      flex-direction: column;
    }

    .register-split-left {
      min-height: 200px;
      padding: 30px 20px;
    }

    .register-image {
      width: 60%;
      max-width: 250px;
    }

    .register-split-right {
      padding: 40px 20px;
    }

    .register-form {
      max-width: 100%;
      padding: 0 10px;
    }

    .register-title {
      font-size: 22px;
      margin-bottom: 25px;
    }
  }

  /* Mobile - Compact layout */
  @media (max-width: 480px) {
    .register-split-left {
      min-height: 150px;
      padding: 20px;
    }

    .register-image {
      width: 50%;
      max-width: 180px;
    }

    .register-split-right {
      padding: 30px 15px;
    }

    .register-title {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .register-input {
      padding: 14px 15px;
      font-size: 16px;
      margin-bottom: 15px;
    }

    .register-button {
      padding: 14px 15px;
      font-size: 16px;
    }

    .register-text {
      font-size: 13px;
    }
  }
`;

export default Register;
