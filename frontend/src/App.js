import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import AddBlog from "./AddBlog";
import EditBlog from "./EditBlog";
import BlogDetail from "./BlogDetail";
import SavedBlogs from "./SavedBlogs";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={styles.container}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add-blog" element={<AddBlog />} />
            <Route path="/edit-blog/:id" element={<EditBlog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/saved" element={<SavedBlogs />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#eef2ff",
  },
};

export default App;
