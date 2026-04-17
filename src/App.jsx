import Dashboard from "./components/Dashboard";
import HeroSection from "./components/HeroSection";
import Landing from "./components/Landing";
import Questions from "./components/Question";
import { LoginSignup } from "./components/login_signup";
import DragDropGame from "./components/DragDropGame";
import { ParallaxProvider } from "react-scroll-parallax";
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { tokenManager } from "./services/api";
import TenseGame from "./components/TenseGame";
import VerbGame from "./components/VerbGame";
import ShabdaFusion from "./components/ShabdaFusion";
import SankhyaTrivia from "./components/SankhyaTrivia";
import LearningModule from "./components/LearningModule";
import Learn from "./components/Learn";
import LearnObject from "./components/Learn_object";
import LearnSanskritSentence from "./components/Learn_Sentence_Structure";
import LearnPresentTense from "./components/Learn_present_tense";
import LearnSubject from "./components/LearnSubject";
import LearnFutureTense from "./components/LearnFutureTense";
import LearnPastTense from "./components/LearnPastTense";
import LoginRequiredPage from "./components/LoginRequiredPage";
import bgImage from './assets/background_image.jpeg';

// Fixed brand header component
function BrandHeader() {
  return (
    <div
      style={{
        position: "fixed",
        top: "12px",
        left: "16px",
        zIndex: 2000,
        fontSize: "clamp(1.1rem, 3vw, 1.8rem)",
        fontWeight: "bold",
        color: "white",
        fontFamily: "'Noto Serif Devanagari', serif",
        backgroundColor: "rgba(139, 69, 19, 0.85)",
        padding: "4px 10px",
        borderRadius: "6px",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        maxWidth: "calc(100vw - 200px)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      संस्कृतमणिः
    </div>
  );
}

// Authentication wrapper component
function AuthWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = tokenManager.isAuthenticated();
      setIsAuthenticated(isAuth);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    tokenManager.removeToken();
    setIsAuthenticated(false);
  };

  // 1. Separate Background Layer Style
  // This forces the image to stay fixed at the back, independent of content layout
  const fixedBackgroundStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: -1, // Puts it behind everything
  };

  if (loading) {
    return (
      <>
        {/* Background Layer */}
        {!isLanding && <div style={fixedBackgroundStyle} />}
        {/* Loading Content */}
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "1.2rem",
          }}
        >
          Loading...
        </div>
      </>
    );
  }

  return (
    <>
      {/* GLOBAL BACKGROUND LAYER - Hidden on landing page, visible everywhere else */}
      {!isLanding && <div style={fixedBackgroundStyle} />}

      <BrandHeader />
      
      {/* Main Content Scrollable Area */}
      <div
        style={{
          position: "relative", // Ensures content sits on top of z-index -1
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
        }}
      >
        {/* Spacer so content doesn't hide behind fixed BrandHeader — not needed on landing */}
        {!isLanding && <div style={{ height: "56px", flexShrink: 0 }} />}
        <main style={{ flex: 1, width: "100%", overflowX: "hidden" }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/login" element={<LoginSignup onLogin={handleLogin} />} />
            <Route path="/learning-module" element={<LearningModule />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn-object" element={<LearnObject />} />
            <Route path="/learn-sentences" element={<LearnSanskritSentence />} />
            <Route path="/learn-subject" element={<LearnSubject />} />
            <Route path="/learn-present-tense" element={<LearnPresentTense />} />
            <Route path="/learn-past-tense" element={<LearnPastTense />} />
            <Route path="/learn-future-tense" element={<LearnFutureTense />} />
            <Route path="/login-required" element={<LoginRequiredPage />} />
            <Route path="/hero" element={<HeroSection />} />
            <Route path="/hero-dashboard" element={<HeroSection />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Protected Routes */}
            <Route
              path="/game"
              element={
                isAuthenticated ? (
                  <DragDropGame onLogout={handleLogout} />
                ) : (
                  <LoginRequiredPage />
                )
              }
            />
            <Route
              path="/tense-game"
              element={
                isAuthenticated ? (
                  <TenseGame />
                ) : (
                  <LoginRequiredPage />
                )
              }
            />
            <Route
              path="/verb-game"
              element={
                isAuthenticated ? (
                  <VerbGame />
                ) : (
                  <LoginRequiredPage />
                )
              }
            />
            <Route
              path="/shabda-fusion"
              element={
                isAuthenticated ? (
                  <ShabdaFusion />
                ) : (
                  <LoginRequiredPage />
                )
              }
            />
            <Route
              path="/sankhya-trivia"
              element={
                isAuthenticated ? (
                  <SankhyaTrivia />
                ) : (
                  <LoginRequiredPage />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ParallaxProvider>
        <AuthWrapper />
      </ParallaxProvider>
    </BrowserRouter>
  );
}

export default App;