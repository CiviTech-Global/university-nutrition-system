import { Routes, Route } from "react-router-dom";
import Register from "./presentation/pages/Register";
import Login from "./presentation/pages/Login";
import ForgotPassword from "./presentation/pages/ForgotPassword";
import Dashboard from "./presentation/pages/Dashboard";
import Credit from "./presentation/pages/Credit";
import Profile from "./presentation/pages/Profile";
import Foods from "./presentation/pages/Foods";
import SaleDay from "./presentation/pages/SaleDay";
import TestLanguage from "./presentation/pages/TestLanguage";
import Layout from "./presentation/components/Layout";
import AuthLayout from "./presentation/components/AuthLayout";
import "./presentation/assets/persian-rtl.css";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthLayout>
            <Register />
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <Register />
          </AuthLayout>
        }
      />
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
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
      <Route
        path="/foods"
        element={
          <Layout>
            <Foods />
          </Layout>
        }
      />
      <Route
        path="/sale-day"
        element={
          <Layout>
            <SaleDay />
          </Layout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthLayout>
            <ForgotPassword />
          </AuthLayout>
        }
      />
      <Route
        path="/test-language"
        element={
          <Layout>
            <TestLanguage />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
