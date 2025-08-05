const fs = require('fs');
const path = require('path');

// Créer les icônes PWA de base
const iconSizes = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Créer les icônes de raccourcis
const shortcutIcons = [
  { name: 'shortcut-assistante.png' },
  { name: 'shortcut-recettes.png' },
  { name: 'shortcut-courses.png' },
  { name: 'shortcut-calendrier.png' }
];

// Créer les icônes SVG de base
const createSVGIcon = (size) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f43f5e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad1)"/>
  <text x="${size/2}" y="${size/2 + size*0.1}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold">💖</text>
  <text x="${size/2}" y="${size/2 + size*0.4}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold">B</text>
</svg>`;
};

// Créer les icônes de raccourcis SVG
const createShortcutSVG = (name) => {
  const icon = name.replace('shortcut-', '').replace('.png', '');
  const emoji = {
    'assistante': '💬',
    'recettes': '🍳',
    'courses': '🛒',
    'calendrier': '📅'
  }[icon] || '💖';
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f43f5e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="96" height="96" rx="19.2" fill="url(#grad1)"/>
  <text x="48" y="58" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="bold">${emoji}</text>
</svg>`;
};

// Créer l'icône Safari
const createSafariIcon = () => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f43f5e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="16" height="16" rx="3.2" fill="url(#grad1)"/>
  <text x="8" y="11" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="8" font-weight="bold">B</text>
</svg>`;
};

// Créer les icônes
console.log('Génération des icônes PWA...');

// Créer les icônes principales
iconSizes.forEach(({ size, name }) => {
  const svg = createSVGIcon(size);
  const filePath = path.join(__dirname, '../public/icons', name);
  fs.writeFileSync(filePath.replace('.png', '.svg'), svg);
  console.log(`✓ Créé: ${name.replace('.png', '.svg')}`);
});

// Créer les icônes de raccourcis
shortcutIcons.forEach(({ name }) => {
  const svg = createShortcutSVG(name);
  const filePath = path.join(__dirname, '../public/icons', name);
  fs.writeFileSync(filePath.replace('.png', '.svg'), svg);
  console.log(`✓ Créé: ${name.replace('.png', '.svg')}`);
});

// Créer l'icône Safari
const safariIcon = createSafariIcon();
const safariPath = path.join(__dirname, '../public/icons/safari-pinned-tab.svg');
fs.writeFileSync(safariPath, safariIcon);
console.log('✓ Créé: safari-pinned-tab.svg');

// Créer un favicon.ico basique
const faviconSVG = createSVGIcon(32);
const faviconPath = path.join(__dirname, '../public/favicon.ico');
fs.writeFileSync(faviconPath.replace('.ico', '.svg'), faviconSVG);
console.log('✓ Créé: favicon.svg');

console.log('\n🎉 Toutes les icônes PWA ont été générées !');
console.log('\nNote: Pour une meilleure compatibilité, convertissez les SVG en PNG avec des outils comme:');
console.log('- https://convertio.co/svg-png/');
console.log('- https://cloudconvert.com/svg-to-png');
console.log('- Ou utilisez un outil comme ImageMagick'); 