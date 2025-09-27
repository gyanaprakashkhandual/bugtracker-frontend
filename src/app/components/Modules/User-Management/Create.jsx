import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import Modal from './Modal';
import { GoogleArrowDown } from '../../utils/Icon';
import {
  FaUserShield, FaTasks, FaCode, FaBug, FaUsers,
  FaServer, FaPalette, FaUserTie, FaClipboardList,
  FaChartLine, FaBrain, FaDatabase, FaRobot,
  FaLaptopCode, FaMobileAlt, FaCloud, FaShieldAlt,
  FaFlask, FaClipboardCheck, FaHeadset, FaCogs,
  FaSitemap, FaUserGraduate, FaEllipsisH
} from 'react-icons/fa';
import { SiScrum } from 'react-icons/si';

const CreateUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'developer',
    password: ''
  });

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full system access', icon: FaUserShield, color: 'text-red-600 bg-red-50' },
    { value: 'project manager', label: 'Project Manager', description: 'Manages projects and timelines', icon: FaTasks, color: 'text-indigo-600 bg-indigo-50' },
    { value: 'developer', label: 'Developer', description: 'Can read and write code', icon: FaCode, color: 'text-green-600 bg-green-50' },
    { value: 'qa tester', label: 'QA Tester', description: 'Tests and ensures quality', icon: FaBug, color: 'text-yellow-600 bg-yellow-50' },
    { value: 'hr manager', label: 'HR Manager', description: 'Manages human resources', icon: FaUsers, color: 'text-pink-600 bg-pink-50' },
    { value: 'devops engineer', label: 'DevOps Engineer', description: 'Manages deployment and infrastructure', icon: FaServer, color: 'text-cyan-600 bg-cyan-50' },
    { value: 'ui-ux designer', label: 'UI/UX Designer', description: 'Designs user interfaces', icon: FaPalette, color: 'text-purple-600 bg-purple-50' },
    { value: 'manager', label: 'Manager', description: 'Can manage team members', icon: FaUserTie, color: 'text-blue-600 bg-blue-50' },
    { value: 'product manager', label: 'Product Manager', description: 'Manages product strategy', icon: FaClipboardList, color: 'text-orange-600 bg-orange-50' },
    { value: 'business analyst', label: 'Business Analyst', description: 'Analyzes business requirements', icon: FaChartLine, color: 'text-teal-600 bg-teal-50' },
    { value: 'scrum master', label: 'Scrum Master', description: 'Facilitates Agile processes', icon: SiScrum, color: 'text-indigo-600 bg-indigo-50' },
    { value: 'data scientist', label: 'Data Scientist', description: 'Analyzes and interprets data', icon: FaChartLine, color: 'text-blue-600 bg-blue-50' },
    { value: 'data engineer', label: 'Data Engineer', description: 'Builds data pipelines', icon: FaDatabase, color: 'text-gray-600 bg-gray-50' },
    { value: 'ml engineer', label: 'ML Engineer', description: 'Develops machine learning models', icon: FaBrain, color: 'text-purple-600 bg-purple-50' },
    { value: 'ai engineer', label: 'AI Engineer', description: 'Develops AI solutions', icon: FaRobot, color: 'text-violet-600 bg-violet-50' },
    { value: 'frontend developer', label: 'Frontend Developer', description: 'Builds user interfaces', icon: FaLaptopCode, color: 'text-green-600 bg-green-50' },
    { value: 'backend developer', label: 'Backend Developer', description: 'Builds server-side logic', icon: FaServer, color: 'text-slate-600 bg-slate-50' },
    { value: 'fullstack developer', label: 'Fullstack Developer', description: 'Builds complete applications', icon: FaCode, color: 'text-emerald-600 bg-emerald-50' },
    { value: 'mobile developer', label: 'Mobile Developer', description: 'Builds mobile applications', icon: FaMobileAlt, color: 'text-sky-600 bg-sky-50' },
    { value: 'cloud engineer', label: 'Cloud Engineer', description: 'Manages cloud infrastructure', icon: FaCloud, color: 'text-blue-600 bg-blue-50' },
    { value: 'security engineer', label: 'Security Engineer', description: 'Ensures system security', icon: FaShieldAlt, color: 'text-red-600 bg-red-50' },
    { value: 'automation tester', label: 'Automation Tester', description: 'Automates testing processes', icon: FaFlask, color: 'text-amber-600 bg-amber-50' },
    { value: 'manual tester', label: 'Manual Tester', description: 'Performs manual testing', icon: FaClipboardCheck, color: 'text-yellow-600 bg-yellow-50' },
    { value: 'support engineer', label: 'Support Engineer', description: 'Provides technical support', icon: FaHeadset, color: 'text-cyan-600 bg-cyan-50' },
    { value: 'system administrator', label: 'System Administrator', description: 'Manages system operations', icon: FaCogs, color: 'text-gray-600 bg-gray-50' },
    { value: 'solution architect', label: 'Solution Architect', description: 'Designs system architecture', icon: FaSitemap, color: 'text-indigo-600 bg-indigo-50' },
    { value: 'technical lead', label: 'Technical Lead', description: 'Leads technical teams', icon: FaUserTie, color: 'text-slate-600 bg-slate-50' },
    { value: 'software architect', label: 'Software Architect', description: 'Designs software systems', icon: FaSitemap, color: 'text-purple-600 bg-purple-50' },
    { value: 'database administrator', label: 'Database Administrator', description: 'Manages databases', icon: FaDatabase, color: 'text-teal-600 bg-teal-50' },
    { value: 'intern', label: 'Intern', description: 'Learning and gaining experience', icon: FaUserGraduate, color: 'text-lime-600 bg-lime-50' },
    { value: 'other', label: 'Other', description: 'Other role', icon: FaEllipsisH, color: 'text-gray-600 bg-gray-50' }
  ];

  const selectedRole = roles.find(role => role.value === formData.role);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      onSubmit(formData);
      setFormData({
        name: '',
        email: '',
        role: 'developer',
        password: ''
      });
      setIsRoleDropdownOpen(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'developer',
      password: ''
    });
    setIsRoleDropdownOpen(false);
    onClose();
  };

  const handleRoleSelect = (roleValue) => {
    setFormData({ ...formData, role: roleValue });
    setIsRoleDropdownOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter user name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${selectedRole.color}`}>
                  <selectedRole.icon className="w-3 h-3" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">{selectedRole.label}</span>
                  <span className="text-xs text-gray-500 ml-1">— {selectedRole.description}</span>
                </div>
              </div>
              <GoogleArrowDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            <AnimatePresence>
              {isRoleDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto"
                >
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleSelect(role.value)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${role.color}`}>
                          <role.icon className="w-3 h-3" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{role.label}</div>
                          <div className="text-xs text-gray-500">{role.description}</div>
                        </div>
                      </div>
                      {formData.role === role.value && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password (Optional)</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Leave empty for default password"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create User
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;