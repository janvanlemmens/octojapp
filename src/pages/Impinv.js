import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import "./Pages.css";

export default function Impinv() {
  /*
  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const response = await axios.get("http://localhost:5001/octo-auth");

        console.log(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAuth();
  }, []);
  */

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Import Invoices</h2>
      </div>
    </>
  );
}
