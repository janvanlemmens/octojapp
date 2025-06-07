import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Pages.css";
import PdfViewer from "../components/PdfViewer";
import { pdfjs } from "react-pdf";
import CustomButton from "../components/ui/CustomButton";
import Input from "../components/ui/Input";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function Purchases() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [refresh, setRefresh] = useState(false);
  const [formData, setFormData] = useState({ from: "", till: "" });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  async function showPdf(data, idx) {
    setSelectedRow(idx);

    const booking = data.booking.toString();
    const pdfname = data.pdfpath;
    const swin = "1";
    if (pdfname == null) return;
    try {
      const response = await axios.post("http://localhost:5001/move-file", {
        booking: booking,
        pdfname: pdfname,
        swin: 1,
      });
      setFile("/uploads/in/" + pdfname);
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
    setInvoices((prev) =>
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

        const response = await axios.post(
          "http://localhost:5001/api/invoicesin",
          {
            from: formData.from ? formData.from : yearprev,
            till: formData.till ? formData.till : yearcur,
          }
        );
        setInvoices(response.data);
        console.log(invoices);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [refresh]);

  const filteredInvoices = invoices
    .filter(
      (inv) =>
        inv.id.toString().includes(searchTerm) ||
        inv.datum.includes(searchTerm) ||
        inv.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.amount.toString().includes(searchTerm) ||
        inv.description.toString().includes(searchTerm)
    )
    .sort((a, b) => b.id - a.id);

  const handleRefr = () => {
    setInvoices([]);
    setSelectedRow(null);
    setRefresh((prev) => !prev);
  };

  const handleLink = async () => {
    if (selectedRow == null || !file) {
      console.log("errrorororororor");
      toast.error("Nothing to link");
      return;
    }

    try {
      const pdfname = file.name;
      const facid = filteredInvoices[selectedRow].id;

      const response = await axios.post("http://localhost:5001/api/updin", {
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

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="column2">
          <h2>Invoices In</h2>

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
                placeholder="Search by Date, Supplier, Amount..."
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
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f0f0f0" }}>
              <tr>
                <th>Period</th>
                <th>Invoice</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Amount</th>
                <th>Description</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv, index) => (
                  <tr
                    className={selectedRow === index ? "selected-row" : ""}
                    key={inv.id}
                    onClick={() => showPdf(inv, index)}
                  >
                    <td>{inv.booking}</td>
                    <td>{inv.id}</td>
                    <td>{inv.datum.split("T", 1)}</td>
                    <td>{inv.supplier}</td>
                    <td>{inv.amount.toFixed(2)}</td>
                    <td onDoubleClick={() => handleDoubleClick(inv)}>
                      {editingId === inv.id ? (
                        <input
                          value={editValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(inv.id)}
                          autoFocus
                          style={{
                            width: "100%",
                            maxWidth: "300px",
                          }}
                        />
                      ) : (
                        inv.description
                      )}
                    </td>
                    <td>{inv.pdfpath}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", padding: "1rem" }}
                  >
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="column1">{file && <PdfViewer file={file} />}</div>
      </div>
    </>
  );
}

export default Purchases;
