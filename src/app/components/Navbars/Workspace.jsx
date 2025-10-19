import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TestTypeList from '../Sidebars/TestType';
import { useProject } from '@/app/utils/Get.project';
import { useParams } from 'next/navigation';
import TestCaseSidebar from '../Sidebars/TestCase';
import BugSidebar from '../Sidebars/Bug';
import FilterSidebar from '../Sidebars/Filter';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  Table,
  LayoutGrid,
  Bug,
  FileText,
  SplitIcon,
  Plus,
  DockIcon,
  Sheet,
  Trash2
} from 'lucide-react';
import { FiFilter } from "react-icons/fi";
import { GoogleArrowDown } from '../utils/Icon';
import { SiChatbot } from 'react-icons/si';
import { BsFillKanbanFill } from 'react-icons/bs';

const StyledDropdown = ({ options, placeholder, value, onChange, size = "sm", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (value) {
      const option = options.find(opt => opt.value === value);
      setSelectedOption(option);
    } else {
      setSelectedOption(null);
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
        className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 transition-all duration-200 border rounded-lg bg-white dark:bg-slate-800 backdrop-blur-sm border-sky-200 dark:border-sky-700 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-600"
      >
        <div className="flex items-center space-x-1.5">
          {selectedOption?.icon}
          <span className="whitespace-nowrap">{selectedOption?.label || placeholder}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <GoogleArrowDown className="w-3 h-3" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 z-100 mt-1 overflow-hidden border rounded-lg shadow-lg top-full bg-white dark:bg-slate-800 backdrop-blur-md border-sky-200 dark:border-sky-700"
          >
            {options.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(option)}
                className="flex items-center w-full px-3 py-2 space-x-2 text-xs text-sky-700 dark:text-sky-300 transition-colors duration-150 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 first:rounded-t-lg last:rounded-b-lg"
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

export default function Navbar({ onViewChange, onReportChange, onDataChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [selectedView, setSelectedView] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedManual, setSelectedManual] = useState(null);
  const [isKanbanActive, setIsKanbanActive] = useState(false);

  const [testTypeSidebarOpen, setTestTypeSidebarOpen] = useState(false);
  const [testCaseSidebarOpen, setTestCaseSidebarOpen] = useState(false);
  const [bugSidebarOpen, setBugSidebarOpen] = useState(false);
  const [testDataSidebarOpen, setTestDataSidebarOpen] = useState(false);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);

  const { slug } = useParams();
  const { project, loading, error } = useProject(slug);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeAllSidebars = () => {
    setTestTypeSidebarOpen(false);
    setTestCaseSidebarOpen(false);
    setBugSidebarOpen(false);
    setTestDataSidebarOpen(false);
    setFilterSidebarOpen(false);
  };

  const emitStateChange = (type, value) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('workspaceStateChange', {
        detail: { type, value }
      });
      window.dispatchEvent(event);
    }
  };

  const handleKanbanToggle = () => {
    const newKanbanState = !isKanbanActive;
    setIsKanbanActive(newKanbanState);
    closeAllSidebars();
    emitStateChange('kanban', newKanbanState);
  };

  const handleManualAdd = (value) => {
    if (selectedManual === value) {
      closeAllSidebars();
      setSelectedManual(null);
      return;
    }

    closeAllSidebars();
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

  const handleFilterOpen = () => {
    if (filterSidebarOpen) {
      setFilterSidebarOpen(false);
      return;
    }

    closeAllSidebars();
    setFilterSidebarOpen(true);
  };

  const handleTestTypeToggle = () => {
    if (testTypeSidebarOpen) {
      setTestTypeSidebarOpen(false);
      return;
    }

    closeAllSidebars();
    setTestTypeSidebarOpen(true);
  };

  const handleViewChange = (value) => {
    closeAllSidebars();
    setIsKanbanActive(false);
    setSelectedView(value);
    onViewChange?.(value);
    emitStateChange('view', value);
    emitStateChange('kanban', false);
  };

  const handleReportChange = (value) => {
    closeAllSidebars();
    setIsKanbanActive(false);
    setSelectedReport(value);
    onReportChange?.(value);
    emitStateChange('report', value);
    emitStateChange('kanban', false);
  };

  const viewOptions = [
    { value: 'table', label: 'Table', icon: <Table className="w-4 h-4" /> },
    { value: 'card', label: 'Card', icon: <LayoutGrid className="w-4 h-4" /> },
    { value: 'split', label: 'Split', icon: <SplitIcon className='w-4 h-4' /> }
  ];

  const reportOptions = [
    { value: 'bug', label: 'BUG', icon: <Bug className="w-4 h-4" /> },
    { value: 'test-case', label: 'Case', icon: <FileText className="w-4 h-4" /> }
  ];

  const manualAddOptions = [
    { value: 'addBug', label: 'Bug', icon: <Plus className="h-4 w-4" /> },
    { value: 'addTestCase', label: 'Case', icon: <Plus className="h-4 w-4" /> }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-gradient-to-r from-sky-50 via-blue-50 to-sky-100 dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 backdrop-blur-md border-sky-200 dark:border-slate-700">
        <div className="w-full px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">

            <div className="flex items-center gap-3 flex-shrink-0">
              <motion.button
                tooltip-data="Open Test Types"
                tooltip-placement="right"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTestTypeToggle}
                className="hidden md:block p-2 transition-colors duration-200 rounded-lg cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-800"
              >
                <Menu className="w-6 h-6 text-sky-700 dark:text-sky-300" />
              </motion.button>

              <div className="md:hidden">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMenu}
                  className="p-2 transition-colors duration-200 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800"
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
                        <X className="w-6 h-6 text-sky-700 dark:text-sky-300" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="w-6 h-6 text-sky-700 dark:text-sky-300" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {loading ? (
                <div className="flex items-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-6 bg-gradient-to-r from-sky-200 to-sky-300 dark:from-slate-700 dark:to-slate-600 rounded-md w-32 animate-pulse"
                  />
                </div>
              ) : (
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  tooltip-data={project?.projectName}
                  tooltip-placement="right"
                  animate={{ opacity: 1, x: 0 }}
                  className="text-base font-bold text-sky-700 dark:text-sky-300"
                >
                  {project?.projectName
                    ? project.projectName.length > 15
                      ? project.projectName.slice(0, 15) + "..."
                      : project.projectName
                    : "No Project Selected"}
                </motion.h1>
              )}

              <motion.div className="hidden lg:block relative w-[480px]">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className={`h-4 w-4 transition-colors duration-200 ${searchFocus ? 'text-sky-500 dark:text-sky-400' : 'text-gray-400 dark:text-gray-500'}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-sky-200 dark:border-slate-700 rounded-full bg-white dark:bg-slate-800 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-sky-700 dark:text-sky-300 focus:outline-none focus:ring-0.5 focus:ring-sky-400 dark:focus:ring-sky-500"
                />
              </motion.div>
            </div>

            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <StyledDropdown
                options={viewOptions}
                placeholder="View"
                value={selectedView}
                onChange={handleViewChange}
                size="sm"
                className="w-28"
              />

              <StyledDropdown
                options={reportOptions}
                placeholder="Report"
                value={selectedReport}
                onChange={handleReportChange}
                size="sm"
                className="w-28"
              />

              <StyledDropdown
                options={manualAddOptions}
                placeholder="Add"
                value={selectedManual}
                onChange={handleManualAdd}
                size='sm'
                className='w-28'
              />

              <div className="w-px h-8 bg-sky-200 dark:bg-slate-700" />

              <motion.button
                tooltip-data="Filters"
                tooltip-placement="bottom"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFilterOpen}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-200 rounded-lg ${filterSidebarOpen ? 'bg-sky-500 dark:bg-sky-600 text-white' : 'bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-slate-700'}`}
              >
                <FiFilter size={14} />
                <span>Filter</span>
              </motion.button>

              <motion.button
                tooltip-data="Kanban View"
                tooltip-placement="bottom"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleKanbanToggle}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-200 rounded-lg ${isKanbanActive ? 'bg-sky-500 dark:bg-sky-600 text-white' : 'bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-slate-700'}`}
              >
                <BsFillKanbanFill size={14} />
                <span>Kanban</span>
              </motion.button>

              <motion.button
                tooltip-data="Chat Bot"
                tooltip-placement="bottom"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/app/projects/${project?.slug}/chat`)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 transition-all duration-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                <SiChatbot size={14} />
                <span>Chatbot</span>
              </motion.button>

              <motion.button
                tooltip-data="Documents"
                tooltip-placement="bottom"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/app/projects/${project?.slug}/doc`)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 transition-all duration-200 rounded-lg hover:bg-sky-200 dark:hover:bg-slate-700"
              >
                <DockIcon size={14} />
                <span>Doc</span>
              </motion.button>

              <motion.button
                tooltip-data="Sheet"
                tooltip-placement="bottom"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/app/projects/${project?.slug}/sheet`)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 transition-all duration-200 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700"
              >
                <Sheet size={14} />
                <span>Sheet</span>
              </motion.button>

              <motion.button
                tooltip-data="Trash"
                tooltip-placement="bottom"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/app/projects/${project?.slug}/trash`)}
                className="p-1.5 text-sky-600 dark:text-sky-400 transition-all duration-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          </div>

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
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="block w-full pl-10 pr-3 py-2.5 border border-sky-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-sky-700 dark:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-600"
                    />
                  </div>

                  <StyledDropdown
                    options={viewOptions}
                    placeholder="View Options"
                    value={selectedView}
                    onChange={handleViewChange}
                    size="sm"
                    className="w-full"
                  />

                  <StyledDropdown
                    options={reportOptions}
                    placeholder="Report Options"
                    value={selectedReport}
                    onChange={handleReportChange}
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

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFilterOpen}
                    className="flex items-center w-full px-3 py-2 space-x-2 text-sm text-sky-700 dark:text-sky-300 transition-colors duration-200 rounded-lg hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800"
                  >
                    <FiFilter className="w-4 h-4" />
                    <span>Filter</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleKanbanToggle}
                    className={`flex items-center w-full px-3 py-2 space-x-2 text-sm transition-colors duration-200 rounded-lg ${isKanbanActive ? 'bg-sky-500 dark:bg-sky-600 text-white' : 'text-sky-700 dark:text-sky-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800'}`}
                  >
                    <BsFillKanbanFill className="w-4 h-4" />
                    <span>Kanban</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/app/projects/${project?.slug}/chat`)}
                    className="flex items-center w-full px-3 py-2 space-x-2 text-sm text-sky-700 dark:text-sky-300 transition-colors duration-200 rounded-lg hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800"
                  >
                    <SiChatbot className="w-4 h-4" />
                    <span>Chatbot</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/app/projects/${project?.slug}/test-data`)}
                    className="flex items-center w-full px-3 py-2 space-x-2 text-sm text-sky-700 dark:text-sky-300 transition-colors duration-200 rounded-lg hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800"
                  >
                    <DockIcon className="w-4 h-4" />
                    <span>Documents</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center w-full px-3 py-2 space-x-2 text-xs text-sky-700 dark:text-sky-300 transition-colors duration-200 rounded-lg hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800"
                  >
                    <Sheet className="w-4 h-4" />
                    <span>Sheet</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/app/projects/${project?.slug}/trash`)}
                    className="flex items-center w-full px-3 py-2 space-x-2 text-xs text-sky-700 dark:text-sky-300 transition-colors duration-200 rounded-lg hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Trash</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <TestTypeList
        sidebarOpen={testTypeSidebarOpen}
        onClose={() => setTestTypeSidebarOpen(false)}
      />

      <TestCaseSidebar
        isOpen={testCaseSidebarOpen}
        onClose={() => {
          setTestCaseSidebarOpen(false);
          setSelectedManual(null);
        }}
      />

      <BugSidebar
        isOpen={bugSidebarOpen}
        onClose={() => {
          setBugSidebarOpen(false);
          setSelectedManual(null);
        }}
      />

      <FilterSidebar
        isOpen={filterSidebarOpen}
        onClose={() => setFilterSidebarOpen(false)}
      />

      <div className="pt-16">
      </div>
    </>
  );
}