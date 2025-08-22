import { Routes, Route } from "react-router-dom";
import Register from "./presentation/pages/Register";
import Login from "./presentation/pages/Login";
import ForgotPassword from "./presentation/pages/ForgotPassword";
import Dashboard from "./presentation/pages/Dashboard";
import Credit from "./presentation/pages/Credit";
import Profile from "./presentation/pages/Profile";
import Layout from "./presentation/components/Layout";
import "./presentation/assets/persian-rtl.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/credit"
        element={
          <Layout>
            <Credit />
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout>
            <Profile />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
