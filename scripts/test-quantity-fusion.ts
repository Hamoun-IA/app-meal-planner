// Script de test pour la fusion des quantités
import { parseQuantity, normalizeUnit, formatQuantity, addQuantities } from '../contexts/courses-context';

// Tests de parsing des quantités
console.log('=== Tests de parsing des quantités ===');
const testQuantities = [
  '200g',
  '1.5kg',
  '500ml',
  '2l',
  '3 cuillères',
  '1 tasse',
  '2 pincées',
  '1 sachet',
  '3 unités',
  '150'
];

testQuantities.forEach(qty => {
  const parsed = parseQuantity(qty);
  console.log(`${qty} -> ${parsed.value} ${parsed.unit}`);
});

// Tests d'addition de quantités
console.log('\n=== Tests d\'addition de quantités ===');
const testAdditions = [
  ['200g', '150g'],
  ['1kg', '500g'],
  ['500ml', '300ml'],
  ['2l', '1.5l'],
  ['1 tasse', '1 tasse'],
  ['3 cuillères', '2 cuillères'],
  ['200g', '1kg'],
  ['500ml', '1l']
];

testAdditions.forEach(([q1, q2]) => {
  const result = addQuantities(q1, q2);
  console.log(`${q1} + ${q2} = ${result}`);
});

// Tests de normalisation d'unités
console.log('\n=== Tests de normalisation d\'unités ===');
const testUnits = [
  'grammes',
  'kilogramme',
  'millilitres',
  'litres',
  'centilitres',
  'onces',
  'livres',
  'tasses',
  'cuillères',
  'pincées',
  'sachets',
  'bottes',
  'tranches',
  'unités'
];

testUnits.forEach(unit => {
  const normalized = normalizeUnit(unit);
  console.log(`${unit} -> ${normalized}`);
});

console.log('\n=== Tests terminés ==='); 