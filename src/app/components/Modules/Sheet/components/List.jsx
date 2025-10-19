// components/SheetList.jsx
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SheetList({ projectId, testTypeId }) {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId && testTypeId) {
      fetchSheets();
    }
  }, [projectId, testTypeId]);

  const fetchSheets = async () => {
    try {
      const res = await fetch(`/api/sheets/project/${projectId}/test-type/${testTypeId}`);
      const data = await res.json();
      setSheets(data);
    } catch (error) {
      console.error('Error fetching sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading sheets...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Spreadsheets</h2>
        <Link 
          href={`/projects/${projectId}/test-types/${testTypeId}/sheets/new`}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Create New Sheet
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sheets.map(sheet => (
          <div key={sheet._id} className="border rounded-lg p-4 hover:shadow-md bg-white">
            <Link href={`/sheets/${sheet._id}`}>
              <div className="cursor-pointer">
                <h3 className="text-xl font-semibold mb-2 truncate">{sheet.title}</h3>
                <p className="text-gray-600 text-sm">Created by: {sheet.createdBy?.name}</p>
                <p className="text-gray-500 text-sm">
                  Last updated: {new Date(sheet.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          </div>
        ))}
        
        {sheets.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No spreadsheets found</p>
            <p className="text-gray-400">Create your first spreadsheet to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}