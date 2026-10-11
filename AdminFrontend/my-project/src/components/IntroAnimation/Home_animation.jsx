import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Cinematic "expo-out" curve — the same feel behind most premium
// product intros (Apple, Linear, etc). Slower start, sharp settle.
const EASE = [0.16, 1, 0.3, 1];

const words = [
    {
        text: "WE",
        className: "text-white/90 font-light tracking-[0.6em]",
        hold: 1000,
    },
    {
        text: "LIVE IN",
        className: "text-white/90 font-light tracking-[0.5em]",
        hold: 1100,
    },
    {
        text: "Adventure",
        className:
            "text-yellow-400 font-serif tracking-[0.04em] drop-shadow-[0_0_45px_rgba(250,204,21,0.5)]",
        hold: 2400,
        letters: true, // this word gets the letter-by-letter reveal
    },
];

// Stagger config for the hero word
const letterContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
    exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};

const letterChild = {
    hidden: { opacity: 0, y: 28, filter: "blur(10px)", scale: 0.94 },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        scale: 1,
        transition: { duration: 0.7, ease: EASE },
    },
    exit: {
        opacity: 0,
        y: -18,
        filter: "blur(6px)",
        transition: { duration: 0.4, ease: EASE },
    },
};

export default function HomeAnimation() {
    const [index, setIndex] = useState(0);
    const navigate = useNavigate();
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (index < words.length - 1) {
                setIndex((prev) => prev + 1);
            } else {
                navigate("/dashboard");
            }
        }, words[index].hold);

        return () => clearTimeout(timer);
    }, [index, navigate]);

    const current = words[index];

    return (
        <div className="relative flex h-screen items-center justify-center overflow-hidden bg-black">
            {/* Film grain — subtle, static texture that reads as "premium" instead of flat black */}
            <div
                className="pointer-events-none absolute inset-0 z-20 opacity-[0.05] mix-blend-overlay"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />

            {/* Vignette for depth */}
            <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]" />

            {/* Ambient glow — two orbs drifting independently instead of one pulsing blob */}
            <motion.div
                animate={
                    reduceMotion
                        ? {}
                        : {
                            x: [0, 40, -20, 0],
                            y: [0, -30, 20, 0],
                            scale: [1, 1.1, 0.95, 1],
                            opacity: [0.15, 0.25, 0.18, 0.15],
                        }
                }
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-[700px] w-[700px] rounded-full bg-yellow-500/10 blur-[180px]"
            />
            <motion.div
                animate={
                    reduceMotion
                        ? {}
                        : {
                            x: [0, -50, 30, 0],
                            y: [0, 25, -15, 0],
                            opacity: [0.1, 0.18, 0.12, 0.1],
                        }
                }
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute h-[500px] w-[500px] rounded-full bg-amber-300/10 blur-[160px]"
            />

            {/* Text */}
            <div className="relative z-30 flex h-40 items-center justify-center overflow-hidden px-6">
                <AnimatePresence mode="wait">
                    {current.letters ? (
                        <motion.h1
                            key={index}
                            variants={letterContainer}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={`${current.className} flex text-6xl md:text-8xl lg:text-9xl whitespace-nowrap select-none`}
                        >
                            {current.text.split("").map((char, i) => (
                                <motion.span
                                    key={i}
                                    variants={letterChild}
                                    className="inline-block"
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                        </motion.h1>
                    ) : (
                        <motion.h1
                            key={index}
                            initial={{
                                opacity: 0,
                                y: 30,
                                filter: "blur(10px)",
                                scale: 0.96,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                filter: "blur(0px)",
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: -22,
                                filter: "blur(8px)",
                                scale: 1.02,
                            }}
                            transition={{ duration: 0.8, ease: EASE }}
                            className={`${current.className} text-6xl md:text-8xl lg:text-9xl whitespace-nowrap select-none`}
                        >
                            {current.text}
                        </motion.h1>
                    )}
                </AnimatePresence>
            </div>

            {/* Progress indicator — segmented bar that fills in real time with each word's hold duration,
                so it actually communicates "here's how far along the intro is" instead of decorating */}
            <div className="absolute bottom-20 z-30 flex gap-2">
                {words.map((w, i) => (
                    <div
                        key={i}
                        className="h-[3px] w-10 overflow-hidden rounded-full bg-white/15"
                    >
                        <motion.div
                            className="h-full bg-yellow-400"
                            initial={{ width: "0%" }}
                            animate={{
                                width: i <= index ? "100%" : "0%",
                            }}
                            transition={{
                                duration: i === index ? w.hold / 1000 : 0.3,
                                ease: i === index ? "linear" : EASE,
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}