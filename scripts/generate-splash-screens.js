const fs = require('fs');
const path = require('path');

// Configuration des écrans de démarrage iOS
const splashScreens = [
  {
    name: 'apple-splash-2048-2732.png',
    width: 2048,
    height: 2732,
    media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
  },
  {
    name: 'apple-splash-1668-2388.png',
    width: 1668,
    height: 2388,
    media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
  },
  {
    name: 'apple-splash-1536-2048.png',
    width: 1536,
    height: 2048,
    media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
  },
  {
    name: 'apple-splash-1125-2436.png',
    width: 1125,
    height: 2436,
    media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
  },
  {
    name: 'apple-splash-1242-2688.png',
    width: 1242,
    height: 2688,
    media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
  },
  {
    name: 'apple-splash-750-1334.png',
    width: 750,
    height: 1334,
    media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
  },
  {
    name: 'apple-splash-828-1792.png',
    width: 828,
    height: 1792,
    media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
  }
];

// Créer une image de démarrage SVG
const createSplashSVG = (width, height) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fdf2f8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fce7f3;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="icon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f43f5e;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Arrière-plan -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  
  <!-- Cercle central -->
  <circle cx="${width/2}" cy="${height/2}" r="${Math.min(width, height) * 0.15}" fill="url(#icon)"/>
  
  <!-- Icône principale -->
  <text x="${width/2}" y="${height/2 + Math.min(width, height) * 0.05}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.08}" font-weight="bold">💖</text>
  
  <!-- Texte du nom -->
  <text x="${width/2}" y="${height/2 + Math.min(width, height) * 0.25}" text-anchor="middle" fill="#ec4899" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.04}" font-weight="bold">Babounette</text>
  
  <!-- Sous-titre -->
  <text x="${width/2}" y="${height/2 + Math.min(width, height) * 0.35}" text-anchor="middle" fill="#be185d" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.025}">Ton assistante magique</text>
</svg>`;
};

console.log('Génération des écrans de démarrage iOS...');

// Créer les images de démarrage
splashScreens.forEach(({ name, width, height }) => {
  const svg = createSplashSVG(width, height);
  const filePath = path.join(__dirname, '../public/splash', name.replace('.png', '.svg'));
  fs.writeFileSync(filePath, svg);
  console.log(`✓ Créé: ${name.replace('.png', '.svg')} (${width}x${height})`);
});

console.log('\n🎉 Tous les écrans de démarrage ont été générés !');
console.log('\nNote: Pour une meilleure compatibilité iOS, convertissez les SVG en PNG avec des outils comme:');
console.log('- https://convertio.co/svg-png/');
console.log('- https://cloudconvert.com/svg-to-png');
console.log('- Ou utilisez un outil comme ImageMagick'); 