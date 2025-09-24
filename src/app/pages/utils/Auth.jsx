'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { FaRocket, FaBug, FaChartLine, FaCheckCircle } from 'react-icons/fa';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('developer');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });

  const roles = [
    { value: 'developer', label: 'Developer', icon: '👨‍💻' },
    { value: 'tester', label: 'Tester', icon: '🧪' },
    { value: 'manager', label: 'Manager', icon: '👔' },
    { value: 'admin', label: 'Admin', icon: '⚡' }
  ];

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      showNotification('Please enter your email address', 'error');
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
        showNotification('OTP sent to your email successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to send OTP', 'error');
      }
    } catch (error) {
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.otp) {
      showNotification('Please fill in all fields', 'error');
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
        showNotification('Registration successful! Please login.', 'success');
        setFormData({ name: '', email: '', password: '', otp: '' });
        setShowOTPForm(false);
        setTimeout(() => {
          setIsLogin(true);
        }, 2000);
      } else {
        showNotification(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showNotification('Please enter email and password', 'error');
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
          password: formData.password
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store token in localStorage and cookie
        document.cookie = `token=${data.token}; path=/; max-age=86400`;
        console.log('Token saved in the cookie');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showNotification('Login successful! Redirecting...', 'success');
        
        // Redirect to app after successful login
        setTimeout(() => {
          window.location.href = '/app';
        }, 2000);
      } else {
        showNotification(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-0 left-0 w-1/3 opacity-10"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#3b82f6" // blue
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
            fill="#10b981" // green
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
            fill="#a855f7" // purple
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
            fill="#f59e0b" // orange
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
            fill="#ec4899" // pink
            d="M42.4,-56.9C55.3,-47.9,66.5,-35.8,71.1,-21.5C75.7,-7.2,73.6,9.3,66.2,23.8C58.8,38.3,46.1,50.8,31.2,60.1C16.3,69.4,-0.8,75.6,-16.3,71.8C-31.8,68,-45.6,54.3,-56.1,38.9C-66.6,23.5,-73.8,6.5,-72.1,-10.9C-70.3,-28.2,-59.5,-45.9,-44.5,-54.6C-29.5,-63.3,-10.3,-63.1,5.5,-68.9C21.3,-74.7,42.6,-86.5,42.4,-56.9Z"
            transform="translate(100 100)"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30"></div>
      </div>
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -100, x: '-50%' }}
            className="fixed top-4 left-1/2 transform z-50"
          >
            <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{notification.message}</span>
            </div>
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
              Welcome to <span className="text-blue-600">Calf</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Combine the power of <span className="font-semibold text-blue-600">Selenium</span>,
              <span className="font-semibold text-green-600"> Jira</span>,
              <span className="font-semibold text-orange-600"> Grafana</span>, and
              <span className="font-semibold text-purple-600"> AI</span> to automate your testing workflow.
            </p>
            <p className="text-lg text-gray-500 mb-12">
              Let AI generate test cases, manage bugs, and deliver comprehensive reports automatically.
            </p>

            {/* Feature Icons */}
            <div className="flex justify-center space-x-8 mb-8">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <FaRocket className="text-3xl text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Automation</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <FaBug className="text-3xl text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Bug Tracking</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <FaChartLine className="text-3xl text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Analytics</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md"
              >
                <FaCheckCircle className="text-3xl text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">AI Testing</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {isLogin ? 'Sign in to your account' : 'Get started with Calf today'}
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
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

                      {/* Role Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            <div className="flex items-center space-x-2">
                              <span>{roles.find(r => r.value === selectedRole)?.icon}</span>
                              <span className="text-gray-700">
                                {roles.find(r => r.value === selectedRole)?.label}
                              </span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          </button>
                          
                          <AnimatePresence>
                            {isDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                              >
                                {roles.map((role) => (
                                  <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => {
                                      setSelectedRole(role.value);
                                      setIsDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-2 last:rounded-t-lg first:rounded-b-lg transition-colors"
                                  >
                                    <span>{role.icon}</span>
                                    <span className="text-gray-700">{role.label}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Send OTP Button */}
                      <motion.button
                        onClick={handleSendOTP}
                        disabled={isLoading}
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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