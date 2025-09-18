import React, { useState, useEffect } from 'react';
import { ThemeProvider as MThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import dark from './Dark';
import light from './Light';

/**
 * Monitors the system preferred theme in case it changes and returns True if the system preferred theme is dark, False otherwise.
 * Source: https://medium.com/hypersphere-codes/detecting-system-theme-in-javascript-css-react-f6b961916d48
 * @returns True if system preferred theme is dark, False otherwise.
 */
const useThemeDetector = () => {
    const getCurrentTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDarkTheme, setIsDarkTheme] = useState(getCurrentTheme());
    const mqListener = (e => {
        setIsDarkTheme(e.matches);
    });

    useEffect(() => {
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
        darkThemeMq.addEventListener("change", mqListener);
        return () => darkThemeMq.removeEventListener("change", mqListener);
    }, []);

    return isDarkTheme;
}

/**
 * A theme provider that will change between dark and light themes based on the system preferred theme.
 * @param {*} props 
 * @returns A Theme provider that wraps around the given children.
 */
export default function ThemeProvider(props) {
    const isDarkTheme = useThemeDetector();

    return (
        <MThemeProvider theme={isDarkTheme ? dark : light}>
            <CssBaseline />
            {props.children}
        </MThemeProvider>
    )
};