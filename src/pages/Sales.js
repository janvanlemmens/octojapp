import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
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

const joptions = [
  { value: "1_1", label: "Aankopen" },
  { value: "1_2", label: "Aankopen Spanje" },
  { value: "2_1", label: "Verkopen" },
];

function Sales() {
  const [journal, setJournal] = useState({ value: "1_1", label: "Aankopen" });
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

    const per = data.periodnr;
    const pdfname = data.pdf;

    if (pdfname == null) {
      return;
    }
    try {
      const response = await axios.post("http://localhost:5001/move-file", {
        period: per,
        pdfname: pdfname,
      });
      setFile("/uploads/bookings/" + pdfname);
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

  const handleSelect = (obj) => {
    setRefresh((prev) => !prev);
    setJournal(obj);
    console.log("journal", journal);
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
          journal: journal.value,
        });
        setBookings(response.data);
        //console.log(response.data);
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
    console.log(file);

    if (selectedRow == null) {
      toast.error("Select row please");
      return;
    }
    if (!file) {
      toast.error("Select file please");
      return;
    }
    const ty = typeof file;
    if (ty === "string") return;

    try {
      const pdfname = file.name;
      const facid = filteredBookings[selectedRow].id;

      const response = await axios.post("http://localhost:5001/pg/updpdf", {
        prop1: pdfname,
        prop2: facid,
      });
      console.log(response);

      fileInputRef.current.value = "";
      setFile(null);
      setSelectedRow(null);
      setExpandedRow(null);
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error("Error updating property:", err);
    }
  };

  const toggleRow = (book, idx) => {
    setExpandedRow((prevId) => (prevId === book.id ? null : book.id));
    showPdf(book, idx);
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="column2">
          <h3>
            <Select
              id="selectJournal"
              options={joptions}
              value={journal}
              onChange={handleSelect}
              styles={customStyles}
              placeholder="Select journal..."
            />
          </h3>

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
                placeholder={
                  journal.value.startsWith(1)
                    ? "Search by Date, Supplier, Amount, ..."
                    : "Search by Date, Customer, Amount, ..."
                }
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
                <th>{journal.value.startsWith(1) ? "Supplier" : "Customer"}</th>
                <th>Amount</th>
                <th>Comment</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((record, index) => {
                const [p1, p2, p3, p4] = record.id.split("-");

                return (
                  <React.Fragment key={record.id}>
                    <tr
                      className={`main-row ${
                        expandedRow === record.id ? "expanded" : ""
                      } ${selectedRow === index ? "selected-row" : ""}`}
                      onClick={() => toggleRow(record, index)}
                    >
                      <td className="cell bold">{p1}</td>
                      <td className="cell">{p4}</td>
                      <td className="cell">
                        {record.documentdate.split("T", 1)}
                      </td>
                      <td className="cell">{record.naam}</td>
                      <td className="cell">
                        {record.documentamount.toFixed(2) * (p2 == 1 ? -1 : 1)}
                      </td>
                      <td className="cell">{record.comment}</td>
                      <td className="cell">{record.pdf}</td>
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
