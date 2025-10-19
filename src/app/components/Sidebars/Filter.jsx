'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useProject } from '@/app/script/Project.context';
import { useTestType } from '@/app/script/TestType.context';
import { GoogleArrowDown } from '../utils/Icon';

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
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-left flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-500 transition-colors bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
                <span className={value ? 'text-slate-900 dark:text-slate-100 text-xs font-medium' : 'text-slate-500 dark:text-slate-400 text-xs'}>
                    {value ? formatDisplayDate(value) : placeholder}
                </span>
                <Calendar size={14} className="text-slate-400 dark:text-slate-400" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl z-20 p-3"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                            >
                                <ChevronLeft size={14} className="text-slate-600 dark:text-slate-300" />
                            </button>

                            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>

                            <button
                                onClick={handleNextMonth}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                            >
                                <ChevronRight size={14} className="text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekdays.map(day => (
                                <div key={day} className="text-[10px] font-medium text-slate-500 dark:text-slate-400 text-center py-1">
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
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                                        }
                                    `}
                                >
                                    {date?.getDate()}
                                </button>
                            ))}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-600">
                            <button
                                onClick={() => handleDateSelect(new Date())}
                                className="w-full text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
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
    const [currentReportType, setCurrentReportType] = useState('bug');

    const dropdownOptions = {
        severity: ['Critical', 'High', 'Medium', 'Low'],
        priority: ['High', 'Low', 'Medium', 'Critical'],
        status: ['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open']
    };

    const { selectedProject } = useProject();
    const { testTypeId } = useTestType();
    const projectId = selectedProject?._id;

    // Listen for report type changes
    useEffect(() => {
        const handleReportChange = (event) => {
            const { type, value } = event.detail;
            if (type === 'report') {
                setCurrentReportType(value);
                // Reset filters when report type changes
                setFilterData({
                    severity: '',
                    priority: '',
                    status: '',
                    fromDate: '',
                    toDate: ''
                });
            }
        };

        window.addEventListener('workspaceStateChange', handleReportChange);

        return () => {
            window.removeEventListener('workspaceStateChange', handleReportChange);
        };
    }, []);

    const handleInputChange = (field, value) => {
        setFilterData(prev => ({ ...prev, [field]: value }));
    };

    const toggleDropdown = (field) => {
        setOpenDropdowns(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const toggleDatePicker = (field) => {
        setOpenDatePickers(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleApply = async () => {
        try {

            if (!projectId || !testTypeId) {
                console.error('Project ID or Test Type ID not found');
                return;
            }

            let apiUrl = '';
            const baseURL = currentReportType === 'bug' 
                ? 'http://localhost:5000/api/v1/bug'
                : 'http://localhost:5000/api/v1/test-case';

            // Build API URL based on filters
            const hasDateRange = filterData.fromDate && filterData.toDate;
            const hasSingleFilter = filterData.severity || filterData.priority || filterData.status;

            if (hasDateRange && (filterData.severity || filterData.priority || filterData.status)) {
                // Combined filter
                apiUrl = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/${currentReportType === 'bug' ? 'bugs' : 'test-cases'}/filter/combined`;
            } else if (hasDateRange) {
                // Date range filter
                if (currentReportType === 'bug') {
                    apiUrl = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/bugs/filter/date`;
                } else {
                    apiUrl = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/test-cases/filter/date-range`;
                }
            } else if (filterData.severity) {
                apiUrl = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/${currentReportType === 'bug' ? 'bugs' : 'test-cases'}/filter/severity`;
            } else if (filterData.priority) {
                apiUrl = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/${currentReportType === 'bug' ? 'bugs' : 'test-cases'}/filter/priority`;
            } else if (filterData.status) {
                apiUrl = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/${currentReportType === 'bug' ? 'bugs' : 'test-cases'}/filter/status`;
            }

            if (!apiUrl) {
                console.log('No filters selected');
                return;
            }

            // Build query parameters
            const params = new URLSearchParams();
            if (filterData.fromDate) params.append('startDate', filterData.fromDate);
            if (filterData.toDate) params.append('endDate', filterData.toDate);
            if (filterData.severity) params.append('severity', filterData.severity);
            if (filterData.priority) params.append('priority', filterData.priority);
            if (filterData.status) params.append('status', filterData.status);

            const url = `${apiUrl}?${params.toString()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Emit filter applied event
            const filterAppliedEvent = new CustomEvent('filtersApplied', {
                detail: {
                    filters: filterData,
                    data: data,
                    reportType: currentReportType
                }
            });
            window.dispatchEvent(filterAppliedEvent);

            console.log('Filters applied:', filterData);
            console.log('API Response:', data);

            if (onClose) onClose();
        } catch (error) {
            console.error('Error applying filters:', error);
        }
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

        // Emit reset event
        const filterResetEvent = new CustomEvent('filtersReset', {
            detail: {
                reportType: currentReportType
            }
        });
        window.dispatchEvent(filterResetEvent);
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
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-left flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-500 transition-colors bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
                <span className={filterData[field] ? 'text-slate-900 dark:text-slate-100 text-xs font-medium' : 'text-slate-500 dark:text-slate-400 text-xs'}>
                    {filterData[field] || getDropdownPlaceholder(field)}
                </span>
                <motion.div
                    animate={{ rotate: openDropdowns[field] ? 180 : 0 }}
                    transition={{ duration: 0.15 }}
                >
                    <GoogleArrowDown size={14} className="text-slate-400 dark:text-slate-400" />
                </motion.div>
            </button>

            <AnimatePresence>
                {openDropdowns[field] && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto"
                    >
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    handleInputChange(field, option);
                                    toggleDropdown(field);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg transition-colors text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
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
        <div className="h-[calc(100vh-4rem)] fixed right-0 mt-14 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 w-[26rem] flex flex-col shadow-2xl z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <div>
                    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Filters</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {currentReportType === 'bug' ? 'Bug Report' : 'Test Case Report'}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <X size={18} className="text-slate-600 dark:text-slate-300" />
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
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Severity</label>
                    {renderDropdown('severity', dropdownOptions.severity)}
                </div>

                {/* Priority Filter */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Priority</label>
                    {renderDropdown('priority', dropdownOptions.priority)}
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Status</label>
                    {renderDropdown('status', dropdownOptions.status)}
                </div>

                {/* Date Range Filters */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date Range</h3>

                    {/* From Date */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">From Date</label>
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
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">To Date</label>
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
            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
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
                        className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        Reset
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;