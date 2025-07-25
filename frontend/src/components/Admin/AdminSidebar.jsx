import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Button,
  ListItemButton,
} from "@mui/material";
import {
  Dashboard,
  ExpandLess,
  ExpandMore,
  PersonAdd,
  ManageAccounts,
  PostAdd,
  Message,
  Email,
  Feedback,
  CalendarToday,
  TaskAlt,
  Forum,
  AdminPanelSettings,
  Group,
  Block,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

const AdminSidebar = () => {
  const [openUserManagement, setOpenUserManagement] = useState(false);
  const [openPostManagement, setOpenPostManagement] = useState(false);
  const [openAdminManagement, setOpenAdminManagement] = useState(false);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const { isSidebarOpen } = useSidebar();

  const handleUserManagementClick = () => {
    setOpenUserManagement(!openUserManagement);
  };

  const handlePostManagementClick = () => {
    setOpenPostManagement(!openPostManagement);
  };

  const handleAdminManagementClick = () => {
    setOpenAdminManagement(!openAdminManagement);
  };

  const handleFeedbackClick = () => {
    setOpenFeedback(!openFeedback);
  };

  const handleCalendarClick = () => {
    setOpenCalendar(!openCalendar);
  };

  const isActiveRoute = (route) => {
    return location.pathname === route;
  };

  return (
    <aside
      className={`top-16 inset-y-0 left-0 bg-white w-64 lg:w-72 p-4 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-4rem)] overflow-y-auto transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen
          ? "translate-x-0 dark:bg-dark absolute"
          : "-translate-x-full lg:translate-x-0 dark:bg-dark fixed"
      } z-40`}
    >
      <List className="flex-grow">
        <ListItem
          button
          component={Link}
          to="/admin/dashboard"
          className={`${
            isActiveRoute("/admin") ? "bg-gray-300 dark:bg-gray-700" : ""
          } hover:bg-gray-200 dark:hover:bg-gray-800 rounded`}
        >
          <ListItemIcon className="text-black dark:text-white">
            <Dashboard />
          </ListItemIcon>
          <ListItemText
            className="text-black dark:text-white"
            primary="Dashboard"
          />
        </ListItem>

        <ListItemButton
          onClick={() => handleUserManagementClick()}
          className="hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ListItemIcon className="text-black dark:text-white">
            <Group  />
          </ListItemIcon>
          <ListItemText
            primary="User Management"
            className="text-black dark:text-white"
          />
          {openUserManagement ? (
            <ExpandLess className="text-black dark:text-white" />
          ) : (
            <ExpandMore className="text-black dark:text-white" />
          )}
        </ListItemButton>
        <Collapse in={openUserManagement} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              to="/admin/users/manage"
              sx={{ pl: 4 }}
              className={`${
                isActiveRoute("/admin/users/manage")
                  ? "bg-gray-300 dark:bg-gray-700"
                  : ""
              } hover:bg-gray-200 dark:hover:bg-gray-800 rounded`}
            >
              <ListItemIcon className="text-black dark:text-white">
                <ManageAccounts />
              </ListItemIcon>
              <ListItemText
                primary="Manage Users"
                className="text-black dark:text-white"
              />
            </ListItem>
            
            <ListItem
              button
              component={Link}
              to="/admin/users/create"
              sx={{ pl: 4 }}
              className={`${
                isActiveRoute("/admin/users/create")
                  ? "bg-gray-300 dark:bg-gray-700"
                  : ""
              } hover:bg-gray-200 dark:hover:bg-gray-800 rounded`}
            >
              <ListItemIcon className="text-black dark:text-white">
                <PersonAdd />
              </ListItemIcon>
              <ListItemText
                primary="Create User"
                className="text-black dark:text-white"
              />
            </ListItem>
            
            <ListItem
              button
              component={Link}
              to="/admin/users/all-punishments"
              sx={{ pl: 4 }}
              className={`${
                isActiveRoute("/admin/users/all-punishments")
                  ? "bg-gray-300 dark:bg-gray-700"
                  : ""
              } hover:bg-gray-200 dark:hover:bg-gray-800 rounded`}
            >
              <ListItemIcon className="text-black dark:text-white">
                <Block />
              </ListItemIcon>
              <ListItemText
                primary="Punishment Records"
                className="text-black dark:text-white"
              />
            </ListItem>
          </List>
        </Collapse>

        <ListItem button onClick={handlePostManagementClick}>
          <ListItemIcon className="text-black dark:text-white">
            <PostAdd />
          </ListItemIcon>
          <ListItemText
            className="text-black dark:text-white"
            primary="Post Management"
          />
          {openPostManagement ? (
            <ExpandLess className="text-black dark:text-white" />
          ) : (
            <ExpandMore className="text-black dark:text-white" />
          )}
        </ListItem>
        <Collapse in={openPostManagement} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              to="/admin/posts/manage"
              sx={{ pl: 4 }}
              className={`${
                isActiveRoute("/admin/posts/manage")
                  ? "bg-gray-300 dark:bg-gray-700"
                  : ""
              } hover:bg-gray-200 dark:hover:bg-gray-800 rounded`}
            >
              <ListItemIcon className="text-black dark:text-white">
                <ManageAccounts />
              </ListItemIcon>
              <ListItemText
                className="text-black dark:text-white"
                primary="Manage Post"
              />
            </ListItem>
          </List>
        </Collapse>
        <ListItem button onClick={handleAdminManagementClick}>
          <ListItemIcon className="text-black dark:text-white">
            <AdminPanelSettings />
          </ListItemIcon>
          <ListItemText
            className="text-black dark:text-white"
            primary="Admin Management"
          />
          {openAdminManagement ? (
            <ExpandLess className="text-black dark:text-white" />
          ) : (
            <ExpandMore className="text-black dark:text-white" />
          )}
        </ListItem>
        <Collapse in={openAdminManagement} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              to="/admin/management/content"
              sx={{ pl: 4 }}
              className={`${
                isActiveRoute("/admin/management/content")
                  ? "bg-gray-300 dark:bg-gray-700"
                  : ""
              } hover:bg-gray-200 dark:hover:bg-gray-800 rounded`}
            >
              <ListItemIcon className="text-black dark:text-white">
                <Message />
              </ListItemIcon>
              <ListItemText
                className="text-black dark:text-white"
                primary="Content Post Message (Pin)"
              />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/admin/management/nonfiction"
              sx={{ pl: 4 }}
              className={`${
                isActiveRoute("/admin/management/nonfiction")
                  ? "bg-gray-300 dark:bg-gray-700"
                  : ""
              } hover:bg-gray-200 dark:hover:bg-gray-800 rounded`}
            >
              <ListItemIcon className="text-black dark:text-white">
                <Message />
              </ListItemIcon>
              <ListItemText
                className="text-black dark:text-white"
                primary="Nonfiction Send Management"
              />
            </ListItem>
          </List>
        </Collapse>

        <ListItem button onClick={handleFeedbackClick}>
          <ListItemIcon className="text-black dark:text-white">
            <Feedback />
          </ListItemIcon>
          <ListItemText
            className="text-black dark:text-white"
            primary="Feedback Management"
          />
          {openFeedback ? (
            <ExpandLess className="text-black dark:text-white" />
          ) : (
            <ExpandMore className="text-black dark:text-white" />
          )}
        </ListItem>
        <Collapse in={openFeedback} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              to="/admin/feedback/view"
              sx={{ pl: 4 }}
              className={`${
                isActiveRoute("/admin/feedback/view")
                  ? "bg-gray-300 dark:bg-gray-700"
                  : ""
              } hover:bg-gray-200 dark:hover:bg-gray-800 rounded`}
            >
              <ListItemIcon className="text-black dark:text-white">
                <Feedback />
              </ListItemIcon>
              <ListItemText
                className="text-black dark:text-white"
                primary="View Feedback"
              />
            </ListItem>
          </List>
        </Collapse>

        <ListItem button onClick={handleCalendarClick}>
          <ListItemIcon className="text-black dark:text-white">
            <CalendarToday />
          </ListItemIcon>
          <ListItemText
            className="text-black dark:text-white"
            primary="Calendar Management"
          />
          {openCalendar ? (
            <ExpandLess className="text-black dark:text-white" />
          ) : (
            <ExpandMore className="text-black dark:text-white" />
          )}
        </ListItem>
        <Collapse in={openCalendar} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              to="/admin/calendar/view"
              sx={{ pl: 4 }}
              className={`${
                isActiveRoute("/admin/calendar/view")
                  ? "bg-gray-300 dark:bg-gray-700"
                  : ""
              } hover:bg-gray-200 dark:hover:bg-gray-800 rounded`}
            >
              <ListItemIcon className="text-black dark:text-white">
                <CalendarToday />
              </ListItemIcon>
              <ListItemText
                className="text-black dark:text-white"
                primary="Calendar "
              />
            </ListItem>
          </List>
        </Collapse>
      </List>
      <div className="mt-auto">
        <Button
          component={Link}
          to="/"
          variant="contained"
          className="bg-blue-600 hover:bg-blue-700 text-white focutext-black dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:bg-blue-700"
          sx={{ width: "100%" }}
        >
          <ListItemIcon className="text-white dark:text-white">
            <Forum />
          </ListItemIcon>
          <ListItemText
            className="text-black dark:text-white"
            primary="Return to Forum"
          />
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
