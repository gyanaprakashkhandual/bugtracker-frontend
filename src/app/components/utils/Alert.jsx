"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import * as Tone from "tone";

const alertStyles = {
    success: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        particleColor: "#10b981",
    },
    error: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        particleColor: "#ef4444",
    },
    warning: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
        icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
        particleColor: "#f59e0b",
    },
    info: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        icon: <Info className="w-5 h-5 text-blue-600" />,
        particleColor: "#3b82f6",
    },
};

const Particle = ({ x, y, color, delay }) => {
    return (
        <motion.div
            initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
                rotate: 0,
            }}
            animate={{
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 200 + Math.random() * 100,
                opacity: 0,
                scale: 0,
                rotate: Math.random() * 360,
            }}
            transition={{
                duration: 1.2 + Math.random() * 0.8,
                delay: delay,
                ease: "easeOut",
            }}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
                backgroundColor: color,
                left: x,
                top: y,
                boxShadow: `0 0 4px ${color}`,
            }}
        />
    );
};

// Sound effect function using Tone.js
const playAlertSound = async (type) => {
    await Tone.start();

    const synth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 0.3,
        },
    }).toDestination();

    switch (type) {
        case "success":
            // Upward cheerful melody
            synth.triggerAttackRelease("C5", "0.1", Tone.now());
            synth.triggerAttackRelease("E5", "0.1", Tone.now() + 0.1);
            synth.triggerAttackRelease("G5", "0.2", Tone.now() + 0.2);
            break;
        case "error":
            // Descending alert tone
            const errorSynth = new Tone.Synth({
                oscillator: { type: "sawtooth" },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
            }).toDestination();
            errorSynth.triggerAttackRelease("G4", "0.15", Tone.now());
            errorSynth.triggerAttackRelease("D4", "0.2", Tone.now() + 0.15);
            setTimeout(() => errorSynth.dispose(), 500);
            break;
        case "warning":
            // Double beep
            const warnSynth = new Tone.Synth({
                oscillator: { type: "square" },
                envelope: { attack: 0.005, decay: 0.1, sustain: 0.2, release: 0.1 },
            }).toDestination();
            warnSynth.triggerAttackRelease("F4", "0.1", Tone.now());
            warnSynth.triggerAttackRelease("F4", "0.1", Tone.now() + 0.15);
            setTimeout(() => warnSynth.dispose(), 500);
            break;
        case "info":
            // Single soft notification
            synth.triggerAttackRelease("A4", "0.15", Tone.now());
            break;
        default:
            synth.triggerAttackRelease("C4", "0.1", Tone.now());
    }

    setTimeout(() => synth.dispose(), 1000);
};

export default function Alert({
    type = "info",
    message = "This is a sample alert message!",
}) {
    const [show, setShow] = useState(true);
    const [isDisintegrating, setIsDisintegrating] = useState(false);
    const [particles, setParticles] = useState([]);
    const alertRef = useRef(null);
    const style = alertStyles[type] || alertStyles.info;

    const createParticles = () => {
        if (!alertRef.current) return;

        const rect = alertRef.current.getBoundingClientRect();
        const particleCount = 50;
        const newParticles = [];

        for (let i = 0; i < particleCount; i++) {
            newParticles.push({
                id: i,
                x: Math.random() * rect.width,
                y: Math.random() * rect.height,
                delay: Math.random() * 0.3,
            });
        }

        setParticles(newParticles);
    };

    useEffect(() => {
        // Play sound when alert appears
        playAlertSound(type);

        const timer = setTimeout(() => {
            setIsDisintegrating(true);
            createParticles();

            setTimeout(() => setShow(false), 1500);
        }, 2000);

        return () => clearTimeout(timer);
    }, [type]);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed top-5 right-5 z-50">
                    <motion.div
                        ref={alertRef}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{
                            opacity: isDisintegrating ? 0 : 1,
                            x: 0,
                            scale: isDisintegrating ? 0.95 : 1,
                            filter: isDisintegrating ? "blur(0.5px)" : "blur(0px)",
                        }}
                        transition={{
                            duration: isDisintegrating ? 0.8 : 0.4,
                            ease: "easeInOut",
                        }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg relative overflow-hidden ${style.bg} ${style.text} ${style.border}`}
                    >
                        {/* Glitch effect overlay */}
                        {isDisintegrating && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.3, 0, 0.2, 0] }}
                                transition={{ duration: 0.6, times: [0, 0.2, 0.4, 0.7, 1] }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                                style={{
                                    background: `linear-gradient(45deg, transparent, ${style.particleColor}20, transparent)`,
                                }}
                            />
                        )}

                        {style.icon}
                        <span className="text-sm font-medium relative z-10">{message}</span>

                        {/* Crackling effect lines */}
                        {isDisintegrating && (
                            <>
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                                        transition={{
                                            duration: 0.4,
                                            delay: i * 0.05,
                                            ease: "easeOut",
                                        }}
                                        className="absolute pointer-events-none"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                            width: `${20 + Math.random() * 40}px`,
                                            height: "1px",
                                            background: style.particleColor,
                                            transform: `rotate(${Math.random() * 360}deg)`,
                                            boxShadow: `0 0 4px ${style.particleColor}`,
                                        }}
                                    />
                                ))}
                            </>
                        )}
                    </motion.div>

                    {/* Particle system */}
                    {isDisintegrating &&
                        particles.map((particle) => (
                            <Particle
                                key={particle.id}
                                x={particle.x}
                                y={particle.y}
                                color={style.particleColor}
                                delay={particle.delay}
                            />
                        ))}
                </div>
            )}
        </AnimatePresence>
    );
}