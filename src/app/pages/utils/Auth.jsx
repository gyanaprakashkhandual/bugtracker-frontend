'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Loader2,
  Crown,
  Users,
  Code2,
  TestTube,
  Database,
  Brain,
  Smartphone,
  Cloud,
  Shield,
  Wrench,
  Network,
  BarChart3,
  Palette,
  Briefcase,
  GitBranch,
  Server,
  Github,
  FileSpreadsheet,
  MessageSquare,
  Zap
} from 'lucide-react';
import { FaRocket, FaBug, FaChartLine, FaCheckCircle } from 'react-icons/fa';
import { useAlert } from '@/app/script/Alert.context';
import { GoogleArrowDown } from '@/app/components/utils/Icon';

const AuthPage = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('developer');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isPersistent, setIsPersistent] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { showAlert } = useAlert();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });

  const roles = [
    { value: 'admin', label: 'Admin', icon: <Crown className="w-4 h-4" /> },
    { value: 'project manager', label: 'Project Manager', icon: <Users className="w-4 h-4" /> },
    { value: 'developer', label: 'Developer', icon: <Code2 className="w-4 h-4" /> },
    { value: 'qa tester', label: 'QA Tester', icon: <TestTube className="w-4 h-4" /> },
    { value: 'hr manager', label: 'HR Manager', icon: <Users className="w-4 h-4" /> },
    { value: 'devops engineer', label: 'DevOps Engineer', icon: <Server className="w-4 h-4" /> },
    { value: 'ui-ux designer', label: 'UI/UX Designer', icon: <Palette className="w-4 h-4" /> },
    { value: 'manager', label: 'Manager', icon: <Briefcase className="w-4 h-4" /> },
    { value: 'product manager', label: 'Product Manager', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'business analyst', label: 'Business Analyst', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'scrum master', label: 'Scrum Master', icon: <GitBranch className="w-4 h-4" /> },
    { value: 'data scientist', label: 'Data Scientist', icon: <Brain className="w-4 h-4" /> },
    { value: 'data engineer', label: 'Data Engineer', icon: <Database className="w-4 h-4" /> },
    { value: 'ml engineer', label: 'ML Engineer', icon: <Brain className="w-4 h-4" /> },
    { value: 'ai engineer', label: 'AI Engineer', icon: <Brain className="w-4 h-4" /> },
    { value: 'frontend developer', label: 'Frontend Developer', icon: <Code2 className="w-4 h-4" /> },
    { value: 'backend developer', label: 'Backend Developer', icon: <Server className="w-4 h-4" /> },
    { value: 'fullstack developer', label: 'Fullstack Developer', icon: <Code2 className="w-4 h-4" /> },
    { value: 'mobile developer', label: 'Mobile Developer', icon: <Smartphone className="w-4 h-4" /> },
    { value: 'cloud engineer', label: 'Cloud Engineer', icon: <Cloud className="w-4 h-4" /> },
    { value: 'security engineer', label: 'Security Engineer', icon: <Shield className="w-4 h-4" /> },
    { value: 'automation tester', label: 'Automation Tester', icon: <Wrench className="w-4 h-4" /> },
    { value: 'manual tester', label: 'Manual Tester', icon: <TestTube className="w-4 h-4" /> },
    { value: 'support engineer', label: 'Support Engineer', icon: <Network className="w-4 h-4" /> },
    { value: 'system administrator', label: 'System Administrator', icon: <Server className="w-4 h-4" /> },
    { value: 'solution architect', label: 'Solution Architect', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'technical lead', label: 'Technical Lead', icon: <Users className="w-4 h-4" /> },
    { value: 'software architect', label: 'Software Architect', icon: <Code2 className="w-4 h-4" /> },
    { value: 'database administrator', label: 'Database Administrator', icon: <Database className="w-4 h-4" /> },
    { value: 'intern', label: 'Intern', icon: <Users className="w-4 h-4" /> },
    { value: 'other', label: 'Other', icon: <Wrench className="w-4 h-4" /> }
  ];

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setShowLoginModal(true);

      // Simulate authentication delay for better User experience
      setTimeout(() => {
        setShowLoginModal(false);
        showAlert({
          type: "success",
          message: "Welcome to Caffetest"
        })
        router.push('/app');
      }, 2000);
    } else {
      // Show info alert about Google sign-in
      showAlert({
        type: "info",
        message: "For enhanced security and compatibility with VS Code environment, we currently support email-based authentication only. This ensures maximum protection for your testing projects and data."
      });
    }
  }, [router, showAlert]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      showAlert('Please enter your email address', 'error');
      return;
    }

    if (!acceptTerms) {
      showAlert('Please accept the Terms & Conditions and Privacy Policy to continue', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOTPForm(true);
        showAlert({
          type: "success",
          message: "OTP Sent successfully to Your Email"
        })
      } else {
        showAlert(data.message || 'Failed to send OTP', 'error');
      }
    } catch (error) {
      showAlert('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.otp) {
      showAlert('Please fill in all fields', 'error');
      return;
    }

    if (!acceptTerms) {
      showAlert('Please accept the Terms & Conditions and Privacy Policy to continue', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          otp: formData.otp,
          role: selectedRole
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert('Registration successful! Please login.', 'success');
        setFormData({ name: '', email: '', password: '', otp: '' });
        setShowOTPForm(false);
        setTimeout(() => {
          setIsLogin(true);
        }, 2000);
      } else {
        showAlert(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      showAlert('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

const handleLogin = async (e) => {
  e.preventDefault();
  if (!formData.email || !formData.password) {
    showAlert('Please enter email and password', 'error');
    return;
  }

  setIsLoading(true);
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        persistent: isPersistent
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store token based on persistence preference
      if (isPersistent) {
        document.cookie = `token=${data.token}; path=/; max-age=86400`;
        localStorage.setItem('token', data.token);
      } else {
        sessionStorage.setItem('token', data.token);
      }

      // Store ALL required user data for messaging app - MATCHING YOUR BACKEND RESPONSE
      localStorage.setItem('userId', data.user._id); // Using _id from backend
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('isVerified', data.user.isVerified);
      localStorage.setItem('isActive', data.user.isActive);
      localStorage.setItem('isOrganizationOwner', data.user.isOrganizationOwner);
      
      // Organization data
      localStorage.setItem('organizationId', data.user.organizationId);
      localStorage.setItem('organizationName', data.user.organizationName);

      // Also store the complete user object as backup
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('✅ Login successful - Stored user data:', {
        userId: data.user._id,
        userName: data.user.name,
        organizationId: data.user.organizationId,
        organizationName: data.user.organizationName
      });

      showAlert('Login successful! Redirecting...', 'success');

      // Redirect to app after successful login
      setTimeout(() => {
        router.push('/app');
      }, 2000);
    } else {
      showAlert(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    showAlert('Network error. Please try again.', 'error');
  } finally {
    setIsLoading(false);
  }
};

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy');
  };

  const handleTermsConditions = () => {
    router.push('/terms-and-conditions');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex relative sidebar-scrollbar">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-0 left-0 w-1/3 opacity-10"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#3b82f6"
            d="M50,-50C64.5,-36.1,75.2,-18,74.3,-0.9C73.4,16.2,60.9,32.4,46.4,45.1C32,57.8,15.6,67,-3.4,70.4C-22.3,73.8,-44.7,71.4,-58.1,58.7C-71.6,46,-76.2,23,-74.5,1.5C-72.8,-20.1,-64.7,-40.1,-51.3,-54C-37.8,-67.9,-18.9,-75.6,0.3,-75.9C19.5,-76.2,39,-69.1,50,-50Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg
          className="absolute top-1/4 right-1/4 w-1/5 opacity-10"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#10b981"
            d="M42.4,-56.9C55.3,-47.9,66.5,-35.8,71.1,-21.5C75.7,-7.2,73.6,9.3,66.2,23.8C58.8,38.3,46.1,50.8,31.2,60.1C16.3,69.4,-0.8,75.6,-16.3,71.8C-31.8,68,-45.6,54.3,-56.1,38.9C-66.6,23.5,-73.8,6.5,-72.1,-10.9C-70.3,-28.2,-59.5,-45.9,-44.5,-54.6C-29.5,-63.3,-10.3,-63.1,5.5,-68.9C21.3,-74.7,42.6,-86.5,42.4,-56.9Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg
          className="absolute bottom-0 right-0 w-1/4 opacity-10"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#a855f7"
            d="M42.4,-56.9C55.3,-47.9,66.5,-35.8,71.1,-21.5C75.7,-7.2,73.6,9.3,66.2,23.8C58.8,38.3,46.1,50.8,31.2,60.1C16.3,69.4,-0.8,75.6,-16.3,71.8C-31.8,68,-45.6,54.3,-56.1,38.9C-66.6,23.5,-73.8,6.5,-72.1,-10.9C-70.3,-28.2,-59.5,-45.9,-44.5,-54.6C-29.5,-63.3,-10.3,-63.1,5.5,-68.9C21.3,-74.7,42.6,-86.5,42.4,-56.9Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg
          className="absolute bottom-1/3 left-1/6 w-1/6 opacity-10"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#f59e0b"
            d="M50,-50C64.5,-36.1,75.2,-18,74.3,-0.9C73.4,16.2,60.9,32.4,46.4,45.1C32,57.8,15.6,67,-3.4,70.4C-22.3,73.8,-44.7,71.4,-58.1,58.7C-71.6,46,-76.2,23,-74.5,1.5C-72.8,-20.1,-64.7,-40.1,-51.3,-54C-37.8,-67.9,-18.9,-75.6,0.3,-75.9C19.5,-76.2,39,-69.1,50,-50Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg
          className="absolute top-2/3 left-3/4 w-1/8 opacity-10"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ec4899"
            d="M42.4,-56.9C55.3,-47.9,66.5,-35.8,71.1,-21.5C75.7,-7.2,73.6,9.3,66.2,23.8C58.8,38.3,46.1,50.8,31.2,60.1C16.3,69.4,-0.8,75.6,-16.3,71.8C-31.8,68,-45.6,54.3,-56.1,38.9C-66.6,23.5,-73.8,6.5,-72.1,-10.9C-70.3,-28.2,-59.5,-45.9,-44.5,-54.6C-29.5,-63.3,-10.3,-63.1,5.5,-68.9C21.3,-74.7,42.6,-86.5,42.4,-56.9Z"
            transform="translate(100 100)"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30"></div>
      </div>

      {/* Persistent Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Logging you in...</h3>
                <p className="text-gray-600">We found your previous session. Please wait while we authenticate you.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Side - Welcome Content */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              Welcome to <span className="text-blue-600">CaffeTest</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Unified testing platform supporting <span className="font-semibold text-blue-600">Selenium</span>,
              <span className="font-semibold text-green-600"> Appium</span>,
              <span className="font-semibold text-purple-600"> Playwright</span>,
              <span className="font-semibold text-orange-600"> Cypress</span>,
              <span className="font-semibold text-red-600"> REST Assured</span>, and
              <span className="font-semibold text-yellow-600"> PyTest</span>
            </p>
            <p className="text-lg text-gray-500 mb-12">
              Integrated with GitHub, Google Sheets, Excel, OpenAI, and VS Code. Features AI-powered chatbot for intelligent test automation.
            </p>

            {/* Feature Icons */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <FaRocket className="text-3xl text-blue-600 mb-2" />
                <span className="text-xs font-medium text-gray-700">Automation</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <Github className="text-3xl text-gray-800 mb-2" />
                <span className="text-xs font-medium text-gray-700">GitHub</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <FileSpreadsheet className="text-3xl text-green-600 mb-2" />
                <span className="text-xs font-medium text-gray-700">Sheets</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <MessageSquare className="text-3xl text-purple-600 mb-2" />
                <span className="text-xs font-medium text-gray-700">AI Chat</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <FaBug className="text-3xl text-red-600 mb-2" />
                <span className="text-xs font-medium text-gray-700">Bug Track</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <FaChartLine className="text-3xl text-orange-600 mb-2" />
                <span className="text-xs font-medium text-gray-700">Analytics</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <Brain className="text-3xl text-indigo-600 mb-2" />
                <span className="text-xs font-medium text-gray-700">OpenAI</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <Zap className="text-3xl text-yellow-600 mb-2" />
                <span className="text-xs font-medium text-gray-700">VS Code</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-2">
        <div className="w-full max-w-md">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Header */}
            <div className="text-center mb-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {isLogin ? 'Sign in to your account' : 'Get started with CaffeTest today'}
              </p>
            </div>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {!isLogin ? (
                // Register Form
                <motion.div
                  key="register"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {!showOTPForm ? (
                    // Step 1: Email and Role Selection
                    <div className="space-y-6">
                      {/* Name Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 transition-all"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 transition-all"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 transition-all"
                            placeholder="Create a password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Role Selection - GitHub Style Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-900 transition-all"
                          >
                            <div className="flex items-center gap-3 text-gray-700">
                              {roles.find(role => role.value === selectedRole)?.icon}
                              <span className="font-medium">{roles.find(role => role.value === selectedRole)?.label}</span>
                            </div>
                            <GoogleArrowDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto"
                              >
                                <div className="py-1">
                                  {roles.map((role) => (
                                    <button
                                      key={role.value}
                                      type="button"
                                      onClick={() => {
                                        setSelectedRole(role.value);
                                        setIsDropdownOpen(false);
                                      }}
                                      className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left ${selectedRole === role.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                        }`}
                                    >
                                      <span className={selectedRole === role.value ? 'text-blue-600' : 'text-gray-500'}>
                                        {role.icon}
                                      </span>
                                      <span>{role.label}</span>
                                      {selectedRole === role.value && (
                                        <CheckCircle className="w-4 h-4 ml-auto text-blue-600" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Terms and Conditions Checkbox */}
                      <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="acceptTerms"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1 flex-shrink-0"
                        />
                        <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer select-none">
                          I agree to the{' '}
                          <button
                            type="button"
                            onClick={handleTermsConditions}
                            className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                          >
                            Terms & Conditions
                          </button>{' '}
                          and{' '}
                          <button
                            type="button"
                            onClick={handlePrivacyPolicy}
                            className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                          >
                            Privacy Policy
                          </button>
                        </label>
                      </div>

                      {/* Send OTP Button */}
                      <motion.button
                        onClick={handleSendOTP}
                        disabled={isLoading || !acceptTerms}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          'Send OTP'
                        )}
                      </motion.button>
                    </div>
                  ) : (
                    // Step 2: OTP Verification
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mail className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-gray-600">
                          We sent a verification code to <br />
                          <span className="font-medium text-gray-800">{formData.email}</span>
                        </p>
                      </div>

                      {/* OTP Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verification Code
                        </label>
                        <input
                          type="text"
                          name="otp"
                          value={formData.otp}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-blue-900 transition-all"
                          placeholder="Enter 6-digit code"
                          maxLength="6"
                          required
                        />
                      </div>

                      {/* Verify Button */}
                      <motion.button
                        onClick={handleRegister}
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify & Register'
                        )}
                      </motion.button>

                      {/* Back Button */}
                      <button
                        type="button"
                        onClick={() => setShowOTPForm(false)}
                        className="w-full text-gray-600 hover:text-gray-800 py-2 font-medium transition-colors"
                      >
                        ← Back to registration
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                // Login Form
                <motion.div
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 transition-all"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 transition-all"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                      >
                        Forgot your password?
                      </button>
                    </div>

                    {/* Persistent Login Checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="persistent"
                        checked={isPersistent}
                        onChange={(e) => setIsPersistent(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="persistent" className="text-sm text-gray-700 cursor-pointer select-none">
                        Keep me logged in
                      </label>
                    </div>

                    {/* Login Button */}
                    <motion.button
                      onClick={handleLogin}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle Form */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({ name: '', email: '', password: '', otp: '' });
                    setShowOTPForm(false);
                    setIsDropdownOpen(false);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {isLogin ? 'Sign up here' : 'Sign in here'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;