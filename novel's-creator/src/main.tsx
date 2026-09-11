import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import {
  AuthProvider,
} from "./contexts/AuthContext";

import {
  BookProvider,
} from "./contexts/BookContext";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <AuthProvider>
      <BookProvider>
        <App />
      </BookProvider>
    </AuthProvider>
  </React.StrictMode>
);
