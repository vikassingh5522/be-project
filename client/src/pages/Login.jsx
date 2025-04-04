import React, { useEffect, useState } from "react";
import Svgfile from "../assets/signup.svg";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useVerifyToken } from "../hooks/useVerifyToken";

const Login = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const user = useVerifyToken();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username || !password || !email || !role) {
      setError("All fields are required");
      return;
    }

    console.log(username, email, password, role);
    axios
      .post(
        "http://localhost:5000/auth/login",
        { username, email, password, role },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        if (response.data.success) {
          console.log(response.data);
          localStorage.setItem("token", response.data.token);
          localStorage.setItem('username', response.data.user_data.username);
          window.location.href = "/dashboard";
        } else {
          setError(response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        setError("Invalid Credentials");
      });
  };

  useEffect(() => {
    if (user?.role === "student" || user?.role === "teacher") {
      window.location.href = "/dashboard";
    }
  }, [user]);

  return (
    <div className="flex w-full min-h-screen">
      <div className="left w-1/2 bg-gray-100">
        <picture>
          <img src={Svgfile} alt="Placeholder" />
        </picture>
      </div>
      <div className="right flex justify-center items-center w-1/2">
        <div className="wrapper flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-center mb-8">Login</h1>
          <form onSubmit={handleLogin}>
            {error && <p className="text-center text-red-500">{error}</p>}
            <label>
              Username
              <input
                type="text"
                placeholder="Enter username"
                className="w-full p-2 mb-4 mt-2 border border-gray-300 rounded"
                onChange={(e) => setUserName(e.target.value)}
                value={username}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                placeholder="Enter email"
                className="w-full p-2 mb-4 mt-2 border border-gray-300 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <div className="flex p-2 mb-4 border rounded border-gray-300">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer text-sm ml-2"
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </div>
              </div>
            </label>
            <label>
              Role
              <select
                className="w-full p-2 border border-gray-300 rounded"
                onChange={(e) => setRole(e.target.value)}
                value={role}
              >
                <option value="">Select Role</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </label>
            <button
              className="w-full mt-4 bg-red-500 text-white p-2 rounded"
              type="submit"
            >
              Login
            </button>
            <p className="text-center mt-2">
              Don't have an account?{" "}
              <Link to="/auth/signup" className="text-blue-500 underline">
                signup
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
