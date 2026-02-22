import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try { return localStorage.getItem('mdm-theme') || 'dark'; }
        catch { return 'dark'; }
    });

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        try { localStorage.setItem('mdm-theme', theme); } catch { }
    }, [theme]);

    const toggle = useCallback(() => {
        setTheme(t => (t === 'dark' ? 'light' : 'dark'));
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
    return ctx;
}
