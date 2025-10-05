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

    if (!projectId || !testTypeId || !token) {
      setError("Missing projectId, testTypeId, or token in localStorage");
      setLoading(false);
      return;
    }

    const fetchTestType = async () => {
      try {
        setLoading(true);
        const url = `http://localhost:5000/api/v1/test-type/projects/${projectId}/test-types`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const testTypes = response.data.testTypes || [];
        const found = testTypes.find((t) => t._id === testTypeId);

        if (found) {
          setTestTypeName(found.testTypeName);
        } else {
          setError("Test Type not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestType();
  }, []);

  return { testTypeName, loading, error };
};