const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "votes.json";

function loadVotes() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function saveVotes(votes) {
  fs.writeFileSync(FILE, JSON.stringify(votes, null, 2));
}

// отдаём HTML по корню
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "voting.html"));
});

app.post("/vote", (req, res) => {
  let votes = loadVotes();
  votes.push(req.body);
  saveVotes(votes);
  res.json({status: "ok"});
});

app.get("/results", (req, res) => {
  res.json(loadVotes());
});

app.delete("/votes", (req, res) => {
  saveVotes([]);
  res.json({status: "cleared"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
