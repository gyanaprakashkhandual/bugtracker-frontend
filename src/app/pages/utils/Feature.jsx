'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, Code, Brain, FileText, Bug, CheckSquare, AlertCircle, 
  Users, Shield, Folder, LayoutGrid, List, Table, Split, 
  Zap, MessageSquare, GitBranch, BarChart3, Clock, Eye,
  Layers, Box, Command, Wand2, Database, RefreshCw
} from 'lucide-react'

export default function CaffeTestFeatures() {
  const [activeTab, setActiveTab] = useState('overview')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  }

  const coreFeatures = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Document & Sheet Management',
      description: 'Create, organize, and collaborate on documentation with Google Docs-like experience. Manage sheets with Excel-like functionality for comprehensive test data organization.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Bug className="w-6 h-6" />,
      title: 'Advanced Bug Tracking',
      description: 'Track, manage, and resolve bugs efficiently with real-time updates, AI-powered categorization, and automatic assignment based on your team structure.',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: <CheckSquare className="w-6 h-6" />,
      title: 'Test Case Management',
      description: 'Design, execute, and monitor test cases with intelligent tracking. Automatically link test results from VS Code extensions to corresponding test cases.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: 'Issue Tracking System',
      description: 'Monitor and resolve project issues beyond bugs and tests. Perfect for feature requests, improvements, and general project management tasks.',
      gradient: 'from-orange-500 to-amber-500'
    }
  ]

  const viewTypes = [
    {
      icon: <Split className="w-8 h-8" />,
      name: 'Split View',
      description: 'Edit and view content side-by-side with real-time synchronization. Perfect for comparing data or working with multiple documents simultaneously.',
      color: 'purple'
    },
    {
      icon: <LayoutGrid className="w-8 h-8" />,
      name: 'Card View',
      description: 'Visualize your tasks, bugs, and test cases in an intuitive card-based layout. Drag, drop, and organize with Kanban-style boards for agile workflows.',
      color: 'blue'
    },
    {
      icon: <Table className="w-8 h-8" />,
      name: 'Sheet View',
      description: 'Work with data in a powerful spreadsheet interface, exactly like Google Sheets. Perfect for bulk operations, data analysis, and detailed record keeping.',
      color: 'green'
    }
  ]

  const aiFeatures = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: 'Intelligent AI Chatbot',
      description: 'Interact with your entire project using natural language. Ask questions, create items, or manage your workflow—all through conversational AI.',
      features: ['Natural language commands', 'Context-aware responses', 'Action confirmations', 'Smart suggestions']
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: 'VS Code Integration',
      description: 'Control CaffeTest directly from your code editor. Execute commands, create test cases, and track bugs without leaving your development environment.',
      features: ['Direct editor commands', 'Real-time test tracking', 'Automatic result sync', 'Inline bug reporting']
    },
    {
      icon: <Wand2 className="w-5 h-5" />,
      title: 'Auto-Documentation',
      description: 'AI automatically generates test case documentation, bug reports, and project summaries based on your work patterns and test results.',
      features: ['Smart content generation', 'Pattern recognition', 'Auto-categorization', 'Intelligent linking']
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'AI-Powered Reports',
      description: 'Generate insightful dashboards and reports with AI analysis. Get actionable insights about your project health, team performance, and testing coverage.',
      features: ['Visual dashboards', 'Trend analysis', 'Predictive insights', 'Custom metrics']
    }
  ]

  const projectManagement = [
    {
      icon: <Folder className="w-6 h-6" />,
      title: 'Test Types & Folders',
      description: 'Organize unlimited test types within each project. Think of them as smart folders that can contain infinite documents, sheets, and test cases.',
      highlight: 'Infinite organization possibilities'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Multi-Team Support',
      description: 'Manage multiple teams within your organization. Support for both dark teams and white teams with customized workflows and access controls.',
      highlight: 'Flexible team structures'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Access Control',
      description: 'Granular permission management for projects, test types, and individual items. Admin controls ensure secure collaboration across teams.',
      highlight: 'Enterprise-grade security'
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: 'Project Management',
      description: 'Complete project lifecycle management from planning to execution. Track progress, manage resources, and coordinate across teams seamlessly.',
      highlight: 'End-to-end visibility'
    }
  ]

  const realtimeFeatures = [
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: 'Real-Time Auto-Save',
      description: 'Never lose your work. Every change is automatically saved in real-time as you type.'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Collaborative Editing',
      description: 'See your teammates\' changes instantly. Work together on documents, test cases, and bugs simultaneously.'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Instant Sync',
      description: 'VS Code extension results appear immediately in your web dashboard. Zero delay between testing and tracking.'
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: 'Live Updates',
      description: 'Watch as test results flow in real-time. Failed tests automatically create bug reports with context.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-features" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.05)" strokeWidth="1"/>
          </pattern>
          <pattern id="dots-features" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(59, 130, 246, 0.1)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-features)"/>
        <rect width="100%" height="100%" fill="url(#dots-features)"/>
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Powerful Features</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Everything You Need for <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Modern Testing</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            CaffeTest brings together AI-powered automation, collaborative workflows, and intelligent project management to revolutionize how you test software.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Four Core Areas of Excellence
          </motion.h2>
          <motion.p variants={itemVariants} className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            CaffeTest provides comprehensive coverage across the most critical aspects of software testing and quality assurance.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden group"
              >
                <div className={`h-1.5 bg-gradient-to-r ${feature.gradient}`} />
                <div className="p-6 sm:p-8">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Three Powerful View Types
          </motion.h2>
          <motion.p variants={itemVariants} className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Work the way you want. Switch between views seamlessly to match your workflow and preferences.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {viewTypes.map((view, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center group"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-${view.color}-100 flex items-center justify-center text-${view.color}-600 group-hover:bg-gradient-to-br group-hover:from-${view.color}-500 group-hover:to-${view.color}-600 group-hover:text-white transition-all duration-300`}>
                  {view.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{view.name}</h3>
                <p className="text-gray-600 leading-relaxed">{view.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl p-8 sm:p-12 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-8 h-8" />
              <h2 className="text-3xl sm:text-4xl font-bold">AI-Powered Intelligence</h2>
            </div>
            <p className="text-white/90 text-lg mb-12 max-w-3xl">
              Experience the future of testing with AI that understands natural language, automates documentation, and provides intelligent insights across your entire project.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-white/80 text-sm mb-4">{feature.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-white/90">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <Command className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xl font-bold mb-2">Conversational AI Experience</h4>
                  <p className="text-white/90 leading-relaxed">
                    Interact with CaffeTest like you would with ChatGPT or Claude. Ask questions in plain English, request actions, and receive intelligent confirmations. Our AI provides a human-like conversational experience with contextual understanding, smart suggestions, and friendly confirmations before executing important actions. It's like having a testing expert available 24/7 who knows your entire project inside out.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Complete Project Management
          </motion.h2>
          <motion.p variants={itemVariants} className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Organize, control, and scale your testing operations with enterprise-grade project management features.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {projectManagement.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-3 leading-relaxed">{feature.description}</p>
                    <div className="inline-flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">{feature.highlight}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Real-Time Collaboration</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Work seamlessly with your team. Every action is synchronized instantly across all devices and users.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {realtimeFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                  className="text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-2xl p-8 sm:p-12 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Code className="w-8 h-8" />
              <h2 className="text-3xl sm:text-4xl font-bold">VS Code Extension Magic</h2>
            </div>
            <p className="text-white/90 text-lg mb-8 max-w-3xl">
              Our Visual Studio Code extension seamlessly integrates with CaffeTest, bringing the power of AI-driven testing directly into your development environment.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Automatic Test Tracking</h3>
                <div className="space-y-3">
                  {[
                    'Run tests directly in VS Code',
                    'Results automatically sync to CaffeTest',
                    'Failed tests create bug reports instantly',
                    'Passed tests update test case status',
                    'Real-time result visualization'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <span className="text-white/90">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Command-Based Control</h3>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <p className="text-white/90 mb-4">Execute commands directly from your editor:</p>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="bg-black/20 rounded px-3 py-2">caffetest add test-case</div>
                    <div className="bg-black/20 rounded px-3 py-2">caffetest create bug</div>
                    <div className="bg-black/20 rounded px-3 py-2">caffetest get all bugs</div>
                    <div className="bg-black/20 rounded px-3 py-2">caffetest filter tests</div>
                  </div>
                  <p className="text-white/80 text-sm mt-4">
                    AI processes your commands and performs actions instantly. No context switching required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 border border-purple-100">
            <Database className="w-16 h-16 mx-auto mb-6 text-purple-600" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Infinite Scalability
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              CaffeTest is built for growth. Create unlimited projects, add infinite test types (folders) to each project, and populate them with unlimited documents, sheets, test cases, and bugs. Your testing infrastructure scales effortlessly as your organization grows, with no artificial limits on collaboration or data storage.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                <div className="text-sm font-semibold text-gray-900">Projects</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">∞</div>
                <div className="text-sm font-semibold text-gray-900">Test Types</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-cyan-600 mb-2">∞</div>
                <div className="text-sm font-semibold text-gray-900">Documents</div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}