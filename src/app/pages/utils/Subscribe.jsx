'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Code, Brain, Users, Calendar, MessageSquare, Bug, FileText, Sparkles } from 'lucide-react'

export default function CaffeTestSubscription() {
  const [billingCycle, setBillingCycle] = useState('monthly')

  const plans = {
    monthly: [
      {
        name: 'Free Trial',
        price: '₹0',
        period: '/15 days',
        description: 'Experience the power of AI-driven bug tracking',
        features: [
          'Up to 3 users per organization',
          'Basic bug tracking & documentation',
          'AI-assisted test case writing',
          'VS Code extension integration',
          'Community support',
          '15-day full access'
        ],
        cta: 'Start Free Trial',
        popular: false,
        gradient: 'from-slate-500 to-slate-600'
      },
      {
        name: 'Plus',
        price: '₹200',
        period: '/month',
        description: 'Perfect for growing teams and projects',
        features: [
          'Up to 10 users per organization',
          'Advanced bug tracking & management',
          'Full AI documentation automation',
          'Priority VS Code extension support',
          'OpenAI API integration',
          'Custom test data management',
          'Email support',
          'Monthly feature updates'
        ],
        cta: 'Choose Plus',
        popular: true,
        gradient: 'from-purple-600 to-blue-600'
      },
      {
        name: 'Pro',
        price: '₹300',
        period: '/month',
        description: 'Ultimate solution for professional teams',
        features: [
          'Unlimited users per organization',
          'Enterprise-grade bug tracking',
          'Advanced AI chatbot control',
          'Multi-framework testing support',
          'Custom integrations',
          'Dedicated account manager',
          'Priority 24/7 support',
          'Early access to beta features',
          'Custom AI training models',
          'Advanced analytics & reporting'
        ],
        cta: 'Choose Pro',
        popular: false,
        gradient: 'from-orange-500 to-pink-600'
      }
    ],
    yearly: [
      {
        name: 'Free Trial',
        price: '₹0',
        period: '/15 days',
        description: 'Experience the power of AI-driven bug tracking',
        features: [
          'Up to 3 users per organization',
          'Basic bug tracking & documentation',
          'AI-assisted test case writing',
          'VS Code extension integration',
          'Community support',
          '15-day full access'
        ],
        cta: 'Start Free Trial',
        popular: false,
        gradient: 'from-slate-500 to-slate-600'
      },
      {
        name: 'Plus',
        price: '₹2,160',
        period: '/year',
        savings: 'Save ₹240',
        description: 'Perfect for growing teams and projects',
        features: [
          'Up to 10 users per organization',
          'Advanced bug tracking & management',
          'Full AI documentation automation',
          'Priority VS Code extension support',
          'OpenAI API integration',
          'Custom test data management',
          'Email support',
          'Monthly feature updates'
        ],
        cta: 'Choose Plus',
        popular: true,
        gradient: 'from-purple-600 to-blue-600'
      },
      {
        name: 'Pro',
        price: '₹3,240',
        period: '/year',
        savings: 'Save ₹360',
        description: 'Ultimate solution for professional teams',
        features: [
          'Unlimited users per organization',
          'Enterprise-grade bug tracking',
          'Advanced AI chatbot control',
          'Multi-framework testing support',
          'Custom integrations',
          'Dedicated account manager',
          'Priority 24/7 support',
          'Early access to beta features',
          'Custom AI training models',
          'Advanced analytics & reporting'
        ],
        cta: 'Choose Pro',
        popular: false,
        gradient: 'from-orange-500 to-pink-600'
      }
    ]
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.05)" strokeWidth="1"/>
          </pattern>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(59, 130, 246, 0.1)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
        <rect width="100%" height="100%" fill="url(#dots)"/>
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Welcome to CaffeTest</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Welcome to Our <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Subscription Page</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Thank you for your interest in CaffeTest! We're thrilled to have you here.
          </motion.p>

          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto mb-12 border border-purple-100">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Important Notice About Early Access</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We're delighted you're exploring CaffeTest! Currently, our platform is <strong>completely free</strong> for all users as we perfect the experience. For startups, mid-level companies, and growing teams, we want you to know that CaffeTest is still in its refinement phase for full enterprise workspace integration.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This is your opportunity to explore the platform, familiarize yourself with its powerful features, and develop a workflow that suits your team. On <strong>December 31st</strong>, we'll launch our stable version with enhanced capabilities and subscription options that truly deliver value worth every rupee you invest.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Currently, we're offering <strong>Selenium</strong> for the VS Code extension with CaffeTest integration. In our stable release launching on <strong>December 31st</strong>, we'll integrate industry-leading frameworks including <strong>Appium, Playwright, Cypress, Rest Assured, K6</strong>, and other popular automation testing frameworks focusing on web applications, mobile applications, and desktop applications.
                </p>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-4 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Exciting News: Our Revolutionary Testing Framework</h4>
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">
                        We're building our proprietary open-source testing framework designed for comprehensive web application, mobile application, and desktop testing. This versatile framework supports API testing and complete performance testing across all platforms. Whether you're testing web, mobile, or desktop applications, our framework provides a unified solution that's completely free to use and seamlessly integrated with CaffeTest.
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed font-medium bg-white/60 rounded-lg p-3 border border-purple-100">
                        <span className="text-purple-600 font-semibold">Write Tests in Plain English:</span> Imagine writing automation scripts that feel like giving instructions to a colleague. With our natural language syntax, you won't feel like you're coding at all—simply describe what you want to test in clear, conversational English, and our framework handles the technical complexity behind the scenes. No cryptic commands, no complex syntax—just intuitive, human-readable instructions that anyone on your team can understand and maintain. It's automation testing that finally speaks your language.
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed mt-3">
                        Join us in revolutionizing the testing landscape with a framework built by testers, for testers. Experience the future where testing is as simple as describing what you want, and let the technology do the rest.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We're actively developing exciting features including custom integrations, expanded AI capabilities, multi-framework testing support, and a unified AI chatbot that gives you complete project control from a single interface. Your experience matters to us, so please explore our pricing tiers below and share your valuable feedback to help us refine both our features and pricing strategy.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-4xl mx-auto mb-12 text-white">
            <div className="flex items-start gap-4">
              <Code className="w-8 h-8 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-4">About CaffeTest</h3>
                <p className="text-white/90 leading-relaxed mb-4">
                  CaffeTest is an advanced web application that revolutionizes bug tracking and test documentation. By seamlessly integrating OpenAI's powerful artificial intelligence with Visual Studio Code extensions, we've created a comprehensive solution that automates your entire testing workflow.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Bug className="w-5 h-5 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Smart Bug Tracking</h4>
                      <p className="text-sm text-white/80">Effortlessly manage and document bugs with AI assistance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Automated Documentation</h4>
                      <p className="text-sm text-white/80">Let AI handle test cases, bug reports, and test data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Code className="w-5 h-5 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">VS Code Integration</h4>
                      <p className="text-sm text-white/80">Work directly within your favorite development environment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">AI-Powered Assistance</h4>
                      <p className="text-sm text-white/80">Leverage ChatGPT to streamline manual testing operations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-center mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-lg inline-flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Save 10%</span>
              </button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16"
        >
          {plans[billingCycle].map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.popular ? 'ring-2 ring-purple-600 md:scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className={`h-2 bg-gradient-to-r ${plan.gradient}`} />

              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                    {index === 0 ? <Zap className="w-6 h-6 text-white" /> : 
                     index === 1 ? <Users className="w-6 h-6 text-white" /> : 
                     <Sparkles className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    {plan.savings && (
                      <span className="text-sm text-green-600 font-semibold">{plan.savings}</span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </div>

                <button className={`w-full py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 mb-6 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  {plan.cta}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">We Value Your Feedback</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Your insights are crucial in shaping CaffeTest's future. We encourage you to review our pricing structure and share your thoughts. What features would make your testing workflow more efficient? What price point feels right for your organization? How can we enhance the platform to better serve your needs?
            </p>
            <p className="text-gray-700 leading-relaxed mb-8">
              Together, we'll build a tool that not only meets your expectations but exceeds them, making your testing process smoother, faster, and more enjoyable. Let's create something extraordinary together!
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 inline-flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Share Your Feedback
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}