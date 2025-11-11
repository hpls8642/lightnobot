# React CAPTCHA Demo

A polished two-stage CAPTCHA built with React (Vite):
- Stage 1: Checkbox with loading and verified state
- Stage 2: Modal with draggable puzzle piece, snapping, refresh, animations, and haptics

## Scripts
- `npm run dev` — start dev server
- `npm run build` — build for production
- `npm run preview` — preview production build

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm run dev
   ```
3. Open the browser tab that Vite launches (default `http://localhost:5173`).

## File structure
- `src/components/Captcha/Captcha.jsx` — CAPTCHA core component
- `src/components/Captcha/Captcha.css` — styles for the CAPTCHA
- `src/components/Captcha/CaptchaDemo.jsx` — simple demo form usage
- `src/App.jsx` — demo page wiring
- `src/main.jsx` — React entry
- `vite.config.js` — Vite configuration

## Notes
- All logic is client-side; no backend required.
- For a PNG-shaped piece, replace the vector in `Captcha.jsx` with an `<image>` using your transparent PNG and align transforms similarly.


