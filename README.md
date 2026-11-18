# 📚 Assignment Submission Portal

> **DevOps Lab Mid — CSC418: DevOps for Cloud Computing**  
> COMSATS University Islamabad, Attock Campus  
> Instructor: Mr. Babar Shazad

A web-based assignment submission portal with CI/CD pipeline, automated testing, local report delivery, GitHub Pages deployment, and email notifications.

---

## 📁 Project Structure

```
├── server.js                    # Express application (API + static files)
├── public/
│   └── index.html               # Frontend UI
├── tests/
│   └── submission.test.js       # Jest + Supertest automated tests
├── receiver/
│   └── server.js                # Local HTTP receiver for test reports
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD pipeline
├── package.json
├── .gitignore
└── README.md
```

---

## 🚀 How to Run the Application

### Prerequisites
- **Node.js** v18+ and **npm**

### Install & Start

```bash
# Install dependencies
npm install

# Start the portal
npm start
```

The portal runs at **http://localhost:3000**

### Features
- Enter student **name**, **registration number**, **assignment title**, and **submission URL**
- Form validates all required fields and URL format
- Valid submissions are saved and displayed in a table
- Beautiful responsive UI with gradient theme

---

## 🧪 How to Execute Tests

```bash
# Run tests
npm test

# Run tests with JSON output (used by CI)
npm run test:ci
```

### Test Cases

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 1 | Complete details + valid URL | Submission saved & appears in list |
| 2 | Missing registration number | Rejected with validation message |
| 3 | Invalid submission URL | Rejected and not saved |

---

## 📡 How to Start the Local Report Receiver

The receiver is a lightweight HTTP server that accepts test reports from the CI pipeline and saves them as `test-report.json`.

```bash
# Start the receiver
node receiver/server.js
```

The receiver runs at **http://localhost:9876**

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/report` | Receives and saves test report JSON |
| `GET` | `/health` | Health check |

### Exposing to GitHub Actions (Tunnel)

Since GitHub Actions runners can't reach your localhost, use a tunnel:

#### Option A: ngrok
```bash
# Install ngrok and authenticate
ngrok http 9876
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

#### Option B: localtunnel
```bash
npx localtunnel --port 9876
```

Then set the tunnel URL as a GitHub repository secret:
- **Secret name:** `RECEIVER_URL`
- **Secret value:** `https://your-tunnel-url` (no trailing slash)

---

## ⚙️ CI/CD Pipeline

The pipeline (`.github/workflows/ci.yml`) runs on **every push** to any branch:

### Pipeline Stages

1. **Checkout** → Clones the repository
2. **Setup Node.js** → Installs Node.js v20
3. **Install Dependencies** → `npm ci`
4. **Run Tests** → Executes Jest tests with JSON output
5. **Build Report** → Creates structured test report with metadata
6. **Send to Receiver** → POSTs report to your local receiver via tunnel
7. **Send Email** → Emails the report (if configured)
8. **Upload Artifact** → Saves report as GitHub Actions artifact
9. **Check Results** → Fails the pipeline if any test failed

### Deploy Stage (Bonus)
- Runs **only on `main` branch** and **only if all tests pass**
- Deploys `public/` to **GitHub Pages**

---

## 🎁 Bonus: GitHub Pages Deployment

After all tests pass on the `main` branch, the static frontend is automatically deployed to GitHub Pages.

### Setup
1. Go to repo **Settings → Pages**
2. Set Source to **GitHub Actions**

The deployed URL will be: `https://<username>.github.io/<repo-name>/`

---

## 📧 Bonus: Email Report

The pipeline can email test reports automatically.

### Setup Gmail Secrets

Go to repo **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|--------|-------|
| `EMAIL_TO` | Recipient email |
| `EMAIL_FROM` | Sender Gmail address |
| `EMAIL_PASSWORD` | Gmail App Password ([generate here](https://myaccount.google.com/apppasswords)) |
| `SMTP_HOST` | `smtp.gmail.com` (optional, default) |
| `SMTP_PORT` | `587` (optional, default) |

---

## 🎬 Demonstration Workflow

### 1. Passing Run
```bash
git add .
git commit -m "feat: complete submission portal"
git push origin main
```
→ All 3 tests pass ✅ → Report saved to `test-report.json` → Deployed to Pages

### 2. Failing Run (Introduce Defect)
Edit `server.js` — remove URL validation:
```javascript
// Comment out or remove the URL validation block
```
```bash
git add .
git commit -m "break: remove URL validation"
git push origin main
```
→ Test 3 fails ❌ → Report shows failure → Pages NOT updated

### 3. Fix and Pass Again
Restore the URL validation:
```bash
git add .
git commit -m "fix: restore URL validation"
git push origin main
```
→ All 3 tests pass ✅ → Report updated → Pages redeployed

---

## 📊 Test Report Format (`test-report.json`)

```json
{
  "repository": "username/repo-name",
  "branch": "main",
  "commitSha": "abc1234...",
  "pipelineRunId": "12345678",
  "timestamp": "2026-10-26T10:00:00.000Z",
  "tests": [
    {
      "name": "should save submission with complete details and valid URL",
      "result": "passed",
      "failureMessage": null
    }
  ],
  "summary": {
    "total": 3,
    "passed": 3,
    "failed": 0
  },
  "overallStatus": "PASSED"
}
```
