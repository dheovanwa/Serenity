import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Verif from "./components/verifyEmail";
import ForgotPassword from "./Pages/forgotPassword";
import UserSurvey from "./Pages/SurveyPage";
import Homepage from "./Pages/Homepage";
import UserProfile from "./components/profileUser";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<Login />}></Route>
        <Route path="/signup" element={<Register />}></Route>
        <Route path="/verify-email" element={<Verif />}></Route>
        <Route path="/forgot-password/*" element={<ForgotPassword />}></Route>
        <Route path="/user-survey" element={<UserSurvey />}></Route>
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/profile" element={<UserProfile />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
