// Script QA: things that make text-to-speech or captions wrong. Shared by CI (extract.js) and the dashboard.
const HETERONYMS = ['read', 'lead', 'wind', 'wound', 'tear', 'bow', 'live', 'minute', 'desert', 'record', 'refuse', 'resume', 'bass', 'row', 'sow', 'close', 'object', 'content', 'present', 'project'];
const ABBR = ['St', 'Dr', 'Mr', 'Mrs', 'Ms', 'vs', 'etc', 'approx', 'Jr', 'Sr', 'Mt', 'Gen', 'Col', 'Sgt'];
const CONFUSABLE = [['dairy', 'diary'], ['desert', 'dessert'], ['principal', 'principle'], ['affect', 'effect'], ['lose', 'loose'], ['quiet', 'quite'], ['weather', 'whether'], ['stationary', 'stationery'], ['complement', 'compliment'], ['born', 'borne']];
const DAIRY_CTX = /(cheese|milk|butter|cream|cow|cattle|farm|yoghurt|yogurt|curd)/i;
const DIARY_CTX = /(wrote|kept|journal|entry|entries|pepys|dear|page)/i;

function qa(lines, lexicon = {}) {
  const errors = [], warnings = [], seen = {};
  for (const [id, text0] of Object.entries(lines)) {
    const text = String(text0);
    if (!text.trim()) { errors.push(`${id}: empty narration line`); continue; }
    const words = text.split(/\s+/);
    if (words.length > 60) warnings.push(`${id}: ${words.length} words in one scene (over about 9 s); split it`);
    text.split(/(?<=[.!?])\s+/).forEach((s) => { if (s.split(/\s+/).length > 40) warnings.push(`${id}: a sentence has more than 40 words; hard to follow when spoken`); });
    if (/\d/.test(text)) warnings.push(`${id}: contains digits; write numbers and years as spoken words ("sixteen sixty six")`);
    if (/[^\x00-\x7F\u2018\u2019\u201C\u201D\u2014\u2013\u00E9\u00ED\u00F3\u00E1\u00FA\u00F1\u00E7]/.test(text)) warnings.push(`${id}: unusual symbol that TTS may skip or misread`);
    if (/\s{2,}/.test(text)) warnings.push(`${id}: double space`);
    for (const a of ABBR) if (new RegExp(`\\b${a}\\.?\\s+[A-Z]`).test(text) && !lexicon[a]) warnings.push(`${id}: abbreviation "${a}" not in lexicon.json (TTS may spell it out)`);
    const low = text.toLowerCase();
    if (/\bdiary\b/.test(low) && DAIRY_CTX.test(low) && !DIARY_CTX.test(low)) errors.push(`${id}: "diary" next to food words. Did you mean "dairy"?`);
    if (/\bdairy\b/.test(low) && DIARY_CTX.test(low)) errors.push(`${id}: "dairy" next to writing words. Did you mean "diary"?`);
    for (const [a, b] of CONFUSABLE) for (const w of [a, b]) if (new RegExp(`\\b${w}\\b`, 'i').test(low) && !seen[w]) { seen[w] = 1; warnings.push(`${id}: "${w}" is easily confused with "${a === w ? b : a}". Check the meaning`); }
    for (const h of HETERONYMS) if (new RegExp(`\\b${h}\\b`, 'i').test(low) && !seen['h' + h]) { seen['h' + h] = 1; warnings.push(`${id}: "${h}" has two pronunciations. Listen to it, or respell in lexicon.json`); }
  }
  return {errors, warnings};
}
module.exports = {qa};
