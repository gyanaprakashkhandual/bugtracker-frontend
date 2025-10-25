'use client';

import { motion } from 'framer-motion';
import {
    Download,
    UserPlus,
    Key,
    Settings,
    TestTube,
    Send,
    Mail,
    Lock,
    Chrome,
    FolderOpen,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    Bug,
    Sparkles
} from 'lucide-react';

export default function CaffetestDocs() {
    const steps = [
        {
            number: 1,
            title: "Install the Extension",
            icon: Download,
            description: "Get started by installing the Caffetest Tracker extension from VS Code Marketplace",
            substeps: [
                { icon: Chrome, text: "Open VS Code Extensions Marketplace (Ctrl+Shift+X or Cmd+Shift+X)" },
                { icon: FileText, text: 'Search for "Caffetest Tracker"' },
                { icon: CheckCircle, text: "Click Install" },
                { icon: Sparkles, text: "Reload VS Code if prompted" }
            ]
        },
        {
            number: 2,
            title: "Create Your Caffetest Account",
            icon: UserPlus,
            description: "Set up your account on the Caffetest web application",
            substeps: [
                { icon: Chrome, text: "Visit Caffetest Web Application" },
                { icon: Mail, text: "Email & Password - Traditional registration" },
                { icon: Chrome, text: "Google OAuth - Quick one-click sign-up" },
                { icon: CheckCircle, text: "Complete the registration process" },
                { icon: Lock, text: "Remember your credentials for VS Code login" }
            ]
        },
        {
            number: 3,
            title: "Authenticate in VS Code",
            icon: Key,
            description: "Connect your Caffetest account with the VS Code extension",
            substeps: [
                { icon: Chrome, text: "Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)" },
                { icon: FileText, text: 'Type and select "Caffetest: Login"' },
                { icon: Mail, text: "Enter your email address" },
                { icon: Lock, text: "Enter your password OR click 'Login with Google'" },
                { icon: CheckCircle, text: 'Wait for "Authentication Successful" notification' }
            ]
        },
        {
            number: 4,
            title: "Configure Project & Test Type",
            icon: Settings,
            description: "Set up your project and test type preferences",
            substeps: [
                { icon: FolderOpen, text: "Open the Configure accordion" },
                { icon: Settings, text: "Locate Project and Test Type dropdown" },
                { icon: FolderOpen, text: "Choose your Project from dropdown" },
                { icon: FileText, text: "Select your Test Type (filtered by project)" },
                { icon: CheckCircle, text: "Configuration saved automatically" }
            ]
        },
        {
            number: 5,
            title: "Write & Run Your Tests",
            icon: TestTube,
            description: "Execute your automation tests as usual",
            substeps: [
                { icon: FileText, text: "Write tests using Selenium, Cucumber, JUnit, or TestNG" },
                { icon: TestTube, text: "Run test suite through IDE or terminal" },
                { icon: CheckCircle, text: "Extension automatically detects test executions" }
            ]
        },
        {
            number: 6,
            title: "Send Results to Caffetest",
            icon: Send,
            description: "Upload your test results and view comprehensive reports",
            substeps: [
                { icon: Send, text: 'Click "Caffetest: Send Test Results" command' },
                { icon: Sparkles, text: "Or enable Auto-Sync for automatic uploads" },
                { icon: CheckCircle, text: "Successfully sent tests" },
                { icon: Clock, text: "Pending tests" },
                { icon: XCircle, text: "Failed uploads" },
                { icon: FileText, text: "Auto-generated test cases (passed tests)" },
                { icon: Bug, text: "Auto-generated bug reports (failed tests)" }
            ]
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        return (
                            <motion.div
                                key={step.number}
                                variants={itemVariants}
                                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="relative">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                    <StepIcon className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                    {step.number}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                {step.title}
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                                {step.description}
                                            </p>

                                            <div className="space-y-2">
                                                {step.substeps.map((substep, subIndex) => {
                                                    const SubIcon = substep.icon;
                                                    return (
                                                        <motion.div
                                                            key={subIndex}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 + subIndex * 0.05 }}
                                                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                        >
                                                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-lg flex items-center justify-center">
                                                                <SubIcon className="w-4 h-4 text-white" />
                                                            </div>
                                                            <p className="text-xs text-gray-700 dark:text-gray-200 pt-1 flex-1">
                                                                {substep.text}
                                                            </p>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-center"
                >
                    <Sparkles className="w-10 h-10 text-white mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                        Ready to Get Started?
                    </h3>
                    <p className="text-blue-50 text-sm mb-4 max-w-2xl mx-auto">
                        Follow these steps to streamline your testing workflow and automatically generate test cases and bug reports with Caffetest
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <CheckCircle className="w-4 h-4 text-white" />
                            <span className="text-white font-medium text-xs">Auto Test Cases</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <Bug className="w-4 h-4 text-white" />
                            <span className="text-white font-medium text-xs">Auto Bug Reports</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-white font-medium text-xs">Real-time Tracking</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}