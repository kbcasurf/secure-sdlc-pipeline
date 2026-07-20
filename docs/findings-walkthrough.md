# Findings walkthrough

Every vulnerability in `app/` is planted on purpose so a specific pipeline stage
detects it. For each: where it lives, why it's a problem, which tool catches it,
and how you'd fix it.

---

## VULN-01 · Hardcoded credential (CWE-798)

- **Where:** `app/src/server.js` — `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`.
- **Caught by:** Gitleaks (secret scanning).
- **Why:** Secrets committed to source control leak through history, forks and
  clones — rotation is the only remedy once exposed.
- **Note:** the value used is AWS's official *example* key (`AKIA...EXAMPLE`), a
  documented placeholder, so the pattern is detected without exposing anything real.
- **Fix:** load secrets from the environment / a secrets manager (Vault, AWS
  Secrets Manager); never commit them. Add pre-commit secret scanning.

## VULN-02 · SQL injection (CWE-89)

- **Where:** `app/src/server.js` `GET /users`, sink in `app/src/db.js`.
- **Caught by:** Semgrep (SAST).
- **Why:** user input concatenated into a SQL string lets an attacker alter the
  query (data theft, auth bypass).
- **Fix:** parameterized queries / prepared statements — pass values separately
  from the query text.

## VULN-03 · OS command injection (CWE-78)

- **Where:** `app/src/server.js` `GET /ping` — `exec('ping -c 1 ' + host)`.
- **Caught by:** Semgrep (SAST).
- **Why:** input passed to a shell allows arbitrary command execution.
- **Fix:** use `execFile`/`spawn` with an argument array (no shell), and validate
  the input against an allowlist.

## VULN-04 · Weak password hashing (CWE-327)

- **Where:** `app/src/server.js` `POST /register` — unsalted MD5.
- **Caught by:** Semgrep (SAST).
- **Why:** MD5 is fast and broken for passwords; unsalted hashes fall to rainbow
  tables.
- **Fix:** use a slow, salted KDF — bcrypt, scrypt or Argon2.

## VULN-05 · Prototype pollution (CWE-1321)

- **Where:** `app/src/server.js` `POST /merge` — `_.merge(target, req.body)`.
- **Caught by:** Semgrep (SAST) + Trivy/SCA (the lodash version).
- **Why:** attacker-controlled keys like `__proto__` can pollute `Object.prototype`
  and change app behavior globally.
- **Fix:** upgrade lodash; avoid deep-merging untrusted input; use `Object.create(null)`
  or schema validation.

## VULN-06 · Vulnerable dependencies (CWE-1035)

- **Where:** `app/package.json` — `lodash@4.17.11`, `express@4.17.1`.
- **Caught by:** Trivy + `npm audit` (SCA); also surfaced in the SBOM.
- **Why:** known-vulnerable versions ship exploitable CVEs (e.g. lodash prototype
  pollution CVE-2019-10744).
- **Fix:** upgrade to patched versions; automate with Dependabot/Renovate; track
  components via the generated SBOM.

---

## Turning detection into a gate

By default these findings are **reported, not blocking** (see
[`../policies/README.md`](../policies/README.md)). To make any of them fail the
build, remove `continue-on-error` on that job (GitHub) / `allow_failure` (GitLab)
and set the tool's severity/exit-code threshold.
