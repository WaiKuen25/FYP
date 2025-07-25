import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBell,
  faPlus,
  faBars,
  faRightToBracket,
  faGear,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../resources/logo.png";
import { useNavigate } from "react-router-dom";
import Switch from "@mui/material/Switch";
import { Avatar, Badge } from "@mui/material";
import useCheckUser from "../../hooks/useCheckUser";
import { useTheme } from "../../context/ThemeContext";
import { useSidebar } from "../../context/SidebarContext";
import { useCreatePost } from "../../context/CreatePostContext";
import useScreenSize from "../../hooks/useScreenSize";
import { useSignUp } from "../../context/SignUpContext";
import { stringAvatar } from "../../service/avatar";
import axios from "axios";

const NavHeader = ({ part = "all" }) => {
  const [nickName, setNickName] = useState("Guest");
  const [openLoginCard, setOpenLoginCard] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { themeMode, switchTheme } = useTheme();
  const { setIsSignUp } = useSignUp();
  const { toggleSidebar } = useSidebar();
  const { toggleCreatePost } = useCreatePost();
  const { setManualOpen } = useScreenSize();
  const user = useCheckUser();
  const navigate = useNavigate();

  useEffect(() => {
    const storedNickName = localStorage.getItem("nickName");
    if (storedNickName) {
      setNickName(storedNickName);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/data/notifications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleNotificationClick = async (notificationId, link) => {
    try {
      // Mark notification as read
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/data/notifications/mark-read`,
        { notificationIds: [notificationId] },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Navigate to the link if it exists
      if (link) {
        navigate(link);
      }
      
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleToggleSidebar = () => {
    setManualOpen((prev) => !prev);
    toggleSidebar();
  };

  const handleClickUserIcon = () => {
    setOpenLoginCard(!openLoginCard);
  };

  const handleClickNotificationIcon = () => {
    setOpenNotifications(!openNotifications);
  };

  const Signout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nickName");
    window.location.href = "/";
  };

  const LoginCardItem = ({ icon, title, linkTo, onClick }) => (
    <div
      onClick={onClick}
      className="flex items-center py-2 text-gray-700 hover:bg-gray-100 rounded-md transition duration-150 ease-in-out cursor-pointer dark:hover:bg-gray-700"
    >
      <div className="icon-container flex items-center justify-center w-8 h-8 rounded-full">
        <FontAwesomeIcon icon={icon} className="text-lg dark:text-white" />
      </div>
      <div className="text-container ml-3">
        <span className="font-medium dark:text-white">{title}</span>
      </div>
    </div>
  );

  const NotLoginCard = () => (
    <div
      className="absolute top-full right-0 w-64 p-4 bg-white border border-gray-300 rounded-lg shadow-lg z-50 dark:bg-dark dark:border-gray-700"
      onMouseEnter={() => setOpenLoginCard(true)}
      onMouseLeave={() => setOpenLoginCard(false)}
    >
      <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
        <h3 className="pl-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Please login first
        </h3>
      </div>
      <div className="mt-4 space-y-2">
        <LoginCardItem
          icon={faRightToBracket}
          title="Sign In"
          onClick={() => {
            setIsSignUp(false);
            navigate("/login");
          }}
        />
        <LoginCardItem
          icon={faRightToBracket}
          title="Sign Up"
          onClick={() => {
            setIsSignUp(true);
            navigate("/login");
          }}
        />
      </div>
    </div>
  );

  const LoginCard = () => (
    <div
      className="absolute top-full right-0 w-64 p-5 bg-white border border-gray-300 rounded-xl shadow-xl z-50 dark:bg-dark dark:border-gray-700"
      onMouseEnter={() => setOpenLoginCard(true)}
      onMouseLeave={() => setOpenLoginCard(false)}
    >
      <div className="flex items-center pl-2 pb-3 border-b border-gray-200 dark:border-gray-600">
        <FontAwesomeIcon
          icon={faUser}
          size="lg"
          alt="user"
          className="text-gray-600 dark:text-gray-300"
        />
        <span className="ml-3 text-lg font-semibold text-gray-700 dark:text-gray-300 truncate">
          {nickName}
        </span>
      </div>
      <div className="pt-2" />
      <LoginCardItem
        icon={faUser}
        title="My Profile"
        linkTo="/AccountManagement"
        className="mt-3"
        onClick={() => {
          navigate("/AccountManagement");
        }}
      />
      <div className="pt-2" />

      <LoginCardItem
        icon={faRightToBracket}
        title="Sign Out"
        linkTo="/"
        onClick={Signout}
        className="mt-3"
      />

      <div className="flex items-center justify-between py-3 mt-3 border-t border-gray-200 dark:border-gray-600">
        <span className="font-medium text-black dark:text-gray-300">
          Dark Mode
        </span>
        <Switch
          checked={themeMode === "dark"}
          onChange={() => switchTheme(themeMode === "dark" ? "light" : "dark")}
          color="primary"
          className="ml-2"
        />
      </div>

      <div className="border-t border-gray-200 pt-2 dark:border-gray-600" />

      <LoginCardItem
        icon={faGear}
        title="Setting"
        linkTo="/AccountManagement"
        onClick={() => {
          navigate("/AccountManagement");
        }}
        className="mt-3"
      />
    </div>
  );

  const NotificationCard = () => (
    <div
      className="absolute top-full right-0 w-80 bg-white border border-gray-300 rounded-lg shadow-lg mt-2 z-40 max-h-[400px] overflow-y-auto dark:bg-dark dark:border-gray-700"
      onMouseEnter={() => setOpenNotifications(true)}
      onMouseLeave={() => setOpenNotifications(false)}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Notifications
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-600">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.notificationId}
              onClick={() => handleNotificationClick(notification.notificationId, notification.link)}
              className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                !notification.isRead ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
            >
              <div className="flex items-center">
                {!notification.isRead && (
                  <FontAwesomeIcon
                    icon={faCircle}
                    className="text-blue-500 text-xs mr-2"
                  />
                )}
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {notification.content}
                  </p>
                  {notification.postTitle && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Related Post: {notification.postTitle}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No notifications
          </div>
        )}
      </div>
    </div>
  );

  const LogoSection = () => (
    <div className="flex items-center">
      <div
        className="icon-button block lg:hidden"
        onClick={handleToggleSidebar}
      >
        <FontAwesomeIcon icon={faBars} size="lg" alt="bars" />
      </div>
      <div className="md:pl-5 lg:p-0">
        <img className="w-14 h-10" src={logo} alt="Logo" />
      </div>
      <span className="ml-2 text-xl font-bold hidden lg:block dark:text-white">
        VTC Forum
      </span>
    </div>
  );

  const FunctionsSection = () => (
    <div className="flex items-center space-x-6 sm:space-x-7 md:space-x-8 lg:space-x-9">
      {user && (
        <>
          <div onClick={toggleCreatePost} className="flex items-center hover:bg-slate-100 rounded-lg m-2">
            <FontAwesomeIcon icon={faPlus} size="2xl" alt="add" className="dark:text-white"/>
            <div className="pl-2 font-extrabold text-lg dark:text-white">POST</div>
          </div>
          <div className="icon-button relative">
            <div onClick={handleClickNotificationIcon}>
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <FontAwesomeIcon icon={faBell} size="xl" alt="bell" />
              </Badge>
            </div>
            {openNotifications && <NotificationCard />}
          </div>
        </>
      )}
      <div className="icon-button relative" onClick={handleClickUserIcon}>
        {user ? (
          <Avatar
            {...stringAvatar(nickName)}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <FontAwesomeIcon icon={faUser} size="lg" alt="login" />
        )}

        {openLoginCard && user && <LoginCard />}
        {openLoginCard && !user && <NotLoginCard />}
      </div>
    </div>
  );

  // 根據傳入的參數決定顯示哪一部分
  if (part === "logo") {
    return <LogoSection />;
  } else if (part === "functions") {
    return <FunctionsSection />;
  }

  // 預設顯示全部
  return (
    <>
      <LogoSection />
      <FunctionsSection />
    </>
  );
};

export default NavHeader; 