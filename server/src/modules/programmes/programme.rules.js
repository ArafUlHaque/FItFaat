import { EQUIPMENT, GOALS, LEVELS } from "./programme.constants.js";

/*
 * Programme generator rules (requirement 4.7)
 * ---------------------------------------------
 * A template is a candidate only if ALL of these are true:
 *   1. Goal        the template lists the user's goal.
 *   2. Experience  the template lists the user's experience level.
 *   3. Days        it needs no more training days than the user has.
 *   4. Time        its longest session fits in the user's session length.
 *   5. Equipment   every exercise slot has at least one option the user can do
 *                  with their equipment (bodyweight is always available).
 *
 * Candidates are scored out of 100:
 *   Goal       40 if it is the template's main goal, otherwise 25
 *   Days       30 if it uses all the user's days, 20 if one fewer, otherwise 10
 *   Time       20 if it uses the session to within 15 min, 12 within 30, otherwise 5
 *   Equipment  10 if every slot gets its first-choice exercise, otherwise 5
 *
 * The top 3 are returned, best first. If none qualify, the result explains
 * which rules ruled the templates out and suggests answer changes that would help.
 *
 * Session length estimate: 5 min warm-up + every set takes 45 s of work plus
 * its rest, rounded up to the next 5 minutes.
 *
 * All functions here are pure (no database, no network) so they are easy to test.
 */

const WARM_UP_SECONDS = 5 * 60;
const WORK_SECONDS_PER_SET = 45;
const MAX_MATCHES = 3;

// Rules the user could change by giving a different answer.
// (We don't suggest changing goal or experience: those should stay honest.)
const CHANGEABLE_RULES = ["days", "time", "equipment"];

export function estimateDayMinutes(slots) {
  const seconds = slots.reduce(
    (total, s) => total + s.sets * (WORK_SECONDS_PER_SET + s.restSeconds),
    WARM_UP_SECONDS,
  );
  return Math.ceil(seconds / 60 / 5) * 5;
}

export function estimateTemplateMinutes(template) {
  return Math.max(...template.days.map((d) => estimateDayMinutes(d.slots)));
}

function canUseWith(equipmentSet) {
  return (option) => option.equipment.every((item) => equipmentSet.has(item));
}

