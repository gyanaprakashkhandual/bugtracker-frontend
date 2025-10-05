'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Mail, Globe, FileText, AlertCircle } from 'lucide-react';

export default function PrivacyPolicy() {
    const sections = [
        {
            icon: <Database className="w-4 h-4" />,
            title: "Information We Collect",
            content: [
                {
                    subtitle: "Personal Information",
                    text: "We collect information you provide directly, including name, email address, and account credentials when you register for Caffetest."
                },
                {
                    subtitle: "Usage Data",
                    text: "We automatically collect information about your interaction with our application, including test cases created, bug reports, and feature usage patterns."
                },
                {
                    subtitle: "AI Integration Data",
                    text: "Data processed through OpenAI integration is handled according to OpenAI's privacy policies. We transmit only necessary documentation data for AI processing."
                }
            ]
        },
        {
            icon: <Lock className="w-4 h-4" />,
            title: "How We Use Your Information",
            content: [
                {
                    subtitle: "Service Delivery",
                    text: "To provide, maintain, and improve Caffetest's functionality, including AI-powered documentation features and VS Code extension integration."
                },
                {
                    subtitle: "Communication",
                    text: "To send service updates, security alerts, and respond to your inquiries via the provided contact emails."
                },
                {
                    subtitle: "Analytics",
                    text: "To understand usage patterns and improve user experience across our platform."
                }
            ]
        },
        {
            icon: <Shield className="w-4 h-4" />,
            title: "Data Security",
            content: [
                {
                    subtitle: "Protection Measures",
                    text: "We implement industry-standard security measures including encryption, secure data transmission, and access controls to protect your information."
                },
                {
                    subtitle: "Third-Party Services",
                    text: "OpenAI integration and VS Code extension follow their respective security protocols. We ensure secure API communications for all integrations."
                }
            ]
        },
        {
            icon: <Eye className="w-4 h-4" />,
            title: "Data Sharing and Disclosure",
            content: [
                {
                    subtitle: "Third-Party Sharing",
                    text: "We share data with OpenAI strictly for AI processing purposes. We do not sell your personal information to third parties."
                },
                {
                    subtitle: "Legal Requirements",
                    text: "We may disclose information if required by law or to protect our rights and users' safety."
                }
            ]
        },
        {
            icon: <FileText className="w-4 h-4" />,
            title: "Your Rights",
            content: [
                {
                    subtitle: "Access and Control",
                    text: "You have the right to access, update, or delete your personal information. Contact us to exercise these rights."
                },
                {
                    subtitle: "Data Portability",
                    text: "You may request a copy of your data in a structured, machine-readable format."
                }
            ]
        },
        {
            icon: <Globe className="w-4 h-4" />,
            title: "International Data Transfers",
            content: [
                {
                    subtitle: "Data Location",
                    text: "As we operate from Odisha, India, your data may be processed and stored in India or other locations where our service providers operate."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center mb-3">
                        <Shield className="w-8 h-8 text-blue-600 mr-2" />
                        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">Caffetest - Advanced Testing Documentation Platform</p>
                    <p className="text-xs text-slate-500">Last Updated: October 5, 2025</p>
                </motion.div>

                {/* Introduction */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-5"
                >
                    <p className="text-xs text-slate-700 leading-relaxed">
                        Caffetest ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our advanced web application integrated with OpenAI and Visual Studio Code Extension. Caffetest enables users to perform CRUD operations on important documents like test cases, bugs, and test data, with AI automation to reduce manual documentation effort.
                    </p>
                </motion.div>

                {/* Sections */}
                {sections.map((section, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-4"
                    >
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                {section.icon}
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900">{section.title}</h2>
                        </div>
                        <div className="space-y-3">
                            {section.content.map((item, idx) => (
                                <div key={idx} className="pl-11">
                                    <h3 className="text-xs font-medium text-slate-800 mb-1">{item.subtitle}</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {/* Cookies */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-4"
                >
                    <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <h2 className="text-sm font-semibold text-slate-900">Cookies and Tracking</h2>
                    </div>
                    <div className="pl-11">
                        <p className="text-xs text-slate-600 leading-relaxed mb-2">
                            We use cookies and similar tracking technologies to enhance user experience, analyze usage patterns, and maintain session information. You can control cookie preferences through your browser settings.
                        </p>
                    </div>
                </motion.div>

                {/* Contact */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md p-5 text-white"
                >
                    <div className="flex items-center mb-3">
                        <Mail className="w-5 h-5 mr-2" />
                        <h2 className="text-sm font-semibold">Contact Us</h2>
                    </div>
                    <p className="text-xs mb-3 opacity-90">
                        If you have questions or concerns about this Privacy Policy, please contact us:
                    </p>
                    <div className="space-y-1.5 text-xs">
                        <div className="flex items-center">
                            <span className="opacity-75 mr-2">Service:</span>
                            <a href="mailto:service.caffetest@gmail.com" className="hover:underline font-medium">
                                service.caffetest@gmail.com
                            </a>
                        </div>
                        <div className="flex items-center">
                            <span className="opacity-75 mr-2">Support:</span>
                            <a href="mailto:gyanaprakashkhnadual@gmail.com" className="hover:underline font-medium">
                                gyanaprakashkhnadual@gmail.com
                            </a>
                        </div>
                        <div className="flex items-center">
                            <span className="opacity-75 mr-2">Location:</span>
                            <span className="font-medium">Odisha, India</span>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-center mt-6"
                >
                    <p className="text-xs text-slate-500">
                        By using Caffetest, you acknowledge that you have read and understood this Privacy Policy.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}