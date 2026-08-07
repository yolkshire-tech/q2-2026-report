// Launched combos (from Docs/Yolkshire_Todays_Launch_Combos.md, Aug 2026).
// `match` = lowercase substrings; an uploaded POS item matches a combo when its
// name contains ANY of them. Names in POS may differ — extend match lists as
// real item names appear in the Jul–Aug item exports.

export const LAUNCHED_COMBOS = [
  { name: 'Classic Masala Omelette + Mint Lemonade', price: 239, match: ['masala omelette + mint', 'masala omelette combo'] },
  { name: 'Veg Alfredo Pasta + Mint Mojito', price: 299, match: ['alfredo pasta + mint', 'alfredo pasta combo'] },
  { name: 'Bhuna Roll (Chicken) + Mint Lemonade', price: 299, match: ['bhuna roll + mint', 'bhuna roll combo'] },
  { name: 'Egg Fried Rice + Lemon Iced Tea', price: 279, match: ['egg fried rice + lemon', 'egg fried rice combo'] },
  { name: 'OG Omelette Pav + Masala Chai', price: 149, match: ['omelette pav + masala', 'omelette pav combo'] },
  { name: 'Egg Bhurji Pav + Masala Chai', price: 199, match: ['bhurji pav + masala', 'bhurji pav combo'] },
  { name: 'Gymholic Meal (50g Protein)', price: 289, match: ['gymholic'] },
  { name: '30g Whey Protein Cold Coffee', price: 249, match: ['whey protein cold coffee', 'whey cold coffee'] },
  { name: '30g Whey Protein Berry Smoothie', price: 349, match: ['whey protein berry', 'whey berry'] },
  { name: '30g Whey Protein Choco-Banana Smoothie', price: 349, match: ['whey protein choco', 'whey choco'] },
];

// Generic catch-all: anything the outlets ring up with these words is
// combo-family even if it isn't in the configured list yet.
export const COMBO_KEYWORDS = ['combo', 'gymholic', 'whey protein'];

export function matchCombo(itemName) {
  const n = (itemName || '').toLowerCase();
  const hit = LAUNCHED_COMBOS.find(c => c.match.some(m => n.includes(m)));
  if (hit) return hit.name;
  if (COMBO_KEYWORDS.some(k => n.includes(k))) return '(unconfigured combo item)';
  return null;
}
