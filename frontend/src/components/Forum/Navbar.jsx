import React from "react";
import SearchBar from "./SearchBar";
import NavHeader from "./NavHeader";

const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-dark border-b-2 border-gray-200 fixed top-0 left-0 right-0 z-10 dark:border-gray-700">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center h-16">
          <div className="flex-shrink-0 mr-4">
            <NavHeader part="logo" />
          </div>
          <div className="flex-1 flex justify-center">
            <SearchBar />
          </div>
          <div className="flex-shrink-0 ml-4">
            <NavHeader part="functions" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
