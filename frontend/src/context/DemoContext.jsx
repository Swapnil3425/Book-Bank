// frontend/src/context/DemoContext.jsx
// Manages demo mode state — persisted in sessionStorage so page refreshes keep demo active.

import { createContext, useContext, useState, useCallback } from "react";
import { DEMO_STUDENT, DEMO_ADMIN } from "../data/demoData";

const DemoContext = createContext(null);

export const DemoProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(
    () => sessionStorage.getItem("demoMode") === "true"
  );
  const [demoRole, setDemoRole] = useState(
    () => sessionStorage.getItem("demoRole") || null
  );

  const enterDemo = useCallback((role) => {
    sessionStorage.setItem("demoMode", "true");
    sessionStorage.setItem("demoRole", role);
    setIsDemoMode(true);
    setDemoRole(role);
  }, []);

  const exitDemo = useCallback(() => {
    sessionStorage.removeItem("demoMode");
    sessionStorage.removeItem("demoRole");
    setIsDemoMode(false);
    setDemoRole(null);
  }, []);

  const demoUser = isDemoMode
    ? demoRole === "admin"
      ? DEMO_ADMIN
      : DEMO_STUDENT
    : null;

  return (
    <DemoContext.Provider value={{ isDemoMode, demoRole, demoUser, enterDemo, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoMode = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemoMode must be used within DemoProvider");
  return ctx;
};
