'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Merge,
  Plus,
  Minus,
  PaintBucket,
  Type as TypeIcon
} from 'lucide-react';
import { useSheet } from '@/app/script/Sheet.context';

const ExcelSheetEditor = () => {
  const { sheetId, sheetName } = useSheet();
  const luckysheetRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [sheetData, setSheetData] = useState(null);
  const [isLuckySheetReady, setIsLuckySheetReady] = useState(false);

  const BASE_URL = 'http://localhost:5000/api/v1/sheet';

  // Debugging logs
  useEffect(() => {
    console.log('🔍 Debug - Component mounted');
    console.log('🔍 Debug - sheetId:', sheetId);
    console.log('🔍 Debug - sheetName:', sheetName);
  }, []);

  // Show notification
  const showNotification = (type, message) => {
    console.log(`📢 Notification: ${type} - ${message}`);
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  // Get token from localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token retrieved:', token ? 'Token exists' : 'No token found');
    return token;
  };

  // Fetch sheet data
  const fetchSheetData = async () => {
    console.log('📥 Fetching sheet data...');
    if (!sheetId) {
      console.error('❌ No sheet ID provided');
      showNotification('error', 'No sheet ID provided');
      setLoading(false);
      return;
    }

    try {
      const token = getAuthToken();
      console.log('🌐 Making API call to:', `${BASE_URL}/${sheetId}`);

      const response = await fetch(`${BASE_URL}/${sheetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch sheet data: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Sheet data received:', data);
      setSheetData(data);

      // Set loading to false FIRST to render the container
      console.log('🎬 Setting loading to false to render container');
      setLoading(false);

      // Wait for LuckySheet to be ready and container to render
      if (isLuckySheetReady) {
        setTimeout(() => {
          console.log('🚀 Starting LuckySheet initialization');
          initializeLuckySheet(data);
        }, 300);
      }
    } catch (error) {
      console.error('❌ Error fetching sheet:', error);
      showNotification('error', 'Failed to load sheet data: ' + error.message);
      setLoading(false);
    }
  };

  // Initialize LuckySheet
  const initializeLuckySheet = (data) => {
    console.log('🎯 Initializing LuckySheet...');

    const container = document.getElementById('luckysheet-container');
    console.log('🎯 Window.luckysheet exists:', !!window.luckysheet);
    console.log('🎯 Container exists:', !!container);
    console.log('🎯 Container element:', container);

    if (!window.luckysheet) {
      console.error('❌ Luckysheet not loaded');
      showNotification('error', 'Spreadsheet library not loaded');
      return;
    }

    if (!container) {
      console.error('❌ Container not found in DOM');
      showNotification('error', 'Container not found. Please refresh the page.');
      return;
    }

    // Clear any existing instance
    console.log('🧹 Clearing container');
    container.innerHTML = '';

    const sheetDataArray = data.data && Array.isArray(data.data) && data.data.length > 0
      ? data.data
      : [getDefaultSheetData()];

    console.log('📊 Sheet data for initialization:', sheetDataArray);

    const options = {
      container: 'luckysheet-container',
      title: data.title || sheetName || 'Untitled Sheet',
      lang: 'en',
      showinfobar: false,
      showsheetbar: true,
      showstatisticBar: true,
      enableAddRow: true,
      enableAddCol: true,
      userInfo: false,
      showConfigWindowResize: true,
      allowEdit: true,
      showToolbar: true,
      data: sheetDataArray,
      hook: {
        cellUpdated: function (r, c, oldValue, newValue, isRefresh) {
          console.log('📝 Cell updated:', { row: r, col: c, oldValue, newValue });
        },
        updated: function (operate) {
          console.log('🔄 Sheet updated:', operate);
        }
      }
    };

    console.log('⚙️ LuckySheet options:', options);

    try {
      console.log('🚀 Creating LuckySheet instance...');
      window.luckysheet.create(options);
      console.log('✅ LuckySheet created successfully');
      showNotification('success', 'Sheet loaded successfully!');
    } catch (error) {
      console.error('❌ Error creating LuckySheet:', error);
      showNotification('error', 'Failed to initialize sheet: ' + error.message);
    }
  };

  // Get default sheet data
  const getDefaultSheetData = () => {
    console.log('📄 Creating default sheet data');
    return {
      name: 'Sheet1',
      color: '',
      status: 1,
      order: 0,
      data: Array(20).fill(null).map(() => Array(26).fill(null)),
      config: {
        merge: {},
        rowlen: {},
        columnlen: {},
        rowhidden: {},
        colhidden: {},
        borderInfo: [],
        authority: {}
      },
      index: 0,
      chart: [],
      zoomRatio: 1,
      celldata: []
    };
  };

  // Save sheet data
  const handleSave = async () => {
    console.log('💾 Saving sheet data...');
    if (!sheetId || !window.luckysheet) {
      console.error('❌ Cannot save: Missing sheetId or luckysheet');
      return;
    }

    setSaving(true);
    try {
      const currentData = window.luckysheet.getAllSheets();
      console.log('📤 Current sheet data:', currentData);

      const token = getAuthToken();

      const payload = {
        data: currentData,
        version: (sheetData?.version || 0) + 1
      };

      console.log('📤 Sending payload:', payload);

      const response = await fetch(`${BASE_URL}/${sheetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Save response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to save sheet: ${response.status}`);
      }

      const updatedSheet = await response.json();
      console.log('✅ Sheet saved successfully:', updatedSheet);
      setSheetData(updatedSheet);
      showNotification('success', 'Sheet saved successfully!');
    } catch (error) {
      console.error('❌ Error saving sheet:', error);
      showNotification('error', 'Failed to save sheet: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Toolbar actions with proper LuckySheet API
  const applyFormat = (action) => {
    console.log('🎨 Applying format:', action);

    if (!window.luckysheet) {
      console.error('❌ LuckySheet not available');
      return;
    }

    try {
      const luckysheet = window.luckysheet;

      switch (action) {
        case 'bold':
          console.log('🎨 Applying bold');
          luckysheet.setCellFormat('bl', 1);
          break;
        case 'italic':
          console.log('🎨 Applying italic');
          luckysheet.setCellFormat('it', 1);
          break;
        case 'underline':
          console.log('🎨 Applying underline');
          luckysheet.setCellFormat('un', 1);
          break;
        case 'alignLeft':
          console.log('🎨 Aligning left');
          luckysheet.setCellFormat('ht', 1);
          break;
        case 'alignCenter':
          console.log('🎨 Aligning center');
          luckysheet.setCellFormat('ht', 0);
          break;
        case 'alignRight':
          console.log('🎨 Aligning right');
          luckysheet.setCellFormat('ht', 2);
          break;
        case 'merge':
          console.log('🎨 Merging cells');
          // Use the correct method for merging
          if (luckysheet.selectRange) {
            const range = luckysheet.getRange();
            console.log('🎨 Current range:', range);
            luckysheet.setCellFormat('mc', {
              r: range[0].row[0],
              c: range[0].column[0],
              rs: range[0].row[1] - range[0].row[0] + 1,
              cs: range[0].column[1] - range[0].column[0] + 1
            });
          }
          break;
        case 'increaseFontSize':
          console.log('🎨 Increasing font size');
          luckysheet.setCellFormat('fs', 14);
          break;
        case 'decreaseFontSize':
          console.log('🎨 Decreasing font size');
          luckysheet.setCellFormat('fs', 10);
          break;
        default:
          console.log('⚠️ Unknown format action:', action);
          break;
      }
      console.log('✅ Format applied successfully');
    } catch (error) {
      console.error('❌ Error applying format:', error);
      showNotification('error', 'Failed to apply format');
    }
  };

  // Load LuckySheet scripts
  useEffect(() => {
    console.log('📦 Loading LuckySheet resources...');

    const loadLuckySheet = () => {
      // Check if already loaded
      if (window.luckysheet) {
        console.log('✅ LuckySheet already loaded');
        setIsLuckySheetReady(true);
        return;
      }

      // Load CSS
      const cssFiles = [
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/css/pluginsCss.css',
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/plugins.css',
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/css/luckysheet.css',
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/assets/iconfont/iconfont.css'
      ];

      cssFiles.forEach((href, index) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => console.log(`✅ CSS loaded ${index + 1}/${cssFiles.length}`);
        link.onerror = () => console.error(`❌ Failed to load CSS ${index + 1}`);
        document.head.appendChild(link);
      });

      // Add custom CSS to fix input visibility
      const customStyle = document.createElement('style');
      customStyle.innerHTML = `
        /* Fix for cell input visibility */
        #luckysheet-input-box {
          z-index: 1000 !important;
          background: white !important;
          color: black !important;
        }
        #luckysheet-rich-text-editor {
          z-index: 1000 !important;
          background: white !important;
          color: black !important;
        }
        .luckysheet-cell-input {
          z-index: 1000 !important;
          background: white !important;
          color: black !important;
        }
        .luckysheet-cell-selected {
          z-index: 15 !important;
        }
      `;
      document.head.appendChild(customStyle);
      console.log('✅ Custom CSS for input visibility added');

      // Load JS
      const pluginScript = document.createElement('script');
      pluginScript.src = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/js/plugin.js';
      pluginScript.onload = () => {
        console.log('✅ Plugin script loaded');

        const mainScript = document.createElement('script');
        mainScript.src = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js';
        mainScript.onload = () => {
          console.log('✅ Main LuckySheet script loaded');
          setIsLuckySheetReady(true);
        };
        mainScript.onerror = () => {
          console.error('❌ Failed to load main LuckySheet script');
          showNotification('error', 'Failed to load spreadsheet library');
        };
        document.body.appendChild(mainScript);
      };
      pluginScript.onerror = () => {
        console.error('❌ Failed to load plugin script');
      };
      document.body.appendChild(pluginScript);
    };

    loadLuckySheet();
  }, []);

  // Fetch data when LuckySheet is ready
  useEffect(() => {
    if (isLuckySheetReady && sheetId) {
      console.log('🚀 LuckySheet ready, fetching data...');
      // Wait for next tick to ensure DOM is ready
      setTimeout(() => {
        fetchSheetData();
      }, 100);
    }
  }, [isLuckySheetReady, sheetId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 relative z-10"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {sheetName || 'Excel Sheet'}
              </h1>
              {sheetData && (
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  v{sheetData.version}
                </span>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Enhanced Toolbar */}
          <div className="flex items-center gap-3 flex-wrap border-t border-gray-200 dark:border-gray-700 pt-4">
            {/* Text Formatting */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => applyFormat('bold')}
                className="p-2.5 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors group"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4 text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
              <button
                onClick={() => applyFormat('italic')}
                className="p-2.5 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors group"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4 text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
              <button
                onClick={() => applyFormat('underline')}
                className="p-2.5 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors group"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-4 h-4 text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => applyFormat('alignLeft')}
                className="p-2.5 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors group"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4 text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
              <button
                onClick={() => applyFormat('alignCenter')}
                className="p-2.5 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors group"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4 text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
              <button
                onClick={() => applyFormat('alignRight')}
                className="p-2.5 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors group"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4 text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => applyFormat('decreaseFontSize')}
                className="p-2.5 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors group"
                title="Decrease Font Size"
              >
                <Minus className="w-4 h-4 text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
              <div className="px-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <TypeIcon className="w-4 h-4" />
              </div>
              <button
                onClick={() => applyFormat('increaseFontSize')}
                className="p-2.5 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors group"
                title="Increase Font Size"
              >
                <Plus className="w-4 h-4 text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
            </div>

            {/* Merge Cells */}
            <button
              onClick={() => applyFormat('merge')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors shadow-sm group"
              title="Merge Cells"
            >
              <Merge className="w-4 h-4 text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Merge</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading sheet...</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Please wait while we prepare your spreadsheet</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div
              id="luckysheet-container"
              ref={luckysheetRef}
              className="w-full"
              style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}
            />
          </motion.div>
        )}
      </div>

      {/* Notification */}
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-6 right-6 z-50"
        >
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border-2 ${notification.type === 'success'
              ? 'bg-green-500 dark:bg-green-600 border-green-400 dark:border-green-500'
              : 'bg-red-500 dark:bg-red-600 border-red-400 dark:border-red-500'
            } text-white`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </motion.div>
      )}

      {/* Debug Info (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-3 rounded-lg max-w-xs z-50 font-mono">
          <div>SheetID: {sheetId || 'N/A'}</div>
          <div>LuckySheet Ready: {isLuckySheetReady ? '✅' : '❌'}</div>
          <div>Loading: {loading ? '⏳' : '✅'}</div>
          <div>Data Loaded: {sheetData ? '✅' : '❌'}</div>
        </div>
      )}
    </div>
  );
};

export default ExcelSheetEditor;