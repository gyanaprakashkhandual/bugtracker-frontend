'use client';
import { useState, useEffect } from "react";
import axios from "axios";

export const useTestTypeName = () => {
  const [testTypeName, setTestTypeName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const projectId = localStorage.getItem("currentProjectId");
    const testTypeId = localStorage.getItem("selectedTestTypeId");
    const token = localStorage.getItem("token");

    console.log("📦 LocalStorage values:", { projectId, testTypeId });

    if (!projectId || !testTypeId || !token) {
      setError("Missing projectId, testTypeId, or token in localStorage");
      setLoading(false);
      return;
    }

    const fetchTestType = async () => {
      try {
        setLoading(true);
        const url = `http://localhost:5000/api/v1/test-type/projects/${projectId}/test-types`;
        console.log("🌐 Fetching test types from:", url);

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Test Types API Response:", response.data);

        const testTypes = response.data.testTypes || [];
        const found = testTypes.find((t) => t._id === testTypeId);

        if (found) {
          console.log("🎯 Found Test Type:", found);
          setTestTypeName(found.testTypeName);
        } else {
          setError("Test Type not found");
        }
      } catch (err) {
        console.error("❌ Error fetching test types:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestType();
  }, []);

  return { testTypeName, loading, error };
};
