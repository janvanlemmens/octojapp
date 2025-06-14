import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./pages/App";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Impinv from "./pages/Impinv";
import Imprel from "./pages/Imprel";
import Autolink from "./pages/Autolink";
import reportWebVitals from "./reportWebVitals";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
  },
  {
    path: "/bookings",
    element: <Sales />,
  },
  {
    path: "/import/invoices",
    element: <Impinv />,
  },
  {
    path: "/import/relations",
    element: <Imprel />,
  },
  {
    path: "/autolink",
    element: <Autolink />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <ToastContainer position="bottom-center" autoClose={3000} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
