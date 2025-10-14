// Navbar.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search } from 'lucide-react';
import * as api from '../service/api.service';

const Navbar = ({ projectId, testTypeId, currentDocId, onDocSelected, onCreateNew }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docs, setDocs] = useState([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      api.getDocsByProjectAndTestType(projectId, testTypeId).then((res) => setDocs(res.docs));
    }
  }, [isModalOpen, projectId, testTypeId]);

  return (
    <div className="h-12 bg-white flex items-center px-4 border-b text-sm">
      <button
        onClick={() => {
          onCreateNew();
          setNewTitle('');
        }}
        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded mr-4"
      >
        <Plus size={16} className="mr-2" /> Create Document
      </button>
      <input
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        placeholder="New doc title"
        className="p-2 border rounded mr-4"
      />
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center bg-gray-200 px-4 py-2 rounded"
      >
        <FileText size={16} className="mr-2" /> Open Docs
      </button>
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white p-4 rounded shadow w-96 max-h-[80vh] overflow-auto"
            >
              <h3 className="font-bold mb-2">Documents</h3>
              {docs.map((d) => (
                <div
                  key={d._id}
                  onClick={() => {
                    onDocSelected(d._id);
                    setIsModalOpen(false);
                  }}
                  className="p-2 border-b cursor-pointer hover:bg-gray-100"
                >
                  <p className="font-medium">{d.title}</p>
                  <p className="text-xs text-gray-500">{d.description}</p>
                </div>
              ))}
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-2 bg-gray-200 px-4 py-2 rounded text-xs"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;