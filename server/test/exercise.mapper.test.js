import { test } from "node:test";
import assert from "node:assert/strict";
import {
  htmlToParagraphs,
  pickTranslation,
  toExerciseDetail,
  toExerciseSummary,
} from "../src/modules/exercises/exercise.mapper.js";

// A trimmed-down copy of a real wger /exerciseinfo/ result.
const wgerExercise = {
  id: 73,
  category: { id: 11, name: "Chest" },
  muscles: [{ id: 4, name: "Pectoralis major", name_en: "Chest" }],
  muscles_secondary: [{ id: 5, name: "Triceps brachii", name_en: "" }],
  equipment: [{ id: 1, name: "Barbell" }, { id: 8, name: "Bench" }],
  images: [
    { image: "https://wger.de/media/a.png", is_main: false },
    { image: "https://wger.de/media/main.png", is_main: true },
  ],
  videos: [{ video: "https://wger.de/media/v.mp4" }],
  license: { short_name: "CC-BY-SA 4", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
  license_author: "someone",
  translations: [
    { language: 7, name: "Supino", description: "<p>pt</p>" },
    { language: 2, name: "Bench Press", description: "<p>Lie on the bench.</p>\n<p>Press &amp; lower.</p>" },
  ],
};

test("pickTranslation prefers English and falls back to the first", () => {
  assert.equal(pickTranslation(wgerExercise.translations).name, "Bench Press");
  assert.equal(pickTranslation([{ language: 7, name: "Supino" }]).name, "Supino");
  assert.equal(pickTranslation([]), null);
});

test("htmlToParagraphs strips tags and decodes entities", () => {
  assert.deepEqual(htmlToParagraphs("<p>One</p><p>Two &amp; three</p>"), ["One", "Two & three"]);
  assert.deepEqual(htmlToParagraphs("<ul><li>A</li><li>B</li></ul>"), ["A", "B"]);
  assert.deepEqual(htmlToParagraphs(""), []);
});

test("toExerciseSummary returns the short English shape", () => {
  assert.deepEqual(toExerciseSummary(wgerExercise), {
    id: 73,
    name: "Bench Press",
    category: "Chest",
    muscles: ["Chest"],
    equipment: ["Barbell", "Bench"],
    imageUrl: "https://wger.de/media/main.png",
  });
});

test("toExerciseDetail includes instructions, media and attribution", () => {
  const detail = toExerciseDetail(wgerExercise);
  assert.deepEqual(detail.instructions, ["Lie on the bench.", "Press & lower."]);
  assert.deepEqual(detail.musclesSecondary, ["Triceps brachii"]); // empty name_en falls back
  assert.equal(detail.images.length, 2);
  assert.deepEqual(detail.videos, ["https://wger.de/media/v.mp4"]);
  assert.equal(detail.attribution.license, "CC-BY-SA 4");
});

test("an exercise with no translations still gets a name", () => {
  const summary = toExerciseSummary({ id: 5, translations: [] });
  assert.equal(summary.name, "Exercise 5");
  assert.deepEqual(summary.muscles, []);
  assert.equal(summary.imageUrl, null);
});
