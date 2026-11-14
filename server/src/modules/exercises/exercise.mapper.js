// wger returns large nested objects in many languages. These functions turn
// them into the small, English-only shapes the FitFaat frontend needs.
// They are plain functions (no network), so they are easy to test.

const ENGLISH = 2; // wger's language id for English

// Pick the English translation, or the first one if there is no English text.
export function pickTranslation(translations = []) {
  return translations.find((t) => t.language === ENGLISH) || translations[0] || null;
}

// wger descriptions are HTML ("<p>Step one</p><p>Step two</p>").
// Turn them into a list of plain-text paragraphs.
export function htmlToParagraphs(html = "") {
  return html
    .replace(/<\/(p|li|h\d)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// Muscles have a Latin name ("Biceps brachii") and usually a common one ("Biceps").
export function muscleName(muscle) {
  return muscle.name_en || muscle.name;
}

function mainImage(images = []) {
  const image = images.find((i) => i.is_main) || images[0];
  return image ? image.image : null;
}

// Short version for search results and favourites.
export function toExerciseSummary(info) {
  const translation = pickTranslation(info.translations);
  return {
    id: info.id,
    name: translation ? translation.name : `Exercise ${info.id}`,
    category: info.category ? info.category.name : null,
    muscles: (info.muscles || []).map(muscleName),
    equipment: (info.equipment || []).map((e) => e.name),
    imageUrl: mainImage(info.images),
  };
}

// Full version for the exercise detail screen.
export function toExerciseDetail(info) {
  const translation = pickTranslation(info.translations);
  return {
    ...toExerciseSummary(info),
    instructions: translation ? htmlToParagraphs(translation.description) : [],
    musclesSecondary: (info.muscles_secondary || []).map(muscleName),
    images: (info.images || []).map((i) => i.image),
    videos: (info.videos || []).map((v) => v.video),
    attribution: {
      source: "wger.de",
      sourceUrl: `https://wger.de/exercise/${info.id}/view-base`,
      license: info.license ? info.license.short_name : null,
      licenseUrl: info.license ? info.license.url : null,
      author: info.license_author || null,
    },
  };
}
