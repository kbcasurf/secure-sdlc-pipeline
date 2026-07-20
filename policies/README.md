# Policies & quality gates

Configuration that governs how strict each pipeline stage is. Keeping the gate
config in one place makes the "report vs. block" decision explicit and reviewable.

| File | Governs | How to make it blocking |
|---|---|---|
| `gitleaks.toml` | Secret scanning | Remove `continue-on-error` on the `secrets` job |
| `zap-rules.tsv` | DAST (ZAP baseline) | Change a rule's action from `WARN` to `FAIL` |
| — (inline) | SAST / SCA / IaC severity | Drop `continue-on-error` and set tool `--severity` / `--exit-code` |

## Gate philosophy

This demo runs every scanner in **report mode** (`continue-on-error: true`,
`allow_failure: true`, ZAP `WARN`) so findings are visible without failing every
run of an app that is vulnerable by design. In a real project you promote the
controls you trust to **blocking** incrementally — usually starting with secret
detection and critical-severity SCA, which have the lowest false-positive rates.
