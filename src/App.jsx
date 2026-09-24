import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Videos from './pages/Videos';
import VideoDetail from './pages/VideoDetail';
import Team from './pages/Team';
import PlayerDetail from './pages/PlayerDetail';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import MyMessages from './pages/MyMessages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import Dashboard from './pages/admin/Dashboard';
import ManageNews from './pages/admin/ManageNews';
import CreateNews from './pages/admin/CreateNews';
import EditNews from './pages/admin/EditNews';
import ManageVideos from './pages/admin/ManageVideos';
import CreateVideo from './pages/admin/CreateVideo';
import EditVideo from './pages/admin/EditVideo';
import ManagePlayers from './pages/admin/ManagePlayers';
import CreatePlayer from './pages/admin/CreatePlayer';
import EditPlayer from './pages/admin/EditPlayer';
import ManageMatches from './pages/admin/ManageMatches';
import CreateMatch from './pages/admin/CreateMatch';
import EditMatch from './pages/admin/EditMatch';
import ManageStats from './pages/admin/ManageStats';
import ManageMessages from './pages/admin/ManageMessages';

import Election from './pages/Election';
import ManageElection from './pages/admin/ManageElection';
import UploadMembers from './pages/admin/UploadMembers';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/videos/:id" element={<VideoDetail />} />
              <Route path="/team" element={<Team />} />
              <Route path="/team/:id" element={<PlayerDetail />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/matches/:id" element={<MatchDetail />} />
              <Route path="/elections" element={<Election />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-messages"
                element={
                  <ProtectedRoute>
                    <MyMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              element={
                <ProtectedRoute adminOnly>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<Dashboard />} />

              <Route path="/admin/news" element={<ManageNews />} />
              <Route path="/admin/news/create" element={<CreateNews />} />
              <Route path="/admin/news/edit/:id" element={<EditNews />} />

              <Route path="/admin/videos" element={<ManageVideos />} />
              <Route path="/admin/videos/create" element={<CreateVideo />} />
              <Route path="/admin/videos/edit/:id" element={<EditVideo />} />

              <Route path="/admin/players" element={<ManagePlayers />} />
              <Route path="/admin/players/create" element={<CreatePlayer />} />
              <Route path="/admin/players/edit/:id" element={<EditPlayer />} />

              <Route path="/admin/matches" element={<ManageMatches />} />
              <Route path="/admin/matches/create" element={<CreateMatch />} />
              <Route path="/admin/matches/edit/:id" element={<EditMatch />} />

              <Route path="/admin/statistics" element={<ManageStats />} />

              <Route path="/admin/messages" element={<ManageMessages />} />

              <Route path="/admin/elections" element={<ManageElection />} />
              <Route path="/admin/elections/upload" element={<UploadMembers />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;