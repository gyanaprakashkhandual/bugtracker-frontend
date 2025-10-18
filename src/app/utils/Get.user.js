// utils/getUser.js

export const getUser = async () => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found in localStorage");
      return null;
    }

    // Call backend API
    const response = await fetch("http://localhost:5000/api/v1/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Pass token in headers
      },
    });

    // Handle response
    const data = await response.json();

    if (!response.ok) {
      console.error("Error fetching user:", data.message || "Unknown error");
      return null;
    }

    return data.user; // user object from backend
  } catch (error) {
    console.error("Error in getUser:", error);
    return null;
  }
};
