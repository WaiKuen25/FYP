import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const storedUserConfig = JSON.parse(localStorage.getItem("userConfig"));
    return storedUserConfig?.theme === "dark" ? "dark" : "light";
  });

  const switchTheme = (theme) => {
    setThemeMode(theme);
    const storedUserConfig = JSON.parse(localStorage.getItem("userConfig")) || {};
    storedUserConfig.theme = theme === "dark" ? "dark" : "light";
    localStorage.setItem("userConfig", JSON.stringify(storedUserConfig));
    document.documentElement.className = theme;
  };

  useEffect(() => {
    document.documentElement.className = themeMode;
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
