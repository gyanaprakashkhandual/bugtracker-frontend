// components/LuckySheetWrapper.jsx
import { useEffect, useRef, useState } from 'react';

export default function LuckySheetWrapper({ sheetData, onSave, title, onTitleChange }) {
  const luckysheetRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load LuckySheet CSS and JS dynamically
    loadLuckySheet().then(initLuckySheet);
    
    return () => {
      // Destroy LuckySheet instance on unmount
      if (window.luckysheet) {
        window.luckysheet.destroy();
      }
    };
  }, []);

  const loadLuckySheet = async () => {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/luckysheet@2.1.12/dist/plugins/css/pluginsCss.css';
    document.head.appendChild(link);

    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href = 'https://cdn.jsdelivr.net/npm/luckysheet@2.1.12/dist/plugins/plugins.css';
    document.head.appendChild(link2);

    const link3 = document.createElement('link');
    link3.rel = 'stylesheet';
    link3.href = 'https://cdn.jsdelivr.net/npm/luckysheet@2.1.12/dist/css/luckysheet.css';
    document.head.appendChild(link3);

    // Load JS
    await loadScript('https://cdn.jsdelivr.net/npm/luckysheet@2.1.12/dist/plugins/js/plugin.js');
    await loadScript('https://cdn.jsdelivr.net/npm/luckysheet@2.1.12/dist/luckysheet.umd.js');
  };

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const initLuckySheet = () => {
    if (!window.luckysheet) return;

    // Initialize LuckySheet
    window.luckysheet.create({
      container: 'luckysheet',
      showinfobar: false,
      data: sheetData ? [sheetData] : [getDefaultSheetConfig()],
      title: title || 'Untitled Sheet',
      hook: {
        // Auto-save on changes (optional)
        onCellUpdated: () => {
          // You can implement auto-save here if needed
        }
      }
    });
  };

  const getDefaultSheetConfig = () => {
    return {
      "name": "Sheet1",
      "color": "",
      "status": 1,
      "order": 0,
      "data": [],
      "config": {},
      "index": 0
    };
  };

  const handleSave = async () => {
    if (!window.luckysheet) return;

    setIsSaving(true);
    try {
      const currentData = window.luckysheet.getAllSheets();
      
      if (currentData && currentData.length > 0) {
        await onSave({
          title: title,
          data: currentData[0], // Get first sheet data
          version: sheetData?.version ? sheetData.version + 1 : 1
        });
      }
    } catch (error) {
      console.error('Error saving sheet:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-2xl font-bold border-none outline-none bg-transparent"
          placeholder="Sheet Title"
        />
        <div className="flex gap-2">
          <button
            onClick={() => window.luckysheet && window.luckysheet.download()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Export
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Sheet'}
          </button>
        </div>
      </div>

      {/* LuckySheet Container */}
      <div 
        id="luckysheet" 
        ref={luckysheetRef}
        className="flex-1 w-full"
        style={{ height: 'calc(100vh - 80px)' }}
      />
    </div>
  );
}