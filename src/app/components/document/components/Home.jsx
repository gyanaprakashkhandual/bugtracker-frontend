'use client';

import { motion } from 'framer-motion';
import {
    BookOpen,
    Rocket,
    Brain,
    Shield,
    FileText,
    Wrench,
    Lightbulb,
    ArrowRight,
    CheckCircle,
    Sparkles,
    Code,
    MessageSquare,
    Lock,
    Users
} from 'lucide-react';

export default function DocumentationHome() {
    const sections = [
        {
            icon: Rocket,
            title: "Getting Started",
            description: "Learn how to set up your account, create projects, and start testing with CaffeTest",
            color: "from-blue-500 to-cyan-500",
            topics: [
                "Create your account with Google or Email",
                "Set up projects and test types",
                "Navigate the workspace",
                "Add your first test cases"
            ]
        },
        {
            icon: FileText,
            title: "Installation Guide",
            description: "Step-by-step instructions to install and configure the CaffeTest VS Code extension",
            color: "from-purple-500 to-pink-500",
            topics: [
                "Install from VS Code Marketplace",
                "Authenticate with CaffeTest",
                "Configure project settings",
                "Send test results automatically"
            ]
        },
        {
            icon: Brain,
            title: "Work Ethics & AI",
            description: "Understand how AI integration works and best practices for optimal test generation",
            color: "from-green-500 to-teal-500",
            topics: [
                "How AI analyzes your test code",
                "Cucumber vs traditional scripts",
                "AI chatbot capabilities",
                "Project and folder organization"
            ]
        },
        {
            icon: Shield,
            title: "Security & Privacy",
            description: "Learn about our security measures, password protection, and data privacy policies",
            color: "from-orange-500 to-red-500",
            topics: [
                "Google OAuth vs Email/Password",
                "Password hashing and encryption",
                "Data privacy commitment",
                "End-to-end encryption roadmap"
            ]
        }
    ];

    const quickLinks = [
        {
            icon: Rocket,
            title: "Quick Start",
            description: "Get up and running in 5 minutes",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: Code,
            title: "VS Code Setup",
            description: "Install and configure the extension",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: MessageSquare,
            title: "AI Features",
            description: "Learn about AI-powered testing",
            color: "from-green-500 to-teal-500"
        },
        {
            icon: Lock,
            title: "Security Info",
            description: "Understand our security practices",
            color: "from-orange-500 to-red-500"
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
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
                        <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        CaffeTest Documentation
                    </h1>
                    <p className="text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
                        Welcome to CaffeTest! Your complete guide to AI-powered test automation, VS Code integration, and intelligent test management.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg">
                            <Brain className="w-4 h-4" />
                            <span className="text-xs font-medium">AI-Powered</span>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg">
                            <Code className="w-4 h-4" />
                            <span className="text-xs font-medium">VS Code Extension</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-medium">Automated Testing</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-10 border border-blue-400 dark:border-blue-700"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                            <Lightbulb className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">What is CaffeTest?</h3>
                            <p className="text-sm text-blue-50 leading-relaxed">
                                CaffeTest is an AI-powered testing platform that integrates with Visual Studio Code to automatically generate test cases and bug reports. Using OpenAI technology, it analyzes your automation code and creates professional documentation that matches human behavior. Streamline your testing workflow with intelligent chatbots, Google Sheets import, and seamless project organization.
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-10"
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Documentation Sections</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sections.map((section, index) => {
                            const SectionIcon = section.icon;
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                                >
                                    <div className={`bg-gradient-to-r ${section.color} p-4`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                <SectionIcon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white">
                                                {section.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                            {section.description}
                                        </p>
                                        <ul className="space-y-2">
                                            {section.topics.map((topic, topicIndex) => (
                                                <li key={topicIndex} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>{topic}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <button className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                            Read More
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mb-10"
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Links</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickLinks.map((link, index) => {
                            const LinkIcon = link.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                                >
                                    <div className={`w-10 h-10 bg-gradient-to-br ${link.color} rounded-lg flex items-center justify-center mb-3`}>
                                        <LinkIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                        {link.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {link.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-center"
                >
                    <Sparkles className="w-12 h-12 text-white mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-3">
                        Ready to Get Started?
                    </h3>
                    <p className="text-blue-50 text-sm mb-6 max-w-2xl mx-auto">
                        Begin your journey with CaffeTest and experience the power of AI-driven test automation. Follow our comprehensive guides to set up your account, install the extension, and start generating intelligent test cases.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors">
                            <Rocket className="w-4 h-4" />
                            Getting Started Guide
                        </button>
                        <button className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-white/30 transition-colors">
                            <FileText className="w-4 h-4" />
                            View All Docs
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                        <Users className="w-8 h-8 text-blue-500 mb-3" />
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                            Community Support
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Join our community for help, tips, and best practices from other CaffeTest users.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                        <MessageSquare className="w-8 h-8 text-purple-500 mb-3" />
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                            AI Chatbot Help
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Use our intelligent chatbot for instant answers to your testing questions.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                        <Wrench className="w-8 h-8 text-green-500 mb-3" />
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                            API Documentation
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Integrate CaffeTest into your workflow with our comprehensive API docs.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}