const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.post("/bfhl", (req, res) => {
  // TODO: Implement business logic
  const { data } = req.body;

  // Placeholder response
  res.json({
    status: "success",
    message: "Endpoint is working. Business logic not yet implemented.",
    received: data,
  });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Hierarchy Analyzer API" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
