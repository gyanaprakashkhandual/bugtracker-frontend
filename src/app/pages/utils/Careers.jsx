'use client';

import { motion } from 'framer-motion';
import { Briefcase, Users, Target, Zap, Award, Globe, Code, Brain, Coffee, TrendingUp, Mail, MapPin, Heart, Rocket } from 'lucide-react';

export default function CareersPage() {
    const benefits = [
        {
            icon: <Code className="w-6 h-6" />,
            title: "Cutting-Edge Tech",
            description: "Work with AI, OpenAI integration, and modern development tools",
            color: "bg-blue-600",
            borderColor: "border-blue-600"
        },
        {
            icon: <Brain className="w-6 h-6" />,
            title: "Innovation First",
            description: "Build products that revolutionize testing documentation",
            color: "bg-purple-600",
            borderColor: "border-purple-600"
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Collaborative Team",
            description: "Work with passionate professionals who care about quality",
            color: "bg-green-600",
            borderColor: "border-green-600"
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Growth Opportunities",
            description: "Continuous learning and career advancement paths",
            color: "bg-amber-600",
            borderColor: "border-amber-600"
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: "Remote Friendly",
            description: "Flexible work arrangements and work-life balance",
            color: "bg-indigo-600",
            borderColor: "border-indigo-600"
        },
        {
            icon: <Award className="w-6 h-6" />,
            title: "Competitive Package",
            description: "Fair compensation and comprehensive benefits",
            color: "bg-red-600",
            borderColor: "border-red-600"
        }
    ];

    const values = [
        {
            icon: <Target className="w-5 h-5" />,
            title: "Mission-Driven",
            description: "We're on a mission to automate manual documentation effort"
        },
        {
            icon: <Zap className="w-5 h-5" />,
            title: "Move Fast",
            description: "We iterate quickly and ship features that matter"
        },
        {
            icon: <Heart className="w-5 h-5" />,
            title: "User-Centric",
            description: "Our users' success is our success"
        },
        {
            icon: <Rocket className="w-5 h-5" />,
            title: "Think Big",
            description: "We tackle ambitious problems with bold solutions"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 hide-scrollbar user-select-none">
            {/* Hero Section */}
            <div className="bg-white border-b-2 border-slate-200">
                <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center mb-4">
                            <Briefcase className="w-12 h-12 text-indigo-600 mr-3" />
                            <h1 className="text-5xl font-bold text-slate-900">Careers at Caffetest</h1>
                        </div>
                        <p className="text-base text-slate-700 max-w-2xl mx-auto mb-2">
                            Join our mission to revolutionize testing documentation with AI-powered automation
                        </p>
                        <p className="text-xs text-slate-600">
                            Building the future of test management from Odisha, India
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* About Caffetest */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow-sm border-2 border-slate-300 p-8 mb-8"
                >
                    <div className="flex items-center mb-4">
                        <Coffee className="w-8 h-8 text-indigo-600 mr-3" />
                        <h2 className="text-2xl font-bold text-slate-900">About Caffetest</h2>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed mb-4">
                        Caffetest is an advanced web application that integrates seamlessly with OpenAI and Visual Studio Code Extension. We empower teams to perform CRUD operations on critical testing documents including test cases, bugs, and test data. Our AI-powered platform automatically resolves manual documentation efforts, saving countless hours and improving accuracy.
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        We're a technology startup based in Odisha, India, committed to innovation, quality, and creating tools that make developers' lives easier.
                    </p>
                </motion.div>

                {/* Why Join Us */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Why Join Caffetest?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className={`bg-white rounded-lg shadow-sm border-2 ${benefit.borderColor} p-6 hover:shadow-md transition-shadow duration-300`}
                            >
                                <div className={`${benefit.color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                                    {benefit.icon}
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-2">{benefit.title}</h3>
                                <p className="text-xs text-slate-700 leading-relaxed">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Our Values */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white rounded-lg shadow-sm border-2 border-slate-300 p-8 mb-12"
                >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <div key={index} className="text-center">
                                <div className="bg-indigo-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    {value.icon}
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-2">{value.title}</h3>
                                <p className="text-xs text-slate-700 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Current Openings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Current Openings</h2>

                    {/* No Openings Card */}
                    <div className="bg-white rounded-lg shadow-sm border-2 border-slate-300 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Briefcase className="w-10 h-10 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">No Career Offers Available Right Now</h3>
                            <p className="text-sm text-slate-700 leading-relaxed mb-6">
                                We don't have any open positions at the moment, but we're always looking for talented individuals who are passionate about innovation and technology.
                            </p>
                            <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4 mb-4">
                                <p className="text-xs text-slate-800 font-medium mb-2">
                                    Interested in future opportunities?
                                </p>
                                <p className="text-xs text-slate-700">
                                    Send your resume and portfolio to our careers email. We'll keep it on file and reach out when relevant positions open up.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* How to Apply */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="bg-indigo-600 rounded-lg shadow-md p-8 mb-8 text-white border-2 border-indigo-700"
                >
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center">How to Apply</h2>
                        <p className="text-sm leading-relaxed mb-6 text-center">
                            Even though we don't have current openings, we're always excited to hear from talented professionals. Here's how you can get in touch:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="bg-white bg-opacity-20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold mb-2">Send Your Resume</h3>
                                <p className="text-xs">Email your CV and portfolio to our careers address</p>
                            </div>

                            <div className="text-center">
                                <div className="bg-white bg-opacity-20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold mb-2">Tell Us About You</h3>
                                <p className="text-xs">Share your passion, skills, and what excites you about Caffetest</p>
                            </div>

                            <div className="text-center">
                                <div className="bg-white bg-opacity-20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Rocket className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold mb-2">We'll Keep in Touch</h3>
                                <p className="text-xs">We'll review your application and contact you for future opportunities</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="bg-white rounded-lg shadow-md border-2 border-slate-300 p-8"
                >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Get in Touch</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-2">Careers Email</h3>
                            <a href="mailto:service.caffetest@gmail.com" className="text-xs text-blue-600 hover:underline font-medium">
                                service.caffetest@gmail.com
                            </a>
                        </div>

                        <div className="text-center">
                            <div className="bg-green-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-2">General Inquiries</h3>
                            <a href="mailto:gyanaprakashkhnadual@gmail.com" className="text-xs text-green-600 hover:underline font-medium">
                                gyanaprakashkhnadual@gmail.com
                            </a>
                        </div>

                        <div className="text-center">
                            <div className="bg-indigo-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-2">Location</h3>
                            <p className="text-xs text-slate-700 font-medium">
                                Odisha, India
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Final CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-center mt-8"
                >
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Join us in building the future of testing documentation. We can't wait to hear from you!
                    </p>
                </motion.div>
            </div>
        </div>
    );
}