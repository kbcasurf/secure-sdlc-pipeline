'use strict';

/*
 * INTENTIONALLY VULNERABLE demo application.
 * -----------------------------------------------------------------------------
 * This service exists ONLY to give the security scanners in the CI pipeline
 * something real to detect. Every planted issue is tagged `// [VULN-xx]` and
 * documented in ../../docs/findings-walkthrough.md (with CWE / OWASP mapping
 * and the fix). DO NOT DEPLOY THIS.
 */

const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');
const _ = require('lodash');
const { getUserByName } = require('./db');

const app = express();
app.use(express.json());

// [VULN-01] Hardcoded credential (CWE-798). AWS's official *example* key — a
// documented placeholder, not a real secret — so Gitleaks flags the pattern
// without exposing any live credential.
const AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// [VULN-02] SQL injection (CWE-89): user input concatenated straight into a query.
app.get('/users', (req, res) => {
  const query = "SELECT * FROM users WHERE name = '" + req.query.name + "'";
  getUserByName(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// [VULN-03] OS command injection (CWE-78): user input passed to a shell.
app.get('/ping', (req, res) => {
  exec('ping -c 1 ' + req.query.host, (err, stdout) => {
    if (err) return res.status(500).json({ error: err.message });
    res.type('text/plain').send(stdout);
  });
});

// [VULN-04] Weak hashing (CWE-327): MD5 for passwords, unsalted.
app.post('/register', (req, res) => {
  const hash = crypto.createHash('md5').update(req.body.password || '').digest('hex');
  res.json({ user: req.body.username, passwordHash: hash });
});

// [VULN-05] Prototype pollution sink (CWE-1321) via vulnerable lodash.merge.
app.post('/merge', (req, res) => {
  const target = {};
  _.merge(target, req.body);
  res.json(target);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`vulnerable demo app listening on :${PORT}`));

module.exports = app;
