const express = require("express");
const cors = require("cors");
const { buildGraph, findRoots, findGroupRoots, findDisconnectedGroups, buildTree, calculateDepth } = require("./graph");

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);
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

function generateSummary(hierarchies) {
  let totalTrees = 0;
  let totalCycles = 0;
  let largestTreeRoot = null;
  let maxDepth = 0;

  for (const h of hierarchies) {
    if (h.has_cycle) {
      totalCycles++;
    } else {
      totalTrees++;
      if (h.depth > maxDepth || (h.depth === maxDepth && h.root < largestTreeRoot)) {
        maxDepth = h.depth;
        largestTreeRoot = h.root;
      }
    }
  }

  return {
    total_trees: totalTrees,
    total_cycles: totalCycles,
    largest_tree_root: largestTreeRoot,
  };
}

app.post("/bfhl", (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: "data must be an array" });
  }

  const { validEdges, invalidEntries, duplicateEdges } = parseEntries(data);
  const groups = findDisconnectedGroups(validEdges);

  const hierarchies = groups.map((group) => {
    const root = group.roots[0];

    if (group.has_cycle) {
      return { root, tree: {}, has_cycle: true };
    }

    const tree = buildTree(group.edges, root);
    const depth = calculateDepth(group.edges, root);

    return { root, tree, depth };
  });

  const summary = generateSummary(hierarchies);

  res.json({
    user_id: "kanavkumar_08092004",
    email_id: "kanav2111.be23@chitkara.edu.in",
    college_roll_number: "2310992111",
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary,
  });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Hierarchy Analyzer API" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL;
const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000;

if (KEEP_ALIVE_URL) {
  setInterval(async () => {
    try {
      const res = await fetch(KEEP_ALIVE_URL);
      console.log(`[Keep-Alive] Pinged at ${new Date().toISOString()} - Status: ${res.status}`);
    } catch (err) {
      console.error(`[Keep-Alive] Error: ${err.message}`);
    }
  }, KEEP_ALIVE_INTERVAL);
  console.log(`[Keep-Alive] Monitoring started for ${KEEP_ALIVE_URL}`);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
