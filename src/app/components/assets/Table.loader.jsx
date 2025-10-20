'use client';

import { motion } from 'framer-motion';

const TableSkeletonLoader = () => {
    const shimmer = {
        hidden: { backgroundPosition: '-100% 0' },
        visible: {
            backgroundPosition: '100% 0',
            transition: {
                duration: 1.5,
                ease: 'linear',
                repeat: Infinity,
            },
        },
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.3 },
        },
    };

    const SkeletonBox = ({ className = '' }) => (
        <motion.div
            className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] rounded ${className}`}
            variants={shimmer}
            initial="hidden"
            animate="visible"
        />
    );

    const rows = Array.from({ length: 10 }, (_, i) => i);

    return (
        <motion.div
            className="w-full bg-white dark:bg-gray-900"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
        >
            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    {/* Table Header */}
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <th className="px-4 py-3 text-left">
                                <SkeletonBox className="h-4 w-12" />
                            </th>
                            <th className="px-4 py-3 text-left">
                                <SkeletonBox className="h-4 w-16" />
                            </th>
                            <th className="px-4 py-3 text-left">
                                <SkeletonBox className="h-4 w-20" />
                            </th>
                            <th className="px-4 py-3 text-left">
                                <SkeletonBox className="h-4 w-28" />
                            </th>
                            <th className="px-4 py-3 text-left">
                                <SkeletonBox className="h-4 w-32" />
                            </th>
                            <th className="px-4 py-3 text-left">
                                <SkeletonBox className="h-4 w-24" />
                            </th>
                            <th className="px-4 py-3 text-left">
                                <SkeletonBox className="h-4 w-24" />
                            </th>
                            <th className="px-4 py-3 text-left">
                                <SkeletonBox className="h-4 w-20" />
                            </th>
                            <th className="px-4 py-3 text-left">
                                <SkeletonBox className="h-4 w-24" />
                            </th>
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                                {/* S.NO */}
                                <td className="px-4 py-4">
                                    <SkeletonBox className="h-5 w-20" />
                                </td>

                                {/* TYPE */}
                                <td className="px-4 py-4">
                                    <SkeletonBox className="h-8 w-28" />
                                </td>

                                {/* MODULE */}
                                <td className="px-4 py-4">
                                    <SkeletonBox className="h-5 w-32" />
                                </td>

                                {/* DESCRIPTION */}
                                <td className="px-4 py-4">
                                    <div className="space-y-2">
                                        <SkeletonBox className="h-4 w-full" />
                                        <SkeletonBox className="h-4 w-5/6" />
                                    </div>
                                </td>

                                {/* REQUIREMENT */}
                                <td className="px-4 py-4">
                                    <div className="space-y-2">
                                        <SkeletonBox className="h-4 w-full" />
                                        <SkeletonBox className="h-4 w-4/5" />
                                    </div>
                                </td>

                                {/* PRIORITY */}
                                <td className="px-4 py-4">
                                    <SkeletonBox className="h-8 w-24" />
                                </td>

                                {/* SEVERITY */}
                                <td className="px-4 py-4">
                                    <SkeletonBox className="h-8 w-24" />
                                </td>

                                {/* STATUS */}
                                <td className="px-4 py-4">
                                    <SkeletonBox className="h-8 w-28" />
                                </td>

                                {/* ACTIONS */}
                                <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                        <SkeletonBox className="h-8 w-8 rounded" />
                                        <SkeletonBox className="h-8 w-8 rounded" />
                                        <SkeletonBox className="h-8 w-8 rounded" />
                                        <SkeletonBox className="h-8 w-8 rounded" />
                                        <SkeletonBox className="h-8 w-8 rounded" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer with pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <SkeletonBox className="h-5 w-40" />
                    <SkeletonBox className="h-5 w-48" />
                </div>
                <div className="flex items-center gap-2">
                    <SkeletonBox className="h-9 w-9" />
                    <SkeletonBox className="h-9 w-9" />
                    <SkeletonBox className="h-9 w-24" />
                    <SkeletonBox className="h-9 w-9" />
                    <SkeletonBox className="h-9 w-9" />
                </div>
            </div>
        </motion.div>
    );
};

export default TableSkeletonLoader;