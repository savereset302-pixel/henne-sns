"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
    font: string;
    setFont: (font: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [theme, setThemeState] = useState("dark");
    const [font, setFontState] = useState("default");

    useEffect(() => {
        if (user?.theme) {
            setThemeState(user.theme);
        }
        if (user?.font) {
            setFontState(user.font);
        }
    }, [user]);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.setAttribute("data-font", font);
    }, [font]);

    const setTheme = (newTheme: string) => {
        setThemeState(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const setFont = (newFont: string) => {
        setFontState(newFont);
        document.documentElement.setAttribute("data-font", newFont);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, font, setFont }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
};
