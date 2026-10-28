# Database coverage matrix

Counts are from `database-test-cases.json`. "Passed" means the test ran in this session and passed. This is not a claim that the area is fully covered or secure.

| Area | Cases | Automated | Passed | Failed | Blocked | Manual / other |
|---|---|---|---|---|---|---|
| SCHEMA (schema/constraints) | 9 | 9 | 9 | 0 | 0 | 0 |
| DELETE (deletion/cascade) | 2 | 2 | 2 | 0 | 0 | 0 |
| WORKOUT (workout persistence) | 10 | 10 | 8 | 0 | 0 | 2 |
| BULK (bulk insert) | 5 | 5 | 5 | 0 | 0 | 0 |
| TXN (transactions) | 5 | 5 | 5 | 0 | 0 | 0 |
| PERF (query performance) | 2 | 2 | 2 | 0 | 0 | 0 |
| CONCURRENCY (concurrency) | 3 | 2 | 1 | 0 | 2 | 0 |
| MIGRATE (MIGRATE) | 1 | 1 | 0 | 0 | 0 | 1 |
| NEON (NEON) | 2 | 0 | 0 | 0 | 2 | 0 |
| **Total** | **39** | **36** | **32** | **0** | **4** | **3** |

"Passed (mock only)" rows count as passed but use a mocked auth server or API.
