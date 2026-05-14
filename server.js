const express = require("express");
const https   = require("https");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;
const FUB_KEY = process.env.FUB_API_KEY || "";

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/fub", (req, res) => {
  const endpoint = req.query.endpoint || "/people";
  const params   = new URLSearchParams(req.query);
  params.delete("endpoint");
  const qs = params.toString();
  const options = {
    hostname: "api.followupboss.com",
    path: `/v1${endpoint}${qs ? "?" + qs : ""}`,
    method: "GET",
    headers: {
      "Authorization": "Basic " + Buffer.from(FUB_KEY + ":").toString("base64"),
      "Content-Type": "application/json",
      "X-System": "DewClawMarket",
      "X-System-Key": FUB_KEY,
    },
  };
  const proxyReq = https.request(options, (proxyRes) => {
    res.setHeader("Content-Type", "application/json");
    proxyRes.pipe(res);
  });
  proxyReq.on("error", (e) => res.status(500).json({ error: e.message }));
  proxyReq.end();
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`DewClaw Market Dashboard running on port ${PORT}`);
  if (!FUB_KEY) console.warn("WARNING: FUB_API_KEY not set");
});
