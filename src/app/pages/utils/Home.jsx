'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FaCoffee, FaCode, FaRocket, FaBug, FaChartLine, FaGithub, FaTwitter, FaLinkedin, FaCheckCircle, FaArrowRight, FaPlay } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
export default function CaffetestLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])

  const router = useRouter();
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  }

  const openPage = (item) => {
    router.push(`/${item}`);
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const features = [
    {
      icon: FaCode,
      title: "VS Code Integration",
      description: "Seamless integration with Visual Studio Code through our CAPTEST extension for effortless test automation."
    },
    {
      icon: FaRocket,
      title: "AI-Powered Analysis",
      description: "OpenAI integration automatically refines test data and generates intelligent pass/fail results."
    },
    {
      icon: FaChartLine,
      title: "Smart Dashboard",
      description: "Comprehensive dashboards with multiple view options and real-time analytics for better insights."
    },
    {
      icon: FaBug,
      title: "Bug Tracking",
      description: "Advanced bug tracking features with automated detection and detailed reporting capabilities."
    }
  ]

  const benefits = [
    "Automated test case generation",
    "Real-time pass/fail results",
    "Multiple project separation",
    "Cucumber syntax support",
    "OpenAI-powered insights",
    "Dashboard integration"
  ]

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-sky-50">
      {/* Header */}
      <motion.header
        className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-sky-100"
        style={{ opacity: headerOpacity }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >

              <FaCoffee className="w-8 h-8 text-blue-900" />

              <span className="text-xl font-semibold text-gray-900">
                Caffetest
              </span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex items-center space-x-6">
                {['Documentation', 'Pricing', 'Contact', 'Feedback'].map((item, index) => (
                  <motion.a
                    key={item}
                    onClick={() => openPage(item.toLowerCase())}
                    className="text-gray-600 hover:text-sky-600 transition-colors duration-200 font-medium text-sm cursor-pointer"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </nav>

              <motion.button
                onClick={() => router.push('/auth')}
                className="px-5 py-2 bg-purple-600 text-white font-medium rounded-4xl hover:bg-purple-700 transition-all duration-200 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>

              <motion.button
                onClick={() => router.push('/auth')}
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In
              </motion.button>
            </div>

            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                <span className={`block w-full h-0.5 bg-current transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
                <span className={`block w-full h-0.5 bg-current transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-full h-0.5 bg-current transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
              </div>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight"
              variants={fadeInUp}
            >
              Professional Testing
              <br />
              <span className="text-blue-600">Automation Platform</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              AI-powered automation testing that transforms your VS Code workflow with intelligent
              test generation, real-time analytics, and seamless bug tracking.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={fadeInUp}
            >
              <motion.button
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaPlay className="w-4 h-4" />
                <span>Get Started Free</span>
              </motion.button>

              <motion.button
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Watch Demo</span>
                <FaArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-12 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-xl shadow-xl border border-gray-200">
              <div className="bg-gray-800 rounded-t-xl px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-400 ml-4 text-sm font-mono">caffetest-demo.js</span>
              </div>
              <div className="p-6 font-mono text-sm text-left">
                <div className="space-y-2">
                  <div className="text-green-400">// CAPTEST Extension Active 🚀</div>
                  <div className="text-blue-400">describe('User Login Test', () = {`{`}</div>
                  <div className="pl-4 text-yellow-400">it('should login successfully', () = {`{`}</div>
                  <div className="pl-8 text-gray-300">// AI analyzing test data...</div>
                  <div className="pl-8 text-green-400">✅ Test passed - Generated by Caffetest AI</div>
                  <div className="pl-4 text-yellow-400">{`}`});</div>
                  <div className="text-blue-400">{`}`});</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to streamline your testing workflow and boost productivity
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                variants={fadeInUp}
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
                Why Choose Caffetest?
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Transform your testing workflow with AI-powered automation that saves time,
                reduces errors, and provides actionable insights for better software quality.
              </p>

              <motion.div
                className="space-y-3"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    variants={fadeInUp}
                  >
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheckCircle className="text-white text-xs" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Test Analytics</h3>
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-white text-lg" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">94.2%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      className="h-2 bg-green-500 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: "94.2%" }}
                      transition={{ duration: 1.2, delay: 0.5 }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">1,247</div>
                      <div className="text-gray-600 text-sm">Tests Automated</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">89%</div>
                      <div className="text-gray-600 text-sm">Time Saved</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple 3-step process to transform your testing workflow
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Install CAPTEST Extension",
                description: "Add our VS Code extension and start writing your automation tests with Cucumber syntax support.",
                color: "bg-blue-600"
              },
              {
                step: "02",
                title: "AI Analysis & Tracking",
                description: "Our system tracks test data, analyzes results using OpenAI, and generates intelligent insights.",
                color: "bg-green-600"
              },
              {
                step: "03",
                title: "Dashboard & Reports",
                description: "View comprehensive analytics, manage multiple projects, and track bugs with our intuitive dashboard.",
                color: "bg-purple-600"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mb-4 text-white font-bold`}>
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>


              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <motion.div
          className="w-full max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Testing?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who have revolutionized their testing workflow with Caffetest
          </p>

          <motion.button
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Your Free Trial
          </motion.button>
        </motion.div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 relative overflow-hidden">
        {/* SVG Background Structure */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Curved flowing lines */}
            <path
              d="M -50 50 Q 200 100, 400 50 T 800 50 T 1200 50 T 1600 50"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              opacity="0.3"
            />
            <path
              d="M -50 150 Q 250 200, 500 150 T 1000 150 T 1500 150"
              fill="none"
              stroke="rgb(96, 165, 250)"
              strokeWidth="1.5"
              opacity="0.2"
            />
            <path
              d="M 0 250 Q 300 200, 600 250 T 1200 250 T 1800 250"
              fill="none"
              stroke="rgb(147, 197, 253)"
              strokeWidth="1"
              opacity="0.15"
            />

            {/* Circuit-like connections */}
            <circle cx="15%" cy="30%" r="4" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1.5" opacity="0.4" />
            <circle cx="45%" cy="70%" r="3" fill="none" stroke="rgb(96, 165, 250)" strokeWidth="1.5" opacity="0.3" />
            <circle cx="75%" cy="40%" r="5" fill="none" stroke="rgb(147, 197, 253)" strokeWidth="1.5" opacity="0.4" />
            <circle cx="85%" cy="80%" r="3" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1.5" opacity="0.3" />

            <line x1="15%" y1="30%" x2="45%" y2="70%" stroke="rgb(59, 130, 246)" strokeWidth="0.5" opacity="0.2" strokeDasharray="5,5" />
            <line x1="45%" y1="70%" x2="75%" y2="40%" stroke="rgb(96, 165, 250)" strokeWidth="0.5" opacity="0.2" strokeDasharray="5,5" />
            <line x1="75%" y1="40%" x2="85%" y2="80%" stroke="rgb(147, 197, 253)" strokeWidth="0.5" opacity="0.2" strokeDasharray="5,5" />
          </svg>
        </div>

        <div className="w-full max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-4 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <FaCoffee className="w-8 h-8 text-blue-900" />
                <span className="text-lg font-semibold text-white">Caffetest</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                AI-powered automation testing for modern development teams.
                Streamline your workflow with intelligent test generation and analytics.
              </p>
              <div className="flex space-x-3">
                {[FaTwitter, FaGithub, FaLinkedin].map((Icon, index) => (
                  <motion.a
                    key={index}
                    href="https://github.com/GyanaprakashKhandual"
                    className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Footer link columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-medium text-sm mb-4">Visit</h4>
              <ul className="space-y-2">
                <li><a onClick={() => router.push("/features")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Features</a></li>
                <li><a onClick={() => router.push("/report-bug")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Report Bug</a></li>
                <li><a onClick={() => router.push("/pricing")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Pricing</a></li>
                <li><a onClick={() => router.push("/documentation")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Documentation</a></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-medium text-sm mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a onClick={() => window.open('https://www.neckly.com')} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">About Us</a></li>
                <li><a onClick={() => router.push("/privacy")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Privacy</a></li>
                <li><a onClick={() => router.push("/terms-and-conditions")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Terms & Conditions</a></li>
                <li><a onClick={() => router.push("/careers")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Careers</a></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-medium text-sm mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a onClick={() => router.push("/help-center")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Help Center</a></li>
                <li><a onClick={() => router.push("/feedback")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Feedback</a></li>
                <li><a onClick={() => router.push("/community")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Community</a></li>
                <li><a onClick={() => router.push("/status")} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer">Status</a></li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            className="border-t border-gray-800 pt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 text-sm">
              © 2025 Caffetest. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}