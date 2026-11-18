const request = require("supertest");
const app = require("../server");

describe("Assignment Submission Portal", () => {
  // Test 1: Complete details and a valid submission URL → saved successfully
  test("should save submission with complete details and valid URL", async () => {
    const submission = {
      name: "Ahmed Khan",
      registrationNumber: "SP22-BSE-001",
      assignmentTitle: "DevOps Lab Mid",
      submissionUrl: "https://github.com/ahmed/devops-lab",
    };

    const res = await request(app)
      .post("/api/submissions")
      .send(submission)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.submission).toMatchObject({
      name: "Ahmed Khan",
      registrationNumber: "SP22-BSE-001",
      assignmentTitle: "DevOps Lab Mid",
      submissionUrl: "https://github.com/ahmed/devops-lab",
    });

    // Verify it appears in the submissions list
    const listRes = await request(app).get("/api/submissions").expect(200);
    const found = listRes.body.find(
      (s) => s.registrationNumber === "SP22-BSE-001"
    );
    expect(found).toBeDefined();
  });

  // Test 2: Missing registration number → rejected with validation message
  test("should reject submission with missing registration number", async () => {
    const submission = {
      name: "Sara Ali",
      registrationNumber: "",
      assignmentTitle: "DevOps Assignment",
      submissionUrl: "https://github.com/sara/assignment",
    };

    const res = await request(app)
      .post("/api/submissions")
      .send(submission)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain("Registration number is required.");
  });

  // Test 3: Invalid submission URL → rejected and not saved
  test("should reject submission with invalid URL and not save it", async () => {
    const submission = {
      name: "Ali Hassan",
      registrationNumber: "SP22-BSE-003",
      assignmentTitle: "Cloud Computing Lab",
      submissionUrl: "not-a-valid-url",
    };

    const res = await request(app)
      .post("/api/submissions")
      .send(submission)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain(
      "Submission URL must be a valid HTTP or HTTPS URL."
    );

    // Verify it was NOT saved
    const listRes = await request(app).get("/api/submissions").expect(200);
    const found = listRes.body.find(
      (s) => s.registrationNumber === "SP22-BSE-003"
    );
    expect(found).toBeUndefined();
  });
});
