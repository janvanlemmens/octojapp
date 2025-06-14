import React, { useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "../components/Navbar";
import CustomButton from "../components/ui/CustomButton";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import axios from "axios";

const customStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: 4,
    borderColor: "#888",
    minHeight: 36,
    boxShadow: "none",
    "&:hover": {
      borderColor: "#555",
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: 4,
  }),
};

const formStyle = {
  maxWidth: 400,
  margin: "30px auto",
  padding: 20,
  border: "1px solid #ccc",
  borderRadius: 8,
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#f9f9f9",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: "bold",
  fontSize: 14,
  color: "#333",
};

const inputStyle = {
  width: "100%",
  minHeight: 36,
  padding: "8px 10px",
  fontSize: 14,
  borderRadius: 4,
  border: "1px solid #ccc",
  marginBottom: 15,
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: 16,
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

export default function StyledForm() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [bookyOption, setBookyOption] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [invoices, setInvoices] = useState([]);

  const options = [
    { value: "1", label: "Purchases" },
    { value: "2", label: "Sales" },
    { value: "3", label: "Financial" },
  ];

  const optionsby = [
    { value: "9", label: "2021" },
    { value: "10", label: "2022" },
    { value: "11", label: "2023" },
    { value: "12", label: "2024" },
    { value: "13", label: "2025" },
  ];

  const handleSubmit = async (e) => {
    if (bookyOption == null) {
      toast.error("select bookYear");
      return;
    }
    if (selectedOption == null) {
      toast.error("select journalTypeId");
      return;
    }
    e.preventDefault();
    const dat = startDate ? startDate.toLocaleDateString() : "None";
    const [day, month, year] = dat.split("-");
    const dd = String(day).padStart(2, "0");
    const mm = String(month).padStart(2, "0");
    const datum = year + "-" + mm + "-" + dd + " 00:00:00.000";
    try {
      const response = await axios.post("http://localhost:5001/octo-bookm", {
        dateModified: datum,
        journalTypeId: selectedOption.value,
        bookyearId: bookyOption.value,
      });
      setInvoices(response.data.modifiedBookings);
      const bookings = invoices.filter((item) => item.lineSequenceNr === 1);
      const response1 = await axios.post(
        "http://localhost:5001/postgres-bookings",
        bookings
      );
      console.log(response1);
    } catch (err) {
      console.error("Error fetching dossier:", err);
    }
  };

  const getDosTok = async () => {
    try {
      const response1 = await axios.get("http://localhost:5001/octo-auth");
      const response2 = await axios.get("http://localhost:5001/octo-token");
      console.log(response2);
    } catch (err) {
      console.error("Error fetching dossierToken:", err);
    }
  };

  const showAuth = async () => {
    try {
      const response = await axios.get("http://localhost:5001/show-octo");
      console.log(response);
    } catch (err) {
      console.error("Error fetching key:", err);
    }
  };

  const getBookyears = async () => {
    try {
      const response = await axios.get("http://localhost:5001/octo-bookyears");
      console.log(response);
    } catch (err) {
      console.error("Error fetching key:", err);
    }
  };

  const filInvoices = () => {
    console.log(invoices);
    let bookings = invoices.filter((item) => item.lineSequenceNr == 1);
    console.log(bookings);
  };

  return (
    <>
      <Navbar />
      <form style={formStyle} onSubmit={handleSubmit}>
        {/*
 <label style={labelStyle} htmlFor="textInput">
          Your Text
        </label>
        <input
          id="textInput"
          type="text"
          style={inputStyle}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder="Type something..."
        />
       */}

        <label style={labelStyle} htmlFor="bookYear">
          bookYear
        </label>
        <Select
          id="bookYear"
          options={optionsby}
          value={bookyOption}
          onChange={setBookyOption}
          styles={customStyles}
          placeholder="Select BookYear..."
        />
        <label style={labelStyle} htmlFor="selectInput">
          journalTypeId
        </label>
        <Select
          id="selectInput"
          options={options}
          value={selectedOption}
          onChange={setSelectedOption}
          styles={customStyles}
          placeholder="Select journalTypeId..."
        />

        <label style={labelStyle} htmlFor="datePicker">
          Pick a date
        </label>
        <DatePicker
          id="datePicker"
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Select a date"
          style={{ width: "100%" }}
        />
        <div className="bwrapper">
          <CustomButton type="submit">Submit</CustomButton>
        </div>
        <div className="bwrapper">
          <CustomButton type="button" onPress={getDosTok}>
            Get dossierToken
          </CustomButton>
        </div>
        <div className="bwrapper">
          <CustomButton type="button" onPress={showAuth}>
            Show auth
          </CustomButton>
        </div>
        <div className="bwrapper">
          <CustomButton type="button" onPress={getBookyears}>
            Get bookyears
          </CustomButton>
        </div>
        <div className="bwrapper">
          <CustomButton type="button" onPress={filInvoices}>
            filter invoices
          </CustomButton>
        </div>
        {/*
  <button type="submit" style={buttonStyle}>
          Submit
        </button>
  */}
      </form>
    </>
  );
}
