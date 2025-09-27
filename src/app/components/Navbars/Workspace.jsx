import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  Filter,
  MessageSquarePlus,
  Settings,
  User,
  BarChart3,
  Table,
  LayoutGrid,
  Bug,
  FileText,
  Trash2,
  Palette,
  SplitIcon,
  Plus,
  CodeSquareIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/app/utils/Get.project';
import { GoogleArrowDown } from '../utils/Icon';
import TestTypeList from '../Sidebars/TestType';
import { MdReport } from 'react-icons/md';

// Styled Dropdown (no changes to this part)
const StyledDropdown = ({ options, placeholder, value, onChange, size = "sm", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (value) {
      const option = options.find(opt => opt.value === value);
      setSelectedOption(option);
    }
  }, [value, options]);

  const handleSelect = (option) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 border rounded-lg bg-white/70 backdrop-blur-sm border-blue-200/50 hover:bg-blue-50/50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
      >
        <div className="flex items-center space-x-2">
          {selectedOption?.icon}
          <span>{selectedOption?.label || placeholder}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <GoogleArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 z-50 mt-1 overflow-hidden border rounded-lg shadow-lg top-full bg-white/90 backdrop-blur-md border-blue-200/50"
          >
            {options.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(option)}
                className="flex items-center w-full px-4 py-3 space-x-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-blue-50/50 hover:text-blue-600 first:rounded-t-lg last:rounded-b-lg"
              >
                {option.icon}
                <span>{option.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [selectedView, setSelectedView] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedManual, setSelectedManual] = useState(null);
  const [ selectedData, setSelectedData ] = useState(null);
  const [testTypeIsOpen, setTestTypeIsOpen] = useState(false);
  const [settingIsOpen, setSettingIsOpen] = useState(false);
  const { slug } = useParams(); // get slug from URL
  const { project, loading, error } = useProject(slug); // just call the hook

  // ✅ Pull selectedProject from context
  const { selectedProject } = useProject();

  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  // View options
  const viewOptions = [
    { value: 'chart', label: 'Chart View', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'table', label: 'Table View', icon: <Table className="w-4 h-4" /> },
    { value: 'card', label: 'Card View', icon: <LayoutGrid className="w-4 h-4" /> },
    { value: 'split', label: 'Split View', icon: <SplitIcon className='w-4 h-4' />}
  ];

  const reportOptions = [
    { value: 'bug', label: 'BUG', icon: <Bug className="w-4 h-4" /> },
    { value: 'test-case', label: 'Test Case', icon: <FileText className="w-4 h-4" /> }
  ];

  const manualAddOptions = [
    { value: 'addBug', label: 'Add Bug', icon: <Plus className="h-4, w-4"/>},
    { value: 'addTestCase', label: 'Add Test Case', icon: <Plus className="h-4, w-4"/>},
    { value: 'addData', label: 'Add Data', icon: <Plus className="h-4, w-4"/>},
  ];

  const dataOption = [
    {value: 'fromVsCode', label: 'From VS Code', icon: <CodeSquareIcon className='h-4, w-4'/> },
    {value: 'fromManual', label: 'From Manual', icon: <MdReport className='h-4, w-4'/> },
  ]
  // Prevent body scroll when settings sidebar is open
  useEffect(() => {
    if (settingIsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        document.body.style.overflow = 'unset';
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [settingIsOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b bg-gradient-to-r from-blue-100 via-sky-50 to-blue-100 backdrop-blur-md border-blue-200/30">
      <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Mobile hamburger */}
          <div className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className="p-2 transition-colors duration-200 rounded-lg hover:bg-blue-100/50"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-gray-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-gray-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Brand */}
          <div className="flex items-center flex-shrink-0 gap-3">
            <motion.p
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTestTypeIsOpen((prev) => !prev)}
              className="p-1 transition-colors duration-200 rounded-md cursor-pointer hover:bg-blue-100/50"
            >
              <Menu className="w-6 h-6 text-black" />
            </motion.p>
            <TestTypeList
              sidebarOpen={testTypeIsOpen}
              onClose={() => setTestTypeIsOpen(false)}
            />

            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text"
            >
              {/* ✅ Use project name from context */}
              {project.projectName || "No Project Selected"}
            </motion.h1>
          </div>

                    {/* Search Bar - Desktop */}
                    <div className="flex-1 hidden max-w-lg mx-8 md:flex">
                        <motion.div
                            className={`relative w-full transition-all duration-300 ${searchFocus ? 'transform scale-105' : ''}`}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className={`h-5 w-5 transition-colors duration-200 ${searchFocus ? 'text-blue-500' : 'text-gray-400'}`} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                onFocus={() => setSearchFocus(true)}
                                onBlur={() => setSearchFocus(false)}
                                className="block w-[400px] pl-10 pr-3 py-1.5 border border-blue-200/50 rounded-full bg-white/70 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
                            />
                        </motion.div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="items-center hidden space-x-3 md:flex">

                        {/* View Dropdown */}
                        <StyledDropdown
                            options={viewOptions}
                            placeholder="View Options"
                            value={selectedView}
                            onChange={setSelectedView}
                            size="sm"
                            className="w-40"
                        />

                        {/* Report Dropdown */}
                        <StyledDropdown
                            options={reportOptions}
                            placeholder="Report Options"
                            value={selectedReport}
                            onChange={setSelectedReport}
                            size="sm"
                            className="w-40"
                        />

                        <StyledDropdown
                        options={manualAddOptions}
                        placeholder="Add Manually"
                        value={selectedManual}
                        onChange={setSelectedManual}
                        size='sm'
                        className='w-40'
                        />
<StyledDropdown
                        options={dataOption}
                        placeholder="Data From"
                        value={selectedData}
                        onChange={setSelectedData}
                        size='sm'
                        className='w-40'
                        />

                        {/* Action Buttons */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center px-4 py-2 space-x-2 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg hover:text-blue-600 hover:bg-blue-50/50"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </motion.button>
                    </div>
                </div>

                {/* Settings Sidebar with scroll prevention */}
                <div style={{ overflow: settingIsOpen ? 'hidden' : 'visible' }}>
                    <SettingSidebar
                        isOpen={settingIsOpen}
                        toggleSidebar={() => setSettingIsOpen((prev) => !prev)}
                    />
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden md:hidden"
                        >
                            <div className="px-2 pt-2 pb-4 space-y-3">

                                {/* Mobile Search */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Search className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="block w-full pl-10 pr-3 py-2.5 border border-blue-200/50 rounded-lg bg-white/70 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
                                    />
                                </div>

                                {/* Mobile Dropdowns */}
                                <StyledDropdown
                                    options={viewOptions}
                                    placeholder="View Options"
                                    value={selectedView}
                                    onChange={setSelectedView}
                                    size="sm"
                                    className="w-full"
                                />

                                <StyledDropdown
                                    options={reportOptions}
                                    placeholder="Report Options"
                                    value={selectedReport}
                                    onChange={setSelectedReport}
                                    size="sm"
                                    className="w-full"
                                />

                                {/* Mobile Buttons */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center w-full px-3 py-2 space-x-2 text-sm text-gray-700 transition-colors duration-200 rounded-lg hover:text-blue-600 hover:bg-blue-50/50"
                                >
                                    <Filter className="w-4 h-4" />
                                    <span>Filter</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center w-full px-3 py-2 space-x-2 text-sm text-white transition-all duration-200 rounded-lg shadow-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                >
                                    <MessageSquarePlus className="w-4 h-4" />
                                    <span>Add Comment</span>
                                </motion.button>
                                <div className="flex items-center justify-center pt-2 space-x-4">
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 180 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSettingIsOpen((prev) => !prev)}
                                        className="p-2 text-gray-600 transition-colors duration-200 rounded-lg hover:text-blue-600 hover:bg-blue-50/50"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 text-gray-600 transition-colors duration-200 rounded-lg hover:text-blue-600 hover:bg-blue-50/50"
                                    >
                                        <User className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}