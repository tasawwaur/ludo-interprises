import React, { createContext, useContext, useState, useEffect } from "react";
import { lightTheme, darkTheme, amoledTheme } from "../theme/themes";

export type ThemeMode = "light" | "dark" | "amoled";

interface ThemeContextType {
  mode: ThemeMode;
  theme: typeof darkTheme;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: "amoled",
  theme: amoledTheme,
  setThemeMode: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>("amoled");

  const getThemeObject = (m: ThemeMode) => {
    if (m === "light") return lightTheme;
    if (m === "dark") return darkTheme;
    return amoledTheme;
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem("ludo_theme_mode", newMode);
  };

  useEffect(() => {
    const saved = localStorage.getItem("ludo_theme_mode") as ThemeMode;
    if (saved) setMode(saved);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, theme: getThemeObject(mode), setThemeMode }}>
      <div className={`theme-${mode} min-h-screen text-white bg-slate-950 transition-colors duration-300`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
