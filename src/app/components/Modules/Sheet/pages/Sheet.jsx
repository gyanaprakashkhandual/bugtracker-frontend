'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Loader2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Merge,
  Plus,
  Minus,
  Type
} from 'lucide-react';
import { useSheet } from '@/app/script/Sheet.context';
import { useProject } from '@/app/script/Project.context';
import { useTestType } from '@/app/script/TestType.context';


const ExcelSheetEditor = () => {
  const { sheetId, sheetName } = useSheet();
  const { selectedProject } = useProject();
  const { testTypeName } = useTestType();
  const luckysheetRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sheetData, setSheetData] = useState(null);
  const [isLuckySheetReady, setIsLuckySheetReady] = useState(false);
  const autoSaveTimerRef = useRef(null);

  const BASE_URL = 'http://localhost:5000/api/v1/sheet';

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token;
  };

  const fetchSheetData = async () => {
    if (!sheetId) {
      setLoading(false);
      return;
    }

    try {
      const token = getAuthToken();
      const requestUrl = `${BASE_URL}/${sheetId}`;

      const response = await fetch(requestUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sheet data: ${response.status}`);
      }

      const data = await response.json();
      setSheetData(data);
      setLoading(false);

      if (isLuckySheetReady) {
        setTimeout(() => {
          initializeLuckySheet(data);
        }, 300);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const initializeLuckySheet = (data) => {
    const container = document.getElementById('luckysheet-container');

    if (!window.luckysheet) {
      return;
    }

    if (!container) {
      return;
    }

    container.innerHTML = '';

    const sheetDataArray = data.data && Array.isArray(data.data) && data.data.length > 0
      ? data.data
      : [getDefaultSheetData()];

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
          triggerAutoSave();
        },
        updated: function (operate) {
          triggerAutoSave();
        }
      }
    };

    try {
      window.luckysheet.create(options);
    } catch (error) {
    }
  };

  const getDefaultSheetData = () => {
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

  const triggerAutoSave = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 1000);
  };

  const handleSave = async () => {
    if (!sheetId || !window.luckysheet) {
      return;
    }

    setSaving(true);
    try {
      const currentData = window.luckysheet.getAllSheets();
      const token = getAuthToken();

      const payload = {
        data: currentData,
        version: (sheetData?.version || 0) + 1
      };

      const requestUrl = `${BASE_URL}/${sheetId}`;

      const response = await fetch(requestUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to save sheet: ${response.status}`);
      }

      const updatedSheet = await response.json();
      setSheetData(updatedSheet);
    } catch (error) {
    } finally {
      setSaving(false);
    }
  };

  const applyFormat = (action) => {
    if (!window.luckysheet) {
      return;
    }

    try {
      const luckysheet = window.luckysheet;

      switch (action) {
        case 'bold':
          luckysheet.setCellFormat('bl', 1);
          break;
        case 'italic':
          luckysheet.setCellFormat('it', 1);
          break;
        case 'underline':
          luckysheet.setCellFormat('un', 1);
          break;
        case 'alignLeft':
          luckysheet.setCellFormat('ht', 1);
          break;
        case 'alignCenter':
          luckysheet.setCellFormat('ht', 0);
          break;
        case 'alignRight':
          luckysheet.setCellFormat('ht', 2);
          break;
        case 'merge':
          if (luckysheet.selectRange) {
            const range = luckysheet.getRange();
            luckysheet.setCellFormat('mc', {
              r: range[0].row[0],
              c: range[0].column[0],
              rs: range[0].row[1] - range[0].row[0] + 1,
              cs: range[0].column[1] - range[0].column[0] + 1
            });
          }
          break;
        case 'increaseFontSize':
          luckysheet.setCellFormat('fs', 14);
          break;
        case 'decreaseFontSize':
          luckysheet.setCellFormat('fs', 10);
          break;
        default:
          break;
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    const loadLuckySheet = () => {
      if (window.luckysheet) {
        setIsLuckySheetReady(true);
        return;
      }

      const cssFiles = [
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/css/pluginsCss.css',
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/plugins.css',
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/css/luckysheet.css',
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/assets/iconfont/iconfont.css'
      ];

      cssFiles.forEach((href) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      });

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

      const pluginScript = document.createElement('script');
      pluginScript.src = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/js/plugin.js';
      pluginScript.onload = () => {
        const mainScript = document.createElement('script');
        mainScript.src = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js';
        mainScript.onload = () => {
          setIsLuckySheetReady(true);
        };
        document.body.appendChild(mainScript);
      };
      document.body.appendChild(pluginScript);
    };

    loadLuckySheet();

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isLuckySheetReady && sheetId) {
      setTimeout(() => {
        fetchSheetData();
      }, 100);
    }
  }, [isLuckySheetReady, sheetId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative z-10"
      >
        <div className="px-6 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h6 className="text-md font-bold text-gray-800 dark:text-gray-100">
                {selectedProject?.projectName || 'Project'}
              </h6>
              <h6 className="text-md font-bold text-gray-800 dark:text-gray-100">
                {testTypeName || 'Test Type'}
              </h6>
              <h6 className="text-md font-bold text-gray-800 dark:text-gray-100">
                {sheetName || 'Excel Sheet'}
              </h6>
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
              className="flex items-center gap-2 px-6 py-1 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {saving ? (
                <>
                  <Loader2 className="w-2 h-2 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-2 h-2" />
                  <span>Save</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="">
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
              style={{ height: 'calc(100vh - 65px)', minHeight: '500px' }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExcelSheetEditor;