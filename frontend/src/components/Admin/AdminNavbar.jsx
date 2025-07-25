import React, { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import logo from "../../resources/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBell,
  faBars,
  faRightToBracket,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import Switch from "@mui/material/Switch";
import { Avatar, Badge, TextField } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";
import { useSidebar } from "../../context/SidebarContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useScreenSize from "../../hooks/useScreenSize";
import { stringAvatar } from "../../service/avatar";
import axios from "axios";

const AdminNavbar = () => {
  const [openLoginCard, setOpenLoginCard] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nickName, setNickName] = useState();
  const { themeMode, switchTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
  const { setManualOpen } = useScreenSize();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedNickName = localStorage.getItem("nickName");
    if (storedNickName) {
      setNickName(storedNickName);
    }
    fetchNotifications();
  }, []);

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

  const handleClickNotificationIcon = () => {
    setOpenNotifications(!openNotifications);
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
        linkTo="/profile"
        className="mt-3"
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
        linkTo="/setting"
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

  const Signout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nickName");
    window.location.href = "/";
  };

  const handleClickUserIcon = () => {
    setOpenLoginCard(!openLoginCard);
  };

  const GenerateBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    return (
      <Breadcrumbs separator=">" aria-label="breadcrumb">
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          return isLast ? (
            <Typography key={to} color="textPrimary">
              {value}
            </Typography>
          ) : (
            <MuiLink color="inherit" component={Link} to={to} key={to}>
              {value}
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    );
  };

  return (
    <nav className="bg-white dark:bg-dark border-b-2 border-gray-200 fixed top-0 left-0 right-0 z-10 dark:border-gray-700 h-16">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
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
              Edu Connect Admin <GenerateBreadcrumbs />
            </span>
          </div>
          <div className="flex-1 flex justify-center mx-4 h-10"></div>
          <div className="flex items-center space-x-6 sm:space-x-6 md:space-x-7 lg:space-x-8">
            <>
              <TextField
                id="outlined-basic"
                label="Search"
                variant="outlined"
                size="small"
                color="primary"
              />
              <div className="icon-button relative">
                <div onClick={handleClickNotificationIcon}>
                  <Badge badgeContent={unreadCount} color="error" max={99}>
                    <FontAwesomeIcon icon={faBell} size="xl" alt="bell" />
                  </Badge>
                </div>
                {openNotifications && <NotificationCard />}
              </div>
            </>
            <div className="icon-button relative" onClick={handleClickUserIcon}>
              <Avatar
                {...stringAvatar(nickName)}
                style={{ cursor: "pointer" }}
              />
              {openLoginCard && <LoginCard />}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
