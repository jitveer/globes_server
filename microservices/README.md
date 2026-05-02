# 🧩 Microservices

Ye folder independent, single-responsibility utility services ke liye hai.
Ye services kisi bhi module ke saath integrate ho sakti hain.

## Kab yahan dalna chahiye?

- Agar koi functionality ek se zyada jagah use hoti hai
- Agar koi complex processing logic controller se alag rakhni ho
- Agar future mein use kisi separate process ya service mein move karna ho

---

## 📦 Available Microservices

### `imageOptimizer.js`

**Purpose:** Ek uploaded image se 3 optimized versions banata hai.

**Flow:**
```
Input: image buffer + destination folder
         ↓
  ┌──────────────────────────────────┐
  │      imageOptimizer.js           │
  ├──────────────────────────────────┤
  │  Version 1: img-xxx.png          │  ← Original (no changes)
  │  Version 2: img-xxx.webp         │  ← Optimized ≤ 200KB (main display)
  │  Version 3: img-xxx_thum.webp    │  ← Thumbnail < 20KB, blurred (progressive loading)
  └──────────────────────────────────┘
         ↓
Output: { original, webp, thumbnail, baseName }
```

**Progressive Loading Strategy (Frontend):**
```
Page load
  → Pehle `thumbnail` (blurred, <20KB) load hoti hai instantly
  → Jab `webp` (200KB) fully load ho jata hai
  → thumbnail ko replace kar do with webp
  → User ko smooth, non-jarring image transition milta hai
```

**Usage:**
```js
const { optimizeAndSaveImages } = require('../microservices/imageOptimizer');

const result = await optimizeAndSaveImages(
  file.buffer,          // multer memoryStorage buffer
  file.originalname,    // original file name
  destDir               // e.g. "uploads/properties/my-property"
);

// result:
// {
//   original:  "/uploads/properties/my-property/img-xxx.png",
//   webp:      "/uploads/properties/my-property/img-xxx.webp",
//   thumbnail: "/uploads/properties/my-property/img-xxx_thum.webp",
//   baseName:  "img-xxx"
// }
```

**Dependencies:** `sharp` (already in package.json)

---

## ➕ Future Microservices (Ideas)

| Service | Purpose |
|---|---|
| `pdfOptimizer.js` | Brochure PDF compression & thumbnail generation |
| `videoThumbnail.js` | Property video se thumbnail extract karna |
| `watermark.js` | Images pe brand watermark lagana |
| `geoCode.js` | Address se lat/lng coordinates nikalna |
