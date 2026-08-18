import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Starfield from "./components/Starfield";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import BooksPage from "./pages/BooksPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyBorrowsPage from "./pages/MyBorrowsPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Nền vũ trụ cố định: tinh vân + canvas sao (chạy trên mọi trang) */}
        <div className="space-background" aria-hidden="true" />
        <div className="nebula nebula--one" aria-hidden="true" />
        <div className="nebula nebula--two" aria-hidden="true" />
        <Starfield />

        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/my-borrows" element={<MyBorrowsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}
