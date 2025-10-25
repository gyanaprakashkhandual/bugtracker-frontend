'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Key, 
  Chrome,
  Mail,
  UserPlus,
  ShieldCheck,
  Database,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  FileKey,
  Users,
  Lightbulb,
  Fingerprint,
  ServerCog
} from 'lucide-react';

export default function SecurityDocumentation() {
  const sections = [
    {
      id: 1,
      title: "Authentication Methods",
      icon: Key,
      color: "from-blue-500 to-cyan-500",
      content: "Choose between Google OAuth or traditional email/password authentication",
      details: [
        {
          subtitle: "Google OAuth Login",
          icon: Chrome,
          points: [
            "One-click sign-up with your Google account",
            "Uses Google as a trusted third-party authentication service",
            "Your Google email ID and password remain with Google",
            "No password storage on CaffeTest servers",
            "Secure OAuth 2.0 protocol implementation",
            "Automatic account verification through Google"
          ]
        },
        {
          subtitle: "Traditional Email & Password",
          icon: Mail,
          points: [
            "Register with email address and custom password",
            "Full control over your credentials",
            "Password stored using industry-standard hashing",
            "Requires strong password for maximum security",
            "Independent of third-party services"
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Password Security Best Practices",
      icon: Lock,
      color: "from-purple-500 to-pink-500",
      content: "Essential guidelines for creating and managing secure passwords",
      details: [
        {
          subtitle: "Creating Strong Passwords",
          icon: ShieldCheck,
          points: [
            "Use complicated passwords that are difficult to guess",
            "Combine uppercase, lowercase, numbers, and special characters",
            "Minimum 12-16 characters recommended for maximum security",
            "Avoid common words, names, or predictable patterns",
            "Example: Cf@Test#2024$Secure!Pass"
          ]
        },
        {
          subtitle: "Password Storage Tips",
          icon: FileKey,
          points: [
            "Save passwords in your browser's password manager",
            "Use secure password manager applications",
            "Store in encrypted note-taking apps",
            "Keep physical copies in secure locations",
            "Never share passwords via email or messaging"
          ]
        },
        {
          subtitle: "Forgot Password Recovery",
          icon: AlertTriangle,
          points: [
            "Use the 'Forgot Password' option if you cannot remember",
            "Password reset link sent to your registered email",
            "Follow email instructions to create a new password",
            "Ensure access to your registered email account",
            "Reset process is secure and encrypted"
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Admin User Management",
      icon: Users,
      color: "from-green-500 to-teal-500",
      content: "Security guidelines for administrators creating organization users",
      details: [
        {
          subtitle: "Creating User Accounts",
          icon: UserPlus,
          points: [
            "As an admin, create users for your organization members",
            "Generate strong, complicated passwords for each user",
            "Ensure passwords are unique and not easily guessable",
            "Provide users with secure password delivery method",
            "Consider using password generation tools"
          ]
        },
        {
          subtitle: "Password Complexity Requirements",
          icon: Lock,
          points: [
            "Enforce minimum password length (12+ characters)",
            "Require mix of character types",
            "Avoid sequential or repetitive characters",
            "Do not use organization name or common terms",
            "Regularly remind users to update passwords"
          ]
        },
        {
          subtitle: "User Security Guidelines",
          icon: ShieldCheck,
          points: [
            "Educate users about password best practices",
            "Instruct users to change default passwords immediately",
            "Provide secure channels for password distribution",
            "Monitor account security and suspicious activities",
            "Implement role-based access controls"
          ]
        }
      ]
    },
    {
      id: 4,
      title: "Password Hashing & Encryption",
      icon: Fingerprint,
      color: "from-orange-500 to-red-500",
      content: "Advanced security measures protecting your credentials",
      details: [
        {
          subtitle: "Password Hashing Technology",
          icon: Lock,
          points: [
            "All passwords are hashed using industry-standard algorithms",
            "Hashing is a one-way encryption process",
            "Original passwords cannot be retrieved from hashed values",
            "Even CaffeTest administrators cannot see your password",
            "Protects against database breaches and unauthorized access"
          ]
        },
        {
          subtitle: "Protection Against Hackers",
          icon: Shield,
          points: [
            "Hashed passwords are extremely difficult to crack",
            "Salting adds additional security layer to hashing",
            "Brute force attacks are computationally infeasible",
            "Regular security audits and updates",
            "You can trust CaffeTest with your credentials"
          ]
        },
        {
          subtitle: "Security Guarantee",
          icon: CheckCircle,
          points: [
            "Your password is safe and cannot be hacked",
            "State-of-the-art cryptographic protection",
            "Compliance with security best practices",
            "Regular security assessments and improvements",
            "Feel confident using CaffeTest services"
          ]
        }
      ]
    },
    {
      id: 5,
      title: "Data Privacy & Protection",
      icon: Database,
      color: "from-indigo-500 to-purple-500",
      content: "How CaffeTest protects and handles your data",
      details: [
        {
          subtitle: "Data Usage Policy",
          icon: Eye,
          points: [
            "We do not spread your data to other services",
            "Your data remains confidential and private",
            "No sharing with third-party marketing services",
            "Data used only for CaffeTest functionality",
            "Complete transparency in data handling"
          ]
        },
        {
          subtitle: "Data Security Commitment",
          icon: ShieldCheck,
          points: [
            "Your testing data is stored securely",
            "Access controls prevent unauthorized viewing",
            "Regular backups ensure data availability",
            "Secure transmission protocols (HTTPS/SSL)",
            "Industry-standard database security measures"
          ]
        },
        {
          subtitle: "Privacy Respect",
          icon: EyeOff,
          points: [
            "We respect your privacy and confidentiality",
            "No data mining or unauthorized analysis",
            "Your test cases and bugs remain private",
            "Organization data isolated and protected",
            "Clear data ownership policies"
          ]
        }
      ]
    },
    {
      id: 6,
      title: "Future Security Enhancements",
      icon: ServerCog,
      color: "from-red-500 to-pink-500",
      content: "Upcoming security features and improvements",
      details: [
        {
          subtitle: "End-to-End Encryption (Coming Soon)",
          icon: Lock,
          points: [
            "Full end-to-end encryption implementation in progress",
            "All data encrypted before leaving your device",
            "Data remains encrypted in our database",
            "Only you can decrypt your data",
            "Maximum privacy and security guarantee"
          ]
        },
        {
          subtitle: "Enhanced Data Protection",
          icon: Database,
          points: [
            "Zero-knowledge architecture implementation",
            "Client-side encryption for sensitive data",
            "Encrypted data storage and transmission",
            "Advanced key management systems",
            "Future-proof security infrastructure"
          ]
        },
        {
          subtitle: "Continuous Improvement",
          icon: Lightbulb,
          points: [
            "Regular security updates and patches",
            "Adopting latest security technologies",
            "Compliance with evolving security standards",
            "User feedback integration for security features",
            "Commitment to long-term data protection"
          ]
        }
      ]
    }
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: "Password Hashing",
      description: "Industry-standard encryption"
    },
    {
      icon: Shield,
      title: "Hack Protection",
      description: "Advanced security measures"
    },
    {
      icon: EyeOff,
      title: "Data Privacy",
      description: "Your data stays private"
    },
    {
      icon: Chrome,
      title: "OAuth Support",
      description: "Secure Google login"
    },
    {
      icon: ServerCog,
      title: "E2E Encryption",
      description: "Coming soon"
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
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Security & Privacy
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your security is our priority. Learn how CaffeTest protects your data with advanced encryption, secure authentication, and privacy-first practices
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-8 border border-green-400 dark:border-green-700"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">Trust & Security Guarantee</h3>
              <p className="text-xs text-green-50 leading-relaxed">
                CaffeTest implements bank-level security with password hashing, secure authentication, and strict data privacy policies. Your credentials cannot be hacked, and your data will never be shared with third parties. We are committed to protecting your information with end-to-end encryption coming soon. You can trust us completely.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 mb-8"
        >
          {sections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;
            return (
              <motion.div
                key={section.id}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className={`bg-gradient-to-r ${section.color} p-4`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <SectionIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-white">
                        {section.title}
                      </h2>
                      <p className="text-xs text-white/90">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-5">
                    {section.details.map((detail, detailIndex) => {
                      const DetailIcon = detail.icon;
                      return (
                        <div key={detailIndex} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-7 h-7 bg-gradient-to-br ${section.color} rounded-lg flex items-center justify-center`}>
                              <DetailIcon className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              {detail.subtitle}
                            </h3>
                          </div>
                          <ul className="space-y-2">
                            {detail.points.map((point, pointIndex) => (
                              <motion.li
                                key={pointIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: sectionIndex * 0.05 + detailIndex * 0.02 + pointIndex * 0.01 }}
                                className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300"
                              >
                                <div className="flex-shrink-0 w-1 h-1 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mt-1.5"></div>
                                <span>{point}</span>
                              </motion.li>
                            ))}
                          </ul>
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
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-center"
        >
          <Lock className="w-10 h-10 text-white mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">
            Your Security is Our Priority
          </h3>
          <p className="text-green-50 text-xs mb-5 max-w-2xl mx-auto">
            CaffeTest employs multiple layers of security to protect your data and credentials. Trust us to keep your testing infrastructure safe and secure.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {securityFeatures.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3"
                >
                  <FeatureIcon className="w-5 h-5 text-white mx-auto mb-1" />
                  <div className="text-white font-bold text-xs mb-0.5">{feature.title}</div>
                  <div className="text-green-100 text-xs">{feature.description}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}