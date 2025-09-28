import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GoogleArrowDown } from '../utils/Icon';

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
        <div className="h-[calc(100vh-4rem)] fixed right-0 sidebar-scrollbar mt-10 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 w-[28rem] flex flex-col shadow-xl">
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
                        <input
                            type="date"
                            value={filterData.fromDate}
                            onChange={(e) => handleInputChange('fromDate', e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-0.5 focus:ring-blue-900 bg-gray-50 hover:bg-gray-100 transition-all duration-200 font-medium"
                        />
                    </div>

                    {/* To Date */}
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600">To Date</label>
                        <input
                            type="date"
                            value={filterData.toDate}
                            onChange={(e) => handleInputChange('toDate', e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-0.5 focus:ring-blue-900 bg-gray-50 hover:bg-gray-100 transition-all duration-200 font-medium"
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