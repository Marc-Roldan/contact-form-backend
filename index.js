const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// Use DATABASE_URL from Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Railway Postgres
});

// Test database connection
pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("PostgreSQL connection error:", err));

// Test route
app.get("/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Contact form submission
app.post("/contact", async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const query = `
      INSERT INTO contact_messages (email, subject, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [email, subject, message];
    const result = await pool.query(query, values);

    res.status(201).json({ message: "Message saved", data: result.rows[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Use PORT from Railway or fallback to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
