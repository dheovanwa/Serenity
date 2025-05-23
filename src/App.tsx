import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
<<<<<<< HEAD
import NavBar from "./components/Navbar";
=======
import SignUpComplete from "./Pages/CompleteSignUp";
import TermsOfService from "./Pages/TermsOfService";
// import ManageApt from "./components/ManageAppointmentContent";
>>>>>>> 0484298a1d4da71d2103fb183027f300a2e23fee

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<Login />}></Route>
        <Route path="/signup" element={<Register />}></Route>
        <Route path="/complete-register" element={<SignUpComplete />}></Route>
        <Route path="/verify-email" element={<Verif />}></Route>
        <Route path="/forgot-password/*" element={<ForgotPassword />}></Route>
        <Route path="/profile" element={<UserProfile />}></Route>
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/Search-psi" element={<SearchPskiater />}></Route>
        <Route path="/psychiatrist" element={<Dashboardpsychiatrist />}></Route>
        <Route
          path="/psychiatrist-coolit-heytame"
          element={<PsychiatristProfile />}
        ></Route>
<<<<<<< HEAD
        <Route path="/welcome" element={<LandingPage />}></Route>
        <Route path="/dp" element={<Dashboardpsychiatrist />}></Route>
        <Route path="/test" element={<NavBar />}></Route>
=======
        {/* <Route
          path="/schedule-appointment/:id?"
          element={<ManageApt />}
        ></Route> */}
        <Route path="/welcome" element={<LandingPage />}></Route>
        <Route path="/terms" element={<TermsOfService />}></Route>
>>>>>>> 0484298a1d4da71d2103fb183027f300a2e23fee
      </Routes>
    </Router>
  );
};

export default App;
