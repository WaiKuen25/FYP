import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faClock,
  faFire,
  faCode,
  faGear,
  faChevronDown,
  faChevronUp,
  faLink,
  faCircleInfo,
  faCirclePlus,
  faClockRotateLeft,
  faStar
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSidebar } from "../../context/SidebarContext";
import useToggleState from "../../hooks/useToggleState";
import useCheckUser from "../../hooks/useCheckUser";

const AsideItem = ({ icon, title, onClick }) => {
  return (
    <div
      className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700"
      onClick={onClick}
    >
      <div className="icon-container flex items-center justify-center w-8 h-8 rounded-full">
        <FontAwesomeIcon icon={icon} className="text-xl dark:text-white" />
      </div>
      <div className="text-container ml-3 dark:text-white">
        <span>{title}</span>
      </div>
    </div>
  );
};

const CATEGORY_ITEMS = [
  { icon: faHome, title: "Home", path: "/" },
  { icon: faClock, title: "Latest", path: "/news" },
  { icon: faFire, title: "Popular", path: "/hots" },
];

const USER_ITEMS = [
  { icon: faClockRotateLeft, title: "History", path: "/history"},
  { icon: faStar, title: "Collection", path: "/collection"}
];

const Sidebar = () => {
  const [OpenCommunities, toggleCommunities] = useToggleState(true);
  const [OpenInformation, toggleInformation] = useToggleState(true);
  const [OpenUserInformation, toggleUserInformation] = useToggleState(true);
  const [followedCategories, setFollowedCategories] = useState([]);
  const { isSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const user = useCheckUser();

  useEffect(() => {
    const fetchFollowedCategories = async () => {
      const storedUserConfig = JSON.parse(localStorage.getItem("userConfig"));
      if (storedUserConfig?.followCategory) {
        const categoryIds = storedUserConfig.followCategory;
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/data/category`
          );
          const categoriesData = response.data.filter((category) =>
            categoryIds.includes(category.categoryId)
          );
          setFollowedCategories(categoriesData);
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      }
    };

    fetchFollowedCategories();
  }, []);

  const handleItemClick = (title) => {
    console.log(`Clicked on ${title}`);
  };

  return (
    <aside
      className={`fixed top-16 lg:relative inset-y-0 left-0 bg-white w-64 lg:w-72 p-4 border-t-2 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-4rem)] overflow-y-auto transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen
          ? "translate-x-0 dark:bg-dark"
          : "-translate-x-full lg:translate-x-0 dark:bg-dark"
      } z-40`}
    >
      <div className="pt-0">
        <nav className="space-y-2">
          {CATEGORY_ITEMS.map(({ icon, title, path, onClick }) => (
            <AsideItem key={title} icon={icon} title={title} onClick={onClick || (() => navigate(path))} />
          ))}
          {user && (
            <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

              <div className="flex items-center px-4 py-2 text-gray-700 cursor-pointer" onClick={toggleCommunities}>
                <span className="dark:text-white">Category</span>
                <FontAwesomeIcon icon={OpenCommunities ? faChevronUp : faChevronDown} className="ml-auto dark:text-white" />
              </div>
              {OpenCommunities && (
                <div className="space-y-2">
                  {followedCategories.map((category) => (
                    <AsideItem key={category.categoryId} icon={faCode} title={`r/${category.categoryName}`} onClick={() => navigate(`/c/${category.categoryId}`)} />
                  ))}
                  <AsideItem icon={faCirclePlus} title="Add Category" onClick={() => navigate("/category")} />
                </div>
              )}

                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                <div className="flex items-center px-4 py-2 text-gray-700 cursor-pointer" onClick={toggleUserInformation}>
                  <span className="dark:text-white">User Information</span>
                  <FontAwesomeIcon icon={OpenCommunities ? faChevronUp : faChevronDown} className="ml-auto dark:text-white" />
                </div>
                {OpenUserInformation && (
                  <div className="space-y-2">
                    {USER_ITEMS.map(({ icon, title, path, onClick }) => (
                      <AsideItem key={title} icon={icon} title={title} onClick={onClick || (() => navigate(path))} />
                    ))}
                  </div>
                )}
            </>
          )}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
          <div className="flex items-center px-4 py-2 text-gray-700 cursor-pointer" onClick={toggleInformation}>
            <span className="dark:text-white">Information</span>
            <FontAwesomeIcon icon={OpenInformation ? faChevronUp : faChevronDown} className="ml-auto dark:text-white" />
          </div>
          {OpenInformation && (
            <div className="space-y-2">
              <AsideItem icon={faLink} title="VTC Link" onClick={() => navigate("/links")} />
              <AsideItem icon={faGear} title="Setting" onClick={() => navigate("/AccountManagement")} />
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
