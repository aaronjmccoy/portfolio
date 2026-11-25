<!-- Copy to .github/pull_request_template.md. Title: a Conventional Commit, such as "fix: reject expired tokens" (VC-1). -->

**Goal:** <one line>

**Done when:**

- <an observable criterion, checked by a named test or command>

**Check run:** `<command>` → <result>

**Not done, not verified or assumed:** <or "none">

- [ ] `check` passes locally and in CI (LP-5)
- [ ] Every new test asserts behaviour and maps to a criterion or a bug (TS-2, CH-3)
- [ ] No check was weakened: no skipped tests, raised limits or `--no-verify` (LP-6)
- [ ] Fewer than 400 changed lines, or the reason is stated (LP-9)
- [ ] Docs or `AGENTS.md` are updated if commands or conventions changed
