import express from "express";
import cors from "cors";
import pg from "pg";
import env from "dotenv";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import CryptoJS from "crypto-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path
  .dirname(__filename)
  .substring(0, path.dirname(__filename).lastIndexOf("/"));

const api = axios.create();

api.interceptors.request.use((config) => {
  console.log("[Server Request]", config);
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log("[Response]", res);
    return res;
  },
  (err) => {
    console.error("[Error]", err);
    return Promise.reject(err);
  }
);

env.config();
const store = new Map();
const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); //to tell server that public folder is static
app.use(express.json({ limit: "200mb" }));

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

/*pool
  .query("SELECT NOW()")
  .then((res) => {
    console.log("✅ Connected to DB at:", res.rows[0].now);
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
  });*/

app.post("/pg/bookings", async (req, res) => {
  const { from, till, journal } = req.body;
  try {
    const result = await pool.query(
      "SELECT b.*, r.naam FROM bookings b JOIN relations r ON b.relation_id = r.id WHERE (b.periodnr BETWEEN $1 AND $2) AND b.journal = $3 order by periodnr desc,documentnr desc",
      [from, till, journal]
    );
    //console.log(result);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Database error");
  }
});

app.post("/pg/updpdf", async (req, res) => {
  const { prop1, prop2 } = req.body;
  const [per, jty, jnr, dnr] = prop2.split("-");
  //console.log("Received:", prop1, prop2, per);
  try {
    const result = await pool.query(
      "UPDATE bookings SET pdf = $1 WHERE periodnr = $2 and journaltype = $3 and journalnr = $4 and documentnr =$5",
      [prop1, per, jty, jnr, dnr]
    );
    res.status(200).json({ success: true, rowCount: result.rowCount });
  } catch (err) {
    console.error("Error updating PDF path:", err);
    res.status(500).json({ error: "Database update failed" });
  }
});

app.post("/move-file", (req, res) => {
  const { period, pdfname } = req.body;
  const fol = "bk" + period.toString().substring(0, 4) + "/";
  const source = process.env.PDF_SOURCE + fol + pdfname;
  const dest = path.join(__dirname, "public", "/uploads/bookings/" + pdfname);
  //console.log(source + "-" + dest);

  if (fs.existsSync(dest)) {
    // File already exists
    return res.send("File already exists");
  }

  fs.copyFile(source, dest, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error moving file");
    }
    res.send("File copied successfully");
  });
});

app.post("/clear-uploads", (req, res) => {
  const { folder } = req.body;
  const uploadsDir = path.join(__dirname, "public" + "/uploads/" + folder);
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Unable to read folder" });

    files.forEach((file) => {
      fs.unlink(path.join(uploadsDir, file), (err) => {
        if (err) console.error(err);
      });
    });

    res.json({ message: "All files deleted from uploads" });
  });
});

app.get("/octo-auth", async (req, res) => {
  try {
    const url = process.env.URL + "/authentication";
    const secret = process.env.SECRET_AUTH;
    const response = await api.post(
      url,
      { user: process.env.USR, password: process.env.PAS }, // request body
      {
        headers: {
          softwareHouseUuid: process.env.SHI,
          "Content-Type": "application/json",
        },
      }
    );
    const tok = response.data.token;
    store.set("auth", tok);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "API request failed" });
  }
});

function retrieveToken(loc) {
  /*
  const secret = process.env.SECRET_AUTH;
  const bytes = CryptoJS.AES.decrypt(stored, secret);
  const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  */
  const stored = store.get(loc);
  return stored;
}

app.get("/show-octo", (req, res) => {
  const data = retrieveToken("auth");
  res.json(data);
});
app.get("/show-dostim", (req, res) => {
  const data = retrieveToken("dostim");
  res.json(data);
});

app.get("/octo-token", async (req, res) => {
  const url = process.env.URL + "/dossiers";
  const auth = retrieveToken("auth");
  try {
    const response = await axios.post(url, null, {
      params: { dossierId: process.env.DOS_NR }, // query parameters
      headers: {
        token: auth,
        "Content-Type": "application/json",
      },
    });
    const tok = response.data.Dossiertoken;
    store.set("dostok", tok);
    store.set("dostim", Date.now());
    res.json(response.data);
    // store.set("dostoken", response);
  } catch (err) {
    res.status(500).json({ error: "API request failed" });
  }
});

