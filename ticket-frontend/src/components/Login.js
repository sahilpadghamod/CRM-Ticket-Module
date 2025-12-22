import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost/ticket-api/api.php?action=login", { email, password });
      if (res.data.status) {
        localStorage.setItem("user", JSON.stringify(res.data.data));
        setUser(res.data.data);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("API Error");
    }
  };

return (
  <div className="auth-wrapper">
    <div className="auth-card">
      <h2>Welcome Back</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email Address" 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Sign In</button>
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  </div>
);
};

export default Login;