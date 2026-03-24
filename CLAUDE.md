# CSI Lab Static Site — Agent Notes

## Project overview
Static Node.js site (Express on port 3001) replicating the CSI Lab (csilab.ufop.br) in Brazilian Portuguese.
- `public/index.html` — main page
- `public/equipe.html` — full team page (cards, no photos)
- `public/publicacoes.html` — publications list
- `public/contato.html` — contact page
- `public/css/main.css` — all design tokens + layout
- `public/css/dropdown.css` — nav dropdowns, accordions, news, team cards
- `public/js/main.js` — accordion factory, counter animation, AOS init, scroll-zoom observer

## Start dev server
```
cd /home/olvr/Desktop/zyvolab-static
npm run dev          # nodemon (port 3001)
# or
node server.js
```

## Pending: Download external images from csilab.ufop.br

The server at `csilab.ufop.br` (IP 200.239.129.47) **blocks server-side TCP connections** from this machine
(curl/wget time out). Images ARE served to browsers normally.

### Images needed and their destination paths

| External URL | Save to (relative to `public/`) | Used in |
|---|---|---|
| `https://csilab.ufop.br/sites/default/files/csilab2/files/logo_csi_lab_-_invertida_com_texto_0.png` | `images/logo-csilab.png` | nav + footer (currently using text fallback) |
| `https://csilab.ufop.br/sites/default/files/styles/os_files_xxlarge/public/csilab2/files/logo-ufop.png` | `images/logo-ufop.png` | footer (currently using text fallback) |
| `https://csilab.ufop.br/profiles/openscholar/themes/hwpi_basetheme/images/ufop-logo.png` | `images/ufop-logo.png` | favicon (currently using `images/favicon.svg`) |
| `https://csilab.ufop.br/sites/default/files/styles/os_slideshow_16%3A9_660/public/csilab2/files/foto.png` | `images/foto-equipe.png` | hero card (currently `about-image-1.jpg`), and was used in FAQ |
| `https://csilab.ufop.br/sites/default/files/styles/os_slideshow_16%3A9_660/public/csilab2/files/csilab_marca_4.png` | `images/csilab-marca.png` | about-images grid (currently `about-image-2.jpg`) |
| `https://csilab.ufop.br/sites/default/files/styles/os_slideshow_16%3A9_660/public/csilab2/files/screenshot_2023-12-14_at_22.47.00.png` | `images/evento-2023.png` | about-images grid (currently `about-image-3.jpg`) |
| `https://csilab.ufop.br/sites/default/files/styles/os_slideshow_16%3A9_660/public/csilab2/files/whatsapp_image_2024-04-06_at_21.32.36.jpeg` | `images/evento-2024.jpg` | about-images grid (currently `about-image-4.jpg`) |

### How to download (if/when network access is available)
```bash
cd /home/olvr/Desktop/zyvolab-static/public/images

curl -L -o logo-csilab.png \
  "https://csilab.ufop.br/sites/default/files/csilab2/files/logo_csi_lab_-_invertida_com_texto_0.png"

curl -L -o logo-ufop.png \
  "https://csilab.ufop.br/sites/default/files/styles/os_files_xxlarge/public/csilab2/files/logo-ufop.png"

curl -L -o foto-equipe.png \
  "https://csilab.ufop.br/sites/default/files/styles/os_slideshow_16%3A9_660/public/csilab2/files/foto.png"

curl -L -o csilab-marca.png \
  "https://csilab.ufop.br/sites/default/files/styles/os_slideshow_16%3A9_660/public/csilab2/files/csilab_marca_4.png"

curl -L -o evento-2023.png \
  "https://csilab.ufop.br/sites/default/files/styles/os_slideshow_16%3A9_660/public/csilab2/files/screenshot_2023-12-14_at_22.47.00.png"

curl -L -o evento-2024.jpg \
  "https://csilab.ufop.br/sites/default/files/styles/os_slideshow_16%3A9_660/public/csilab2/files/whatsapp_image_2024-04-06_at_21.32.36.jpeg"
```

### After downloading, update these HTML references:

**Nav logo** (all 4 HTML files — currently text-only "CSILab"):
Replace text logo with `<img src="images/logo-csilab.png" alt="CSI Lab" style="height:36px;" />`

**Footer logo** (index.html + contato.html — currently text "CSILab"):
Replace text logo with `<img src="images/logo-csilab.png" alt="CSI Lab" style="height:48px;margin-bottom:1rem;" />`

**Footer UFOP logo** (index.html + contato.html — currently text "UFOP · Universidade Federal de Ouro Preto"):
Replace with `<img src="images/logo-ufop.png" alt="UFOP" style="height:36px;opacity:0.7;" />`

**Hero card image** (index.html line ~107 — currently `images/about-image-1.jpg`):
Change to `images/foto-equipe.png`

**About section images** (index.html — currently about-image-2/3/4.jpg):
Change to `images/csilab-marca.png`, `images/evento-2023.png`, `images/evento-2024.jpg`

**Favicon** (all 4 HTML files — currently `images/favicon.svg`):
Change to `images/ufop-logo.png` (or keep SVG if logo doesn't fit as favicon)

## Design tokens (CSS custom properties)
```css
--color-primary: #0B0C10   /* page background */
--color-surface: #1F2833   /* cards, nav, sections */
--color-accent:  #E94F37   /* coral red — CTAs, highlights */
--color-steel:   #566573   /* muted blue-grey */
--color-muted:   #8892B0   /* secondary text */
--color-text:    #E2E8F0   /* primary text */
--font-primary:  "Funnel Sans"
--font-secondary:"Inter"
```

## Architecture notes
- Hero background: `public/images/banner.jpg` (set in main.css `.hero-section`)
- Counter section (`#numeros`) background: `public/images/banner.jpg`
- Accordions: generic `initAccordion()` factory in main.js
  - Consultorias uses `class="consult-accordion"` container
  - FAQ uses `id="faq"` container
  - Both are now side-by-side in `#consultorias` section (no images)
- AOS: CDN `unpkg.com/aos@2.3.4` — `once:true, duration:800, offset:60`
  - No CSS animation fallback (was causing blink); JS fallback at 3s instead
- Fonts: self-hosted woff2 in `public/fonts/` (Funnel Sans + Inter)
