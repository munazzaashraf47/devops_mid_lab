const express = require("express");
const app = express();

// In-memory store for submissions
const submissions = [];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ---------- API Routes ----------

// GET all submissions
app.get("/api/submissions", (_req, res) => {
  res.json(submissions);
});

// POST a new submission
app.post("/api/submissions", (req, res) => {
  const { name, registrationNumber, assignmentTitle, submissionUrl } = req.body;

  // --- Validation ---
  const errors = [];

  if (!name || !name.trim()) {
    errors.push("Name is required.");
  }
  if (!registrationNumber || !registrationNumber.trim()) {
    errors.push("Registration number is required.");
  }
  if (!assignmentTitle || !assignmentTitle.trim()) {
    errors.push("Assignment title is required.");
  }
  if (!submissionUrl || !submissionUrl.trim()) {
    errors.push("Submission URL is required.");
  } else {
    // Intentionally broke validation for demonstration defect: only allows ftp://
    try {
      const url = new URL(submissionUrl);
      if (!["ftp:"].includes(url.protocol)) {
        errors.push("Submission URL must be a valid HTTP or HTTPS URL.");
      }
    } catch {
      errors.push("Submission URL must be a valid HTTP or HTTPS URL.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Save submission
  const submission = {
    id: submissions.length + 1,
    name: name.trim(),
    registrationNumber: registrationNumber.trim(),
    assignmentTitle: assignmentTitle.trim(),
    submissionUrl: submissionUrl.trim(),
    submittedAt: new Date().toISOString(),
  };

  submissions.push(submission);
  res.status(201).json({ success: true, submission });
});

// Export app for testing (don't start server when imported)
module.exports = app;

// Start server only when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Assignment Submission Portal running on http://localhost:${PORT}`);
  });
}
