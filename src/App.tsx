import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Verif from "./components/verifyEmail";
import ForgotPassword from "./Pages/forgotPassword";
import UserProfile from "./components/profileUser";
import Homepage from "./Pages/HomepageRevised";
import LandingPage from "./Pages/LandingPage";
import SearchPskiater from "./Pages/SearchPskiater";
import PsychiatristProfile from "./Pages/PsychiatristProfile";
import Dashboardpsychiatrist from "./Pages/Dashboardpsychiatrist";
import NavBar from "./components/Navbar";
import SignUpComplete from "./Pages/CompleteSignUp";
import TermsOfService from "./Pages/TermsOfService";
import ManageApt from "./components/ManageAppointmentContent";
import ManageAppointment from "./components/ManageAppointment";
import ManageAppointmentPsy from "./components/ManageAppointmentPsy";
import Layout from "./components/Layout";
import ChatPage from "./Pages/Chat";
import VideoCallPage from "./Pages/VideoCallPage";
import Forum from "./Pages/Forum";
import ForumPost from "./Pages/ForumPost";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./Pages/Landing";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Auth routes without protection */}
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/verify-email" element={<Verif />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/forgot-password/*" element={<ForgotPassword />} />
        <Route path="/" element={<Landing />} />
        {/* Routes with navbar */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Layout>
                <Homepage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/complete-register"
          element={
            // <ProtectedRoute>
            <SignUpComplete />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <UserProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Search-psi"
          element={
            <ProtectedRoute>
              <Layout>
                <SearchPskiater />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboardpsychiatrist />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-profile"
          element={
            <ProtectedRoute>
              <Layout>
                <PsychiatristProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule-appointment/:id?"
          element={
            <ProtectedRoute>
              <Layout>
                <ManageApt />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <Layout>
                <LandingPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/terms" element={<TermsOfService />} />
        <Route
          path="/manage-appointment"
          element={
            <ProtectedRoute>
              <Layout>
                <ManageAppointment />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/psy-manage-appointment"
          element={
            <ProtectedRoute>
              <Layout>
                <ManageAppointmentPsy />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout>
                <ChatPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-call"
          element={
            <ProtectedRoute>
              <Layout>
                <VideoCallPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-call/:callId"
          element={
            <ProtectedRoute>
              <Layout>
                <VideoCallPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/forum"
          element={
            <ProtectedRoute>
              <Layout>
                <Forum />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/forum/:forumId"
          element={
            <ProtectedRoute>
              <Layout>
                <ForumPost />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
