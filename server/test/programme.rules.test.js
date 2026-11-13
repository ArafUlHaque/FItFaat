import { test } from "node:test";
import assert from "node:assert/strict";
import {
  estimateDayMinutes,
  estimateTemplateMinutes,
  findFailures,
  generateProgrammes,
} from "../src/modules/programmes/programme.rules.js";
import { EXERCISE_OPTIONS, PROGRAMME_TEMPLATES } from "../src/modules/programmes/templates.data.js";

const answers = (overrides = {}) => ({
  goal: "build_muscle",
  experience: "beginner",
  equipment: ["dumbbells", "bench"],
  daysPerWeek: 4,
  sessionMinutes: 45,
  ...overrides,
});

const byKey = (key) => PROGRAMME_TEMPLATES.find((t) => t.key === key);
const allExercises = (match) => match.schedule.flatMap((d) => d.exercises);

test("estimateDayMinutes: 5 min warm-up + (45 s + rest) per set, rounded up to 5", () => {
  // 300 + 3 * (45 + 60) = 615 s = 10.25 min -> 15
  assert.equal(estimateDayMinutes([{ sets: 3, restSeconds: 60 }]), 15);
  // 300 + 2 * (45 + 15) = 420 s = 7 min -> 10
  assert.equal(estimateDayMinutes([{ sets: 2, restSeconds: 15 }]), 10);
  assert.equal(estimateDayMinutes([]), 5);
});

test("every template has a sensible length and real exercise options", () => {
  for (const t of PROGRAMME_TEMPLATES) {
    const minutes = estimateTemplateMinutes(t);
    assert.ok(minutes >= 20 && minutes <= 90, `${t.key} takes ${minutes} min`);
    assert.ok(t.goals.length && t.levels.length, `${t.key} needs goals and levels`);
    for (const day of t.days) for (const slot of day.slots) assert.ok(slot.options.length, slot.pattern);
  }
});

test("matches are sorted by score, at most 3, and only the first is the best match", () => {
  const { matches, noFit } = generateProgrammes(PROGRAMME_TEMPLATES, answers());
  assert.equal(noFit, null);
  assert.ok(matches.length >= 1 && matches.length <= 3);
  assert.equal(matches[0].templateKey, "four-day-muscle-builder");
  assert.deepEqual(matches.map((m) => m.bestMatch), matches.map((_, i) => i === 0));
  for (let i = 1; i < matches.length; i++) assert.ok(matches[i - 1].score >= matches[i].score);
  assert.ok(matches[0].reasons.length >= 3);
});

test("programmes only use equipment the user has, including the swap options", () => {
  const usable = new Set(["dumbbells", "bench"]);
  const equipmentOf = new Map(
    Object.values(EXERCISE_OPTIONS).flat().map((o) => [o.exerciseId, o.equipment]),
  );
  const { matches } = generateProgrammes(PROGRAMME_TEMPLATES, answers());
  for (const match of matches) {
    for (const ex of allExercises(match)) {
      for (const id of [ex.exerciseId, ...ex.alternatives.map((a) => a.exerciseId)]) {
        assert.ok(equipmentOf.get(id).every((item) => usable.has(item)), `exercise ${id} needs other kit`);
      }
    }
  }
});

test("a bodyweight-only user gets bodyweight exercises", () => {
  const { matches } = generateProgrammes(
    PROGRAMME_TEMPLATES,
    answers({ goal: "lose_fat", experience: "intermediate", equipment: [], daysPerWeek: 3, sessionMinutes: 30 }),
  );
  assert.equal(matches[0].templateKey, "fat-loss-circuits");
  assert.ok(matches[0].reasons.some((r) => r.includes("bodyweight")));
});

test("templates needing more days or longer sessions than the user has are excluded", () => {
  const { matches } = generateProgrammes(PROGRAMME_TEMPLATES, answers({ daysPerWeek: 3, sessionMinutes: 40 }));
  for (const match of matches) {
    assert.ok(match.daysPerWeek <= 3);
    assert.ok(match.estimatedMinutes <= 40);
  }
});

test("findFailures names each rule a template breaks", () => {
  const rules = findFailures(byKey("push-pull-legs"), answers({ experience: "beginner", daysPerWeek: 3, equipment: [] }))
    .map((f) => f.rule);
  assert.deepEqual(rules, ["experience", "days", "equipment"]);
});

test("equipment suggestions ask for the smallest change", () => {
  const failure = findFailures(byKey("full-body-foundations"), answers({ equipment: [], daysPerWeek: 3 }))
    .find((f) => f.rule === "equipment");
  assert.equal(failure.suggestion, "add dumbbells to your equipment");
});

test("when no template fits, the result explains why and suggests changes", () => {
  const { matches, noFit } = generateProgrammes(
    PROGRAMME_TEMPLATES,
    answers({ equipment: [], daysPerWeek: 2, sessionMinutes: 30 }),
  );
  assert.deepEqual(matches, []);
  assert.ok(noFit.message);
  assert.ok(noFit.reasons.length >= 1);
  assert.ok(noFit.suggestions.some((s) => s.includes("train 3 days a week")));
});

test("with no templates at all, no-fit still has a suggestion", () => {
  const { noFit } = generateProgrammes([], answers());
  assert.equal(noFit.suggestions.length, 1);
});
