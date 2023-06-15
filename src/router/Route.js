import { BrowserRouter, Routes, Route } from "react-router-dom";
import OnBoard from "../pages/OnBoard";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Main from "../pages/Main";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OnBoard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
}
