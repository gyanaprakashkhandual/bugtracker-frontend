'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCoffee,
  FaHome,
  FaCog,
  FaProjectDiagram,
  FaTerminal,
  FaPuzzlePiece,
  FaNetworkWired,
  FaHandshake,
  FaSearch,
  FaMoon,
  FaSun,
  FaChevronRight,
  FaBook,
  FaRocket,
  FaCode,
  FaShieldAlt
} from 'react-icons/fa';
import Extension from '@/app/components/document/Extension';

const CaffetestDocs = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: FaHome },
    { id: 'configuration', label: 'Configuration', icon: FaCog },
    { id: 'projects', label: 'Projects', icon: FaProjectDiagram },
    { id: 'commands', label: 'Commands', icon: FaTerminal },
    { id: 'extensions', label: 'Extensions', icon: FaPuzzlePiece },
    { id: 'network', label: 'Network Access', icon: FaNetworkWired },
    { id: 'ethics', label: 'Work Ethics', icon: FaHandshake },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
    { id: 'api', label: 'API Reference', icon: FaCode },
    { id: 'getting-started', label: 'Getting Started', icon: FaRocket },
  ];

  const getContent = (section) => {
    const contentMap = {
      home: {
        title: 'Welcome to Caffetest',
        content: (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-2">
                ☕ Brew Better Tests with Caffetest
              </h3>
              <p className="text-amber-700 dark:text-amber-300">
                Your comprehensive testing platform that keeps your development workflow caffeinated and productive.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <FaRocket className="text-2xl text-blue-500 mb-3" />
                <h4 className="font-semibold mb-2">Quick Start</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Get up and running with Caffetest in under 5 minutes. Follow our step-by-step guide.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <FaBook className="text-2xl text-green-500 mb-3" />
                <h4 className="font-semibold mb-2">Documentation</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Explore comprehensive guides, API references, and best practices.
                </p>
              </div>
            </div>
          </div>
        )
      },
      configuration: {
        title: 'Configuration',
        content: (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Configure Caffetest to match your development workflow and testing requirements.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-mono text-sm font-semibold mb-2">caffetest.config.js</h4>
              <pre className="text-sm overflow-x-auto">
                {`{
  "testDir": "./tests",
  "timeout": 30000,
  "retries": 2,
  "reporter": "html",
  "use": {
    "headless": true,
    "viewport": { "width": 1280, "height": 720 }
  }
}`}
              </pre>
            </div>
          </div>
        )
      },
      projects: {
        title: 'Projects',
        content: (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Manage multiple testing projects and organize your test suites efficiently.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">Project Structure</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• tests/ - Test files directory</li>
                  <li>• reports/ - Generated reports</li>
                  <li>• config/ - Configuration files</li>
                  <li>• fixtures/ - Test data</li>
                </ul>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">Best Practices</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Use descriptive test names</li>
                  <li>• Group related tests</li>
                  <li>• Maintain clean test data</li>
                  <li>• Regular cleanup routines</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      commands: {
        title: 'Commands',
        content: (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Master the Caffetest command line interface for efficient testing workflows.
            </p>
            <div className="space-y-4">
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="mb-2">$ caffetest run --watch</div>
                <div className="mb-2">$ caffetest test --parallel</div>
                <div className="mb-2">$ caffetest report --format html</div>
                <div>$ caffetest init --template react</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Run Tests</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    Execute your test suites with various options and configurations.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200">Generate Reports</h4>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Create detailed reports in multiple formats for analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      extensions: {
        title: 'Extensions',
        content: (
          <div className="space-y-6">
            <Extension/>
          </div>
        )
      },
      network: {
        title: 'Network Access',
        content: (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Configure network settings, proxies, and security policies for your testing environment.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Security Notice</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Always ensure your network configurations follow your organization's security policies.
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">Proxy Configuration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set up proxy servers for testing behind corporate firewalls.
                </p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">SSL Certificates</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage SSL certificates for secure testing environments.
                </p>
              </div>
            </div>
          </div>
        )
      },
      ethics: {
        title: 'Work Ethics',
        content: (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Guidelines and best practices for ethical testing and responsible development.
            </p>
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Testing Principles</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Respect user privacy and data protection</li>
                  <li>• Ensure accessibility in all test scenarios</li>
                  <li>• Practice responsible disclosure for security issues</li>
                  <li>• Maintain test environment integrity</li>
                </ul>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">Code of Conduct</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our commitment to fostering an inclusive and professional testing environment.
                </p>
              </div>
            </div>
          </div>
        )
      },
      security: {
        title: 'Security',
        content: (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Security features and best practices for protecting your testing infrastructure.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <FaShieldAlt className="text-red-500 text-xl mb-2" />
                <h4 className="font-semibold text-red-800 dark:text-red-200">Access Control</h4>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  Role-based permissions and authentication mechanisms.
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <FaShieldAlt className="text-blue-500 text-xl mb-2" />
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Data Encryption</h4>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  End-to-end encryption for sensitive test data.
                </p>
              </div>
            </div>
          </div>
        )
      },
      api: {
        title: 'API Reference',
        content: (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Complete API documentation for integrating Caffetest into your applications.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-mono text-sm font-semibold mb-2">Base URL</h4>
              <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                https://api.caffetest.com/v1
              </code>
            </div>
            <div className="space-y-3">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-mono">GET</span>
                  <code className="text-sm">/tests</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Retrieve all test suites</p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-mono">POST</span>
                  <code className="text-sm">/tests/run</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Execute a test suite</p>
              </div>
            </div>
          </div>
        )
      },
      'getting-started': {
        title: 'Getting Started',
        content: (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Welcome to Caffetest! Let's get you set up and running your first tests.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Step 1: Installation</h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded mt-2 font-mono text-sm">
                  npm install -g caffetest
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500">
                <h4 className="font-semibold text-green-800 dark:text-green-200">Step 2: Initialize Project</h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded mt-2 font-mono text-sm">
                  caffetest init my-project
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 dark:border-purple-500">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200">Step 3: Run Your First Test</h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded mt-2 font-mono text-sm">
                  caffetest run --interactive
                </div>
              </div>
            </div>
          </div>
        )
      }
    };

    return contentMap[section] || contentMap.home;
  };

  const currentContent = getContent(activeSection);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
        >
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <FaCoffee className="h-8 w-8 text-blue-900" />
              <h1 className="text-xl font-bold">Caffetest</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${isActive
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`text-lg ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <FaChevronRight className="text-amber-600 dark:text-amber-400 ml-auto" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              {/* Search Bar */}
              <div className="flex-1 max-w-md relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Theme Switcher */}
              <motion.button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="ml-4 p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDarkMode ? (
                  <FaSun className="text-yellow-500" />
                ) : (
                  <FaMoon className="text-gray-600" />
                )}
              </motion.button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-8 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl"
              >
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {currentContent.title}
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  {currentContent.content}
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CaffetestDocs;