'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbars/Workspace';
import BugSpreadsheet from '@/app/pages/view/bug-module/Table';
import BugSplitView from '@/app/pages/view/bug-module/Split';
import BugCardView from '@/app/pages/view/bug-module/Card';
import BugStatisticsDashboard from '@/app/pages/view/bug-module/Chart';
import TestCaseSpreadsheet from '@/app/pages/view/case-module/Table';
import TestCaseCardView from '@/app/pages/view/case-module/Card';
import TestCaseSplitView from '@/app/pages/view/case-module/Split';
import Workspace from '@/app/pages/app/Workspace';

export default function TokenDebugger() {
  const [token, setToken] = useState('');
  const [tokenExists, setTokenExists] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Check for token in cookies
    const checkToken = () => {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      
      if (tokenCookie) {
        const tokenValue = tokenCookie.split('=')[1];
        setToken(tokenValue);
        setTokenExists(true);
        
        // Debug info
        setDebugInfo(`
          Token found: Yes
          Token length: ${tokenValue.length}
          Token preview: ${tokenValue.substring(0, 20)}...
          Token parts: ${tokenValue.split('.').length}
          Issue: Invalid JWT signature (backend verification failed)
        `);
      } else {
        setTokenExists(false);
        setDebugInfo('No token found in cookies');
      }
    };

    checkToken();
  }, []);

  const clearToken = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setToken('');
    setTokenExists(false);
    setError('Token cleared. Please log in again.');
    setDebugInfo('Token has been cleared from cookies');
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Workspace/>
       
    </div>
  );
}