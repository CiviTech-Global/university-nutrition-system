import { Routes, Route } from "react-router-dom";
import Register from "./presentation/pages/Register";
import Login from "./presentation/pages/Login";
import ForgotPassword from "./presentation/pages/ForgotPassword";
import Dashboard from "./presentation/pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
