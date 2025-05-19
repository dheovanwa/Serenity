import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Verif from "./components/verifyEmail";
import ForgotPassword from "./Pages/forgotPassword";
import UserSurvey from "./Pages/SurveyPage";
import UserProfile from "./components/profileUser";
import Homepage from "./Pages/Homepage";
import LandingPage from "./Pages/LandingPage";
import SearchPskiater from "./Pages/SearchPskiater";
import PsychiatristProfile from "./Pages/PsychiatristProfile";
import Dashboardpsychiatrist from "./Pages/Dashboardpsychiatrist";
import ManageApt from "./components/ManageAppointmentContent";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<Login />}></Route>
        <Route path="/signup" element={<Register />}></Route>
        <Route path="/verify-email" element={<Verif />}></Route>
        <Route path="/forgot-password/*" element={<ForgotPassword />}></Route>
        <Route path="/user-survey" element={<UserSurvey />}></Route>
        <Route path="/profile" element={<UserProfile />}></Route>
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/Search-psi" element={<SearchPskiater />}></Route>
        <Route path="/psychiatrist" element={<Dashboardpsychiatrist />}></Route>
        <Route
          path="/psychiatrist-coolit-heytame"
          element={<PsychiatristProfile />}
        ></Route>
        <Route
          path="/schedule-appointment/:id?"
          element={<ManageApt />}
        ></Route>
        <Route path="/welcome" element={<LandingPage />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
