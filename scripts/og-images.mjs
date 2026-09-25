/**
 * Social share cards (1200×630) for the site and every product → public/og/*.jpg
 *
 *   npm run og            # needs Google Chrome; CHROME=/path/to/chrome to override
 *
 * Social networks don't accept SVG, so the pack shots can't be og:images as-is.
 * This renders one HTML card per product (pack shot or category icon, name,
 * price, rating) in the brand fonts, screenshots it with headless Chrome and
 * converts it to JPEG. Re-run after changing products, prices or pack shots.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Bath, Bone, Cookie, Pill, ToyBrick } from 'lucide-react'

const root = resolve(import.meta.dirname, '..')
const outDir = join(root, 'public/og')
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if (!existsSync(chrome)) {
  console.error(`Chrome not found at ${chrome} — set CHROME=/path/to/chrome`)
  process.exit(1)
}

// load the catalogue straight from the TypeScript sources
const vite = await createServer({ root, configFile: false, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const { PRODUCTS, CATEGORIES, FREE_DELIVERY_THRESHOLD } = await vite.ssrLoadModule('/src/lib/data.ts')
const { optionSummary, priceRange } = await vite.ssrLoadModule('/src/lib/catalog.ts')
const { speciesInfo } = await vite.ssrLoadModule('/src/lib/species.ts')
const { money } = await vite.ssrLoadModule('/src/lib/format.ts')
await vite.close()

// brand fonts, inlined so the screenshot never races a network font load
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
const cssUrl =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Figtree:wght@400..700&display=block'
let fontCss = await (await fetch(cssUrl, { headers: { 'user-agent': UA } })).text()
for (const url of new Set(fontCss.match(/https:\/\/fonts\.gstatic\.com[^)]+/g) ?? [])) {
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
  fontCss = fontCss.replaceAll(url, `data:font/woff2;base64,${buf.toString('base64')}`)
}

const TINT = {
  food: ['oklch(93% 0.045 75)', 'oklch(46% 0.09 70)'],
  treats: ['oklch(93% 0.05 48)', 'oklch(46% 0.1 45)'],
  grooming: ['oklch(92% 0.045 200)', 'oklch(42% 0.09 210)'],
  toys: ['oklch(93% 0.045 265)', 'oklch(46% 0.1 265)'],
  health: ['oklch(92% 0.05 150)', 'oklch(42% 0.1 155)'],
}
const ICON = { food: Bone, treats: Cookie, grooming: Bath, toys: ToyBrick, health: Pill }

const PAW =
  '<svg viewBox="0 0 64 64" width="44" height="44"><rect width="64" height="64" rx="14" fill="#105fd9"/><g fill="#fdfcf9"><ellipse cx="22" cy="24" rx="5" ry="6.5"/><ellipse cx="42" cy="24" rx="5" ry="6.5"/><ellipse cx="13.5" cy="35" rx="4.5" ry="5.5"/><ellipse cx="50.5" cy="35" rx="4.5" ry="5.5"/><path d="M32 33c-7 0-13 8-13 13.5 0 4 3 5.5 6.5 5.5 3 0 4.5-1.5 6.5-1.5s3.5 1.5 6.5 1.5c3.5 0 6.5-1.5 6.5-5.5C45 41 39 33 32 33Z"/></g></svg>'

// "$49", not "$49.00", in a headline-sized band
const freeOver = Number.isInteger(FREE_DELIVERY_THRESHOLD) ? `$${FREE_DELIVERY_THRESHOLD}` : money(FREE_DELIVERY_THRESHOLD)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const svgData = (file) => `data:image/svg+xml;base64,${readFileSync(join(root, 'public', file)).toString('base64')}`

const BASE_CSS = `
${fontCss}
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { background: oklch(97.5% 0.008 85); color: oklch(25% 0.014 70); font-family: Figtree, sans-serif; -webkit-font-smoothing: antialiased; }
.frame { position: absolute; inset: 0 0 88px 0; display: flex; align-items: center; gap: 56px; padding: 0 64px 0 48px; }
.brand { display: flex; align-items: center; gap: 14px; font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 30px; letter-spacing: -0.02em; }
.brand b { color: #105fd9; font-weight: 800; }
.tag { font-weight: 700; font-size: 20px; letter-spacing: 0.1em; text-transform: uppercase; color: oklch(48% 0.012 65); }
h1 { font-family: 'Bricolage Grotesque'; font-weight: 800; letter-spacing: -0.035em; line-height: 1.02; text-wrap: balance; }
.band { position: absolute; left: 0; right: 0; bottom: 0; height: 88px; background: oklch(23% 0.014 265); color: oklch(94% 0.008 85); display: flex; align-items: center; padding: 0 64px; font-size: 25px; gap: 18px; }
.band i { width: 6px; height: 6px; border-radius: 50%; background: oklch(79% 0.012 75); display: inline-block; }
`

function productCard(p) {
  const [tint, ink] = TINT[p.category]
  const cat = CATEGORIES.find((c) => c.id === p.category)?.label ?? p.category
  const pets = p.suits.map((sp) => speciesInfo(sp).many).join(' & ')
  const { min, max } = priceRange(p)
  const price = min === max ? money(min) : `from ${money(min)}`
  const detail = p.axes?.length ? optionSummary(p) : p.unit
  const media = p.images?.length
    ? `<img src="${svgData(p.images[0].replace(/^\//, ''))}" alt="" style="width:100%;height:100%;object-fit:cover">`
    : renderToStaticMarkup(createElement(ICON[p.category], { size: 150, strokeWidth: 1.5, color: ink }))
  const nameSize = p.name.length > 30 ? 58 : 66
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
.media { width: 470px; height: 470px; flex: none; border-radius: 32px; overflow: hidden; background: ${tint}; display: grid; place-items: center; }
.copy { display: grid; gap: 18px; min-width: 0; }
h1 { font-size: ${nameSize}px; }
.meta { font-size: 27px; color: oklch(35% 0.012 68); }
.row { display: flex; align-items: baseline; gap: 22px; margin-top: 6px; }
.price { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 50px; letter-spacing: -0.03em; }
.rating { font-size: 25px; color: oklch(35% 0.012 68); }
.rating b { color: #105fd9; }
</style></head><body>
<div class="frame">
  <div class="media">${media}</div>
  <div class="copy">
    <div class="brand">${PAW}<span>PetSafe<b>Care</b></span></div>
    <div class="tag" style="margin-top:14px">${esc(p.brand)} · ${esc(cat)} for ${esc(pets.toLowerCase())}</div>
    <h1>${esc(p.name)}</h1>
    <div class="meta">${esc(detail)}</div>
    <div class="row"><span class="price">${esc(price)}</span><span class="rating"><b>★</b> ${p.rating.toFixed(1)} · ${p.reviews} reviews</span></div>
  </div>
</div>
<div class="band">Free delivery over ${freeOver} <i></i> 30-day returns <i></i> Vet-checked picks</div>
</body></html>`
}

function siteCard() {
  const shots = ['products/p02-1.svg', 'products/p01-1.svg', 'products/p06-1.svg', 'products/p17-1.svg']
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
.copy { display: grid; gap: 30px; width: 600px; }
h1 { font-size: 76px; }
.grid { display: grid; grid-template-columns: repeat(2, 214px); gap: 16px; flex: none; }
.grid img { width: 214px; height: 214px; border-radius: 26px; object-fit: cover; display: block; }
</style></head><body>
<div class="frame" style="justify-content: space-between">
  <div class="copy">
    <div class="brand">${PAW}<span>PetSafe<b>Care</b></span></div>
    <h1>Supplies, vet visits and vaccine reminders.</h1>
  </div>
  <div class="grid">${shots.map((f) => `<img src="${svgData(f)}" alt="">`).join('')}</div>
</div>
<div class="band">Free delivery over ${freeOver} <i></i> Verified clinics <i></i> Reminders before vaccines are due</div>
</body></html>`
}

function shoot(html, outFile) {
  const dir = mkdtempSync(join(tmpdir(), 'og-'))
  const page = join(dir, 'card.html')
  const png = join(dir, 'card.png')
  writeFileSync(page, html)
  const run = spawnSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=4000',
    `--screenshot=${png}`,
    `file://${page}`,
  ])
  if (!existsSync(png)) throw new Error(`Chrome did not write ${outFile}: ${run.stderr}`)
  // JPEG keeps each card ~60 KB; sips ships with macOS, anything else keeps the PNG
  const sips = spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', png, '--out', outFile])
  if (sips.status !== 0) writeFileSync(outFile.replace(/\.jpg$/, '.png'), readFileSync(png))
  rmSync(dir, { recursive: true, force: true })
}

mkdirSync(outDir, { recursive: true })
shoot(siteCard(), join(root, 'public/og-image.jpg'))
console.log('site  → public/og-image.jpg')
for (const p of PRODUCTS) {
  shoot(productCard(p), join(outDir, `${p.id}.jpg`))
  console.log(`${p.id}   → public/og/${p.id}.jpg  ${p.name}`)
}