app.get("/octo-bookyears", async (req, res) => {
  const url =
    process.env.URL + "/dossiers/" + process.env.DOS_NR + "/bookyears";
  const auth = retrieveToken("dostok");
  try {
    const response = await axios.get(url, {
      headers: {
        dossierToken: auth,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
    // store.set("dostoken", response);
  } catch (err) {
    res.status(500).json({ error: "API request failed" });
  }
});

app.get("/octo-relations", async (req, res) => {
  const url =
    process.env.URL + "/dossiers/" + process.env.DOS_NR + "/relations";
  const auth = retrieveToken("dostok");
  try {
    const response = await axios.get(url, {
      headers: {
        dossierToken: auth,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
    // store.set("dostoken", response);
  } catch (err) {
    res.status(500).json({ error: "API request failed" });
  }
});

app.post("/postgres-relations", async (req, res) => {
  const arr = req.body;
  let values = [];
  arr.forEach((element) => {
    values.push({
      id: element.relationIdentificationServiceData.relationKey.id,
      client: element.client,
      supplier: element.supplier,
      naam: element.name,
      streetandnr: element.streetAndNr,
      city: element.city,
      postalcode: element.postalCode,
      country: element.country,
      vatnr: element.vatNr,
    });
  });
  //console.log(values);
  try {
    const result = await pool.query(
      `INSERT INTO relations (id, client, supplier, naam, streetandnr, city, postalcode, country, vatnr)
   SELECT id, client, supplier, naam, streetandnr, city, postalcode, country, vatnr
   FROM json_populate_recordset(NULL::relations, $1)
   ON CONFLICT (id) DO NOTHING;`,
      [JSON.stringify(values)]
    );
    console.log(result.rows);
  } catch (err) {
    console.log("error uploading data", err);
  }
});

app.post("/octo-bookm", async (req, res) => {
  const by = req.body.bookyearId;
  const url =
    process.env.URL +
    "/dossiers/" +
    process.env.DOS_NR +
    "/bookyears/" +
    by +
    "/bookings/modified";
  const auth = retrieveToken("dostok");
  const dm = req.body.dateModified;
  const jk = req.body.journalTypeId;
  try {
    const response = await api.get(url, {
      params: { journalTypeId: jk, modifiedTimeStamp: dm },
      headers: {
        dossierToken: auth,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
    // store.set("dostoken", response);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.post("/postgres-bookings", async (req, res) => {
  const arr = req.body;
  const bookings = arr.filter((item) => item.lineSequenceNr == 1);
  let values = [];
  bookings.forEach((element) => {
    values.push({
      journaltype: element.journalType,
      journalnr: element.journalNr,
      documentnr: element.documentSequenceNr,
      periodnr: element.bookyearPeriodeNr,
      documentdate: element.documentDate,
      relation_id: element.relationKey.id,
      documentamount: element.documentAmount,
      currency: element.currencyCode,
      comment: element.comment,
      reference: element.reference,
      expirydate: element.expiryDate,
      line: element.lineSequenceNr,
    });
  });
  const json = JSON.stringify(values);
  const byteSize = Buffer.byteLength(json, "utf8");
  console.log(`${byteSize} bytes`);
  //console.log(JSON.stringify(values));
  try {
    const result = await pool.query(
      `INSERT INTO bookings (
  journaltype, journalnr, documentnr, periodnr, documentdate,
  relation_id, currency, documentamount, comment, reference,
  expirydate, line
)
SELECT journaltype, journalnr, documentnr, periodnr, documentdate,
  relation_id, currency, documentamount::real, comment, reference,
  expirydate, line
FROM json_populate_recordset(NULL::bookings, $1::json) AS r
ON CONFLICT (journaltype, journalnr, documentnr, periodnr) DO NOTHING;`,
      [JSON.stringify(values)]
    );

    res.json(result.rows.length);
  } catch (err) {
    console.log("error uploading data", err);
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
