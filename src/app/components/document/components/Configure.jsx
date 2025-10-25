'use client';

import { motion } from 'framer-motion';
import {
    Settings,
    Users,
    Lock,
    Eye,
    Edit,
    Crown,
    FolderTree,
    FileText,
    Sheet,
    MessageSquare,
    CheckCircle,
    XCircle,
    AlertCircle,
    Infinity,
    FolderPlus,
    Trash2,
    ChevronDown,
    Link2
} from 'lucide-react';

export default function ConfigurationDocumentation() {
    const configurations = [
        {
            id: 1,
            title: "Access Control Configuration",
            icon: Lock,
            color: "from-blue-500 to-cyan-500",
            description: "Control which users in your organization can access and work with specific projects",
            sections: [
                {
                    subtitle: "User Access Levels",
                    icon: Users,
                    content: [
                        {
                            title: "View Access",
                            icon: Eye,
                            color: "text-blue-500",
                            points: [
                                "Users can only view the project",
                                "No editing or deletion permissions",
                                "Read-only access to all project content",
                                "Ideal for stakeholders and reviewers"
                            ]
                        },
                        {
                            title: "Edit Access",
                            icon: Edit,
                            color: "text-green-500",
                            points: [
                                "Users can edit project content",
                                "Cannot delete any items",
                                "Modify test cases, bugs, and documentation",
                                "Perfect for team contributors"
                            ]
                        },
                        {
                            title: "Admin Access",
                            icon: Crown,
                            color: "text-purple-500",
                            points: [
                                "Complete admin control over the project",
                                "Full permissions: create, edit, delete",
                                "Manage access control for other users",
                                "Same level as project creator",
                                "Can control everything in the project"
                            ]
                        }
                    ]
                },
                {
                    subtitle: "How to Configure Access",
                    icon: Settings,
                    points: [
                        "Navigate to project settings",
                        "Select 'Access Control' option",
                        "Choose users from your organization",
                        "Assign access level: View, Edit, or Admin",
                        "Changes take effect immediately"
                    ]
                }
            ]
        },
        {
            id: 2,
            title: "Project Configuration",
            icon: FolderTree,
            color: "from-purple-500 to-pink-500",
            description: "Manage project creation, editing, deletion, and run operations",
            sections: [
                {
                    subtitle: "Project Operations",
                    icon: Settings,
                    points: [
                        "Create new projects for different applications",
                        "Edit project name and description",
                        "Delete projects when no longer needed",
                        "Complete run operations for test execution",
                        "Archive completed projects"
                    ]
                },
                {
                    subtitle: "Project Management Features",
                    icon: FolderTree,
                    points: [
                        "Each project acts as a container for testing work",
                        "Organize by application, module, or team",
                        "Multiple test types within each project",
                        "Centralized test management dashboard",
                        "Project-level reporting and analytics"
                    ]
                }
            ]
        },
        {
            id: 3,
            title: "Test Type (Folder) Configuration",
            icon: FolderPlus,
            color: "from-green-500 to-teal-500",
            description: "Create and manage unlimited test type folders within each project",
            sections: [
                {
                    subtitle: "Unlimited Folder Creation",
                    icon: Infinity,
                    points: [
                        "Create infinite number of folders per project",
                        "Each folder represents a test type or category",
                        "Common types: Unit, Smoke, Sanity, Regression, API",
                        "Custom folder names based on your workflow",
                        "No limits on folder organization"
                    ]
                },
                {
                    subtitle: "Folder Organization",
                    icon: FolderTree,
                    points: [
                        "Folders help categorize different testing phases",
                        "Easy navigation between test types",
                        "Each folder contains its own test cases and bugs",
                        "Independent documentation for each folder",
                        "Structured approach to test management"
                    ]
                }
            ]
        },
        {
            id: 4,
            title: "Chatbot Configuration",
            icon: MessageSquare,
            color: "from-orange-500 to-red-500",
            description: "Understand chatbot scope and test type switching",
            sections: [
                {
                    subtitle: "Chatbot Scope & Context",
                    icon: Link2,
                    points: [
                        "Chatbot works within selected test type and project",
                        "All operations apply to current test type only",
                        "Context-aware: understands your project structure",
                        "Test cases and bugs created in active folder",
                        "Maintains project-specific knowledge"
                    ]
                },
                {
                    subtitle: "Switching Test Types in Chatbot",
                    icon: ChevronDown,
                    points: [
                        "Locate dropdown near the chatbot input box",
                        "Click on test type dropdown menu",
                        "Select different test type from the list",
                        "Chatbot immediately switches context",
                        "All subsequent operations apply to new test type",
                        "Easy switching without leaving chatbot interface"
                    ]
                },
                {
                    subtitle: "Chatbot Capabilities",
                    icon: MessageSquare,
                    points: [
                        "Add test cases and bugs via conversation",
                        "Edit existing test items naturally",
                        "Delete items with simple commands",
                        "Query test information and statistics",
                        "Works seamlessly within active context"
                    ]
                }
            ]
        },
        {
            id: 5,
            title: "Document & Sheet Configuration",
            icon: FileText,
            color: "from-indigo-500 to-purple-500",
            description: "Create unlimited documentation and spreadsheets within test types",
            sections: [
                {
                    subtitle: "Unlimited Documents",
                    icon: Infinity,
                    points: [
                        "Create infinite number of docs per test type",
                        "Google Docs-like editing features",
                        "Rich text formatting and collaboration",
                        "Each doc associated with specific folder",
                        "Organized by test type and project"
                    ]
                },
                {
                    subtitle: "Unlimited Sheets",
                    icon: Sheet,
                    points: [
                        "Create infinite number of sheets per test type",
                        "Google Sheets-like functionality",
                        "Tables, formulas, and data organization",
                        "Each sheet linked to specific folder",
                        "Perfect for test data matrices"
                    ]
                },
                {
                    subtitle: "Document Association",
                    icon: Link2,
                    points: [
                        "All docs and sheets tied to test type (folder)",
                        "Also associated with parent project",
                        "Clear organizational hierarchy",
                        "Easy to find relevant documentation",
                        "Context-specific content management"
                    ]
                }
            ]
        }
    ];

    const accessLevelComparison = [
        {
            feature: "View Content",
            view: true,
            edit: true,
            admin: true
        },
        {
            feature: "Edit Content",
            view: false,
            edit: true,
            admin: true
        },
        {
            feature: "Delete Items",
            view: false,
            edit: false,
            admin: true
        },
        {
            feature: "Manage Access",
            view: false,
            edit: false,
            admin: true
        },
        {
            feature: "Project Settings",
            view: false,
            edit: false,
            admin: true
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
                        <Settings className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Configuration Guide
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Complete guide to configuring access control, projects, test types, chatbot, documents, and sheets in CaffeTest
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
                            <AlertCircle className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">Configuration Overview</h3>
                            <p className="text-xs text-blue-50 leading-relaxed">
                                CaffeTest offers flexible configuration options to manage access control, organize projects and test types, and control chatbot behavior. Understand how documents and sheets are associated with test types and learn to switch contexts easily in the chatbot interface.
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Access Level Comparison
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-bold">Feature</th>
                                    <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300 font-bold">View</th>
                                    <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300 font-bold">Edit</th>
                                    <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300 font-bold">Admin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accessLevelComparison.map((row, index) => (
                                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50">
                                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{row.feature}</td>
                                        <td className="text-center py-3 px-4">
                                            {row.view ? (
                                                <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                                            )}
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            {row.edit ? (
                                                <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                                            )}
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            {row.admin ? (
                                                <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {configurations.map((config, configIndex) => {
                        const ConfigIcon = config.icon;
                        return (
                            <motion.div
                                key={config.id}
                                variants={itemVariants}
                                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                            >
                                <div className={`bg-gradient-to-r ${config.color} p-4`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                            <ConfigIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-lg font-bold text-white">
                                                {config.title}
                                            </h2>
                                            <p className="text-xs text-white/90">
                                                {config.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-5">
                                        {config.sections.map((section, sectionIndex) => {
                                            const SectionIcon = section.icon;
                                            return (
                                                <div key={sectionIndex} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className={`w-7 h-7 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center`}>
                                                            <SectionIcon className="w-4 h-4 text-white" />
                                                        </div>
                                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {section.subtitle}
                                                        </h3>
                                                    </div>

                                                    {section.content ? (
                                                        <div className="space-y-4">
                                                            {section.content.map((item, itemIndex) => {
                                                                const ItemIcon = item.icon;
                                                                return (
                                                                    <div key={itemIndex} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <ItemIcon className={`w-5 h-5 ${item.color}`} />
                                                                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                                                                                {item.title}
                                                                            </h4>
                                                                        </div>
                                                                        <ul className="space-y-1.5 ml-7">
                                                                            {item.points.map((point, pointIndex) => (
                                                                                <li key={pointIndex} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                                                                                    <div className="flex-shrink-0 w-1 h-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mt-1.5"></div>
                                                                                    <span>{point}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <ul className="space-y-2">
                                                            {section.points.map((point, pointIndex) => (
                                                                <motion.li
                                                                    key={pointIndex}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: configIndex * 0.05 + sectionIndex * 0.02 + pointIndex * 0.01 }}
                                                                    className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300"
                                                                >
                                                                    <div className="flex-shrink-0 w-1 h-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mt-1.5"></div>
                                                                    <span>{point}</span>
                                                                </motion.li>
                                                            ))}
                                                        </ul>
                                                    )}
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
                    <Settings className="w-10 h-10 text-white mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">
                        Flexible Configuration
                    </h3>
                    <p className="text-blue-50 text-xs mb-5 max-w-2xl mx-auto">
                        CaffeTest provides powerful configuration options to organize your testing workspace. Control access, create unlimited test types, and manage context-aware chatbot interactions seamlessly.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <Lock className="w-4 h-4 text-white" />
                            <span className="text-white font-medium text-xs">Access Control</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <Infinity className="w-4 h-4 text-white" />
                            <span className="text-white font-medium text-xs">Unlimited Folders</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <MessageSquare className="w-4 h-4 text-white" />
                            <span className="text-white font-medium text-xs">Context-Aware AI</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <FileText className="w-4 h-4 text-white" />
                            <span className="text-white font-medium text-xs">Organized Docs</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}