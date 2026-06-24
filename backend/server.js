const express = require("express");
const cors = require("cors");
const { buildGraph, findRoots, findDisconnectedGroups } = require("./graph");

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
  const duplicateEdges = [];
  const seen = new Set();
  const childToParent = {};

  for (const raw of data) {
    const trimmed = raw.trim();
    if (trimmed === "" || !isValidEdge(trimmed)) {
      invalidEntries.push(raw);
    } else {
      const [parent, child] = trimmed.split("->");
      if (parent === child) {
        invalidEntries.push(raw);
      } else {
        const key = `${parent}->${child}`;
        if (seen.has(key)) {
          if (!duplicateEdges.includes(key)) {
            duplicateEdges.push(key);
          }
        } else if (childToParent[child]) {
          // Child already has a parent, discard this edge
        } else {
          seen.add(key);
          childToParent[child] = parent;
          validEdges.push({ parent, child });
        }
      }
    }
  }

  return { validEdges, invalidEntries, duplicateEdges };
}

app.post("/bfhl", (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: "data must be an array" });
  }

  const { validEdges, invalidEntries, duplicateEdges } = parseEntries(data);
  const { adjacency, allNodes, parentNodes, childNodes } = buildGraph(validEdges);
  const roots = findRoots(allNodes, childNodes);
  const groups = findDisconnectedGroups(validEdges);

  res.json({
    valid_edges: validEdges,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    graph: { adjacency, allNodes: [...allNodes], parentNodes: [...parentNodes], childNodes: [...childNodes], roots },
    groups,
  });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Hierarchy Analyzer API" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
