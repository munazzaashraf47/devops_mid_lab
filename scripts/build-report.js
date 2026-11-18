const fs = require('fs');

function buildReport() {
  let results = { testResults: [] };
  if (fs.existsSync('test-results.json')) {
    try {
      results = JSON.parse(fs.readFileSync('test-results.json', 'utf-8'));
    } catch (e) {
      console.error('Failed to parse test-results.json:', e);
    }
  }

  const tests = [];
  if (Array.isArray(results.testResults)) {
    for (const suite of results.testResults) {
      // In Jest JSON output, each suite contains assertionResults
      const assertions = suite.assertionResults || suite.testResults || [];
      for (const t of assertions) {
        tests.push({
          name: t.fullName || t.title,
          result: t.status === 'passed' ? 'passed' : 'failed',
          failureMessage: (t.failureMessages && t.failureMessages.length > 0)
            ? t.failureMessages.join('\n')
            : null
        });
      }
    }
  }

  const passed = tests.filter(t => t.result === 'passed').length;
  const failed = tests.filter(t => t.result === 'failed').length;

  const report = {
    repository: process.env.GITHUB_REPOSITORY || 'munazzaashraf47/devops_mid_lab',
    branch: process.env.GITHUB_REF_NAME || 'main',
    commitSha: process.env.GITHUB_SHA || 'manual',
    pipelineRunId: process.env.GITHUB_RUN_ID || '1',
    timestamp: new Date().toISOString(),
    tests: tests,
    summary: {
      total: tests.length,
      passed: passed,
      failed: failed
    },
    overallStatus: (failed === 0 && tests.length > 0) ? 'PASSED' : 'FAILED'
  };

  fs.writeFileSync('test-report-payload.json', JSON.stringify(report, null, 2));
  console.log('Successfully generated test-report-payload.json:');
  console.log(JSON.stringify(report, null, 2));
}

buildReport();
