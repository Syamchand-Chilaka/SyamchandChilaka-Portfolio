# Profile Photo Guide

Two ways to update your profile picture.

## Option A: Use photo-tool.html (recommended)

1. Open `photo-tool.html` in your browser (locally or at `/photo-tool.html` on your deployed site)
2. Drag and drop any photo, or click to browse
3. Crop to a 1:1 square — the live preview shows exactly how it will look on desktop and mobile
4. Click **Download profile.jpeg**
5. Move the downloaded file to the repo root, replacing the existing `profile.jpeg`
6. Commit and push — Vercel will redeploy in 1–2 minutes

## Option B: Use your own image editor

1. Open any image editor (Photoshop, Figma, Preview, etc.)
2. Crop to a **1:1 square** focused on head and shoulders
3. Export as JPEG at **800 × 800 px**, quality 90%+
4. Save as `profile.jpeg` in the repo root (replacing the existing file)
5. Commit and push

## Notes

- The portfolio displays the photo as a **320 px circle on desktop** and **160 px circle on mobile**, so 800 px gives clean 2× retina sharpness.
- If `profile.jpeg` is missing or fails to load, the site shows a fallback with your initials ("SC") — no broken image icon.
- `photo-tool.html` is excluded from search engines (`noindex, nofollow`) and is not linked from the main portfolio.
