#!/usr/bin/env node
/* English content integrity (plain node, vm sandbox): the ported Close Reading validator
   plus the bias suite (answer-length / rank / jargon tells) and the StudyQuest checks
   (near-duplicates, exact ported counts, CSS scoping, manifest, Layer C paths, no pay
   outside award()).   node tests/subjects/eng/validate.js */
require("./run.js").main(["validate", "bias"]).then(code => process.exit(code));
