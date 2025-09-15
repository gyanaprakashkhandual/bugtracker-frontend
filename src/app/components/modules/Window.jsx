"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTestTypes } from "@/app/utils/functions/GetTestType";
import {
    MoreVertical,
    X,
    FolderOpen,
    Calendar,
    User,
    Code,
} from "lucide-react";
import { ThreeDotsDropdown } from "../assets/Dropdown";

export default function TestTypeList({ sidebarOpen, onClose }) {
    const [testTypes, setTestTypes] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredTest, setHoveredTest] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const result = await getTestTypes();
            setTestTypes(result);
            setLoading(false);
        })();
    }, []);

    return (
        <>
            {/* Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="fixed inset-0 z-40"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94],
                            type: "spring",
                            damping: 25,
                            stiffness: 120,
                        }}
                        className="fixed left-0 top-0 h-[calc(100vh-4rem)] w-72 mt-16 bg-gradient-to-br from-blue-50 via-sky-50 to-white z-50 flex flex-col backdrop-blur-sm"
                    >
                        {/* Header */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
                            className="flex items-center justify-between p-4 border-b border-gray-200/50 backdrop-blur-sm"
                        >
                            <h2 className="text-lg font-semibold text-gray-800">
                                Test Types
                            </h2>
                            <motion.button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-100 transition-all duration-300 ease-in-out"
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </motion.button>
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent p-2">
                            {loading ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex justify-center items-center h-40"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                        className="rounded-full h-8 w-8 border-b-2 border-blue-500"
                                    ></motion.div>
                                </motion.div>
                            ) : testTypes && testTypes.data && testTypes.data.length > 0 ? (
                                <AnimatePresence mode="popLayout">
                                    {testTypes.data.map((testType, index) => (
                                        <motion.div
                                            key={testType._id}
                                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: -100, scale: 0.95 }}
                                            transition={{
                                                delay: index * 0.05,
                                                duration: 0.4,
                                                ease: [0.25, 0.46, 0.45, 0.94],
                                                type: "spring",
                                                damping: 20,
                                                stiffness: 100,
                                            }}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onHoverStart={() => setHoveredTest(testType._id)}
                                            onHoverEnd={() => setHoveredTest(null)}
                                            className="mx-2 my-1 rounded-xl border border-transparent hover:border-slate-200/60 transition-all duration-300 ease-in-out cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <motion.div
                                                        className="flex-shrink-0"
                                                        variants={{
                                                            hover: {
                                                                rotate: 15,
                                                                scale: 1.1,
                                                                transition: { duration: 0.2, ease: "easeOut" },
                                                            },
                                                        }}
                                                    >
                                                        <FolderOpen size={18} className="text-blue-500" />
                                                    </motion.div>
                                                    <motion.span
                                                        className="font-medium text-slate-700 truncate"
                                                        variants={{
                                                            hover: {
                                                                x: 4,
                                                                transition: { duration: 0.2, ease: "easeOut" },
                                                            },
                                                        }}
                                                    >
                                                        {testType.testTypeName}
                                                    </motion.span>
                                                </div>

                                                <motion.div
                                                    initial={{ opacity: 0.7, scale: 0.8 }}

                                                >
                                                    <ThreeDotsDropdown
                                                        className="ml-2" // adds some spacing from the element
                                                        dropdownWidth="w-40" // slightly smaller, more compact
                                                        position="bottom-right"
                                                        options={[
                                                            {
                                                                label: "Rename",
                                                                onClick: () => console.log("Rename clicked"),
                                                                className: "text-blue-600 hover:text-blue-800", // extra styling
                                                            },
                                                            {
                                                                label: "Delete",
                                                                onClick: () => console.log("Delete clicked"),
                                                                className: "text-red-600 hover:text-red-800", // extra styling
                                                            },
                                                        ]}
                                                    />



                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex flex-col items-center justify-center h-40 text-gray-500"
                                >
                                    <motion.div
                                        animate={{
                                            y: [0, -5, 0],
                                            opacity: [0.5, 0.8, 0.5],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <FolderOpen className="w-10 h-10 mb-2" />
                                    </motion.div>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.4 }}
                                    >
                                        No test types found
                                    </motion.p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
