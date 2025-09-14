// src/app/utils/GetTestTypes.js
import axios from "axios";
import { getProjectDetails } from "./GetProjectDetails";

export const getTestTypes = async () => {
  try {
    // 1. Get project details (id)
    const project = await getProjectDetails();
    const projectId = project?._id; // <- backend gives _id, not projectid

    if (!projectId) throw new Error("Project ID not found");

    // 2. Get token
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token not found in localStorage");

    // 3. Fetch test types
    const response = await axios.get(
      `http://localhost:5000/api/v1/test-type/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // full object (success, count, data[])
  } catch (error) {
    console.error("Error fetching test types:", error.message);
    return null;
  }
};
