/**
 * Local Test Report Receiver
 * 
 * This HTTP server listens on port 9876 and receives test reports
 * from the CI pipeline. It saves each report as test-report.json.
 * 
 * Usage: node receiver/server.js
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.RECEIVER_PORT || 9876;
const REPORT_PATH = path.join(__dirname, "..", "test-report.json");

const server = http.createServer((req, res) => {
  // CORS headers for flexibility
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", message: "Receiver is running" }));
    return;
  }

  // Receive test report
  if (req.method === "POST" && req.url === "/report") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const report = JSON.parse(body);

        // Pretty-print and save to file
        fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");

        console.log("\n========================================");
        console.log("  TEST REPORT RECEIVED & SAVED");
        console.log("========================================");
        console.log(`  Repository : ${report.repository}`);
        console.log(`  Branch     : ${report.branch}`);
        console.log(`  Commit     : ${report.commitSha}`);
        console.log(`  Run ID     : ${report.pipelineRunId}`);
        console.log(`  Timestamp  : ${report.timestamp}`);
        console.log(`  Status     : ${report.overallStatus}`);
        console.log(`  Total      : ${report.summary.total}`);
        console.log(`  Passed     : ${report.summary.passed}`);
        console.log(`  Failed     : ${report.summary.failed}`);
        console.log(`  Saved to   : ${REPORT_PATH}`);
        console.log("========================================\n");

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Report saved as test-report.json",
          })
        );
      } catch (err) {
        console.error("Error processing report:", err.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Invalid JSON payload" })
        );
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`\n📡 Test Report Receiver listening on http://localhost:${PORT}`);
  console.log(`   POST /report  → saves test-report.json`);
  console.log(`   GET  /health  → health check\n`);
});
