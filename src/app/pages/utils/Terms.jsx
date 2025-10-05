'use client';

import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Scale, AlertTriangle, Cpu, Users, RefreshCw, Shield, Mail } from 'lucide-react';

export default function TermsChart() {
  const termsData = [
    {
      category: "Account Management",
      icon: <Users className="w-5 h-5" />,
      color: "bg-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-600",
      items: [
        { label: "Account Creation", detail: "Accurate information required" },
        { label: "Security", detail: "User responsible for credentials" },
        { label: "Termination Rights", detail: "We can suspend violating accounts" }
      ]
    },
    {
      category: "Service Features",
      icon: <Cpu className="w-5 h-5" />,
      color: "bg-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-600",
      items: [
        { label: "CRUD Operations", detail: "Test cases, bugs, test data" },
        { label: "AI Integration", detail: "OpenAI-powered automation" },
        { label: "VS Code Extension", detail: "IDE integration available" }
      ]
    },
    {
      category: "User Responsibilities",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "bg-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-600",
      items: [
        { label: "Lawful Use", detail: "Only legal purposes allowed" },
        { label: "Content Ownership", detail: "You own your data" },
        { label: "No Hacking", detail: "Reverse engineering prohibited" }
      ]
    },
    {
      category: "Prohibited Activities",
      icon: <XCircle className="w-5 h-5" />,
      color: "bg-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-600",
      items: [
        { label: "Illegal Content", detail: "No harmful/offensive material" },
        { label: "Service Disruption", detail: "No hacking or exploits" },
        { label: "Unauthorized Access", detail: "No automated scraping" }
      ]
    },
    {
      category: "Intellectual Property",
      icon: <Shield className="w-5 h-5" />,
      color: "bg-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-600",
      items: [
        { label: "Platform Rights", detail: "Caffetest owns the software" },
        { label: "User Content", detail: "You retain data ownership" },
        { label: "Third-Party Terms", detail: "OpenAI & VS Code apply" }
      ]
    },
    {
      category: "Disclaimers",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "bg-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-600",
      items: [
        { label: "Service Availability", detail: "No uptime guarantee" },
        { label: "AI Accuracy", detail: "Verify all AI outputs" },
        { label: "No Warranty", detail: "Provided 'as is'" }
      ]
    },
    {
      category: "Legal & Updates",
      icon: <Scale className="w-5 h-5" />,
      color: "bg-slate-700",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-700",
      items: [
        { label: "Jurisdiction", detail: "Governed by Indian law" },
        { label: "Dispute Resolution", detail: "Courts in Odisha, India" },
        { label: "Terms Updates", detail: "May change with notice" }
      ]
    },
    {
      category: "Subscription & Fees",
      icon: <RefreshCw className="w-5 h-5" />,
      color: "bg-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-600",
      items: [
        { label: "Payment Terms", detail: "Fees are non-refundable" },
        { label: "Price Changes", detail: "30 days notice required" },
        { label: "Subscription", detail: "Auto-renewal applies" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-3">
            <FileText className="w-10 h-10 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-slate-900">Terms & Conditions</h1>
          </div>
          <p className="text-sm text-slate-700 mb-1 font-medium">Caffetest - Visual Overview</p>
          <p className="text-xs text-slate-600">Advanced Testing Documentation Platform</p>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-indigo-600 rounded-lg shadow-md p-6 mb-8 text-white border-2 border-indigo-700"
        >
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold mb-2">Important Notice</h2>
              <p className="text-xs leading-relaxed">
                By using Caffetest, you agree to these Terms and Conditions. This chart provides a visual overview of key terms. For complete details, please refer to the full terms document. Effective Date: October 5, 2025
              </p>
            </div>
          </div>
        </motion.div>

        {/* Chart Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {termsData.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className={`bg-white border-2 ${section.borderColor} rounded-lg shadow-sm hover:shadow-lg transition-all duration-300`}
            >
              {/* Header */}
              <div className={`${section.color} text-white p-4 rounded-t-md`}>
                <div className="flex items-center justify-between mb-2">
                  {section.icon}
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <h3 className="text-sm font-bold leading-tight">{section.category}</h3>
              </div>

              {/* Content */}
              <div className="bg-white p-4 space-y-3 rounded-b-md">
                {section.items.map((item, idx) => (
                  <div key={idx} className="border-l-3 border-slate-400 pl-3">
                    <p className="text-xs font-semibold text-slate-900 mb-0.5">{item.label}</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key Statistics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border-2 border-blue-600 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">8</div>
            <div className="text-xs text-slate-700 font-medium">Key Categories</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border-2 border-purple-600 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">24</div>
            <div className="text-xs text-slate-700 font-medium">Important Terms</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border-2 border-green-600 p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
            <div className="text-xs text-slate-700 font-medium">Transparency</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border-2 border-indigo-600 p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">Legal</div>
            <div className="text-xs text-slate-700 font-medium">India Jurisdiction</div>
          </div>
        </motion.div>

        {/* Flowchart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-lg shadow-md border-2 border-slate-300 p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-6 text-center">Terms Flow Overview</h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="flex-1">
              <div className="w-full bg-blue-600 text-white rounded-lg p-4 shadow-md border-2 border-blue-700">
                <Users className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs font-bold">1. Sign Up</p>
                <p className="text-xs mt-1">Create Account</p>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="w-8 h-1 bg-slate-400"></div>
            </div>
            <div className="md:hidden">
              <div className="w-1 h-8 bg-slate-400"></div>
            </div>

            <div className="flex-1">
              <div className="w-full bg-purple-600 text-white rounded-lg p-4 shadow-md border-2 border-purple-700">
                <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs font-bold">2. Accept Terms</p>
                <p className="text-xs mt-1">Agree to Conditions</p>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="w-8 h-1 bg-slate-400"></div>
            </div>
            <div className="md:hidden">
              <div className="w-1 h-8 bg-slate-400"></div>
            </div>

            <div className="flex-1">
              <div className="w-full bg-green-600 text-white rounded-lg p-4 shadow-md border-2 border-green-700">
                <Cpu className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs font-bold">3. Use Service</p>
                <p className="text-xs mt-1">AI Documentation</p>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="w-8 h-1 bg-slate-400"></div>
            </div>
            <div className="md:hidden">
              <div className="w-1 h-8 bg-slate-400"></div>
            </div>

            <div className="flex-1">
              <div className="w-full bg-indigo-600 text-white rounded-lg p-4 shadow-md border-2 border-indigo-700">
                <Shield className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs font-bold">4. Stay Compliant</p>
                <p className="text-xs mt-1">Follow Guidelines</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-slate-900 rounded-lg shadow-md p-6 text-white border-2 border-slate-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <Mail className="w-5 h-5 mr-2 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900">Questions About Terms?</h3>
              </div>
              <p className="text-xs text-gray-900">Contact us for clarifications or concerns</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center">
                <span className="text-gray-900 mr-2 font-bold">Service:</span>
                <a href="mailto:service.caffetest@gmail.com" className="hover:underline font-medium text-gray-900">
                  service.caffetest@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <span className="text-gray-900 mr-2 font-bold">Support:</span>
                <a href="mailto:gyanaprakashkhnadual@gmail.com" className="text-gray-900 hover:underline font-medium">
                  gyanaprakashkhnadual@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <span className="text-gray-900 mr-2 font-bold">Location:</span>
                <span className="font-medium text-gray-900">Odisha, India</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-slate-600 leading-relaxed">
            This chart provides a visual summary. Please read the complete Terms & Conditions for full legal details.<br />
            By using Caffetest, you acknowledge acceptance of all terms and conditions.
          </p>
        </motion.div>
      </div>
    </div>
  );
}