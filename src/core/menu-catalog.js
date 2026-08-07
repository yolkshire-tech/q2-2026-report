// Menu master catalog, category-selection helpers and non-menu detection.
import { S } from './state.js';

export const MENU_CATEGORIES = {
  'Beverages': [
    'Espresso', 'Americano', 'Cappuccino', 'Hazelnut Cappucino', 'Caramel Cappucino', 'Cinnamon Cappucino',
    'Latte', 'Hazelnut Latte', 'Caramel Latte', 'Cinnamon Latte', 'Filter Coffee', 'Mocha Latte',
    'Hot Chocolate', 'Chocolate Shake', 'Cold Coffee', 'Iced Americano', 'Iced Latte', 'Hazelnut Iced Latte',
    'Caramel Iced Latte', 'Cinnamon Iced Latte', 'Iced Mocha Latte', 'Vietnamese Cold Coffee', 'Hazelnut Frappe',
    'Caramel Frappe', 'Cinnamon Frappe', 'Masala Chai', 'Ginger Lemon Honey Tea', 'Green Tea', 'Lemon Ice Tea',
    'Peach Ice Tea', 'Berry Smoothie', 'Tropical Smoothie', 'Green Smoothie', 'Choco-Banana Smoothie',
    'Mint Lemonade', 'Mint Lemon Slush', 'Mint Mojito', 'Pineapple Juice', 'Watermelon Juice', 'ABC Juice'
  ],
  'Eggs': [
    'Devilled Eggs', 'Fried Eggs', 'Poached Eggs', 'French Omelette', 'Creamy Scramble',
    'Potpourri Paneer Omelette', 'Potpourri Chicken Omelette', 'Italian Reve Chicken Omelette', 'Italian Reve Prawns Omelette',
    'Classic Masala Omelette', 'Omelette Florentine', 'Creamy Mushroom Omelette', 'Goan Ros Omelette',
    'Loaded Veggie Farmhouse Feast', 'Peri-Peri Paneer Omelette', 'Peri-Peri Chicken Omelette', 'Peri-Peri Prawns Omelette',
    'Pesto Paneer Omelette', 'Pesto Chicken Omelette', 'Mexican Fajita Scramble', 'Parsi Akuri', 'Egg Bhurji',
    'Paneer Bhurji', 'Cheesy Bacon Scramble', 'BBQ Chicken Scramble', 'Piperade Scramble', 'Masala Baked Beans & Eggs',
    'Eggs Benedict', 'Shakshuka', 'Turkish Eggs'
  ],
  'Signature Breakfast': [
    'Yolkshire English Breakfast Half-Fried', 'Yolkshire English Breakfast Scramble', 'Yolkshire English Breakfast Omelette',
    'Swadeshi Breakfast Egg Bhurji', 'Swadeshi Breakfast Parsi Akuri', 'Classic Bacon Breakfast Scramble',
    'Classic Bacon Breakfast Cheese Omelette', 'Veggie Brekky'
  ],
  'Desserts': [
    'Butter & Syrup French Toast', 'Chocoburst French Toast', 'Banana Nutella French Toast',
    'Butter & Syrup Pancakes', 'Chocoburst Pancakes', 'Banana Nutella Pancakes',
    'Caramel Pudding', 'Basque Cheesecake'
  ],
  'Salads & Sandwiches': [
    'High Protein Millet Salad with Grilled Paneer', 'Low-Cal Grilled Chicken & Zuccini Salad',
    'Caesar Salad - Chicken', 'Caesar Salad - Paneer', 'Orange & Chicken Salad', 'Honey Glazed Chicken Salad',
    'BBQ Chicken Croissant', 'Creamy Mushroom Croissant', 'Chicken Avalanche Croissant',
    'Bhurji Mayo Sandiwch', 'Chicken Mayo Sandwich', 'Bombay Masala Sandwich', 'Yolkshire Eggwich',
    'OG Omelette Pav', 'Thecha Eggs'
  ],
  'Wholesome Rolls': [
    'Classic Double Egg Roll', 'Bhuna Roll - Chicken', 'Bhuna Roll - Paneer',
    'Malai Roll - Chicken', 'Malai Roll - Paneer', 'Hakuna Matata Roll'
  ],
  'Pastas': [
    'Signature Mac & Cheese Pasta', 'Veg Alfredo Pasta', 'Chicken Alfredo Pasta',
    'Veg Arrabiatta Pasta', 'Chicken Arrabiatta Pasta', 'Pink Primavera Pasta', 'Basil Pesto Pasta'
  ],
  'Rice Bowls & Mains': [
    'Chicken Stroganoff', 'Low-Carb Chicken Stroganoff', 'Thai Basil Chicken with Rice',
    'Yolkshire Special Roast Chicken', 'Anda Masala with Paratha', 'Anda Masala with Rice',
    'Peri-Peri Paneer Steak', 'Peri-Peri Chicken Steak', 'Egg Fried Rice',
    'Kerala Paneer Curry with Rice', 'Kerala Chicken Curry with Rice', 'Paprika Chicken with Rice',
    'Paneer Ghee Roast with Paratha', 'Egg Ghee Roast with Paratha', 'Chicken Ghee Roast with Paratha',
    'Prawns Ghee Roast with Paratha', 'Spicy Butter Garlic Prawns', 'Chimmichurri Grilled Chicken', 'Kheema Wow'
  ],
  'Small Plates': [
    'Chicken Sausages', 'Crispy Bacon Strips', 'Mashed Potatoes', 'Baked Beans on Toast',
    'Creamy Mushroom on Toast', 'Crispy Hash Browns (3 pcs)', 'Grilled Chicken Breast',
    'Boiled Egg Chaat', 'French Fries (Salted/Peri-Peri)', 'Cheese Chilli Toast', 'Garlic Bread',
    'Tossed Veggies & Roasted Mushrooms', 'Spicy Grilled Prawns (4 pcs)'
  ],
  'Addons': [
    'Add Egg', 'Boiled Eggs', 'Add Veggies', 'Add Paneer', 'Add Chicken', 'Add Cheese', 'Add Bacon', 'Add Prawns',
    'Add Protein Powder Scoop', 'Extra Wheat Toast', 'Extra Sourdough Toast', 'Extra Pav', 'Extra Paratha',
    'Extra Rice', 'Make it Egg White', 'Cook in Olive Oil', 'Cook in Butter', 'Butter Croissant', 'Chocolate Croissant'
  ],
  'Kids Menu': [
    'Mini Mac & Cheese', 'French Toast Sticks', 'Kids French Fries', 'Cheesy Mashed Potato',
    'Cheese Omelette', 'Kids Hot Chocolate', 'Kids Chocolate Shake'
  ],
  'Delivery Combos': [
    'OG Omelette Pav + Masala Chai', 'Egg Bhurji Pav + Masala Chai', 'Peri-Peri Chicken Omelette + Cold Coffee',
    'Egg Fried Rice + Lemon Iced Tea', 'Chicken Bhuna Roll + Cold Coffee', 'Chicken Stroganoff + Garlic Bread'
  ],
  'Non-Menu / Misc': [
    'Packaged Water Bottle', 'Carry Bag / Packaging Fee', 'Restaurant Packaging Charges', 'Cutlery Set'
  ]
};

