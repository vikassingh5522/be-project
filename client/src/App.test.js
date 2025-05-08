import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import axios from "axios";

// Mock axios
jest.mock("axios");

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe("Login Component", () => {
  test("renders all input fields and button", () => {
    renderLogin();

    expect(screen.getByPlaceholderText(/Enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  test("shows error when form is incomplete", async () => {
    renderLogin();

    fireEvent.click(screen.getByText("Login"));

    expect(await screen.findByText(/All fields are required/i)).toBeInTheDocument();
  });

  test("calls API and redirects on success", async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        token: "test-token",
        user_data: { username: "testuser", role: "student" },
      },
    });

    delete window.location;
    window.location = { href: "" };

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/Enter username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByDisplayValue("Select Role"), {
      target: { value: "student" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(window.location.href).toBe("/dashboard");
    });
  });

  test("displays error on login failure", async () => {
    axios.post.mockRejectedValue(new Error("Invalid Credentials"));

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/Enter username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.change(screen.getByDisplayValue("Select Role"), {
      target: { value: "student" },
    });

    fireEvent.click(screen.getByText("Login"));

    expect(await screen.findByText(/Invalid Credentials/i)).toBeInTheDocument();
  });
});
