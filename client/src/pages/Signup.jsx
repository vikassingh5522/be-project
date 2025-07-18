import React, { useState } from "react";
import Svgfile from "../assets/login.jpg";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Footer from "./Home/Footer";
import { Shield } from "lucide-react";

const Signup = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    axios
      .post(
        `${BASE_URL}/auth/signup`,
        { username, email, password, role },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          console.log(response.data);
          localStorage.setItem("token", response.data.token);
          window.location.href = "/dashboard";
        } else {
          setError(response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error signing up:", error);
        setError("Invalid Credentials");
      });
  };

  return (
    <>
      <div className="w-full min-h-screen">
        <div className="flex w-full h-full">
          <div className="left w-1/2">
            <div className="p-4 flex h-16">
              <Shield className="h-8 w-8 mr-2 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">FairAI</h1>
            </div>
            <picture>
              <img src={Svgfile} alt="Signup illustration" />
            </picture>
          </div>
          <div className="right flex justify-center text-white bg-teal-600 items-center w-1/2">
            <div className="wrapper flex flex-col gap-2">
              <h1 className="text-4xl font-bold text-center mb-8">Signup</h1>
              <form onSubmit={handleSignup}>
                {error && <p className="text-center text-red-500">{error}</p>}
                
                <label>
                  Username
                  <input
                    type="text"
                    placeholder="Enter username"
                    className="w-full p-2 mb-4 mt-2 text-black border border-gray-300 rounded"
                    onChange={(e) => setUserName(e.target.value)}
                    value={username}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full p-2 mb-4 mt-2 border text-black border-gray-300 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Password
                  <div className="flex p-2 mb-4 border bg-white text-black rounded border-gray-300">
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
                      className="cursor-pointer flex items-center text-sm ml-2"
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </div>
                  </div>
                </label>

                <label>
                  Role
                  <select
                    className="w-full p-2 border text-black border-gray-300 rounded"
                    onChange={(e) => setRole(e.target.value)}
                    value={role}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </label>

                <button
                  className="w-full mt-4 bg-yellow-500 text-white p-2 rounded"
                  type="submit"
                >
                  Signup
                </button>
                
                <p className="text-center mt-2">
                  Already have an account?{" "}
                  <Link to="/auth/login" className="text-white hover:text-blue-500 underline">
                    Login
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;