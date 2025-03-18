import React from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login"; 
import Home from "./pages/Home"
import SignUp from "./pages/Signup";
import Crypto from "./pages/Crypto";
import Invest from "./pages/Invest";
import Stocks from "./pages/Stocks";
import Commodities from "./pages/Commodities";
import News from "./pages/News";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/invest" element={<Invest />} />
        <Route path="/crypto" element={<Crypto />} />
        <Route path="/stocks" element={<Stocks />} />
        <Route path="/commodities" element={<Commodities />} />
        <Route path="/news" element={<News />} />
      </Routes>
    </Router>
  );
}

export default App;
