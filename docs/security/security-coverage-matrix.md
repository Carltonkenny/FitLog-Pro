# Security coverage matrix

Counts are from `security-test-cases.json`. "Passed" means the test ran in this session and passed. This is not a claim that the area is fully covered or secure.

| Area | Cases | Automated | Passed | Failed | Blocked | Manual / other |
|---|---|---|---|---|---|---|
| AUTH (authentication) | 12 | 7 | 7 | 0 | 5 | 0 |
| AUTHZ (authorization) | 6 | 6 | 6 | 0 | 0 | 0 |
| ERR (error handling) | 1 | 1 | 1 | 0 | 0 | 0 |
| CORS (configuration) | 1 | 1 | 1 | 0 | 0 | 0 |
| HEALTH (availability) | 1 | 1 | 1 | 0 | 0 | 0 |
| RATE (rate limiting) | 8 | 7 | 7 | 0 | 1 | 0 |
| CONFIG (configuration) | 6 | 6 | 6 | 0 | 0 | 0 |
| INJECT (injection) | 3 | 3 | 3 | 0 | 0 | 0 |
| VALID (input validation) | 5 | 5 | 5 | 0 | 0 | 0 |
| CSRF (CSRF) | 1 | 0 | 0 | 0 | 0 | 1 |
| HDR (HDR) | 1 | 0 | 0 | 0 | 1 | 0 |
| DEP (DEP) | 1 | 1 | 0 | 1 | 0 | 0 |
| **Total** | **46** | **38** | **37** | **1** | **7** | **1** |

"Passed (mock only)" rows count as passed but use a mocked auth server or API.
