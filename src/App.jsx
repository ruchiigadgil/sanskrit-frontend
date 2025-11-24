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
        top: "5px",
        left: "0.2%",
        zIndex: 2000,
        fontSize: "2.5rem",
        fontWeight: "bold",
        color: "white",
        fontFamily: "'Noto Serif Devanagari', serif",
        backgroundColor: "rgba(113, 74, 16, 0.95)",
        padding: "4px 12px rgba(83, 52, 7, 0.8)",
        borderRadius: "5px",
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
    width: "100vw",
    height: "100vh",
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
        <div style={fixedBackgroundStyle} />
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
      {/* GLOBAL BACKGROUND LAYER - Always visible, sits behind everything */}
      <div style={fixedBackgroundStyle} />

      <BrandHeader />
      
      {/* Main Content Scrollable Area */}
      <div
        style={{
          position: "relative", // Ensures content sits on top of z-index -1
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main style={{ flex: 1, width: "100%" }}>
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