# Vulnerable demo app

⚠️ **Intentionally insecure. Do not deploy.** This tiny Express service exists so
the pipeline's scanners have real issues to detect. Each planted flaw is tagged
`// [VULN-xx]` in the source and explained in
[`../docs/findings-walkthrough.md`](../docs/findings-walkthrough.md).

## Inventory of planted vulnerabilities

| Tag | Location | Class | CWE | Caught by |
|---|---|---|---|---|
| VULN-01 | `src/server.js` | Hardcoded credential | CWE-798 | Gitleaks (secrets) |
| VULN-02 | `src/server.js`, `src/db.js` | SQL injection | CWE-89 | Semgrep (SAST) |
| VULN-03 | `src/server.js` | OS command injection | CWE-78 | Semgrep (SAST) |
| VULN-04 | `src/server.js` | Weak hash (MD5) | CWE-327 | Semgrep (SAST) |
| VULN-05 | `src/server.js` + `package.json` | Prototype pollution | CWE-1321 | Semgrep + Trivy/SCA |
| VULN-06 | `package.json` | Vulnerable dependencies (lodash 4.17.11, express 4.17.1) | CWE-1035 | Trivy + `npm audit` (SCA) |

## Run

```bash
npm install
npm start            # http://localhost:3000
# or, from the repo root:
docker compose up --build
```

## Endpoints (for DAST / manual review)

- `GET  /health`                 — liveness
- `GET  /users?name=<x>`         — VULN-02 (SQLi sink)
- `GET  /ping?host=<x>`          — VULN-03 (command injection sink)
- `POST /register {username,password}` — VULN-04 (MD5)
- `POST /merge   {...}`          — VULN-05 (prototype pollution sink)
