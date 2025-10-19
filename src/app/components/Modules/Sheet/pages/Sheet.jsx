'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings,
  Grid3x3,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';
import { useProject } from '@/app/script/Project.context';
import { useSheet } from '@/app/script/Sheet.context';

const SheetComponent = () => {
  const { showAlert } = useAlert();
  const { selectedProject } = useProject();
  const projectId = selectedProject?._id;
  const { testTypeId, testTypeName } = useTestType();
  const { sheetId, sheetName } = useSheet();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sheetData, setSheetData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const luckysheetRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const luckysheetInstance = useRef(null);

  const BASE_URL = 'http://localhost:5000/api/v1/sheet';

  // Debug logging
  useEffect(() => {
    console.log('🔍 SheetComponent Debug:', {
      sheetId,
      sheetName,
      testTypeId,
      testTypeName,
      projectId,
      selectedProject: selectedProject?.name,
      isLoading,
      sheetData: sheetData ? 'Loaded' : 'Not loaded',
      luckysheetAvailable: typeof window !== 'undefined' && !!window.luckysheet
    });
  }, [sheetId, sheetName, testTypeId, projectId, isLoading, sheetData]);

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // API Headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  });

  // Fetch sheet data
  const fetchSheetData = async () => {
    console.log('🚀 Starting fetchSheetData...');
    console.log('📋 Sheet ID:', sheetId);
    console.log('🔑 Token:', getToken() ? 'Present' : 'Missing');

    if (!sheetId) {
      console.error('❌ No sheetId provided');
      showAlert?.('No sheet ID provided', 'error');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('📡 Fetching from:', `${BASE_URL}/${sheetId}`);

      const response = await fetch(`${BASE_URL}/${sheetId}`, {
        method: 'GET',
        headers: getHeaders()
      });

      console.log('📬 Response status:', response.status);
      console.log('📬 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch sheet data: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Sheet data received:', data);
      console.log('📊 Sheet data structure:', {
        hasData: !!data.data,
        dataType: typeof data.data,
        dataLength: Array.isArray(data.data) ? data.data.length : 'Not array'
      });

      setSheetData(data);
      initializeLuckysheet(data.data);
      setLastSaved(new Date(data.updatedAt));
      showAlert?.('Sheet loaded successfully', 'success');
    } catch (error) {
      console.error('💥 Error fetching sheet:', error);
      console.error('💥 Error stack:', error.stack);
      showAlert?.(`Failed to load sheet: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
      console.log('🏁 fetchSheetData completed');
    }
  };

  // Save sheet data
  const saveSheetData = async (data = null) => {
    try {
      setIsSaving(true);

      const sheetDataToSave = data || (luckysheetInstance.current ?
        window.luckysheet.getAllSheets() : sheetData?.data);

      const payload = {
        data: sheetDataToSave,
        version: (sheetData?.version || 0) + 1,
        testType: testTypeId,
        project: projectId
      };

      const response = await fetch(`${BASE_URL}/${sheetId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save sheet data');
      }

      const updatedData = await response.json();
      setSheetData(updatedData);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      showAlert?.('Sheet saved successfully', 'success');

      return true;
    } catch (error) {
      console.error('Error saving sheet:', error);
      showAlert?.('Failed to save sheet', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Initialize Luckysheet
  const initializeLuckysheet = (data) => {
    console.log('🎨 Initializing Luckysheet...');
    console.log('🌍 Window available:', typeof window !== 'undefined');
    console.log('📦 Luckysheet available:', typeof window !== 'undefined' && !!window.luckysheet);
    console.log('📋 Data received:', data);

    if (typeof window === 'undefined' || !window.luckysheet) {
      console.warn('⚠️ Luckysheet not available yet');
      return;
    }

    const container = luckysheetRef.current;
    if (!container) {
      console.error('❌ Container ref not found');
      return;
    }

    console.log('📦 Container found:', container);

    // Destroy existing instance
    if (luckysheetInstance.current) {
      console.log('🗑️ Destroying existing instance');
      window.luckysheet.destroy();
    }

    const sheetDataToUse = data && data.length > 0 ? data : [getDefaultSheetData()];
    console.log('📊 Using sheet data:', sheetDataToUse);

    const options = {
      container: 'luckysheet',
      data: sheetDataToUse,
      title: sheetData?.title || sheetName || 'Untitled Sheet',
      lang: 'en',
      showinfobar: false,
      showsheetbar: true,
      showstatisticBar: true,
      sheetBottomConfig: true,
      allowCopy: true,
      allowEdit: true,
      enableAddRow: true,
      enableAddCol: true,
      userInfo: false,
      myFolderUrl: '',
      devicePixelRatio: 1,
      plugins: [],
      hook: {
        cellUpdated: (r, c, oldValue, newValue, isRefresh) => {
          console.log('📝 Cell updated:', { r, c, oldValue, newValue });
          handleSheetChange();
        },
        rangeSelect: (sheet, range) => {
          console.log('🎯 Range selected:', { sheet, range });
          handleSheetChange();
        },
        sheetActivate: (index) => {
          console.log('📄 Sheet activated:', index);
          handleSheetChange();
        }
      }
    };

    console.log('⚙️ Luckysheet options:', options);

    try {
      window.luckysheet.create(options);
      luckysheetInstance.current = true;
      console.log('✅ Luckysheet initialized successfully');
    } catch (error) {
      console.error('💥 Error initializing Luckysheet:', error);
    }
  };

  // Handle sheet changes
  const handleSheetChange = () => {
    setHasUnsavedChanges(true);

    if (autoSaveEnabled) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer for auto-save after 3 seconds of inactivity
      autoSaveTimerRef.current = setTimeout(() => {
        saveSheetData();
      }, 3000);
    }
  };

  // Manual save
  const handleManualSave = async () => {
    await saveSheetData();
  };

  // Export to Excel
  const handleExport = () => {
    if (window.luckysheet) {
      window.luckysheet.exportXlsx(`${sheetData?.title || 'sheet'}.xlsx`);
      showAlert?.('Sheet exported successfully', 'success');
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    await fetchSheetData();
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Load Luckysheet CSS and JS
  useEffect(() => {
    console.log('🔧 Setting up Luckysheet resources...');
    if (typeof window === 'undefined') {
      console.log('⚠️ Window not available (SSR)');
      return;
    }

    let isMounted = true;

    // Load CSS from unpkg (more reliable)
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/css/pluginsCss.css';
    cssLink.onload = () => console.log('✅ CSS 1 loaded');
    cssLink.onerror = () => console.error('❌ CSS 1 failed to load');
    document.head.appendChild(cssLink);

    const cssLink2 = document.createElement('link');
    cssLink2.rel = 'stylesheet';
    cssLink2.href = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/plugins.css';
    cssLink2.onload = () => console.log('✅ CSS 2 loaded');
    cssLink2.onerror = () => console.error('❌ CSS 2 failed to load');
    document.head.appendChild(cssLink2);

    const cssLink3 = document.createElement('link');
    cssLink3.rel = 'stylesheet';
    cssLink3.href = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/css/luckysheet.css';
    cssLink3.onload = () => console.log('✅ CSS 3 loaded');
    cssLink3.onerror = () => console.error('❌ CSS 3 failed to load');
    document.head.appendChild(cssLink3);

    // Load JS from jsdelivr
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/js/plugin.js';
    script.async = true;
    script.onload = () => console.log('✅ Plugin JS loaded');
    script.onerror = () => console.error('❌ Plugin JS failed to load');
    document.body.appendChild(script);

    const script2 = document.createElement('script');
    script2.src = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js';
    script2.async = true;
    script2.onload = () => {
      console.log('✅ Luckysheet JS loaded');
      console.log('📦 Luckysheet object:', window.luckysheet);
      console.log('🆔 SheetId on load:', sheetId);

      // Add a small delay to ensure everything is ready
      setTimeout(() => {
        if (isMounted && sheetId) {
          console.log('🚀 Triggering fetchSheetData from script load...');
          fetchSheetData();
        } else {
          console.warn('⚠️ Cannot fetch:', { isMounted, sheetId });
        }
      }, 100);
    };
    script2.onerror = () => console.error('❌ Luckysheet JS failed to load');
    document.body.appendChild(script2);

    return () => {
      console.log('🧹 Cleaning up Luckysheet resources...');
      isMounted = false;

      // Safe cleanup - check if elements still exist
      if (cssLink.parentNode) document.head.removeChild(cssLink);
      if (cssLink2.parentNode) document.head.removeChild(cssLink2);
      if (cssLink3.parentNode) document.head.removeChild(cssLink3);
      if (script.parentNode) document.body.removeChild(script);
      if (script2.parentNode) document.body.removeChild(script2);

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      if (luckysheetInstance.current && window.luckysheet) {
        try {
          window.luckysheet.destroy();
        } catch (e) {
          console.log('Error destroying luckysheet:', e);
        }
      }
    };
  }, []);

  // Separate effect to fetch data when sheetId changes
  useEffect(() => {
    console.log('🔄 SheetId changed effect triggered:', sheetId);

    if (sheetId && window.luckysheet) {
      console.log('🚀 Triggering fetchSheetData from sheetId change...');
      fetchSheetData();
    } else {
      console.log('⏳ Waiting for conditions:', {
        hasSheetId: !!sheetId,
        hasLuckysheet: !!(typeof window !== 'undefined' && window.luckysheet)
      });
    }
  }, [sheetId]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Default sheet data
  const getDefaultSheetData = () => ({
    name: 'Sheet1',
    color: '',
    status: 1,
    order: 0,
    data: [],
    config: {},
    index: 0,
    chart: [],
    zoomRatio: 1
  });

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return lastSaved.toLocaleString();
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} flex flex-col h-full bg-gray-900`}>
      {/* Header Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 shadow-lg"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <div>
              <h1 className="text-lg font-semibold text-white">
                {sheetData?.title || 'Loading...'}
              </h1>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span>{testTypeName}</span>
                <span>•</span>
                <span>{sheetName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Save Status */}
          <div className="flex items-center space-x-2 text-sm">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-gray-300">Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Unsaved changes</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-400">Saved {formatLastSaved()}</span>
              </>
            )}
          </div>

          {/* Auto-save Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2"
            />
            <span className="text-sm text-gray-300">Auto-save</span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullscreen}
              className="p-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Luckysheet Container */}
      <div className="flex-1 relative overflow-hidden bg-gray-900">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gray-900 z-50"
            >
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading sheet...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={luckysheetRef}
          id="luckysheet"
          className="w-full h-full"
          style={{
            margin: 0,
            padding: 0,
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0
          }}
        />
      </div>

      {/* Footer Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400"
      >
        <div className="flex items-center space-x-4">
          <span>Project: {selectedProject?.name || 'N/A'}</span>
          <span>•</span>
          <span>Version: {sheetData?.version || 1}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Created by: {sheetData?.createdBy?.name || 'Unknown'}</span>
          {sheetData?.createdAt && (
            <>
              <span>•</span>
              <span>Created: {new Date(sheetData.createdAt).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Custom Styles for Dark Theme */}
      <style jsx global>{`
        #luckysheet {
          background: #111827 !important;
        }
        
        .luckysheet-cell-input {
          background: #1f2937 !important;
          color: #f3f4f6 !important;
          border-color: #374151 !important;
        }
        
        .luckysheet-grid-window {
          background: #111827 !important;
        }
        
        .luckysheet-cell {
          color: #f3f4f6 !important;
          border-color: #374151 !important;
        }
        
        .luckysheet-grid-window-1 {
          background: #1f2937 !important;
        }
        
        .luckysheet-toolbar {
          background: #1f2937 !important;
          border-color: #374151 !important;
        }
        
        .luckysheet-toolbar-button {
          color: #d1d5db !important;
        }
        
        .luckysheet-toolbar-button:hover {
          background: #374151 !important;
        }
        
        .luckysheet-toolbar-menu-button {
          color: #d1d5db !important;
        }
        
        .luckysheet-cols-rows-shift {
          background: #1f2937 !important;
        }
        
        .luckysheet-cols-rows-shift-size {
          background: #374151 !important;
        }
        
        .luckysheet-cols-menu {
          background: #1f2937 !important;
          border-color: #374151 !important;
        }
        
        .luckysheet-rightclick-menu {
          background: #1f2937 !important;
          border-color: #374151 !important;
          color: #f3f4f6 !important;
        }
        
        .luckysheet-cols-menu-item:hover,
        .luckysheet-rightclick-menu-item:hover {
          background: #374151 !important;
        }
        
        .luckysheet-sheet-container-menu-item {
          color: #d1d5db !important;
        }
        
        .luckysheet-sheet-container-menu-item:hover {
          background: #374151 !important;
        }
        
        .luckysheet-stat-area {
          background: #1f2937 !important;
          color: #d1d5db !important;
        }
        
        .luckysheet-scrollbar-ltr {
          background: #1f2937 !important;
        }
        
        .luckysheet-scrollbar-ltr::-webkit-scrollbar-thumb {
          background: #4b5563 !important;
        }
        
        .luckysheet-scrollbar-ltr::-webkit-scrollbar-track {
          background: #1f2937 !important;
        }
        
        .luckysheet-input-box {
          background: #1f2937 !important;
          color: #f3f4f6 !important;
          border-color: #374151 !important;
        }
        
        .luckysheet-formula-search-item {
          background: #1f2937 !important;
          color: #f3f4f6 !important;
        }
        
        .luckysheet-formula-search-item:hover {
          background: #374151 !important;
        }
      `}</style>
    </div>
  );
};

export default SheetComponent;