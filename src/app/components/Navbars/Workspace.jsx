import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TestTypeList from '../Sidebars/TestType';
import { useProject } from '@/app/utils/Get.project';
import { useParams } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  Filter,
  Settings,
  User,
  BarChart3,
  Table,
  LayoutGrid,
  Bug,
  FileText,
  SplitIcon,
  Plus,
  CodeSquareIcon,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import { FiFilter, FiTrash2, FiSettings } from "react-icons/fi";
import { GoogleArrowDown } from '../utils/Icon';

// ============================================
// STYLED DROPDOWN COMPONENT
// ============================================
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

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// ============================================
// THREE DOTS DROPDOWN COMPONENT
// ============================================
const ThreeDotsDropdown = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 transition-colors duration-200 rounded-lg hover:bg-blue-50/50"
      >
        <MoreVertical />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-50 w-48 mt-1 overflow-hidden border rounded-lg shadow-lg top-full bg-white/90 backdrop-blur-md border-blue-200/50"
          >
            {options.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  option.onClick();
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 space-x-2 text-sm transition-colors duration-150 ${option.danger
                    ? 'text-red-600 hover:bg-red-50/50'
                    : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
                  } first:rounded-t-lg last:rounded-b-lg`}
              >
                {option.icon}
                <span>{option.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// ============================================
// SIDEBAR COMPONENT
// ============================================
const Sidebar = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 w-full h-full overflow-y-auto bg-white shadow-2xl sm:w-96"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-100 via-sky-50 to-blue-100 border-blue-200/30">
              <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                {title}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 transition-colors duration-200 rounded-lg hover:bg-blue-100/50"
              >
                <X className="w-6 h-6 text-gray-700" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================
// SIDEBAR CONTENT COMPONENTS
// ============================================
const AddTestCaseSidebar = ({ isOpen, onClose }) => (
  <Sidebar isOpen={isOpen} onClose={onClose} title="Add Test Case">
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Test Case Title
        </label>
        <input
          type="text"
          placeholder="Enter test case title..."
          className="w-full px-4 py-2 border rounded-lg border-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          rows={4}
          placeholder="Enter test case description..."
          className="w-full px-4 py-2 border rounded-lg border-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Priority
        </label>
        <select className="w-full px-4 py-2 border rounded-lg border-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-300/50">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-4 py-3 text-sm font-medium text-white transition-all duration-200 rounded-lg shadow-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
      >
        Create Test Case
      </motion.button>
    </div>
  </Sidebar>
);

const AddBugSidebar = ({ isOpen, onClose }) => (
  <Sidebar isOpen={isOpen} onClose={onClose} title="Add Bug">
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Bug Title
        </label>
        <input
          type="text"
          placeholder="Enter bug title..."
          className="w-full px-4 py-2 border rounded-lg border-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          rows={4}
          placeholder="Describe the bug..."
          className="w-full px-4 py-2 border rounded-lg border-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Severity
        </label>
        <select className="w-full px-4 py-2 border rounded-lg border-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-300/50">
          <option>Minor</option>
          <option>Major</option>
          <option>Critical</option>
          <option>Blocker</option>
        </select>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-4 py-3 text-sm font-medium text-white transition-all duration-200 rounded-lg shadow-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
      >
        Report Bug
      </motion.button>
    </div>
  </Sidebar>
);

const AddTestDataSidebar = ({ isOpen, onClose }) => (
  <Sidebar isOpen={isOpen} onClose={onClose} title="Add Test Data">
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Data Name
        </label>
        <input
          type="text"
          placeholder="Enter data name..."
          className="w-full px-4 py-2 border rounded-lg border-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Data Type
        </label>
        <select className="w-full px-4 py-2 border rounded-lg border-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-300/50">
          <option>String</option>
          <option>Number</option>
          <option>Boolean</option>
          <option>Array</option>
          <option>Object</option>
        </select>
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Value
        </label>
        <textarea
          rows={4}
          placeholder="Enter test data value..."
          className="w-full px-4 py-2 border rounded-lg border-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-4 py-3 text-sm font-medium text-white transition-all duration-200 rounded-lg shadow-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
      >
        Add Test Data
      </motion.button>
    </div>
  </Sidebar>
);

const FilterSidebar = ({ isOpen, onClose }) => (
  <Sidebar isOpen={isOpen} onClose={onClose} title="Filters">
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Status
        </label>
        <div className="space-y-2">
          {['All', 'Active', 'Completed', 'Pending'].map((status) => (
            <label key={status} className="flex items-center space-x-2">
              <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-300" />
              <span className="text-sm text-gray-700">{status}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Priority
        </label>
        <div className="space-y-2">
          {['Low', 'Medium', 'High', 'Critical'].map((priority) => (
            <label key={priority} className="flex items-center space-x-2">
              <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-300" />
              <span className="text-sm text-gray-700">{priority}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 border rounded-lg border-blue-200/50 hover:bg-blue-50/50"
        >
          Reset
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg shadow-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          Apply
        </motion.button>
      </div>
    </div>
  </Sidebar>
);

// ============================================
// MAIN NAVBAR COMPONENT
// ============================================
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [selectedView, setSelectedView] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedManual, setSelectedManual] = useState(null);
  const [selectedData, setSelectedData] = useState(null);



  // Sidebar states
  const [testTypeSidebarOpen, setTestTypeSidebarOpen] = useState(false);
  const [testCaseSidebarOpen, setTestCaseSidebarOpen] = useState(false);
  const [bugSidebarOpen, setBugSidebarOpen] = useState(false);
  const [testDataSidebarOpen, setTestDataSidebarOpen] = useState(false);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);

  const { slug } = useParams(); // get slug from /project/[slug] route
  const { project, loading, error } = useProject(slug);


  const toggleMenu = () => setIsOpen(!isOpen);

  // Three dots dropdown options
  const getOptions = () => [
    {
      label: "Filters",
      icon: <FiFilter size={16} />,
      onClick: () => setFilterSidebarOpen(true),
    },
    {
      label: "Trash",
      icon: <FiTrash2 size={16} />,
      onClick: () => console.log("Trash clicked"),
      danger: true,
    },
    {
      label: "Settings",
      icon: <FiSettings size={16} />,
      onClick: () => console.log("Settings clicked"),
    },
  ];

  // View options
  const viewOptions = [
    { value: 'chart', label: 'Chart View', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'table', label: 'Table View', icon: <Table className="w-4 h-4" /> },
    { value: 'card', label: 'Card View', icon: <LayoutGrid className="w-4 h-4" /> },
    { value: 'split', label: 'Split View', icon: <SplitIcon className='w-4 h-4' /> }
  ];

  // Report options
  const reportOptions = [
    { value: 'bug', label: 'BUG', icon: <Bug className="w-4 h-4" /> },
    { value: 'test-case', label: 'Test Case', icon: <FileText className="w-4 h-4" /> }
  ];

  // Manual add options with sidebar handlers
  const manualAddOptions = [
    { value: 'addBug', label: 'Add Bug', icon: <Plus className="h-4 w-4" /> },
    { value: 'addTestCase', label: 'Add Test Case', icon: <Plus className="h-4 w-4" /> },
    { value: 'addData', label: 'Add Data', icon: <Plus className="h-4 w-4" /> },
  ];

  // Data options
  const dataOption = [
    { value: 'fromVsCode', label: 'From VS Code', icon: <CodeSquareIcon className='h-4 w-4' /> },
    { value: 'fromManual', label: 'From Manual', icon: <FileText className='h-4 w-4' /> },
  ];

  // Handle manual add selection
  const handleManualAdd = (value) => {
    setSelectedManual(value);
    switch (value) {
      case 'addBug':
        setBugSidebarOpen(true);
        break;
      case 'addTestCase':
        setTestCaseSidebarOpen(true);
        break;
      case 'addData':
        setTestDataSidebarOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-gradient-to-r from-blue-100 via-sky-50 to-blue-100 backdrop-blur-md border-blue-200/30">
        <div className="w-full px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Left Section: Desktop Menu + Mobile hamburger + Brand */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Desktop Menu Icon */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTestTypeSidebarOpen(!testTypeSidebarOpen)}
                className="hidden md:block p-1 transition-colors duration-200 rounded-md cursor-pointer hover:bg-blue-100/50"
              >
                <Menu className="w-6 h-6 text-black" />
              </motion.button>

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
              {loading ? (
                <div className="flex items-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-6 bg-gradient-to-r from-blue-200 to-blue-300 rounded-md w-32 animate-pulse"
                  />
                </div>
              ) : (
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text"
                >
                  {project?.projectName
                    ? project.projectName.length > 15
                      ? project.projectName.slice(0, 15) + "..."
                      : project.projectName
                    : "No Project Selected"}
                </motion.h1>

              )}
            </div>

            {/* Center Section: Search Bar - Desktop Only */}
            <div className="hidden md:flex flex-1 max-w-lg">
              <motion.div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className={`h-5 w-5 transition-colors duration-200 ${searchFocus ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                  className="block w-full pl-10 pr-3 py-1.5 border border-blue-200/50 rounded-full bg-white/70 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </motion.div>
            </div>

            {/* Right Section: Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
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

              {/* Manual Add Dropdown */}
              <StyledDropdown
                options={manualAddOptions}
                placeholder="Add Manually"
                value={selectedManual}
                onChange={handleManualAdd}
                size='sm'
                className='w-40'
              />

              {/* Data From Dropdown */}
              <StyledDropdown
                options={dataOption}
                placeholder="Data From"
                value={selectedData}
                onChange={setSelectedData}
                size='sm'
                className='w-40'
              />

              {/* Three Dots Menu */}
              <ThreeDotsDropdown options={getOptions()} />
            </div>
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

                  <StyledDropdown
                    options={manualAddOptions}
                    placeholder="Add Manually"
                    value={selectedManual}
                    onChange={handleManualAdd}
                    size='sm'
                    className='w-full'
                  />

                  <StyledDropdown
                    options={dataOption}
                    placeholder="Data From"
                    value={selectedData}
                    onChange={setSelectedData}
                    size='sm'
                    className='w-full'
                  />

                  {/* Mobile Action Buttons */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilterSidebarOpen(true)}
                    className="flex items-center w-full px-3 py-2 space-x-2 text-sm text-gray-700 transition-colors duration-200 rounded-lg hover:text-blue-600 hover:bg-blue-50/50"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </motion.button>

                  <div className="flex items-center justify-center pt-2 space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.95 }}
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

      {/* Sidebars */}
      <TestTypeList
        sidebarOpen={testTypeSidebarOpen}
        onClose={() => setTestTypeSidebarOpen(false)}
      />
      <AddTestCaseSidebar
        isOpen={testCaseSidebarOpen}
        onClose={() => setTestCaseSidebarOpen(false)}
      />
      <AddBugSidebar
        isOpen={bugSidebarOpen}
        onClose={() => setBugSidebarOpen(false)}
      />
      <AddTestDataSidebar
        isOpen={testDataSidebarOpen}
        onClose={() => setTestDataSidebarOpen(false)}
      />
      <FilterSidebar
        isOpen={filterSidebarOpen}
        onClose={() => setFilterSidebarOpen(false)}
      />
    </>
  );
}