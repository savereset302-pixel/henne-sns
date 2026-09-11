"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSound } from "./SoundContext";

interface RippleItem {
    id: number;
    x: number;
    y: number;
}

interface RippleContextType {
    triggerRipple: (x?: number, y?: number) => void;
}

const RippleContext = createContext<RippleContextType>({
    triggerRipple: () => {},
});

export const RippleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ripples, setRipples] = useState<RippleItem[]>([]);
    const { triggerWaterDrop } = useSound();

    const triggerRipple = useCallback((x?: number, y?: number) => {
        let posX = x;
        let posY = y;

        if (typeof posX !== "number" || typeof posY !== "number") {
            if (typeof window !== "undefined") {
                posX = window.innerWidth / 2;
                posY = window.innerHeight / 2;
            } else {
                posX = 200;
                posY = 200;
            }
        }

        const id = Date.now() + Math.random();
        setRipples(prev => [...prev.slice(-8), { id, x: posX!, y: posY! }]);

        // Play gentle water drop sound
        triggerWaterDrop();

        // Remove ripple after animation finishes (1500ms)
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 1500);
    }, [triggerWaterDrop]);

    return (
        <RippleContext.Provider value={{ triggerRipple }}>
            {children}
            {/* Visual ripple layer */}
            <div className="shizunari-ripple-layer" aria-hidden="true">
                {ripples.map(r => (
                    <div
                        key={r.id}
                        className="shizunari-ripple-group"
                        style={{ left: `${r.x}px`, top: `${r.y}px` }}
                    >
                        <div className="shizunari-ripple-drop" />
                        <div className="shizunari-ripple-ring ring-1" />
                        <div className="shizunari-ripple-ring ring-2" />
                        <div className="shizunari-ripple-ring ring-3" />
                    </div>
                ))}
            </div>
            <style jsx global>{`
                .shizunari-ripple-layer {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 99999;
                    overflow: hidden;
                }

                .shizunari-ripple-group {
                    position: absolute;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                }

                .shizunari-ripple-drop {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 12px;
                    height: 12px;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    background: #a5f3fc;
                    box-shadow: 0 0 16px #38bdf8, 0 0 28px rgba(14, 165, 233, 0.6);
                    animation: shizuDropPulse 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                .shizunari-ripple-ring {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    border: 2px solid #38bdf8;
                    box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
                    pointer-events: none;
                }

                .ring-1 {
                    animation: shizuRippleExpand 1.3s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
                }

                .ring-2 {
                    border-color: #22d3ee;
                    animation: shizuRippleExpand 1.45s cubic-bezier(0.1, 0.8, 0.2, 1) 0.12s forwards;
                    opacity: 0;
                }

                .ring-3 {
                    border-color: #0ea5e9;
                    border-style: dashed;
                    animation: shizuRippleExpand 1.6s cubic-bezier(0.1, 0.8, 0.2, 1) 0.24s forwards;
                    opacity: 0;
                }

                @keyframes shizuDropPulse {
                    0% {
                        transform: translate(-50%, -50%) scale(0.4);
                        opacity: 1;
                    }
                    60% {
                        transform: translate(-50%, -50%) scale(1.4);
                        opacity: 0.9;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(2.2);
                        opacity: 0;
                    }
                }

                @keyframes shizuRippleExpand {
                    0% {
                        width: 10px;
                        height: 10px;
                        opacity: 0.85;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    60% {
                        opacity: 0.55;
                    }
                    100% {
                        width: 320px;
                        height: 320px;
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
            `}</style>
        </RippleContext.Provider>
    );
};

export const useRipple = () => useContext(RippleContext);
