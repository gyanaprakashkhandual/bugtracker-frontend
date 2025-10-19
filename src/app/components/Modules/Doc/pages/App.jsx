// pages/documents/[id].jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TiptapEditor from '../component/Editor';

export default function DocumentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      const res = await fetch(`/api/documents/${id}`);
      const data = await res.json();
      setDocument(data);
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (documentData) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData),
      });
      
      if (res.ok) {
        const updatedDoc = await res.json();
        setDocument(updatedDoc);
        alert('Document saved successfully!');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Error saving document');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!document) return <div>Document not found</div>;

  return (
    <div className="container mx-auto p-6">
      <TiptapEditor document={document} onSave={handleSave} />
    </div>
  );
}