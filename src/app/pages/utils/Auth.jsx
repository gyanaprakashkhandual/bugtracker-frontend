'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/app/script/Alert.context';
import { Eye, EyeOff, Mail, Lock, User, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';

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
    { value: 'admin', label: 'Admin' },
    { value: 'project manager', label: 'Project Manager' },
    { value: 'developer', label: 'Developer' },
    { value: 'qa tester', label: 'QA Tester' },
    { value: 'hr manager', label: 'HR Manager' },
    { value: 'devops engineer', label: 'DevOps Engineer' },
    { value: 'ui-ux designer', label: 'UI/UX Designer' },
    { value: 'manager', label: 'Manager' },
    { value: 'product manager', label: 'Product Manager' },
    { value: 'business analyst', label: 'Business Analyst' },
    { value: 'scrum master', label: 'Scrum Master' },
    { value: 'data scientist', label: 'Data Scientist' },
    { value: 'data engineer', label: 'Data Engineer' },
    { value: 'ml engineer', label: 'ML Engineer' },
    { value: 'ai engineer', label: 'AI Engineer' },
    { value: 'frontend developer', label: 'Frontend Developer' },
    { value: 'backend developer', label: 'Backend Developer' },
    { value: 'fullstack developer', label: 'Fullstack Developer' },
    { value: 'mobile developer', label: 'Mobile Developer' },
    { value: 'cloud engineer', label: 'Cloud Engineer' },
    { value: 'security engineer', label: 'Security Engineer' },
    { value: 'automation tester', label: 'Automation Tester' },
    { value: 'manual tester', label: 'Manual Tester' },
    { value: 'support engineer', label: 'Support Engineer' },
    { value: 'system administrator', label: 'System Administrator' },
    { value: 'solution architect', label: 'Solution Architect' },
    { value: 'technical lead', label: 'Technical Lead' },
    { value: 'software architect', label: 'Software Architect' },
    { value: 'database administrator', label: 'Database Administrator' },
    { value: 'intern', label: 'Intern' },
    { value: 'other', label: 'Other' }
  ];

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setShowLoginModal(true);
      setTimeout(() => {
        setShowLoginModal(false);
        showAlert({
          type: "success",
          message: "Welcome to Caffetest"
        });
        router.push('/app');
      }, 2000);
    } else {
      showAlert({
        type: "info",
        message: "For enhanced security and compatibility with VS Code environment, we currently support email-based authentication only. This ensures maximum protection for your testing projects and data.",
        duration: 7000
      });
    }
  }, [router, showAlert]);

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userString = urlParams.get('user');
    const error = urlParams.get('error');

    if (error) {
      showAlert({
        type: "error",
        message: "Google authentication failed. Please try again."
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token && userString) {
      try {
        const user = JSON.parse(decodeURIComponent(userString));

        // Store token in both localStorage and cookie
        document.cookie = `token=${token}; path=/; max-age=86400`;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user._id);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('isVerified', user.isVerified);
        localStorage.setItem('isActive', user.isActive);
        localStorage.setItem('isOrganizationOwner', user.isOrganizationOwner);
        localStorage.setItem('organizationId', user.organizationId);
        localStorage.setItem('organizationName', user.organizationName);
        localStorage.setItem('user', JSON.stringify(user));

        showAlert({
          type: "success",
          message: "Google login successful! Redirecting..."
        });

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        setTimeout(() => {
          router.push('/app');
        }, 2000);
      } catch (err) {
        showAlert({
          type: "error",
          message: "Error processing authentication data"
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
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
      showAlert({
        type: "error",
        message: "Email is required"
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showAlert({
        type: "error",
        message: "Invalid email address"
      });
      return;
    }
    if (!formData.name) {
      showAlert({
        type: "error",
        message: "Name is required"
      });
      return;
    }
    if (formData.name.length < 3) {
      showAlert({
        type: "error",
        message: "Name must be at least 3 characters long"
      });
      return;
    }
    if (!formData.password) {
      showAlert({
        type: "error",
        message: "Password is required"
      });
      return;
    }
    if (formData.password.length < 8) {
      showAlert({
        type: "error",
        message: "Password must be at least 8 characters"
      });
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      showAlert({
        type: "error",
        message: "Password must contain at least one uppercase letter"
      });
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      showAlert({
        type: "error",
        message: "Password must contain at least one lowercase letter"
      });
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      showAlert({
        type: "error",
        message: "Password must contain at least one number"
      });
      return;
    }
    if (!/[@$!%*?&]/.test(formData.password)) {
      showAlert({
        type: "error",
        message: "Password must contain at least one special character (@$!%*?&)"
      });
      return;
    }
    if (!acceptTerms) {
      showAlert({
        type: "error",
        message: "Please accept the Terms & Conditions and Privacy Policy to continue"
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('https://caffetest.onrender.com/api/v1/auth/send-otp', {
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
        });
      } else {
        showAlert({
          type: "error",
          message: data.message || 'Failed to send OTP'
        });
      }
    } catch (error) {
      showAlert({
        type: "error",
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showAlert({
        type: "error",
        message: "Name is required"
      });
      return;
    }
    if (formData.name.length < 3) {
      showAlert({
        type: "error",
        message: "Name must be at least 3 characters long"
      });
      return;
    }
    if (!formData.email) {
      showAlert({
        type: "error",
        message: "Email is required"
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showAlert({
        type: "error",
        message: "Invalid email address"
      });
      return;
    }
    if (!formData.password) {
      showAlert({
        type: "error",
        message: "Password is required"
      });
      return;
    }
    if (formData.password.length < 8) {
      showAlert({
        type: "error",
        message: "Password must be at least 8 characters"
      });
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      showAlert({
        type: "error",
        message: "Password must contain at least one uppercase letter"
      });
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      showAlert({
        type: "error",
        message: "Password must contain at least one lowercase letter"
      });
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      showAlert({
        type: "error",
        message: "Password must contain at least one number"
      });
      return;
    }
    if (!/[@$!%*?&]/.test(formData.password)) {
      showAlert({
        type: "error",
        message: "Password must contain at least one special character (@$!%*?&)"
      });
      return;
    }
    if (!formData.otp) {
      showAlert({
        type: "error",
        message: "Verification code is required"
      });
      return;
    }
    if (!acceptTerms) {
      showAlert({
        type: "error",
        message: "Please accept the Terms & Conditions and Privacy Policy to continue"
      });
      return;
    }
    if (!roles.some(role => role.value === selectedRole)) {
      showAlert({
        type: "error",
        message: "Invalid role selected"
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('https://caffetest.onrender.com/api/v1/auth/register', {
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
        showAlert({
          type: "success",
          message: "Registration successful! Please login."
        });
        setFormData({ name: '', email: '', password: '', otp: '' });
        setShowOTPForm(false);
        setTimeout(() => {
          setIsLogin(true);
        }, 2000);
      } else {
        showAlert({
          type: "error",
          message: data.message || 'Registration failed'
        });
      }
    } catch (error) {
      showAlert({
        type: "error",
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      showAlert({
        type: "error",
        message: "Email is required"
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showAlert({
        type: "error",
        message: "Invalid email address"
      });
      return;
    }
    if (!formData.password) {
      showAlert({
        type: "error",
        message: "Password is required"
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('https://caffetest.onrender.com/api/v1/auth/login', {
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
        if (isPersistent) {
          document.cookie = `token=${data.token}; path=/; max-age=86400`;
          localStorage.setItem('token', data.token);
        } else {
          sessionStorage.setItem('token', data.token);
        }
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('isVerified', data.user.isVerified);
        localStorage.setItem('isActive', data.user.isActive);
        localStorage.setItem('isOrganizationOwner', data.user.isOrganizationOwner);
        localStorage.setItem('organizationId', data.user.organizationId);
        localStorage.setItem('organizationName', data.user.organizationName);
        localStorage.setItem('user', JSON.stringify(data.user));
        showAlert({
          type: "success",
          message: "Login successful! Redirecting..."
        });
        setTimeout(() => {
          router.push('/app');
        }, 2000);
      } else {
        showAlert({
          type: "error",
          message: data.message || 'Login failed'
        });
      }
    } catch (error) {
      showAlert({
        type: "error",
        message: 'Network error. Please try again.'
      });
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

  const handleGoogleLogin = () => {
    window.location.href = 'https://caffetest.onrender.com/api/v1/auth/google?state=web';
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

            {/* Feature Descriptions */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <span className="text-xs font-medium text-gray-700">Automation</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <span className="text-xs font-medium text-gray-700">GitHub</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <span className="text-xs font-medium text-gray-700">Sheets</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <span className="text-xs font-medium text-gray-700">AI Chat</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <span className="text-xs font-medium text-gray-700">Bug Track</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <span className="text-xs font-medium text-gray-700">Analytics</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <span className="text-xs font-medium text-gray-700">OpenAI</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
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
                              <span className="font-medium">{roles.find(role => role.value === selectedRole)?.label}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
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

                      {/* Divider */}
                      <div className="relative flex items-center justify-center my-6">
                        <div className="border-t border-gray-300 w-full"></div>
                        <span className="absolute bg-white px-4 text-sm text-gray-500">or</span>
                      </div>

                      {/* Google Sign Up Button */}
                      <motion.button
                        onClick={handleGoogleLogin}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium transition-colors border border-gray-300 flex items-center justify-center gap-3 shadow-sm"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                          <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                          <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
                          <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.736 7.396 3.977 10 3.977z" fill="#EA4335" />
                        </svg>
                        Continue with Google
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
                          <span className="font-medium text-gray-800">Please Check Your Spam Folder</span>
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
                          className="w-full px-4 py-3 text-blue-800 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-blue-900 transition-all"
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
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
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
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
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

                    {/* Divider */}
                    <div className="relative flex items-center justify-center my-6">
                      <div className="border-t border-gray-300 w-full"></div>
                      <span className="absolute bg-white px-4 text-sm text-gray-500">or</span>
                    </div>

                    {/* Google Login Button */}
                    <motion.button
                      onClick={handleGoogleLogin}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium transition-colors border border-gray-300 flex items-center justify-center gap-3 shadow-sm"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                        <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                        <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
                        <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.736 7.396 3.977 10 3.977z" fill="#EA4335" />
                      </svg>
                      Continue with Google
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