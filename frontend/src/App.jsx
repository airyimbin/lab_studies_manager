import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ParticipantsList from "./components/ParticipantsList.jsx";
import ParticipantDetail from "./components/ParticipantDetail.jsx";
import StudiesList from "./components/StudiesList.jsx";
import StudiesDetail from "./components/StudiesDetail.jsx";
import SessionsList from "./components/SessionsList.jsx";
import SessionsDetail from "./components/SessionsDetail.jsx";
import Login from "./components/Login.jsx";

export default function App() {
  return (
    <>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/participants" element={<ParticipantsList />} />
          <Route path="/participants/:id" element={<ParticipantDetail />} />
          <Route path="/studies" element={<StudiesList />} />
          <Route path="/studies/:id" element={<StudiesDetail />} />
          <Route path="/sessions" element={<SessionsList />} />
          <Route path="/sessions/:id" element={<SessionsDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
