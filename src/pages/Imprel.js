import React from "react";
import Navbar from "../components/Navbar";
import CustomButton from "../components/ui/CustomButton";
import { toast } from "react-toastify";
import axios from "axios";

export default function Imprel() {
  const getDosTok = async () => {
    try {
      const response1 = await axios.get("http://localhost:5001/octo-auth");
      const response2 = await axios.get("http://localhost:5001/octo-token");
      console.log(response2);
    } catch (err) {
      console.error("Error fetching dossierToken:", err);
    }
  };
  const getDosTim = async () => {
    try {
      const response = await axios.get("http://localhost:5001/show-dostim");
      const curDat = Date.now();
      const Diffmin = Math.floor(
        (curDat - parseInt(response.data)) / 1000 / 60
      );
      console.log(Diffmin);
      toast.success(Diffmin);
    } catch (err) {
      console.error("Error fetching dossierToken:", err);
    }
  };
  const getRelations = async () => {
    try {
      const response = await axios.get("http://localhost:5001/octo-relations");
      const relations = response.data;
      const response1 = await axios.post(
        "http://localhost:5001/postgres-relations",
        relations
      );
      console.log(response1);
    } catch (err) {
      console.error("Error fetching Relations:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bwrapper">
        <CustomButton type="button" onPress={getDosTok}>
          Get dossierToken
        </CustomButton>
      </div>
      <div className="bwrapper">
        <CustomButton type="button" onPress={getDosTim}>
          Get tokenTime
        </CustomButton>
      </div>
      <div className="bwrapper">
        <CustomButton type="button" onPress={getRelations}>
          Get Relations
        </CustomButton>
      </div>
    </>
  );
}
