// components/TestTypeStats.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TestTypeStats({ detailed = false }) {
  const [projectStats, setProjectStats] = useState(null);

  useEffect(() => {
    fetchProjectStats();
  }, []);

  const fetchProjectStats = async () => {
    try {
      const projectId = localStorage.getItem("currentProjectId");
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/v1/bug/projects/${projectId}/bugs/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProjectStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching project stats:', error);
    }
  };

  if (!projectStats) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6">Test Type Analysis</h3>
      
      <div className="space-y-6">
        {/* Test Type Distribution */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Bugs by Test Type</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectStats.bugsByTestType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="testTypeName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Bug Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {detailed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test Type List */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Test Types Overview</h4>
              <div className="space-y-3">
                {projectStats.bugsByTestType.map((testType, index) => (
                  <div key={testType._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{testType.testTypeName}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {testType.count} bugs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700">Total Test Types</span>
                  <span className="font-bold text-green-800">{projectStats.bugsByTestType.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700">Highest Bug Count</span>
                  <span className="font-bold text-blue-800">
                    {Math.max(...projectStats.bugsByTestType.map(t => t.count))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}