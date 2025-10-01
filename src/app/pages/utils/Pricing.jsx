'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Rocket, Code2, Bug, LayoutDashboard, Users, Cloud, Shield, Headphones, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Basic',
      icon: Code2,
      description: 'Perfect for individual developers and small teams',
      monthlyPrice: 29,
      yearlyPrice: 290,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'VS Code Extension Integration',
        'Automatic Test Case Generation',
        'Up to 50 Test Cases/Month',
        'Basic Bug Tracking',
        'Email Support',
        'Single User License',
        'API Access'
      ],
      popular: false
    },
    {
      name: 'Premium',
      icon: Crown,
      description: 'Advanced features for growing teams',
      monthlyPrice: 79,
      yearlyPrice: 790,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Everything in Basic',
        'Manual Test Case Creation',
        'Advanced Bug Report Dashboard',
        'Unlimited Test Cases',
        'Priority Email & Chat Support',
        'Up to 10 Team Members',
        'Custom Test Templates',
        'Integration with Jira & Slack',
        'Advanced Analytics'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      icon: Rocket,
      description: 'Complete solution for large organizations',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      color: 'from-orange-500 to-red-500',
      features: [
        'Everything in Premium',
        'Unlimited Team Members',
        'Custom AI Test Generation',
        'Advanced Automation Workflows',
        'Dedicated Account Manager',
        '24/7 Phone & Video Support',
        'On-Premise Deployment Option',
        'Custom Integrations',
        'SLA Guarantee',
        'Security & Compliance Tools',
        'Advanced Reporting & Insights',
        'Training & Onboarding Sessions'
      ],
      popular: false
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

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Bug className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Caffetest Pricing
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Choose the perfect plan for your testing needs
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-16 h-8 bg-gray-200 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <motion.div
              className="absolute top-1 left-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
              animate={{ x: billingCycle === 'yearly' ? 32 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
        </div>
        {billingCycle === 'yearly' && (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-green-600 text-sm font-semibold"
          >
            Save up to 17% with yearly billing
          </motion.p>
        )}
      </motion.div>

      {/* Pricing Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          
          return (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden border ${
                plan.popular ? 'ring-2 ring-purple-500 border-purple-200' : 'border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">${price}</span>
                    <span className="text-gray-600">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-gray-500 mt-1">
                      ${(price / 12).toFixed(2)}/month billed annually
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white mb-8 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30'
                      : 'bg-gray-900 hover:bg-gray-800'
                  } transition-all duration-300`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </motion.button>

                {/* Features */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">What's included:</p>
                  {plan.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="max-w-4xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-3">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h4 className="text-gray-900 font-semibold mb-1">Secure & Compliant</h4>
          <p className="text-gray-600 text-sm">SOC 2 Type II certified</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <Cloud className="w-8 h-8 text-blue-600" />
          </div>
          <h4 className="text-gray-900 font-semibold mb-1">99.9% Uptime</h4>
          <p className="text-gray-600 text-sm">Reliable cloud infrastructure</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-3">
            <Headphones className="w-8 h-8 text-pink-600" />
          </div>
          <h4 className="text-gray-900 font-semibold mb-1">Expert Support</h4>
          <p className="text-gray-600 text-sm">24/7 customer assistance</p>
        </div>
      </motion.div>

      {/* FAQ Callout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="max-w-3xl mx-auto mt-20 text-center"
      >
        <p className="text-gray-700 mb-4">
          Need help choosing the right plan?
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-white border-2 border-gray-300 hover:border-purple-500 text-gray-900 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Contact Our Sales Team
        </motion.button>
      </motion.div>
    </div>
  );
}