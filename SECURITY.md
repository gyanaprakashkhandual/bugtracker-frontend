# Security Policy

## Scope

This policy applies to the **CapTest (CA50EST)** frontend repository and all connected services, including the Capitus Tracker VS Code extension and the CapTest backend APIs.

---

## Sensitive Assets

This repository is connected to proprietary backend services that handle:

- User authentication and session tokens
- Project and bug data via internal REST APIs
- AI-generated test case and bug report pipelines
- VS Code extension communication endpoints

**These assets are strictly confidential.** Extracting, accessing, replicating, or interacting with any API endpoint, authentication token, or service URL found in this codebase — for any purpose outside of authorized access — is unauthorized and illegal.

---

## Reporting a Security Issue

If you discover a vulnerability, exposed credential, or unintended data exposure within this repository or any connected service, please report it responsibly.

**Do not open a public GitHub issue for security concerns.**

Contact the repository owner directly via GitHub: [@gyanaprakashkhandual](https://github.com/gyanaprakashkhandual)

Please include:
- A clear description of the vulnerability or exposure
- Steps to reproduce or supporting evidence
- Your assessment of the potential impact

All reports will be reviewed and addressed promptly and confidentially.

---

## Responsible Disclosure

We ask that you:

- Allow a reasonable period to investigate and resolve the issue before any public disclosure.
- Do not access, modify, exfiltrate, or distribute any data beyond what is needed to demonstrate the concern.
- Act in good faith and within ethical boundaries throughout the process.

Responsible reporters will be acknowledged privately.
