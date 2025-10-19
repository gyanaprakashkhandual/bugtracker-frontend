// pages/sheets/[id].jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LuckySheetWrapper from '../../components/LuckySheetWrapper';

export default function SheetPage() {
  const router = useRouter();
  const { id } = router.query;
  const [sheet, setSheet] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchSheet();
    } else {
      setLoading(false);
      setTitle('New Spreadsheet');
    }
  }, [id]);

  const fetchSheet = async () => {
    try {
      const res = await fetch(`/api/sheets/${id}`);
      const data = await res.json();
      setSheet(data);
      setTitle(data.title);
    } catch (error) {
      console.error('Error fetching sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (sheetData) => {
    try {
      const url = id === 'new' ? '/api/sheets' : `/api/sheets/${id}`;
      const method = id === 'new' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sheetData,
          project: router.query.projectId,
          testType: router.query.testTypeId
        }),
      });
      
      if (res.ok) {
        const savedSheet = await res.json();
        if (id === 'new') {
          router.replace(`/sheets/${savedSheet._id}`);
        } else {
          setSheet(savedSheet);
        }
        alert('Spreadsheet saved successfully!');
      }
    } catch (error) {
      console.error('Error saving sheet:', error);
      alert('Error saving spreadsheet');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="h-screen">
      <LuckySheetWrapper
        sheetData={sheet?.data}
        onSave={handleSave}
        title={title}
        onTitleChange={setTitle}
      />
    </div>
  );
}