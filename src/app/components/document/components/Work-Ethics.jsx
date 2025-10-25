'use client';

import { motion } from 'framer-motion';
import {
    Brain,
    Code,
    MessageSquare,
    FolderTree,
    FileCode,
    Bot,
    Sparkles,
    TestTube,
    Bug,
    FileText,
    Image,
    Lightbulb,
    Zap,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export default function WorkEthicsDocumentation() {
    const sections = [
        {
            id: 1,
            title: "Understanding AI Integration",
            icon: Brain,
            color: "from-blue-500 to-cyan-500",
            content: "Learn how CaffeTest AI analyzes your automation code and generates test cases and bug reports",
            details: [
                {
                    subtitle: "How AI Reads Your Code",
                    icon: Code,
                    points: [
                        "AI analyzes your test script snippets to understand test logic and flow",
                        "Powered by OpenAI API for intelligent code comprehension",
                        "Generates test cases that closely match manual testing behavior"
                    ]
                },
                {
                    subtitle: "Working with Cucumber",
                    icon: FileCode,
                    points: [
                        "Cucumber BDD format is ideal for AI integration",
                        "Test steps are written in plain language (Given, When, Then)",
                        "AI can easily generate accurate test cases from Cucumber scenarios",
                        "Best practice: Write clear, descriptive step definitions"
                    ]
                },
                {
                    subtitle: "Traditional Test Scripts",
                    icon: TestTube,
                    points: [
                        "Selenium, Java, or Page Object Model frameworks are supported",
                        "Add comments to describe what each test is doing",
                        "Include assertions with descriptive comments for better context",
                        "Example: // Verify user login with valid credentials"
                    ]
                }
            ]
        },
        {
            id: 2,
            title: "AI Intelligence & Code Quality",
            icon: Sparkles,
            color: "from-purple-500 to-pink-500",
            content: "Maximize AI effectiveness with well-structured test scripts",
            details: [
                {
                    subtitle: "Without Comments",
                    icon: AlertCircle,
                    points: [
                        "OpenAI is intelligent enough to work without comments",
                        "AI analyzes code structure, assertions, and logic patterns",
                        "Generates test cases based on code behavior understanding",
                        "Still produces quality results, but less precise"
                    ]
                },
                {
                    subtitle: "With Comments (Recommended)",
                    icon: CheckCircle,
                    points: [
                        "Better test scripts lead to more accurate test case generation",
                        "AI produces results closer to actual manual test cases",
                        "Test cases match human-written documentation style",
                        "Provides clear context for test intent and expected outcomes"
                    ]
                },
                {
                    subtitle: "Best Practices",
                    icon: Lightbulb,
                    points: [
                        "Write descriptive test method names",
                        "Add inline comments for complex logic",
                        "Use meaningful variable and function names",
                        "Include assertion messages that explain expected behavior"
                    ]
                }
            ]
        },
        {
            id: 3,
            title: "AI Chatbot Integration",
            icon: MessageSquare,
            color: "from-green-500 to-teal-500",
            content: "Interact with AI like ChatGPT directly in VS Code",
            details: [
                {
                    subtitle: "How the Chatbot Works",
                    icon: Bot,
                    points: [
                        "Direct integration with OpenAI API in VS Code",
                        "Works similar to ChatGPT but specialized for testing",
                        "Understands your test context and project structure",
                        "Trained specifically for test automation workflows"
                    ]
                },
                {
                    subtitle: "Input Format Matters",
                    icon: FileText,
                    points: [
                        "Clear data input leads to better AI responses",
                        "AI is trained to understand various data formats",
                        "The clearer your input, the more accurate the output",
                        "AI adapts to your communication style"
                    ]
                },
                {
                    subtitle: "AI Capabilities",
                    icon: Zap,
                    points: [
                        "Generate test cases from screenshots or descriptions",
                        "Create bug reports automatically from test failures",
                        "Understand context from your project structure",
                        "Match human behavior in test documentation"
                    ]
                }
            ]
        },
        {
            id: 4,
            title: "Project & Test Type Organization",
            icon: FolderTree,
            color: "from-orange-500 to-red-500",
            content: "Structure your testing workspace for maximum efficiency",
            details: [
                {
                    subtitle: "Creating Projects",
                    icon: FolderTree,
                    points: [
                        "Start by creating a project for your application",
                        "Each project can contain multiple test types",
                        "Organize by application, module, or team structure",
                        "Easy navigation and test case discovery"
                    ]
                },
                {
                    subtitle: "Test Type Categories",
                    icon: TestTube,
                    points: [
                        "Unit Test: Testing individual components or functions",
                        "Smoke Test: Basic functionality and critical path tests",
                        "Functional Test: End-to-end feature testing",
                        "API Test: Backend and integration testing",
                        "Create custom test types as needed"
                    ]
                },
                {
                    subtitle: "Folder Structure Benefits",
                    icon: FileText,
                    points: [
                        "Good folder support for organized test management",
                        "Know exactly which folder contains what tests",
                        "Add documentation and sheets per folder",
                        "Easy to find and reference test artifacts",
                        "Scalable structure for growing test suites"
                    ]
                }
            ]
        },
        {
            id: 5,
            title: "Test Case Generation",
            icon: FileCode,
            color: "from-indigo-500 to-purple-500",
            content: "Streamlined test case creation with AI assistance",
            details: [
                {
                    subtitle: "Simplified Test Case Model",
                    icon: FileText,
                    points: [
                        "Designed for quick test case creation",
                        "No heavy image uploads or reference links required",
                        "Focus on essential test information",
                        "Lightweight and fast to populate"
                    ]
                },
                {
                    subtitle: "AI-Powered Generation",
                    icon: Sparkles,
                    points: [
                        "Simply provide a prompt: 'Generate this test case'",
                        "Upload screenshots for visual reference",
                        "AI generates all possible test scenarios",
                        "Automatically organized into correct test type folders",
                        "Bulk generation from single inputs"
                    ]
                },
                {
                    subtitle: "Workflow Example",
                    icon: Zap,
                    points: [
                        "Upload screenshot of feature or provide description",
                        "AI analyzes and generates comprehensive test cases",
                        "Test cases automatically saved to specified test type",
                        "Review and adjust as needed",
                        "Ready for execution and tracking"
                    ]
                }
            ]
        },
        {
            id: 6,
            title: "Bug Report Management",
            icon: Bug,
            color: "from-red-500 to-pink-500",
            content: "Efficient bug reporting with AI automation",
            details: [
                {
                    subtitle: "Manual vs AI-Assisted",
                    icon: AlertCircle,
                    points: [
                        "Traditional manual bug filling can be time-consuming",
                        "Many fields to fill and details to capture",
                        "Repetitive information entry",
                        "CaffeTest offers a better solution"
                    ]
                },
                {
                    subtitle: "AI Does the Heavy Lifting",
                    icon: Bot,
                    points: [
                        "Let AI handle repetitive bug report tasks",
                        "Provide basic information, AI fills the rest",
                        "Automatically captures relevant test context",
                        "Consistent bug report formatting",
                        "Saves significant time and effort"
                    ]
                },
                {
                    subtitle: "Smart Bug Creation",
                    icon: CheckCircle,
                    points: [
                        "AI analyzes failed test results automatically",
                        "Generates detailed bug reports with context",
                        "Includes test steps, expected vs actual results",
                        "Links to relevant test cases and execution logs",
                        "Professional bug reports in seconds"
                    ]
                }
            ]
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
            <div className="max-w-full mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        CaffeTest Work Ethics
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Understanding AI integration, best practices, and workflow optimization for automated test case and bug report generation
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {sections.map((section, sectionIndex) => {
                        const SectionIcon = section.icon;
                        return (
                            <motion.div
                                key={section.id}
                                variants={itemVariants}
                                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                            >
                                <div className={`bg-gradient-to-r ${section.color} p-4`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                            <SectionIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-lg font-bold text-white">
                                                {section.title}
                                            </h2>
                                            <p className="text-xs text-white/90">
                                                {section.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-5">
                                        {section.details.map((detail, detailIndex) => {
                                            const DetailIcon = detail.icon;
                                            return (
                                                <div key={detailIndex} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className={`w-7 h-7 bg-gradient-to-br ${section.color} rounded-lg flex items-center justify-center`}>
                                                            <DetailIcon className="w-4 h-4 text-white" />
                                                        </div>
                                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {detail.subtitle}
                                                        </h3>
                                                    </div>
                                                    <ul className="space-y-2">
                                                        {detail.points.map((point, pointIndex) => (
                                                            <motion.li
                                                                key={pointIndex}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: sectionIndex * 0.05 + detailIndex * 0.02 + pointIndex * 0.01 }}
                                                                className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300"
                                                            >
                                                                <div className="flex-shrink-0 w-1 h-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mt-1.5"></div>
                                                                <span>{point}</span>
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
                    className="mt-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-center"
                >
                    <Sparkles className="w-10 h-10 text-white mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">
                        AI-Powered Testing Excellence
                    </h3>
                    <p className="text-blue-50 text-xs mb-4 max-w-2xl mx-auto">
                        CaffeTest combines intelligent AI with your testing workflow to automatically generate professional test cases and bug reports that match human behavior
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <Brain className="w-4 h-4 text-white" />
                            <span className="text-white font-medium text-xs">OpenAI Powered</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <Code className="w-4 h-4 text-white" />
                            <span className="text-white font-medium text-xs">Code Analysis</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <Zap className="w-4 h-4 text-white" />
                            <span className="text-white font-medium text-xs">Automated Generation</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <CheckCircle className="w-4 h-4 text-white" />
                            <span className="text-white font-medium text-xs">Human-like Output</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}