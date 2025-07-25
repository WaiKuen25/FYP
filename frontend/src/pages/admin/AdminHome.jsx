import { useEffect } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import AdminNavbar from "../../Components/Admin/AdminNavbar";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import useCheckAdmin from "../../hooks/useCheckAdmin";
import Dashboard from "./Dashboard";
import NonfictionPost from "./manage/NonfictionPost";
import Nonfiction from "./manage/Nonfiction";
import CreateUser from "./user/CreateUser";
import { Box, CssBaseline } from "@mui/material";
import { useSidebar } from "../../context/SidebarContext";
import ManageUser from "./user/ManageUser";
import ManagePost from "./post/ManagePost";
import ReportGenerator from "./post/ReportGenerator";
import UserReport from "./user/UserReport";
import PunishUser from "./user/PunishUser";
import AllPunishments from "./user/AllPunishments";
import Feedback from "./feedback/feedback";
import Calender from "./calender/calender";

const AdminHome = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useCheckAdmin();
  const { isSidebarOpen } = useSidebar();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <CssBaseline />
      <div className="flex flex-col h-screen">
        <AdminNavbar />
        <div className="flex flex-grow overflow-hidden text-black dark:bg-black dark:text-white">
          {isSidebarOpen && <AdminSidebar />}
          <Box
            component="main"
            sx={{
              marginTop: "4rem", 
              flexGrow: 1,
              marginLeft: isSidebarOpen ? { xs: "18rem", lg: "20rem" } : 0,
              transition: "margin-left 0.3s ease",
            }}
            className="text-black bg-slate-50 dark:bg-black dark:text-white overflow-y-auto"
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Navigate to="/admin" />} />
              <Route path="/management/content" element={<NonfictionPost />} />
              <Route path="/management/nonfiction" element={<Nonfiction />} />
              <Route path="/users/manage" element={<ManageUser />} />
              <Route path="/users/create" element={<CreateUser />} />
              <Route path="/users/generate/:userId" element={<UserReport/>}/>
              <Route path="/users/punish/:userId" element={<PunishUser/>}/>
              <Route path="/users/all-punishments" element={<AllPunishments/>}/>
              <Route path="/posts/manage" element={<ManagePost />}/>
              <Route path="/posts/report-generator" element={<ReportGenerator />}/>
              <Route path="/feedback/view" element={<Feedback />}/>
              <Route path="/calendar/view" element={<Calender />}/>
            </Routes>
          </Box>
        </div>
      </div>
    </>
  );
};

export default AdminHome;