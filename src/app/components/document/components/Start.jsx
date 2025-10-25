'use client';

import { motion } from 'framer-motion';
import { 
  Rocket, 
  UserPlus, 
  FolderPlus,
  FolderTree,
  Layout,
  FileText,
  Bug,
  MessageSquare,
  Sheet,
  FileSpreadsheet,
  Cloud,
  Sparkles,
  Chrome,
  Mail,
  Crown,
  CheckCircle,
  ArrowRight,
  Plus,
  Menu,
  Edit,
  Trash2,
  Upload
} from 'lucide-react';

export default function GettingStartedDocumentation() {
  const steps = [
    {
      id: 1,
      title: "Create Your Account",
      icon: UserPlus,
      color: "from-blue-500 to-cyan-500",
      badge: "Step 1",
      description: "Start your journey by creating an account on CaffeTest platform",
      substeps: [
        {
          icon: Chrome,
          title: "Choose Authentication Method",
          details: [
            "Continue with Google - Quick one-click sign-up using Google OAuth",
            "Traditional Email & Password - Create account with email and custom password"
          ]
        },
        {
          icon: Crown,
          title: "Select Admin Role (Recommended)",
          details: [
            "If you're new to CaffeTest, always choose Admin role",
            "Admin users get access to all pro features",
            "Full control over projects, test types, and team management",
            "Complete workspace customization and permissions"
          ]
        },
        {
          icon: CheckCircle,
          title: "Why Choose Admin?",
          details: [
            "Access to all features that professional users need",
            "Ability to create and manage projects",
            "Control over test types, documentation, and team",
            "Best choice for first-time platform users"
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Create Your First Project",
      icon: FolderPlus,
      color: "from-purple-500 to-pink-500",
      badge: "Step 2",
      description: "Set up your testing workspace with a new project",
      substeps: [
        {
          icon: FileText,
          title: "Project Setup",
          details: [
            "Click on 'Create Project' button",
            "Enter Project Name (e.g., 'E-commerce App Testing')",
            "Add Project Description (optional but recommended)",
            "Project acts as main container for all your testing work"
          ]
        },
        {
          icon: FolderTree,
          title: "Understanding Projects",
          details: [
            "Projects organize all your testing activities",
            "Each project can have multiple test types (folders)",
            "Separate projects for different applications or modules",
            "Easy navigation and test management"
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Create Test Types (Folders)",
      icon: FolderTree,
      color: "from-green-500 to-teal-500",
      badge: "Step 3",
      description: "Organize your tests by creating different test type folders",
      substeps: [
        {
          icon: Plus,
          title: "Add Test Type Folders",
          details: [
            "Inside your project, create test type folders",
            "Common test types: Unit Test, Smoke Test, Sanity Test",
            "Additional types: Regression Test, Automation Test, API Test",
            "Create custom folders as per your testing needs"
          ]
        },
        {
          icon: FolderTree,
          title: "Folder Organization Examples",
          details: [
            "Unit Test - For component-level testing",
            "Smoke Test - Quick verification tests",
            "Regression Test - Full application testing",
            "API Test - Backend and integration tests",
            "Choose names that match your workflow"
          ]
        },
        {
          icon: Sparkles,
          title: "Benefits of Test Types",
          details: [
            "Clear separation of different testing phases",
            "Easy to locate specific test categories",
            "Better organization for large test suites",
            "Simplified reporting and analysis"
          ]
        }
      ]
    },
    {
      id: 4,
      title: "Open Workspace",
      icon: Layout,
      color: "from-orange-500 to-red-500",
      badge: "Step 4",
      description: "Access your project workspace to start testing",
      substeps: [
        {
          icon: Menu,
          title: "Navigate to Workspace",
          details: [
            "Find the 'Workspace' button in the app page navbar",
            "Click to open your project workspace area",
            "Workspace is your main testing dashboard",
            "All testing operations happen from here"
          ]
        },
        {
          icon: Layout,
          title: "Workspace Features",
          details: [
            "Add Bug - Create and track bug reports",
            "Add Test Cases - Document your test scenarios",
            "Complete Test Type - Mark testing phases as complete",
            "Run Operations - Execute test management tasks",
            "Sidebar navigation for test type selection"
          ]
        },
        {
          icon: ArrowRight,
          title: "Select Test Type",
          details: [
            "Click on a test type (folder) from the sidebar",
            "Selected test type becomes active workspace",
            "All additions go into the selected test type",
            "Easy switching between different test categories"
          ]
        }
      ]
    },
    {
      id: 5,
      title: "Add Test Cases & Bugs",
      icon: FileText,
      color: "from-indigo-500 to-purple-500",
      badge: "Step 5",
      description: "Three powerful ways to add test cases and bugs",
      substeps: [
        {
          icon: Edit,
          title: "Method 1: Form Filling (Traditional)",
          details: [
            "Click 'Add Test Case' or 'Add Bug' button",
            "Fill out the traditional form with test details",
            "Basic method for manual test case creation",
            "Straightforward and familiar approach"
          ]
        },
        {
          icon: MessageSquare,
          title: "Method 2: Chatbot Instructions (AI-Powered)",
          details: [
            "Open the AI chatbot interface",
            "Instruct: 'Add a test case for login functionality'",
            "Or say: 'Create a bug report for checkout issue'",
            "AI generates complete test case or bug automatically",
            "Natural language understanding for quick creation"
          ]
        },
        {
          icon: Cloud,
          title: "Method 3: Google Sheets Import (Bulk)",
          details: [
            "Go to 'Add Test Case' and find the dropdown",
            "Select 'Import from Cloud' option",
            "Click 'Import from Google Sheet'",
            "Paste your Google Sheets link",
            "AI automatically retrieves all test cases from sheet",
            "Bulk import saves time for large test suites",
            "Same process works for bug imports"
          ]
        }
      ]
    },
    {
      id: 6,
      title: "Create Documentation",
      icon: FileSpreadsheet,
      color: "from-pink-500 to-rose-500",
      badge: "Step 6",
      description: "Document your testing process with built-in tools",
      substeps: [
        {
          icon: FileText,
          title: "Create Documents",
          details: [
            "Click on the 'Doc' button in workspace",
            "Create text documents for test plans and specifications",
            "Full Google Docs-like features available",
            "Rich text editing, formatting, and collaboration",
            "Documents saved in currently selected test type"
          ]
        },
        {
          icon: Sheet,
          title: "Create Sheets",
          details: [
            "Click on the 'Sheet' button in workspace",
            "Create spreadsheets for test data and matrices",
            "Similar to Google Sheets functionality",
            "Tables, formulas, and data organization",
            "Sheets saved in active test type folder"
          ]
        },
        {
          icon: FolderTree,
          title: "Document Organization",
          details: [
            "All documents saved in selected test type",
            "Choose test type first, then create documents",
            "Easy organization and retrieval",
            "Documents linked to specific testing phases"
          ]
        }
      ]
    },
    {
      id: 7,
      title: "Use AI Chatbot Features",
      icon: MessageSquare,
      color: "from-cyan-500 to-blue-500",
      badge: "Step 7",
      description: "Leverage AI chatbot for complete test management",
      substeps: [
        {
          icon: Sparkles,
          title: "Complete AI Assistant",
          details: [
            "AI chatbot handles all testing operations",
            "Add bugs with natural language commands",
            "Create test cases through conversation",
            "Edit existing test cases and bugs",
            "Delete test items when needed"
          ]
        },
        {
          icon: MessageSquare,
          title: "Chatbot Capabilities",
          details: [
            "Add: 'Create a test case for user registration'",
            "Edit: 'Update test case TC-001 with new steps'",
            "Delete: 'Remove bug BUG-123 from database'",
            "Query: 'Show me all critical bugs in smoke test'",
            "Everything manageable through conversation"
          ]
        },
        {
          icon: Rocket,
          title: "Boost Your Productivity",
          details: [
            "Fastest way to manage tests",
            "No need to navigate multiple forms",
            "Natural language makes testing easier",
            "AI understands context and project structure",
            "Complete testing workflow in one interface"
          ]
        }
      ]
    }
  ];

  const quickTips = [
    {
      icon: Crown,
      title: "Start as Admin",
      description: "Get full access to all features"
    },
    {
      icon: FolderTree,
      title: "Organize Test Types",
      description: "Create folders for each testing phase"
    },
    {
      icon: MessageSquare,
      title: "Use AI Chatbot",
      description: "Fastest way to manage tests"
    },
    {
      icon: Cloud,
      title: "Import from Sheets",
      description: "Bulk import test cases quickly"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Getting Started with CaffeTest
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Complete step-by-step guide to set up your testing workspace, create projects, organize test types, and leverage AI-powered features
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 border border-blue-400 dark:border-blue-700"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">New to CaffeTest?</h3>
              <p className="text-xs text-blue-50 leading-relaxed">
                Follow these 7 easy steps to get started with CaffeTest. From account creation to AI-powered test management, we'll guide you through every feature. Remember to choose Admin role for full access to all professional features!
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 mb-8"
        >
          {steps.map((step, stepIndex) => {
            const StepIcon = step.icon;
            return (
              <motion.div
                key={step.id}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className={`bg-gradient-to-r ${step.color} p-4`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <StepIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white/80 bg-white/20 px-2 py-0.5 rounded">
                          {step.badge}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white">
                        {step.title}
                      </h2>
                      <p className="text-xs text-white/90">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-5">
                    {step.substeps.map((substep, substepIndex) => {
                      const SubstepIcon = substep.icon;
                      return (
                        <div key={substepIndex} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-7 h-7 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center`}>
                              <SubstepIcon className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              {substep.title}
                            </h3>
                          </div>
                          <ul className="space-y-2">
                            {substep.details.map((detail, detailIndex) => (
                              <motion.li
                                key={detailIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: stepIndex * 0.05 + substepIndex * 0.02 + detailIndex * 0.01 }}
                                className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300"
                              >
                                <div className="flex-shrink-0 w-1 h-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mt-1.5"></div>
                                <span>{detail}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-center"
        >
          <Rocket className="w-10 h-10 text-white mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">
            Ready to Start Testing?
          </h3>
          <p className="text-blue-50 text-xs mb-5 max-w-2xl mx-auto">
            You're all set to begin your testing journey with CaffeTest. Use these quick tips to maximize your productivity and leverage AI-powered features.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickTips.map((tip, index) => {
              const TipIcon = tip.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white/20 backdrop-blur-sm rounded-lg p-4"
                >
                  <TipIcon className="w-6 h-6 text-white mx-auto mb-2" />
                  <div className="text-white font-bold text-xs mb-1">{tip.title}</div>
                  <div className="text-blue-100 text-xs">{tip.description}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}