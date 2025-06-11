import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Pages.css";
import PdfViewer from "../components/PdfViewer";
import { pdfjs } from "react-pdf";
import CustomButton from "../components/ui/CustomButton";
import Input from "../components/ui/Input";
import Navbar from "../components/Navbar";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function Sales() {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [refresh, setRefresh] = useState(false);
  const [formData, setFormData] = useState({ from: "", till: "" });
  const [expandedRow, setExpandedRow] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  async function showPdf(data, idx) {
    setSelectedRow(idx);

    const booking = data.booking.toString();
    const pdfname = data.pdfpath;

    if (pdfname == null) return;
    try {
      const response = await axios.post("http://localhost:5001/move-file", {
        booking: booking,
        pdfname: pdfname,
        swin: 0,
      });
      setFile("/uploads/out/" + pdfname);
      console.log(response);
    } catch (err) {}
  }
  const handleDoubleClick = (row) => {
    setEditingId(row.id);
    setEditValue(row.description);
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (e) => setEditValue(e.target.value);

  const handleBlur = (id) => {
    setBookings((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, description: editValue } : row
      )
    );
    setEditingId(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const yearprev = new Date().getFullYear() - 1 + "01";
        const yearcur = new Date().getFullYear() + "12";

        const response = await axios.post("http://localhost:5001/pg/bookings", {
          from: formData.from ? formData.from : yearprev,
          till: formData.till ? formData.till : yearcur,
          journaltype: 1,
        });
        setBookings(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [refresh]);

  const filteredBookings = bookings
    .filter(
      (book) =>
        book.documentdate.includes(searchTerm) ||
        book.naam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.documentamount.toString().includes(searchTerm) ||
        book.comment.toString().includes(searchTerm) ||
        book.reference.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      if (a.journaltype !== b.journaltype) return 0;

      // Keep same journalnr
      if (a.journalnr !== b.journalnr) return 0;

      // Sort by latest periodnr (descending)
      if (a.periodnr !== b.periodnr) return b.periodnr - a.periodnr;

      // Sort by latest documentnr (descending)
      return b.documentnr - a.documentnr;
    });

  const handleRefr = () => {
    setBookings([]);
    setSelectedRow(null);
    setRefresh((prev) => !prev);
  };

  const handleLink = async () => {
    console.log(selectedRow + "-" + file.name);
    if (selectedRow == null || !file) {
      return;
    }

    try {
      const pdfname = file.name;
      const facid = filteredBookings[selectedRow].id;

      const response = await axios.post("http://localhost:5001/api/updout", {
        prop1: pdfname,
        prop2: facid,
      });
      console.log(response);

      fileInputRef.current.value = "";
      setFile(null);
      setSelectedRow(null);
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error("Error updating property:", err);
    }
  };

  const toggleRow = (id) => {
    setExpandedRow((prevId) => (prevId === id ? null : id));
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="column2">
          <h2>Invoices Out</h2>

          {/* 🔍 Search Input */}
          <div className="inputContainer">
            <div className="iwrapper">
              <Input
                placeholder="From"
                name="from"
                value={formData.from}
                onChange={handleChangeForm}
              />
            </div>
            <div className="iwrapper">
              <Input
                placeholder="Till"
                name="till"
                value={formData.till}
                onChange={handleChangeForm}
              />
            </div>
            <div className="bwrapper">
              <CustomButton onPress={handleRefr}>Refresh</CustomButton>
            </div>
            <div className="swrapper">
              <input
                type="text"
                placeholder="Search by Date, Customer, Amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="fwrapper">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </div>
            <div className="bwrapper">
              <CustomButton onPress={handleLink}>Link</CustomButton>
            </div>
          </div>

          {/* 📄 Invoice Table */}
          <table className="custom-table">
            <thead style={{ backgroundColor: "#f0f0f0" }}>
              <tr>
                <th>Period</th>
                <th>Invoice</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Comment</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((record) => {
                return (
                  <React.Fragment key={record.id}>
                    <tr
                      className={`main-row ${
                        expandedRow === record.id ? "expanded" : ""
                      }`}
                      onClick={() => toggleRow(record.id)}
                    >
                      <td className="cell bold">{record.periodnr}</td>
                      <td className="cell">{record.documentnr}</td>
                      <td className="cell">
                        {record.documentdate.split("T", 1)}
                      </td>
                      <td className="cell">{record.naam}</td>
                      <td className="cell">
                        {record.documentamount.toFixed(2)}
                      </td>
                      <td className="cell">{record.comment}</td>
                    </tr>
                    {record.reference && expandedRow === record.id && (
                      <tr className="detail-row">
                        <td className="cell detail" colSpan="2">
                          {`reference: ${record.reference}`}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="column1">{file && <PdfViewer file={file} />}</div>
      </div>
    </>
  );
}

export default Sales;
