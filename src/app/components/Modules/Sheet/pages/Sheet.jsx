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

    // Load CSS from CDN
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
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} flex flex-col h-full bg-slate-50`}>
      {/* Header Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {sheetData?.title || sheetName || 'Loading...'}
              </h1>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="font-medium">{testTypeName}</span>
                <span>•</span>
                <span>{sheetName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Save Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-slate-700">Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-700">Unsaved changes</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-slate-600">Saved {formatLastSaved()}</span>
              </>
            )}
          </div>

          {/* Auto-save Toggle */}
          <label className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="w-4 h-4 text-emerald-600 bg-white border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-slate-700">Auto-save</span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleManualSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleFullscreen}
              className="p-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Luckysheet Container */}
      <div className="flex-1 relative overflow-hidden bg-white">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white z-50"
            >
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-emerald-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                </div>
                <p className="mt-4 text-slate-600 font-medium">Loading sheet...</p>
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
        className="flex items-center justify-between px-6 py-2.5 bg-white border-t border-slate-200 text-xs"
      >
        <div className="flex items-center space-x-4 text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Project:</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">{selectedProject?.name || 'N/A'}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Version:</span>
            <span className="text-slate-700 font-medium">{sheetData?.version || 1}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-slate-600">
          <span>Created by: <span className="font-medium text-slate-700">{sheetData?.createdBy?.name || 'Unknown'}</span></span>
          {sheetData?.createdAt && (
            <>
              <span className="text-slate-300">•</span>
              <span>Created: <span className="font-medium text-slate-700">{new Date(sheetData.createdAt).toLocaleDateString()}</span></span>
            </>
          )}
        </div>
      </motion.div>

      {/* Enhanced Luckysheet Styling */}
      <style jsx global>{`
        /* Fix cell input visibility - CRITICAL */
        .luckysheet-cell-input,
        .luckysheet-rich-text-editor,
        .luckysheet-cell-input div,
        .luckysheet-cell-input span {
          background: #ffffff !important;
          color: #000000 !important;
          font-size: 13px !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
          border: 2px solid #3b82f6 !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15) !important;
          z-index: 1000 !important;
        }

        /* Formula bar styling */
        .luckysheet-wa-editor {
          background: #f8fafc !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }

        .luckysheet-input-box,
        .luckysheet-input-box input {
          background: #ffffff !important;
          color: #1e293b !important;
          border: 1px solid #cbd5e1 !important;
          font-size: 13px !important;
          padding: 6px 10px !important;
          border-radius: 6px !important;
        }

        .luckysheet-input-box:focus-within {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        /* Toolbar styling */
        .luckysheet-toolbar {
          background: #f8fafc !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 6px 12px !important;
        }

        .luckysheet-toolbar-button,
        .luckysheet-toolbar-button-split-left,
        .luckysheet-toolbar-button-split-right {
          color: #475569 !important;
          border-radius: 6px !important;
          transition: all 0.15s ease !important;
        }

        .luckysheet-toolbar-button:hover,
        .luckysheet-toolbar-button-split-left:hover,
        .luckysheet-toolbar-button-split-right:hover {
          background: #e2e8f0 !important;
          color: #1e293b !important;
        }

        .luckysheet-toolbar-button-active {
          background: #dbeafe !important;
          color: #1e40af !important;
        }

        /* Tooltip styling - CRITICAL FIX */
        .luckysheet-tooltip,
        .luckysheet-tooltip-text,
        .luckysheet-cols-menu,
        .luckysheet-rightclick-menu {
          background: #1e293b !important;
          color: #f1f5f9 !important;
          border: 1px solid #334155 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
          font-size: 12px !important;
          padding: 8px !important;
          z-index: 10000 !important;
        }

        /* Menu items */
        .luckysheet-cols-menu-item,
        .luckysheet-rightclick-menu-item {
          color: #f1f5f9 !important;
          padding: 8px 12px !important;
          border-radius: 6px !important;
          transition: all 0.15s ease !important;
        }

        .luckysheet-cols-menu-item:hover,
        .luckysheet-rightclick-menu-item:hover {
          background: #334155 !important;
          color: #ffffff !important;
        }

        /* Grid styling */
        .luckysheet-grid-window {
          background: #ffffff !important;
        }

        .luckysheet-cell {
          color: #1e293b !important;
          font-size: 13px !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }

        /* Selection styling */
        .luckysheet-cell-selected {
          border: 2px solid #3b82f6 !important;
          background: rgba(59, 130, 246, 0.05) !important;
        }

        .luckysheet-cell-selected-highlight {
          border: 2px solid #3b82f6 !important;
          background: rgba(59, 130, 246, 0.1) !important;
        }

        /* Row/Column headers */
        .luckysheet-cols-rows-shift,
        .luckysheet-cols-rows-shift-size {
          background: #f8fafc !important;
          color: #64748b !important;
          border-color: #e2e8f0 !important;
          font-size: 12px !important;
          font-weight: 500 !important;
        }

        .luckysheet-cols-rows-shift:hover {
          background: #f1f5f9 !important;
        }

        /* Sheet tabs */
        .luckysheet-sheet-container {
          background: #f8fafc !important;
          border-top: 1px solid #e2e8f0 !important;
        }

        .luckysheet-sheet-item {
          background: #ffffff !important;
          color: #475569 !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 6px 6px 0 0 !important;
          padding: 6px 16px !important;
          margin: 4px 2px 0 2px !important;
          transition: all 0.15s ease !important;
        }

        .luckysheet-sheet-item:hover {
          background: #f1f5f9 !important;
        }

        .luckysheet-sheet-item-active {
          background: #ffffff !important;
          color: #10b981 !important;
          border-bottom: 2px solid #10b981 !important;
          font-weight: 600 !important;
        }

        /* Status bar */
        .luckysheet-stat-area {
          background: #f8fafc !important;
          color: #64748b !important;
          border-top: 1px solid #e2e8f0 !important;
          font-size: 12px !important;
        }

        /* Scrollbars */
        .luckysheet-scrollbar-ltr::-webkit-scrollbar {
          width: 12px !important;
          height: 12px !important;
        }

        .luckysheet-scrollbar-ltr::-webkit-scrollbar-track {
          background: #f8fafc !important;
        }

        .luckysheet-scrollbar-ltr::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 6px !important;
          border: 2px solid #f8fafc !important;
        }

        .luckysheet-scrollbar-ltr::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important;
        }

        /* Modal dialogs */
        .luckysheet-modal-dialog,
        .luckysheet-modal-dialog-content {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
        }

        .luckysheet-modal-dialog-title {
          background: #f8fafc !important;
          color: #1e293b !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 16px 20px !important;
          font-weight: 600 !important;
        }

        .luckysheet-modal-dialog-content {
          padding: 20px !important;
        }

        .luckysheet-modal-dialog-button {
          padding: 8px 16px !important;
          border-radius: 6px !important;
          font-weight: 500 !important;
          transition: all 0.15s ease !important;
        }

        .luckysheet-modal-dialog-button-cancel {
          background: #f1f5f9 !important;
          color: #475569 !important;
          border: 1px solid #cbd5e1 !important;
        }

        .luckysheet-modal-dialog-button-cancel:hover {
          background: #e2e8f0 !important;
        }

        .luckysheet-modal-dialog-button-confirm {
          background: linear-gradient(to right, #10b981, #059669) !important;
          color: #ffffff !important;
          border: none !important;
        }

        .luckysheet-modal-dialog-button-confirm:hover {
          background: linear-gradient(to right, #059669, #047857) !important;
        }

        /* Input elements in modals */
        .luckysheet-modal-dialog input,
        .luckysheet-modal-dialog select,
        .luckysheet-modal-dialog textarea {
          background: #ffffff !important;
          color: #1e293b !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 6px !important;
          padding: 8px 12px !important;
          font-size: 13px !important;
        }

        .luckysheet-modal-dialog input:focus,
        .luckysheet-modal-dialog select:focus,
        .luckysheet-modal-dialog textarea:focus {
          border-color: #3b82f6 !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        /* Formula search dropdown */
        .luckysheet-formula-search-c {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        .luckysheet-formula-search-item {
          background: #ffffff !important;
          color: #1e293b !important;
          padding: 8px 12px !important;
          transition: all 0.15s ease !important;
        }

        .luckysheet-formula-search-item:hover {
          background: #f1f5f9 !important;
          color: #10b981 !important;
        }

        .luckysheet-formula-search-item-active {
          background: #dbeafe !important;
          color: #1e40af !important;
        }

        /* Context menu styling */
        .luckysheet-menuButton {
          color: #475569 !important;
          transition: all 0.15s ease !important;
        }

        .luckysheet-menuButton:hover {
          color: #10b981 !important;
        }

        /* Color picker */
        .luckysheet-color-menu {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          padding: 12px !important;
        }

        /* Borders and grid lines */
        .luckysheet-cell-flow-border {
          border-color: #e2e8f0 !important;
        }

        /* Selection box */
        .luckysheet-selection-copy {
          border: 2px dashed #10b981 !important;
        }

        /* Cell comment indicator */
        .luckysheet-cell-comment-marker {
          border-color: #f59e0b transparent transparent #f59e0b !important;
        }

        /* Loading indicator */
        .luckysheet-loading {
          background: rgba(248, 250, 252, 0.95) !important;
        }

        .luckysheet-loading-content {
          color: #1e293b !important;
          font-weight: 500 !important;
        }

        /* Right-click menu separator */
        .luckysheet-menuseparator {
          background: #e2e8f0 !important;
          height: 1px !important;
          margin: 4px 8px !important;
        }

        /* Freeze pane indicator */
        .luckysheet-freezebar-horizontal,
        .luckysheet-freezebar-vertical {
          background: #10b981 !important;
          opacity: 0.3 !important;
        }

        /* Chart elements */
        .luckysheet-chart-title {
          color: #1e293b !important;
          font-weight: 600 !important;
        }

        /* Data validation */
        .luckysheet-datavisual-selection {
          border: 2px solid #8b5cf6 !important;
        }

        /* Print area */
        .luckysheet-print-area {
          border: 2px dashed #6366f1 !important;
        }

        /* Alternating colors */
        .luckysheet-alternateformat-item {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 6px !important;
          transition: all 0.15s ease !important;
        }

        .luckysheet-alternateformat-item:hover {
          border-color: #10b981 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.15) !important;
        }

        /* Font size dropdown */
        .luckysheet-toolbar-menu-button-dropdown {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          padding: 4px !important;
        }

        .luckysheet-toolbar-menu-button-dropdown-item {
          color: #1e293b !important;
          padding: 6px 12px !important;
          border-radius: 6px !important;
          transition: all 0.15s ease !important;
        }

        .luckysheet-toolbar-menu-button-dropdown-item:hover {
          background: #f1f5f9 !important;
          color: #10b981 !important;
        }

        /* Ensure high z-index for dropdowns and tooltips */
        .luckysheet-tooltip,
        .luckysheet-cols-menu,
        .luckysheet-rightclick-menu,
        .luckysheet-modal-dialog,
        .luckysheet-color-menu,
        .luckysheet-formula-search-c,
        .luckysheet-toolbar-menu-button-dropdown {
          z-index: 10000 !important;
        }

        /* Make sure cell editing is always on top */
        .luckysheet-cell-input,
        .luckysheet-rich-text-editor {
          z-index: 10001 !important;
        }
      `}</style>
    </div>
  );
};

export default SheetComponent;