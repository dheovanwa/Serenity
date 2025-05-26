import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Verif from "./components/verifyEmail";
import ForgotPassword from "./Pages/forgotPassword";
import UserProfile from "./components/profileUser";
import Homepage from "./Pages/Homepage";
import LandingPage from "./Pages/LandingPage";
import SearchPskiater from "./Pages/SearchPskiater";
import PsychiatristProfile from "./Pages/PsychiatristProfile";
import Dashboardpsychiatrist from "./Pages/Dashboardpsychiatrist";
import SignUpComplete from "./Pages/CompleteSignUp";
import TermsOfService from "./Pages/TermsOfService";
import ManageApt from "./components/ManageAppointmentContent";
// import ManageAppointment from "./components/ManageAppointment";
import ManageAppointment from "./components/ManageAppointment";
import ManageAppointmentPsy from "./components/ManageAppointmentPsy";
import Layout from "./components/Layout";
import ChatPage from "./Pages/Chat";
import VideoCallPage from "./Pages/VideoCallPage";
// import { initializeQuotaReset } from "./utils/storePsychiatrists";


const App: React.FC = () => {
  // useEffect(() => {
  //   initializeQuotaReset();
  // }, []);

  return (
    <Router>
      <Routes>
        {/* Auth routes without navbar */}
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/complete-register" element={<SignUpComplete />} />
        <Route path="/verify-email" element={<Verif />} />
        
        <Route path="/forgot-password/*" element={<ForgotPassword />} />
        
        {/* Routes with navbar */}
        <Route
          path="/"
          element={
            <Layout>
              <Homepage />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <UserProfile />
            </Layout>
          }
        />
        <Route
          path="/Search-psi"
          element={
            <Layout>
              <SearchPskiater />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboardpsychiatrist />
            </Layout>
          }
        />
        <Route
          path="/psychiatrist-coolit-heytame"
          element={
            <Layout>
              <PsychiatristProfile />
            </Layout>
          }
        />
        <Route
          path="/schedule-appointment/:id?"
          element={
            <Layout>
              <ManageApt />
            </Layout>
          }
        />
        <Route
          path="/welcome"
          element={
            <Layout>
              <LandingPage />
            </Layout>
          }
        />
        <Route
          path="/terms"
          element={
            <Layout>
              <TermsOfService />
            </Layout>
          }
        />
        <Route
          path="/manage-appointment"
          element={
            <Layout>
              <ManageAppointment />
            </Layout>
          }
        />
        <Route
          path="/psy-manage-appointment"
          element={
            <Layout>
              <ManageAppointmentPsy />
            </Layout>
          }
        />
        <Route
          path="/chat"
          element={
            <Layout>
              <ChatPage />
            </Layout>
          }
        />
        <Route
          path="/video-call"
          element={
            <Layout>
              <VideoCallPage />
            </Layout>
          }
        />
        <Route
          path="/video-call/:callId"
          element={
            <Layout>
              <VideoCallPage />
            </Layout>
          }
        />
      </Routes>
      
    </Router>
  );
};

export default App;