// ["a", "b", "c"] -> "a, b and c"
function joinWithAnd(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function listLabels(keys) {
  return joinWithAnd(keys.map((k) => EQUIPMENT[k] || k));
}

// Check one template against the answers. Returns a list of failed rules;
// an empty list means the template is a candidate.
export function findFailures(template, answers) {
  const failures = [];
  const daysNeeded = template.days.length;
  const minutesNeeded = estimateTemplateMinutes(template);

  if (!template.goals.includes(answers.goal)) {
    failures.push({ rule: "goal" });
  }
  if (!template.levels.includes(answers.experience)) {
    failures.push({ rule: "experience" });
  }
  if (daysNeeded > answers.daysPerWeek) {
    failures.push({ rule: "days", suggestion: `train ${daysNeeded} days a week` });
  }
  if (minutesNeeded > answers.sessionMinutes) {
    failures.push({ rule: "time", suggestion: `allow ${minutesNeeded} minutes per session` });
  }

  const missing = missingEquipment(template, answers.equipment);
  if (missing.length) {
    failures.push({ rule: "equipment", suggestion: `add ${listLabels(missing)} to your equipment` });
  }

  return failures;
}

// Which equipment would the user need to add so every slot has an option?
// Returns [] when they already have enough.
function missingEquipment(template, equipment) {
  const has = new Set(equipment);
  const canUse = canUseWith(has);
  const blocked = template.days.flatMap((d) => d.slots).filter((s) => !s.options.some(canUse));
  if (!blocked.length) return [];

  // 1. Is there one item that unlocks every blocked slot? Suggest just that.
  const single = Object.keys(EQUIPMENT).find((item) => {
    const canUseWithItem = canUseWith(new Set([...has, item]));
    return blocked.every((s) => s.options.some(canUseWithItem));
  });
  if (single) return [single];

  // 2. Otherwise, slot by slot, pick the option needing the fewest new items.
  const missing = new Set();
  for (const slot of blocked) {
    const cheapest = slot.options
      .map((o) => o.equipment.filter((item) => !has.has(item) && !missing.has(item)))
      .sort((a, b) => a.length - b.length)[0];
    cheapest.forEach((item) => missing.add(item));
  }
  return [...missing];
}

// Turn a template into a concrete weekly schedule for this user's equipment.
export function buildSchedule(template, equipment) {
  const canUse = canUseWith(new Set(equipment));
  let allFirstChoice = true;
  const usedEquipment = new Set();

  const schedule = template.days.map((day) => ({
    weekday: day.weekday,
    title: day.title,
    exercises: day.slots.map((slot) => {
      const [chosen, ...others] = slot.options.filter(canUse);
      if (chosen !== slot.options[0]) allFirstChoice = false;
      chosen.equipment.forEach((item) => usedEquipment.add(item));
      return {
        pattern: slot.pattern,
        exerciseId: chosen.exerciseId,
        name: chosen.name,
        sets: slot.sets,
        reps: slot.reps,
        restSeconds: slot.restSeconds,
        alternatives: others.map((o) => ({ exerciseId: o.exerciseId, name: o.name })),
      };
    }),
  }));

  return { schedule, allFirstChoice, usedEquipment: [...usedEquipment] };
}

export function scoreTemplate(template, answers, allFirstChoice) {
  const spareDays = answers.daysPerWeek - template.days.length;
  const spareMinutes = answers.sessionMinutes - estimateTemplateMinutes(template);

  const goal = template.goals[0] === answers.goal ? 40 : 25;
  const days = spareDays === 0 ? 30 : spareDays === 1 ? 20 : 10;
  const time = spareMinutes <= 15 ? 20 : spareMinutes <= 30 ? 12 : 5;
  const equipment = allFirstChoice ? 10 : 5;
  return goal + days + time + equipment;
}

// The "Why this programme" sentences.
export function explainMatch(template, answers, usedEquipment) {
  const goalLabel = GOALS[answers.goal];
  const daysNeeded = template.days.length;
  const minutes = estimateTemplateMinutes(template);

  return [
    template.goals[0] === answers.goal
      ? `Designed to help you ${goalLabel}.`
      : `Also suits your goal to ${goalLabel}.`,
    `Suitable for your ${LEVELS[answers.experience]} experience level.`,
    daysNeeded === answers.daysPerWeek
      ? `Uses all ${daysNeeded} of your training days.`
      : `Uses ${daysNeeded} of your ${answers.daysPerWeek} available days, leaving time to rest.`,
    `Sessions take about ${minutes} minutes, within your ${answers.sessionMinutes} minutes.`,
    usedEquipment.length
      ? `Uses only equipment you have: ${listLabels(usedEquipment)}.`
      : "Needs no equipment: every exercise uses your bodyweight.",
  ];
}

const NO_FIT_REASONS = {
  goal: (n, a) => `${n} not designed to ${GOALS[a.goal]}`,
  experience: (n, a) => `${n} not suited to ${LEVELS[a.experience]} lifters`,
  days: (n, a) => `${n} more than ${a.daysPerWeek} training days a week`,
  time: (n, a) => `${n} sessions longer than ${a.sessionMinutes} minutes`,
  equipment: (n) => `${n} equipment you don't have`,
};

function countTemplates(count, rule) {
  const plural = count === 1 ? "template is" : "templates are";
  const pluralNeed = count === 1 ? "template needs" : "templates need";
  return ["goal", "experience"].includes(rule) ? `${count} ${plural}` : `${count} ${pluralNeed}`;
}

function explainNoFit(evaluated, answers) {
  const reasons = Object.keys(NO_FIT_REASONS)
    .map((rule) => {
      const count = evaluated.filter((e) => e.failures.some((f) => f.rule === rule)).length;
      return count ? NO_FIT_REASONS[rule](countTemplates(count, rule), answers) + "." : null;
    })
    .filter(Boolean);

  // Templates that only fail rules the user can change, fewest changes first.
  const suggestions = evaluated
    .filter((e) => e.failures.every((f) => CHANGEABLE_RULES.includes(f.rule)))
    .sort((a, b) => a.failures.length - b.failures.length)
    .slice(0, MAX_MATCHES)
    .map((e) => {
      const changes = joinWithAnd(e.failures.map((f) => f.suggestion));
      return `To use ${e.template.name}, ${changes}.`;
    });

  return {
    message: "No programme template fits all of your answers.",
    reasons,
    suggestions: suggestions.length
      ? suggestions
      : ["No template is designed for this goal and experience level yet. Try a different goal."],
  };
}

// Main entry point: templates from the database + validated quiz answers.
export function generateProgrammes(templates, answers) {
  const evaluated = templates.map((template) => ({
    template,
    failures: findFailures(template, answers),
  }));

  const matches = evaluated
    .filter((e) => e.failures.length === 0)
    .map(({ template }) => {
      const { schedule, allFirstChoice, usedEquipment } = buildSchedule(template, answers.equipment);
      return {
        templateKey: template.key,
        name: template.name,
        description: template.description,
        score: scoreTemplate(template, answers, allFirstChoice),
        daysPerWeek: template.days.length,
        estimatedMinutes: estimateTemplateMinutes(template),
        reasons: explainMatch(template, answers, usedEquipment),
        schedule,
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, MAX_MATCHES)
    .map((match, index) => ({ ...match, bestMatch: index === 0 }));

  return {
    matches,
    noFit: matches.length ? null : explainNoFit(evaluated, answers),
  };
}

// Short version of a template for GET /programmes/templates.
export function toTemplateSummary(template) {
  return {
    key: template.key,
    name: template.name,
    description: template.description,
    goals: template.goals,
    levels: template.levels,
    daysPerWeek: template.days.length,
    estimatedMinutes: estimateTemplateMinutes(template),
    days: template.days.map((d) => ({
      weekday: d.weekday,
      title: d.title,
      exerciseCount: d.slots.length,
    })),
  };
}
