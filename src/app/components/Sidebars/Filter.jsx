import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// Custom GoogleArrowDown component
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

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

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
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-slate-300 transition-colors bg-white hover:bg-slate-50"
            >
                <span className={value ? 'text-slate-900 text-xs font-medium' : 'text-slate-500 text-xs'}>
                    {value ? formatDisplayDate(value) : placeholder}
                </span>
                <Calendar size={14} className="text-slate-400" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 p-3"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1 rounded hover:bg-slate-100 transition-colors"
                            >
                                <ChevronLeft size={14} className="text-slate-600" />
                            </button>

                            <h3 className="text-xs font-semibold text-slate-800">
                                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>

                            <button
                                onClick={handleNextMonth}
                                className="p-1 rounded hover:bg-slate-100 transition-colors"
                            >
                                <ChevronRight size={14} className="text-slate-600" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekdays.map(day => (
                                <div key={day} className="text-[10px] font-medium text-slate-500 text-center py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth(currentDate).map((date, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleDateSelect(date)}
                                    disabled={!date}
                                    className={`
                                        h-7 w-full text-[11px] rounded transition-colors
                                        ${!date ? 'invisible' : ''}
                                        ${isSelectedDate(date)
                                            ? 'bg-blue-600 text-white font-medium'
                                            : isToday(date)
                                                ? 'bg-blue-50 text-blue-600 font-medium border border-blue-200'
                                                : 'text-slate-700 hover:bg-slate-100'
                                        }
                                    `}
                                >
                                    {date?.getDate()}
                                </button>
                            ))}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100">
                            <button
                                onClick={() => handleDateSelect(new Date())}
                                className="w-full text-[11px] text-blue-600 hover:text-blue-700 font-medium py-1.5 rounded hover:bg-blue-50 transition-colors"
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
            severity: 'Select severity',
            priority: 'Select priority',
            status: 'Select status'
        };
        return placeholders[field] || field;
    };

    const renderDropdown = (field, options) => (
        <div className="relative">
            <button
                onClick={() => toggleDropdown(field)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-slate-300 transition-colors bg-white hover:bg-slate-50"
            >
                <span className={filterData[field] ? 'text-slate-900 text-xs font-medium' : 'text-slate-500 text-xs'}>
                    {filterData[field] || getDropdownPlaceholder(field)}
                </span>
                <motion.div
                    animate={{ rotate: openDropdowns[field] ? 180 : 0 }}
                    transition={{ duration: 0.15 }}
                >
                    <GoogleArrowDown size={14} className="text-slate-400" />
                </motion.div>
            </button>

            <AnimatePresence>
                {openDropdowns[field] && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto"
                    >
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    handleInputChange(field, option);
                                    toggleDropdown(field);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg transition-colors text-xs font-medium text-slate-700 hover:text-slate-900"
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
        <div className="h-[calc(100vh-4rem)] fixed right-0 mt-14 bg-white border-l border-slate-200 w-[26rem] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-semibold text-slate-800">Filters</h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                    <X size={18} className="text-slate-600" />
                </motion.button>
            </div>

            {/* Filter Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 px-5 py-4 space-y-4 overflow-y-auto"
            >
                {/* Severity Filter */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Severity</label>
                    {renderDropdown('severity', dropdownOptions.severity)}
                </div>

                {/* Priority Filter */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Priority</label>
                    {renderDropdown('priority', dropdownOptions.priority)}
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Status</label>
                    {renderDropdown('status', dropdownOptions.status)}
                </div>

                {/* Date Range Filters */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold text-slate-700">Date Range</h3>

                    {/* From Date */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-medium text-slate-600">From Date</label>
                        <CustomDatePicker
                            value={filterData.fromDate}
                            onChange={(value) => handleInputChange('fromDate', value)}
                            placeholder="Select from date"
                            isOpen={openDatePickers.fromDate}
                            onToggle={() => toggleDatePicker('fromDate')}
                        />
                    </div>

                    {/* To Date */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-medium text-slate-600">To Date</label>
                        <CustomDatePicker
                            value={filterData.toDate}
                            onChange={(value) => handleInputChange('toDate', value)}
                            placeholder="Select to date"
                            isOpen={openDatePickers.toDate}
                            onToggle={() => toggleDatePicker('toDate')}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50">
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleApply}
                        className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Apply Filters
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleReset}
                        className="flex-1 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                        Reset
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;