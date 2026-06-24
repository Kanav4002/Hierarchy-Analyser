const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const EDGE_REGEX = /^[A-Z]->[A-Z]$/;

function isValidEdge(entry) {
  return EDGE_REGEX.test(entry);
}

function parseEntries(data) {
  const validEdges = [];
  const invalidEntries = [];

  for (const raw of data) {
    const trimmed = raw.trim();
    if (trimmed === "" || !isValidEdge(trimmed)) {
      invalidEntries.push(raw);
    } else {
      const [parent, child] = trimmed.split("->");
      if (parent === child) {
        invalidEntries.push(raw);
      } else {
        validEdges.push({ parent, child });
      }
    }
  }

  return { validEdges, invalidEntries };
}

app.post("/bfhl", (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: "data must be an array" });
  }

  const { validEdges, invalidEntries } = parseEntries(data);

  res.json({
    valid_edges: validEdges,
    invalid_entries: invalidEntries,
  });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Hierarchy Analyzer API" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
