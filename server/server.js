import express from "express";
import cors from "cors";
import pg from "pg";
import env from "dotenv";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path
  .dirname(__filename)
  .substring(0, path.dirname(__filename).lastIndexOf("/"));

env.config();

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); //to tell server that public folder is static

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

app.post("/api/invoicesin", async (req, res) => {
  const { from, till } = req.body;
  console.log(from);
  try {
    const result = await pool.query(
      "SELECT * FROM invoicesin where booking >= $1 and booking <= $2",
      [from, till]
    );
    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.post("/api/invoicesout", async (req, res) => {
  const { from, till } = req.body;
  console.log(from);
  try {
    const result = await pool.query(
      "SELECT * FROM invoicesout where booking >= $1 and booking <= $2",
      [from, till]
    );
    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.post("/api/updin", async (req, res) => {
  const { prop1, prop2 } = req.body;

  console.log("Received:", prop1, prop2);

  try {
    const result = await pool.query(
      "UPDATE invoicesin SET pdfpath = $1 WHERE id = $2",
      [prop1, prop2]
    );
    res.status(200).json({ success: true, rowCount: result.rowCount });
  } catch (err) {
    console.error("Error updating PDF path:", err);
    res.status(500).json({ error: "Database update failed" });
  }
});

app.post("/api/updout", async (req, res) => {
  const { prop1, prop2 } = req.body;

  console.log("Received:", prop1, prop2);

  try {
    const result = await pool.query(
      "UPDATE invoicesout SET pdfpath = $1 WHERE id = $2",
      [prop1, prop2]
    );
    res.status(200).json({ success: true, rowCount: result.rowCount });
  } catch (err) {
    console.error("Error updating PDF path:", err);
    res.status(500).json({ error: "Database update failed" });
  }
});

app.post("/move-file", (req, res) => {
  const { booking, pdfname, swin } = req.body;
  const fol =
    "inv" +
    booking.toString().substring(0, 4) +
    "/" +
    (swin ? "in" : "out") +
    "/";
  const source = process.env.PDF_SOURCE + fol + pdfname;
  const dest = path.join(
    __dirname,
    "public",
    "uploads/" + (swin ? "in" : "out"),
    pdfname
  );
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
