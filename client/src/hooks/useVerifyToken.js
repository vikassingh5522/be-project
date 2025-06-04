import axios from "axios";
import { useEffect, useState } from "react";

export const useVerifyToken = () => {
  // Initialize with undefined so we can differentiate between "not loaded" and "no user"
  const [user, setUser] = useState(undefined);
  const token = localStorage.getItem("token");
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const verifyToken = async () => {
    if (token) {
      try {
        const response = await axios.get(`${BASE_URL}/auth/verify`, {
          headers: {
            "Authorization": "Bearer " + token,
          },
        });
        setUser(response.data.user_data);
      } catch (error) {
        console.error("Error verifying token:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    verifyToken();
  }, [token]);

  return user;
};
