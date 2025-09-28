import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// Custom GoogleArrowDown component since it's not available
const GoogleArrowDown = ({ size = 16, className = '' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M7 10L12 15L17 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const CustomDatePicker = ({ value, onChange, placeholder, isOpen, onToggle }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const handleDateSelect = (date) => {
        if (date) {
            const formattedDate = date.toISOString().split('T')[0];
            onChange(formattedDate);
            onToggle();
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isSelectedDate = (date) => {
        if (!value || !date) return false;
        const selectedDate = new Date(value);
        return date.toDateString() === selectedDate.toDateString();
    };

    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="w-full p-4 border border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-gray-300 transition-all duration-200 bg-gray-50 hover:bg-gray-100"
            >
                <span className={value ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                    {value ? formatDisplayDate(value) : placeholder}
                </span>
                <Calendar size={16} className="text-gray-400" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4"
                    >
                        {/* Month/Year Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ChevronLeft size={16} className="text-gray-600" />
                            </button>

                            <h3 className="text-sm font-semibold text-gray-800">
                                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>

                            <button
                                onClick={handleNextMonth}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ChevronRight size={16} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Weekdays Header */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekdays.map(day => (
                                <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth(currentDate).map((date, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleDateSelect(date)}
                                    disabled={!date}
                                    className={`
                                        h-8 w-full text-sm rounded-md transition-all duration-150
                                        ${!date ? 'invisible' : ''}
                                        ${isSelectedDate(date)
                                            ? 'bg-blue-600 text-white font-medium'
                                            : isToday(date)
                                                ? 'bg-blue-50 text-blue-600 font-medium border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    {date?.getDate()}
                                </button>
                            ))}
                        </div>

                        {/* Today Button */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <button
                                onClick={() => handleDateSelect(new Date())}
                                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 rounded-md hover:bg-blue-50 transition-colors"
                            >
                                Today
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FilterSidebar = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [filterData, setFilterData] = useState({
        severity: '',
        priority: '',
        status: '',
        fromDate: '',
        toDate: ''
    });
    const [openDropdowns, setOpenDropdowns] = useState({});
    const [openDatePickers, setOpenDatePickers] = useState({});

    const dropdownOptions = {
        severity: ['Critical', 'High', 'Medium', 'Low'],
        priority: ['High', 'Low', 'Medium', 'Critical'],
        status: ['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open']
    };

    const handleInputChange = (field, value) => {
        setFilterData(prev => ({ ...prev, [field]: value }));
    };

    const toggleDropdown = (field) => {
        setOpenDropdowns(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const toggleDatePicker = (field) => {
        setOpenDatePickers(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleApply = () => {
        console.log('Filters applied:', filterData);
        if (onClose) onClose();
    };

    const handleReset = () => {
        setFilterData({
            severity: '',
            priority: '',
            status: '',
            fromDate: '',
            toDate: ''
        });
        setOpenDropdowns({});
        setOpenDatePickers({});
    };

    const getDropdownPlaceholder = (field) => {
        const placeholders = {
            severity: 'Severity',
            priority: 'Priority',
            status: 'Status'
        };
        return placeholders[field] || field;
    };

    const renderDropdown = (field, options) => (
        <div className="relative">
            <button
                onClick={() => toggleDropdown(field)}
                className="w-full p-4 border border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-gray-300 transition-all duration-200 bg-gray-50 hover:bg-gray-100"
            >
                <span className={filterData[field] ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                    {filterData[field] || getDropdownPlaceholder(field)}
                </span>
                <motion.div
                    animate={{ rotate: openDropdowns[field] ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <GoogleArrowDown size={16} className="text-gray-400" />
                </motion.div>
            </button>

            <AnimatePresence>
                {openDropdowns[field] && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto"
                    >
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    handleInputChange(field, option);
                                    toggleDropdown(field);
                                }}
                                className="w-full p-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors font-medium text-gray-700 hover:text-gray-900"
                            >
                                {option}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="h-[calc(100vh-4rem)] fixed right-0 sidebar-scrollbar mt-14 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 w-[28rem] flex flex-col shadow-xl">
            {/* Header with Close Icon */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={20} className="text-gray-600" />
                </motion.button>
            </div>

            {/* Filter Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 p-6 space-y-6 overflow-y-auto"
            >
                {/* Severity Filter */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Severity</label>
                    {renderDropdown('severity', dropdownOptions.severity)}
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Priority</label>
                    {renderDropdown('priority', dropdownOptions.priority)}
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Status</label>
                    {renderDropdown('status', dropdownOptions.status)}
                </div>

                {/* Date Range Filters */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700">Date Range</h3>

                    {/* From Date */}
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600">From Date</label>
                        <CustomDatePicker
                            value={filterData.fromDate}
                            onChange={(value) => handleInputChange('fromDate', value)}
                            placeholder="Select from date"
                            isOpen={openDatePickers.fromDate}
                            onToggle={() => toggleDatePicker('fromDate')}
                        />
                    </div>

                    {/* To Date */}
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600">To Date</label>
                        <CustomDatePicker
                            value={filterData.toDate}
                            onChange={(value) => handleInputChange('toDate', value)}
                            placeholder="Select to date"
                            isOpen={openDatePickers.toDate}
                            onToggle={() => toggleDatePicker('toDate')}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleApply}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Apply
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleReset}
                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                    >
                        Reset
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default FilterSidebar;