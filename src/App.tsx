import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Verif from "./components/verifemail";
import ForgotPassword from "./Pages/forgotPassword";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<Login />}></Route>
        <Route path="/signup" element={<Register />}></Route>
        <Route path="/verify-email" element={<Verif />}></Route>
        <Route path="/forgot-password/*" element={<ForgotPassword />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