export function getAllMenuItems() {
  const all = [];
  Object.values(MENU_CATEGORIES).forEach(items => all.push(...items));
  return all;
}

export function getNonMenuItems() {
  return ['Packaged Water Bottle', 'Carry Bag / Packaging Fee', 'Restaurant Packaging Charges', 'Cutlery Set'];
}

// Pattern-based: catches every POS spelling variant ("Water Bottle (500 ml)",
// "Carry Bag", "Packing Charges"...) instead of an exact-name list.

export const NON_MENU_PATTERNS = ['water bottle', 'carry bag', 'packaging', 'packing charge', 'cutlery', 'event sale'];

export function isNonMenuItem(name) {
  const n = (name || '').toLowerCase();
  return NON_MENU_PATTERNS.some(pat => n.includes(pat));
}



// The category modal is built from menu-master names, while the data carries POS
// export names (which don't all match). A full selection therefore means "no
// filter" — only a real subset selection filters items.

export function itemPassesCategoryFilter(item) {
  if (!S.activeCategorySelection) return true;
  if (S.activeCategorySelection.size >= getAllMenuItems().length) return true;
  return S.activeCategorySelection.has(item);
}

export function initCategorySelection() {
  if (!S.activeCategorySelection) {
    S.activeCategorySelection = new Set(getAllMenuItems());
  }
}

// Modal Functions

