import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import AdminApp from "./admin/App";
import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* USER */}
        <Route path="/*" element={<App />} />

        {/* ADMIN */}
        <Route path="/admin/*" element={<AdminApp />}>
          <Route path="login" element={<Login />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
