'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation';
import { FaCoffee, FaCode, FaRocket, FaBug, FaChartLine, FaGithub, FaTwitter, FaLinkedin, FaCheckCircle, FaArrowRight, FaPlay, FaFolder, FaFileAlt, FaUsers, FaShieldAlt, FaRobot, FaPalette, FaTable, FaColumns, FaTh, FaStream, FaTrash, FaSearch, FaFilter, FaMoon, FaSun, FaLock } from 'react-icons/fa'

export default function CaffetestLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])
  const [activeView, setActiveView] = useState('split')

  const router = useRouter();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  }

  const openPage = (item) => {
    console.log(`Navigate to: /${item}`)
    router.push(`/${item}`);
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const features = [
    {
      icon: FaCode,
      title: "VS Code Integration",
      description: "Seamless integration with Visual Studio Code through our CAPTEST extension for effortless test automation."
    },
    {
      icon: FaRocket,
      title: "AI-Powered Analysis",
      description: "OpenAI integration automatically refines test data and generates intelligent pass/fail results."
    },
    {
      icon: FaChartLine,
      title: "Smart Dashboard",
      description: "Comprehensive dashboards with multiple view options and real-time analytics for better insights."
    },
    {
      icon: FaBug,
      title: "Bug Tracking",
      description: "Advanced bug tracking features with automated detection and detailed reporting capabilities."
    }
  ]

  const benefits = [
    "Automated test case generation",
    "Real-time pass/fail results",
    "Multiple project separation",
    "Cucumber syntax support",
    "OpenAI-powered insights",
    "Dashboard integration"
  ]

  const viewTypes = [
    { id: 'split', name: 'Split View', icon: FaColumns, description: 'Sidebar cards with detail panel' },
    { id: 'table', name: 'Table View', icon: FaTable, description: 'Excel-like spreadsheet view' },
    { id: 'card', name: 'Card View', icon: FaTh, description: 'Grid of expandable cards' },
    { id: 'kanban', name: 'Kanban Board', icon: FaStream, description: 'Drag-and-drop workflow' }
  ]

  const coreFeatures = [
    {
      icon: FaBug,
      title: "Bug Tracking",
      description: "Complete CRUD operations with image and reference link support",
      color: "bg-red-500"
    },
    {
      icon: FaFileAlt,
      title: "Test Cases",
      description: "Full test case management with CRUD operations and image support",
      color: "bg-blue-500"
    },
    {
      icon: FaRocket,
      title: "Issue Management",
      description: "Enterprise-grade issue tracking for modern workflows with comments and more",
      color: "bg-purple-500"
    },
    {
      icon: FaFileAlt,
      title: "Built-in Documentation",
      description: "Google Docs-like editor integrated within the platform for the workspace",
      color: "bg-green-500"
    },
    {
      icon: FaTable,
      title: "Excel Integration",
      description: "Complete spreadsheet capabilities built right in the workarea",
      color: "bg-orange-500"
    },
    {
      icon: FaRobot,
      title: "Lumen AI Assistant",
      description: "ChatGPT-powered AI for test management and queries for bug and test case and reports ",
      color: "bg-indigo-500"
    }
  ]

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-sky-50">
      {/* Header */}
      <motion.header
        className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-sky-100"
        style={{ opacity: headerOpacity }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaCoffee className="w-8 h-8 text-blue-900" />
              <span className="text-xl font-semibold text-gray-900">
                Caffetest
              </span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex items-center space-x-6">
                {['Documentation', 'Pricing', 'Contact', 'Homek'].map((item, index) => (
                  <motion.a
                    key={item}
                    onClick={() => openPage(item.toLowerCase())}
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200 font-medium text-sm cursor-pointer"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </nav>

              <motion.button
                onClick={() => openPage('subscribe')}
                className="px-5 py-2 bg-purple-600 text-white font-medium rounded-4xl hover:bg-purple-700 transition-all duration-200 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>

              <motion.button
                onClick={() => openPage('auth')}
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In
              </motion.button>
            </div>

            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                <span className={`block w-full h-0.5 bg-current transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
                <span className={`block w-full h-0.5 bg-current transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-full h-0.5 bg-current transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
              </div>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight"
              variants={fadeInUp}
            >
              Professional Testing
              <br />
              <span className="text-blue-600">Automation Platform</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              AI-powered automation testing that transforms your VS Code workflow with intelligent
              test generation, real-time analytics, and seamless bug tracking.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={fadeInUp}
            >
              <motion.button
              onClick={() => router.push('/auth')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaPlay className="w-4 h-4" />
                <span>Get Started Free</span>
              </motion.button>

              <motion.button
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Watch Demo</span>
                <FaArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-12 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-xl shadow-xl border border-gray-200">
              <div className="bg-gray-800 rounded-t-xl px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-400 ml-4 text-sm font-mono">OpenApp.java</span>
              </div>
              <div className="p-6 font-mono text-sm text-left overflow-x-auto">
                <div className="space-y-2">
                  <div className="text-purple-400">import <span className="text-blue-400">org.openqa.selenium.WebDriver</span>;</div>
                  <div className="text-purple-400">import <span className="text-blue-400">org.openqa.selenium.chrome.ChromeDriver</span>;</div>
                  <div className="text-yellow-400">public class <span className="text-green-400">OpenWebsite</span> {`{`}</div>
                  <div className="pl-4 text-yellow-400">public static void <span className="text-blue-400">main</span>(String[] args) {`{`}</div>
                  <div className="pl-8 text-gray-300">WebDriver driver = <span className="text-purple-400">new</span> <span className="text-green-400">ChromeDriver</span>();</div>
                  <div className="pl-8 text-gray-300">driver.<span className="text-blue-400">get</span>(<span className="text-orange-400">"https://www.caffetest.com"</span>);</div>
                  <div className="pl-8 text-gray-300">driver.<span className="text-blue-400">manage</span>().<span className="text-blue-400">window</span>().<span className="text-blue-400">maximize</span>();</div>
                  <div className="pl-8 text-yellow-400">try {`{`}</div>
                  <div className="pl-12 text-gray-300">Thread.<span className="text-blue-400">sleep</span>(<span className="text-orange-400">5000</span>);</div>
                  <div className="pl-8 text-yellow-400">{`}`} catch (InterruptedException e) {`{`}</div>
                  <div className="pl-12 text-gray-300">e.<span className="text-blue-400">printStackTrace</span>();</div>
                  <div className="pl-8 text-yellow-400">{`}`}</div>
                  <div className="pl-8 text-gray-300">driver.<span className="text-blue-400">quit</span>();</div>
                  <div className="pl-4 text-yellow-400">{`}`}</div>
                  <div className="text-yellow-400">{`}`}</div>
                  <div className="bg-gray-800 rounded-t-xl px-4 py-3 flex items-center space-x-2">
                
                <span className="text-gray-400 ml-4 text-sm font-mono">✅ Result sent to caffetest</span>
              </div>
                 
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEW: Core Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Five Core Capabilities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for comprehensive test management in one platform
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                variants={fadeInUp}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                  <feature.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* NEW: View Types Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Multiple View Types
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Work your way with flexible view options for bugs, issues, and test cases
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {viewTypes.map((view) => (
              <motion.button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${activeView === view.id
                    ? 'bg-white border-blue-600 shadow-lg'
                    : 'bg-white/50 border-gray-200 hover:border-blue-300'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <view.icon className={`text-3xl mb-3 ${activeView === view.id ? 'text-blue-600' : 'text-gray-400'}`} />
                <h3 className="font-semibold text-gray-900 mb-1">{view.name}</h3>
                <p className="text-sm text-gray-600">{view.description}</p>
              </motion.button>
            ))}
          </div>

          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-3 gap-4 h-64">
              {activeView === 'split' && (
                <>
                  <div className="space-y-2">
                    <div className="bg-blue-100 rounded-lg p-3 border-l-4 border-blue-600">
                      <div className="h-2 bg-blue-600 rounded w-3/4 mb-2"></div>
                      <div className="h-1 bg-blue-400 rounded w-1/2"></div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="h-2 bg-gray-400 rounded w-3/4 mb-2"></div>
                      <div className="h-1 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="h-2 bg-gray-400 rounded w-3/4 mb-2"></div>
                      <div className="h-1 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="col-span-2 bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 border border-blue-200">
                    <div className="h-3 bg-blue-600 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-300 rounded"></div>
                      <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                      <div className="h-2 bg-gray-300 rounded w-4/6"></div>
                    </div>
                  </div>
                </>
              )}
              {activeView === 'table' && (
                <div className="col-span-3 space-y-2">
                  <div className="grid grid-cols-4 gap-2 bg-blue-600 rounded-t-lg p-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-2 bg-white rounded"></div>)}
                  </div>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="grid grid-cols-4 gap-2 bg-gray-100 rounded p-3">
                      {[1, 2, 3, 4].map(j => <div key={j} className="h-2 bg-gray-400 rounded"></div>)}
                    </div>
                  ))}
                </div>
              )}
              {activeView === 'card' && (
                <div className="col-span-3 grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-200">
                      <div className="h-3 bg-blue-600 rounded w-3/4 mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-300 rounded"></div>
                        <div className="h-2 bg-gray-300 rounded w-4/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeView === 'kanban' && (
                <div className="col-span-3 grid grid-cols-3 gap-4">
                  {['To Do', 'In Progress', 'Done'].map((status, i) => (
                    <div key={status} className="bg-gray-100 rounded-lg p-3">
                      <div className="h-2 bg-gray-600 rounded w-1/2 mb-3"></div>
                      <div className="space-y-2">
                        {[1, 2].map(j => (
                          <div key={j} className="bg-white rounded p-2 border border-gray-300">
                            <div className="h-2 bg-blue-400 rounded w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEW: Advanced Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Advanced Capabilities
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Enterprise-grade features for teams of all sizes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaFolder className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Infinite Folder Structure</h3>
                  <p className="text-gray-400">Organize unlimited folders per project for documents, code, bugs, and testing phases</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaSearch className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Smart Search & Filter</h3>
                  <p className="text-gray-400">Powerful search and filter capabilities with pagination for instant access to any data</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaUsers className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Team & Access Control</h3>
                  <p className="text-gray-400">Organization-level teams with admin controls for user management and project access</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaPalette className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Multi-Theme Support</h3>
                  <p className="text-gray-400">Switch between light and dark themes for comfortable work at any time of day</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaTrash className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Trash Management</h3>
                  <p className="text-gray-400">Enterprise-level trash system for safe deletion and recovery at scale</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaShieldAlt className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
                  <p className="text-gray-400">Secure authentication with granular access control for different user roles</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEW: Lumen AI Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <FaRobot className="text-white" />
                <span className="text-white font-medium">AI Assistant</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
                Meet Lumen AI
              </h2>
              <p className="text-lg text-indigo-100 mb-8 leading-relaxed">
                Your intelligent testing companion powered by ChatGPT. Add, delete, and manage test cases and bug through natural conversation. Ask questions, generate reports, and automate workflows with AI-driven insights.
              </p>
              <div className="space-y-3">
                {[
                  'Add/delete test cases via chat',
                  'Generate automated bug reports',
                  'Ask questions like ChatGPT',
                  'Smart test case recommendations',
                  'Natural language commands'
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-indigo-600 text-sm" />
                    </div>
                    <span className="text-white font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">You</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex-1">
                    <p className="text-gray-800">Add a new test case for login functionality</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaRobot className="text-white text-sm" />
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl rounded-tl-none px-4 py-3 flex-1 border border-indigo-200">
                    <p className="text-gray-800 mb-2">✅ Test case created successfully!</p>
                    <div className="bg-white rounded-lg p-3 text-sm">
                      <div className="font-semibold text-indigo-600 mb-1">TC-001: Login Test</div>
                      <div className="text-gray-600">Status: Active | Priority: High</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">You</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex-1">
                    <p className="text-gray-800">Show me all failed tests from last week</p>
                  </div>
                </div>

                <div className="flex items-center justify-center py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEW: Integration Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Seamless Integrations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with your favorite tools and automate your workflow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
            >
              <FaCode className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">VS Code Extension</h3>
              <p className="text-gray-600 mb-4">Caffetest-tracker extension automatically tracks and sends test data to your project in real-time</p>
              <div className="bg-white rounded-lg p-3 text-sm font-mono text-gray-700">
                code --install-extension caffetest-tracker-7.1.2.vsix
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
            >
              <FaTable className="text-4xl text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Google Sheets</h3>
              <p className="text-gray-600 mb-4">Import test cases and bugs directly from Google Sheets with AI-powered analysis</p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <FaTable className="text-green-600" />
                </div>
                <FaArrowRight className="text-green-600" />
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <FaBug className="text-red-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
            >
              <FaGithub className="text-4xl text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">GitHub Integration</h3>
              <p className="text-gray-600 mb-4">Auto-generate test cases based on your automation code repositories</p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <FaGithub className="text-gray-800" />
                </div>
                <FaArrowRight className="text-purple-600" />
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <FaRocket className="text-purple-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to streamline your testing workflow and boost productivity
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                variants={fadeInUp}
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
                Why Choose Caffetest?
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Transform your testing workflow with AI-powered automation that saves time,
                reduces errors, and provides actionable insights for better software quality.
              </p>

              <motion.div
                className="space-y-3"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    variants={fadeInUp}
                  >
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheckCircle className="text-white text-xs" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Test Analytics</h3>
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-white text-lg" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">94.2%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      className="h-2 bg-green-500 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: "94.2%" }}
                      transition={{ duration: 1.2, delay: 0.5 }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">1,247</div>
                      <div className="text-gray-600 text-sm">Tests Automated</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">89%</div>
                      <div className="text-gray-600 text-sm">Time Saved</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple 3-step process to transform your testing workflow
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Install Caffetest Extension",
                description: "Add our VS Code extension and start writing your automation tests with Cucumber syntax support.",
                color: "bg-blue-600"
              },
              {
                step: "02",
                title: "AI Analysis & Tracking",
                description: "Our system tracks test data, analyzes results using OpenAI, and generates intelligent insights.",
                color: "bg-green-600"
              },
              {
                step: "03",
                title: "Dashboard & Reports",
                description: "View comprehensive analytics, manage multiple projects, and track bugs with our intuitive dashboard.",
                color: "bg-purple-600"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mb-4 text-white font-bold`}>
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <motion.div
          className="w-full max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Testing?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who have revolutionized their testing workflow with Caffetest
          </p>

          <motion.button
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Your Free Trial
          </motion.button>
        </motion.div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 relative overflow-hidden">
        {/* SVG Background Structure */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Curved flowing lines */}
            <path
              d="M -50 50 Q 200 100, 400 50 T 800 50 T 1200 50 T 1600 50"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              opacity="0.3"
            />
            <path
              d="M -50 150 Q 250 200, 500 150 T 1000 150 T 1500 150"
              fill="none"
              stroke="rgb(96, 165, 250)"
              strokeWidth="1.5"
              opacity="0.2"
            />
            <path
              d="M 0 250 Q 300 200, 600 250 T 1200 250 T 1800 250"
              fill="none"
              stroke="rgb(147, 197, 253)"
              strokeWidth="1"
              opacity="0.15"
            />

            {/* Circuit-like connections */}
            <circle cx="15%" cy="30%" r="4" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1.5" opacity="0.4" />
            <circle cx="45%" cy="70%" r="3" fill="none" stroke="rgb(96, 165, 250)" strokeWidth="1.5" opacity="0.3" />
            <circle cx="75%" cy="40%" r="5" fill="none" stroke="rgb(147, 197, 253)" strokeWidth="1.5" opacity="0.4" />
            <circle cx="85%" cy="80%" r="3" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1.5" opacity="0.3" />

            <line x1="15%" y1="30%" x2="45%" y2="70%" stroke="rgb(59, 130, 246)" strokeWidth="0.5" opacity="0.2" strokeDasharray="5,5" />
            <line x1="45%" y1="70%" x2="75%" y2="40%" stroke="rgb(96, 165, 250)" strokeWidth="0.5" opacity="0.2" strokeDasharray="5,5" />
            <line x1="75%" y1="40%" x2="85%" y2="80%" stroke="rgb(147, 197, 253)" strokeWidth="0.5" opacity="0.2" strokeDasharray="5,5" />
          </svg>
        </div>

        <div className="w-full max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-4 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <FaCoffee className="w-8 h-8 text-blue-900" />
                <span className="text-lg font-semibold text-white">Caffetest</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                AI-powered automation testing for modern development teams.
                Streamline your workflow with intelligent test generation and analytics.
              </p>
              <div className="flex space-x-3">
                {[FaTwitter, FaGithub, FaLinkedin].map((Icon, index) => (
                  <motion.a
                    key={index}
                    href="https://github.com/GyanaprakashKhandual"
                    className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Footer link columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-medium text-sm mb-4">Visit</h4>
              <ul className="space-y-2">
                <li><a onClick={() => openPage("features")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Features</a></li>
                <li><a onClick={() => openPage("report-bug")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Report Bug</a></li>
                <li><a onClick={() => openPage("pricing")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Pricing</a></li>
                <li><a onClick={() => openPage("documentation")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Documentation</a></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-medium text-sm mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a onClick={() => window.open('https://www.neckly.com')} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">About Us</a></li>
                <li><a onClick={() => openPage("privacy")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Privacy</a></li>
                <li><a onClick={() => openPage("terms-and-conditions")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Terms & Conditions</a></li>
                <li><a onClick={() => openPage("careers")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Careers</a></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-medium text-sm mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a onClick={() => openPage("help-center")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Help Center</a></li>
                <li><a onClick={() => openPage("feedback")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Feedback</a></li>
                <li><a onClick={() => openPage("community")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Community</a></li>
                <li><a onClick={() => openPage("status")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Status</a></li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            className="border-t border-gray-800 pt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 text-sm">
              © 2025 Caffetest. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}