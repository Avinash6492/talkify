import React, { useEffect, useState } from 'react';
import "./ThemeToggle.css";

const ThemeToggle = () => {
    // Check local storage or system preference on initial load
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem("theme") === "dark" || 
               (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    });

    useEffect(() => {
        const html = document.documentElement;
        if (isDark) {
            html.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            html.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    return (
        <button className="theme-btn" onClick={() => setIsDark(!isDark)}>
            <span className="material-symbols-rounded">
                {isDark ? 'light_mode' : 'dark_mode'}
            </span>
        </button>
    );
};

export default ThemeToggle;