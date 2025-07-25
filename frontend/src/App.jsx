import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/forum/MainPage";
import AdminHome from "./pages/admin/AdminHome";
import CategoryPage from "./pages/forum/CategoryPage";
import History from "./pages/forum/History";
import CollectionPage from "./pages/forum/CollectionPage";
import { SignUpProvider } from "./context/SignUpContext";
import Login from "./pages/Login";
import { ThemeProvider as CustomThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
import { CreatePostProvider } from "./context/CreatePostContext";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ThemeProvider } from "@mui/material";
import useThemeMode from "./hooks/useThemeMode";
import { PostProvider } from "./context/PostContext";
import { SummaryProvider } from "./context/SummaryContext";
import Content from "./pages/forum/Content";
import ContentPost from "./pages/forum/ContentPost";
import AccountManagement from './pages/AccountManagement';
import SearchContent from "./pages/forum/SearchContent";
import Links from "./pages/Links";

const App = () => {
  const Theme = useThemeMode();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <SignUpProvider>
        <CustomThemeProvider>
          <SidebarProvider>
            <CreatePostProvider>
              <PostProvider>
                <SummaryProvider>
                  <ThemeProvider theme={Theme}>
                    <Router>
                      <Routes>
                        <Route path="/" element={<MainPage content={<Content sortOption="new" />} />} />
                        <Route path="/news" element={<MainPage content={<Content sortOption="new" />} />} />
                        <Route path="/hots" element={<MainPage content={<Content sortOption="top" />} />} />
                        <Route path="/c/:categoryId" element={<MainPage content={<Content sortOption="new" />} />} />
                        <Route path="/post/:postId" element={<MainPage content={<ContentPost />} />} />
                        <Route path="/search" element={<MainPage content={<SearchContent/>}/>}/>
                        <Route path="/history" element={<MainPage content={<History/>}/>}/>
                        <Route path="/collection" element={<MainPage content={<CollectionPage/>}/>}/>
                        <Route path="/category" element={<CategoryPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/admin/*" element={<AdminHome />} />
                        <Route path="/AccountManagement" element={<AccountManagement />} />
                        <Route path="/links" element={<Links />} />
                      </Routes>
                    </Router>
                  </ThemeProvider>
                </SummaryProvider>
              </PostProvider>
            </CreatePostProvider>
          </SidebarProvider>
        </CustomThemeProvider>
      </SignUpProvider>
    </LocalizationProvider>
  );
};

export default App;