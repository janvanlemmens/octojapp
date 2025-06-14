import React, { useState, useEffect } from "react";
import Select from "react-select";
import { customStyles, labelStyle, formStyle } from "./styles/selectStyles";
import Navbar from "../components/Navbar";
import CustomButton from "../components/ui/CustomButton";
import axios from "axios";

const optionsby = [
  { value: "9", label: "2021" },
  { value: "10", label: "2022" },
  { value: "11", label: "2023" },
  { value: "12", label: "2024" },
  { value: "13", label: "2025" },
];

export default function Autolink() {
  const [bookyOption, setBookyOption] = useState(null);
  const [filelist, setFilelist] = useState([]);
  const [invoicelist, setInvoicelist] = useState([]);

  const readDir = async () => {
    //console.log(bookyOption);
    const dir = "bk" + bookyOption.label;
    const resultf = await axios.post("http://localhost:5001/read-dir", {
      folder: dir,
    });
    setFilelist(resultf.data.list);

    const resulti = await axios.post("http://localhost:5001/pg/bookings", {
      from: bookyOption.label + "01",
      till: bookyOption.label + "12",
      journal: "*",
    });
    setInvoicelist(resulti.data);
  };

  useEffect(() => {
    link();
  }, [filelist, invoicelist]);

  const link = () => {
    const cleanFilelist = filelist.map((file, idx) => {
      const parts = file.replace(".pdf", "").split("_");
      const lastPart = String(parseInt(parts[parts.length - 1], 10)); // Remove leading zeros
      parts[parts.length - 1] = lastPart;
      return parts.join("_") + ".pdf";
    });
    //console.log("inv", invoicelist);
    let arr = [];
    invoicelist.forEach((invoice) => {
      const target = invoice.journal + "_" + invoice.documentnr + ".pdf";
      const index = cleanFilelist.indexOf(target);
      if (index !== -1) {
        arr.push({ invid: invoice.id, pdf: filelist[index] });
        //console.log(invoice.id + "-" + filelist[index]);
      }
    });
    console.log("array", arr);
  };

  return (
    <>
      <Navbar />
      <div style={formStyle}>
        <label style={labelStyle} htmlFor="Autolink bookYear">
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
        <div className="bwrapper">
          <CustomButton type="button" onPress={readDir}>
            List files
          </CustomButton>
        </div>
      </div>
    </>
  );
}
