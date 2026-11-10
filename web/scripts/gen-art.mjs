/**
 * 生成站点演示用视觉素材（纯 SVG，本地资源，无任何外部 CDN 依赖）
 * 运行：node scripts/gen-art.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.cwd(), 'public/images')
for (const dir of ['covers', 'banners', 'artists']) {
  fs.mkdirSync(path.join(root, dir), { recursive: true })
}

const palettes = [
  ['#0b1030', '#3f4fd8', '#e8c56b'],
  ['#120a2a', '#6d3ce0', '#5b6cff'],
  ['#0a1420', '#1f5f8b', '#a8d8e8'],
  ['#101a12', '#4b6b4a', '#d6c79a'],
  ['#1a0d10', '#8c3a2c', '#f0a45c'],
  ['#1a1408', '#8a6320', '#f2dca0'],
  ['#0b1226', '#3a5fb0', '#c9d7f5'],
  ['#150b22', '#6a2f9e', '#e0a6ff'],
  ['#0a1218', '#2b7a78', '#9fe0d0'],
  ['#1a1018', '#8a4a6b', '#f0b6ce']
]

function wavePath(seed, w, h, amp) {
  const pts = []
  for (let i = 0; i <= 8; i++) {
    const x = (w / 8) * i
    const y = h / 2 + Math.sin((i + seed) * 0.9) * amp
    pts.push(`${x.toFixed(0)} ${y.toFixed(0)}`)
  }
  return `M ${pts.join(' L ')}`
}

function coverSvg(i, w = 640, h = 640) {
  const [bg, mid, accent] = palettes[i % palettes.length]
  const seed = i + 1
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg${i}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="0.55" stop-color="${mid}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${bg}"/>
    </linearGradient>
    <radialGradient id="glow${i}" cx="0.7" cy="0.25" r="0.7">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.75"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg${i})"/>
  <rect width="${w}" height="${h}" fill="url(#glow${i})"/>
  <g stroke="${accent}" fill="none" opacity="0.55">
    <circle cx="${w * 0.72}" cy="${h * 0.28}" r="${w * 0.16}" stroke-width="2" opacity="0.8"/>
    <circle cx="${w * 0.72}" cy="${h * 0.28}" r="${w * 0.23}" stroke-width="1" opacity="0.4"/>
    <path d="${wavePath(seed, w, h * 1.25, h * 0.18)}" stroke-width="2" opacity="0.55"/>
    <path d="${wavePath(seed + 2, w, h * 1.38, h * 0.12)}" stroke-width="1" opacity="0.35"/>
  </g>
  <g opacity="0.85">
    ${[0, 1, 2, 3, 4, 5, 6]
      .map((b) => {
        const bh = 30 + ((seed * 17 + b * 23) % 90)
        return `<rect x="${56 + b * 30}" y="${h - 80 - bh}" width="8" height="${bh}" rx="4" fill="${accent}" opacity="${0.25 + b * 0.09}"/>`
      })
      .join('\n    ')}
  </g>
  <rect x="16" y="16" width="${w - 32}" height="${h - 32}" rx="28" fill="none" stroke="${accent}" stroke-opacity="0.28"/>
</svg>`
}

function bannerSvg(i, w = 1600, h = 640) {
  const [bg, mid, accent] = palettes[(i + 3) % palettes.length]
  const seed = i + 5
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="b${i}" x1="0" y1="0" x2="1" y2="0.8">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="0.5" stop-color="${mid}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${bg}"/>
    </linearGradient>
    <radialGradient id="r${i}" cx="0.78" cy="0.3" r="0.65">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade${i}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${bg}" stop-opacity="0.9"/>
      <stop offset="0.6" stop-color="${bg}" stop-opacity="0.15"/>
      <stop offset="1" stop-color="${bg}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#b${i})"/>
  <rect width="${w}" height="${h}" fill="url(#r${i})"/>
  <g opacity="0.65" stroke="${accent}" fill="none">
    <path d="M 0 ${h * 0.72} C ${w * 0.2} ${h * 0.5}, ${w * 0.34} ${h * 0.92}, ${w * 0.55} ${h * 0.66} S ${w * 0.85} ${h * 0.4}, ${w} ${h * 0.55}" stroke-width="2"/>
    <path d="M 0 ${h * 0.82} C ${w * 0.22} ${h * 0.62}, ${w * 0.4} ${h * 0.98}, ${w * 0.62} ${h * 0.76} S ${w * 0.88} ${h * 0.52}, ${w} ${h * 0.66}" stroke-width="1" opacity="0.6"/>
    <circle cx="${w * 0.8}" cy="${h * 0.3}" r="${w * 0.09}" stroke-width="1.5" opacity="0.7"/>
    <circle cx="${w * 0.8}" cy="${h * 0.3}" r="${w * 0.14}" stroke-width="1" opacity="0.35"/>
  </g>
  <rect width="${w}" height="${h}" fill="url(#fade${i})"/>
</svg>`
}

function artistSvg(i, size = 560) {
  const [bg, mid, accent] = palettes[(i + 5) % palettes.length]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="a${i}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${mid}"/>
      <stop offset="1" stop-color="${bg}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#a${i})"/>
  <circle cx="${size * 0.5}" cy="${size * 0.42}" r="${size * 0.19}" fill="${accent}" opacity="0.9"/>
  <path d="M ${size * 0.16} ${size * 0.98} C ${size * 0.2} ${size * 0.66}, ${size * 0.38} ${size * 0.58}, ${size * 0.5} ${size * 0.58} C ${size * 0.62} ${size * 0.58}, ${size * 0.8} ${size * 0.66}, ${size * 0.84} ${size * 0.98} Z" fill="${accent}" opacity="0.85"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.44}" fill="none" stroke="${accent}" stroke-opacity="0.25" stroke-width="1.5"/>
  <g opacity="0.5">
    ${[0, 1, 2, 3, 4]
      .map(
        (b) =>
          `<rect x="${size * 0.3 + b * 26}" y="${size * 0.9 - 16 - (b % 3) * 10}" width="5" height="16" rx="2.5" fill="${accent}" opacity="${0.3 + b * 0.12}"/>`
      )
      .join('')}
  </g>
</svg>`
}

for (let i = 0; i < 8; i++) {
  fs.writeFileSync(path.join(root, 'covers', `cover-${i + 1}.svg`), coverSvg(i))
  fs.writeFileSync(path.join(root, 'artists', `artist-${i + 1}.svg`), artistSvg(i))
}
for (let i = 0; i < 3; i++) {
  fs.writeFileSync(path.join(root, 'banners', `hero-${i + 1}.svg`), bannerSvg(i))
}

// favicon / logo
fs.writeFileSync(
  path.join(root, '../favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B6CFF"/><stop offset="1" stop-color="#7C5CFF"/></linearGradient></defs>
  <rect width="64" height="64" rx="16" fill="#06070F"/>
  <path d="M18 42V22c0-1 1-2 2-2h18" stroke="url(#g)" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M22 48c4-10 8-14 12-14s7 5 10 14" stroke="#E8C56B" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <circle cx="34" cy="28" r="4" fill="#E8C56B"/>
</svg>`
)

console.log('assets generated')
