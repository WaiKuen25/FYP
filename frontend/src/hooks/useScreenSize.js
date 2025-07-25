import { useEffect, useState } from "react";
import { useSidebar } from "../context/SidebarContext";

const useScreenSize = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [manualOpen, setManualOpen] = useState(false);

  const setSidebarOpen = (isOpen) => {
    if (isSidebarOpen !== isOpen) {
      toggleSidebar();
    }
  };

  const checkScreenSize = () => {
    if (window.innerWidth < 1024 && !manualOpen) {
      setSidebarOpen(false);
    } else if (window.innerWidth >= 1024 && !isSidebarOpen) {
      setSidebarOpen(true);
    }
  };

  useEffect(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [manualOpen, isSidebarOpen]);

  return { setManualOpen };
};

export default useScreenSize;
