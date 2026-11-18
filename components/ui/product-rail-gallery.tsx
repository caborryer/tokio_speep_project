"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import s from "./product-rail-gallery.module.css";

export type GarmentKind = "tee" | "knit" | "hoodie" | "shirt" | "jacket" | "coat";

export interface RailGarment {
  id: string;
  /** Accessible name, caption and detail title. */
  name: string;
  description?: string;
  /** Built-in illustration, used when no image is supplied. */
  kind?: GarmentKind;
  /** Fabric colour of the illustration (any CSS colour). */
  color?: string;
  /** Trim colour for ribs, cords and buttons. */
  trim?: string;
  /** Front photo. Best as a transparent cut-out on a 200 × 310 portrait canvas. Front, back and side photos of one piece must share the same canvas and scale, or the piece changes size as it turns. */
  image?: string;
  /** Back photo; the front photo is reused when omitted. */
  backImage?: string;
  /** Side-on photo shown while the piece rests on the rail; omit to show the front photo turned away. */
  sideImage?: string;
  /** Short hang-tag text such as a price or a size. */
  tag?: string;
  /** Short facts listed in the detail view. */
  details?: string[];
}

export interface ClothingRailHeroLabels {
  front: string;
  back: string;
  close: string;
  show: string;
  /** Magnifier button in the detail view (photos only). */
  zoom?: string;
}

export interface ClothingRailHeroProps extends React.ComponentProps<"section"> {
  items: RailGarment[];
  eyebrow?: string;
  heading?: string;
  /** Shown under the rail while nothing is turned to the front. */
  caption?: string;
  /** Call to action rendered under the caption. */
  action?: React.ReactNode;
  /** Turns the pieces to the front one by one until the visitor interacts. */
  autoplay?: boolean;
  /** Milliseconds each piece faces the front during autoplay. */
  interval?: number;
  /** Drawn hanger. Use "none" when your photos already include a hanger with its hook at the top. */
  hanger?: "wood" | "matte" | "none";
  labels?: ClothingRailHeroLabels;
  onOpenChange?: (index: number | null) => void;
}

const VB_W = 200;
const VB_H = 310;
const ASPECT = VB_W / VB_H;
const HOOK_TOP = 4;
const RAIL_R = 4.6;
const REST = -70;
const PERSPECTIVE = 1100;
const GAP = 0.035;
const MAX_H = 400;
const MIN_WIDE_H = 200;
const CAROUSEL_H = 340;
/* With photos the hanger sits inside the garment: only the hook shows above the collar. */
/** Fraction of the canvas height used by cut-out photos (the shirt fills the top part only). */
const PHOTO_BOTTOM = 0.74;
const DEFAULT_LABELS: ClothingRailHeroLabels = { front: "Front", back: "Back", close: "Close", show: "Show", zoom: "Zoom" };

type Tone = { d: string; t: number };
type Art = {
  body: string;
  sleeves: string[];
  under?: string;
  hood?: string;
  ribs: string[];
  panels: Tone[];
  seams: string[];
  stitches: string[];
  folds: string[];
  cords?: string[];
  buttons?: number[][];
};

const CREW = "M80,34 C88,45 112,45 120,34";

const ART = {
  tee: {
    front: {
      body: `${CREW} C132,36 146,40 156,45 C160,48 163,52 164,57 C158,72 152,88 152,102 L153,236 C128,241 72,241 47,236 L48,102 C48,88 42,72 36,57 C37,52 40,48 44,45 C54,40 68,36 80,34 Z`,
      sleeves: ["M44,45 C38,47 33,50 31,55 C24,64 17,76 13,92 C18,100 24,106 30,110 C35,106 42,102 48,102 C47,84 45,62 44,45 Z", "M156,45 C162,47 167,50 169,55 C176,64 183,76 187,92 C182,100 176,106 170,110 C165,106 158,102 152,102 C153,84 155,62 156,45 Z"],
      under: "M80,34 C90,30 110,30 120,34 C112,45 88,45 80,34 Z",
      ribs: ["M80,34 C88,45 112,45 120,34 L124,36 C114,50 86,50 76,36 Z"],
      panels: [],
      seams: ["M80,34 C68,36 54,40 44,45", "M120,34 C132,36 146,40 156,45", "M48,102 C47,84 45,62 44,45", "M152,102 C153,84 155,62 156,45"],
      stitches: ["M14,93 C19,101 25,106 30,109", "M186,93 C181,101 175,106 170,109", "M50,229 C74,233 126,233 150,229"],
      folds: ["M40,56 C58,76 76,94 90,120", "M160,56 C142,76 124,94 110,120", "M70,126 C66,164 72,204 66,234", "M131,128 C135,164 129,204 134,234", "M100,112 C98,160 103,204 100,236", "M31,62 C27,74 23,84 21,96", "M169,62 C173,74 177,84 179,96", "M78,50 C88,58 112,58 122,50"],
    },
    back: {
      body: "M80,34 C90,31 110,31 120,34 C132,36 146,40 156,45 C160,48 163,52 164,57 C158,72 152,88 152,102 L153,236 C128,241 72,241 47,236 L48,102 C48,88 42,72 36,57 C37,52 40,48 44,45 C54,40 68,36 80,34 Z",
      sleeves: ["M44,45 C38,47 33,50 31,55 C24,64 17,76 13,92 C18,100 24,106 30,110 C35,106 42,102 48,102 C47,84 45,62 44,45 Z", "M156,45 C162,47 167,50 169,55 C176,64 183,76 187,92 C182,100 176,106 170,110 C165,106 158,102 152,102 C153,84 155,62 156,45 Z"],
      ribs: ["M80,34 C90,31 110,31 120,34 L121,38 C110,35 90,35 79,38 Z"],
      panels: [],
      seams: ["M80,34 C68,36 54,40 44,45", "M120,34 C132,36 146,40 156,45"],
      stitches: ["M14,93 C19,101 25,106 30,109", "M186,93 C181,101 175,106 170,109", "M50,229 C74,233 126,233 150,229"],
      folds: ["M40,56 C60,74 80,88 96,104", "M160,56 C140,74 120,88 104,104", "M72,120 C68,164 74,204 68,234", "M128,122 C132,164 126,204 132,234", "M100,60 C98,150 102,200 100,236", "M31,62 C27,74 23,84 21,96", "M169,62 C173,74 177,84 179,96"],
    },
  },
  knit: {
    front: {
      body: "M80,34 C88,46 112,46 120,34 L158,46 C162,52 163,60 163,70 L163,226 C140,231 60,231 37,226 L37,70 C37,60 38,52 42,46 Z",
      sleeves: ["M42,46 C32,52 27,62 26,76 L20,216 C26,221 36,222 44,219 L47,98 C46,80 45,62 42,46 Z", "M158,46 C168,52 173,62 174,76 L180,216 C174,221 164,222 156,219 L153,98 C154,80 155,62 158,46 Z"],
      under: "M80,34 C90,30 110,30 120,34 C112,46 88,46 80,34 Z",
      ribs: ["M37,211 L163,211 L163,226 C140,231 60,231 37,226 Z", "M21,203 L45,206 L44,219 C36,222 26,221 20,216 Z", "M179,203 L155,206 L156,219 C164,222 174,221 180,216 Z", "M80,34 C88,46 112,46 120,34 L125,37 C115,53 85,53 75,37 Z"],
      panels: [],
      seams: ["M47,98 C46,80 45,62 42,46", "M153,98 C154,80 155,62 158,46"],
      stitches: [],
      folds: ["M66,60 C62,110 70,160 64,210", "M134,62 C138,112 130,162 136,210", "M100,56 C98,110 102,160 100,210", "M33,80 C31,130 33,170 30,204", "M167,80 C169,130 167,170 170,204"],
    },
    back: {
      body: "M80,34 C90,31 110,31 120,34 L158,46 C162,52 163,60 163,70 L163,226 C140,231 60,231 37,226 L37,70 C37,60 38,52 42,46 Z",
      sleeves: ["M42,46 C32,52 27,62 26,76 L20,216 C26,221 36,222 44,219 L47,98 C46,80 45,62 42,46 Z", "M158,46 C168,52 173,62 174,76 L180,216 C174,221 164,222 156,219 L153,98 C154,80 155,62 158,46 Z"],
      ribs: ["M37,211 L163,211 L163,226 C140,231 60,231 37,226 Z", "M21,203 L45,206 L44,219 C36,222 26,221 20,216 Z", "M179,203 L155,206 L156,219 C164,222 174,221 180,216 Z", "M80,34 C90,31 110,31 120,34 L122,39 C110,35 90,35 78,39 Z"],
      panels: [],
      seams: ["M47,98 C46,80 45,62 42,46", "M153,98 C154,80 155,62 158,46"],
      stitches: [],
      folds: ["M68,60 C64,110 70,160 66,210", "M132,62 C136,112 130,162 134,210", "M100,50 C99,110 101,160 100,210"],
    },
  },
  hoodie: {
    front: {
      body: "M80,36 C88,47 112,47 120,36 L160,48 C164,54 165,62 165,72 L165,228 C141,233 59,233 35,228 L35,72 C35,62 36,54 40,48 Z",
      sleeves: ["M40,48 C30,54 25,64 24,80 L18,218 C24,223 35,224 43,221 L46,100 C45,82 43,64 40,48 Z", "M160,48 C170,54 175,64 176,80 L182,218 C176,223 165,224 157,221 L154,100 C155,82 157,64 160,48 Z"],
      hood: "M72,42 C64,28 68,12 86,8 L114,8 C132,12 136,28 128,42 C116,30 84,30 72,42 Z",
      under: "M78,38 C88,31 112,31 122,38 C112,48 88,48 78,38 Z",
      ribs: ["M35,213 L165,213 L165,228 C141,233 59,233 35,228 Z", "M19,205 L45,208 L43,221 C35,224 24,223 18,218 Z", "M181,205 L155,208 L157,221 C165,224 176,223 182,218 Z"],
      panels: [{ d: "M62,148 L138,148 L150,196 L50,196 Z", t: 0.035 }, { d: "M80,36 C76,46 80,56 92,60 L96,55 C88,52 84,45 85,38 Z", t: -0.12 }, { d: "M120,36 C124,46 120,56 108,60 L104,55 C112,52 116,45 115,38 Z", t: -0.12 }],
      seams: ["M62,148 L52,186", "M138,148 L148,186", "M46,100 C45,82 43,64 40,48", "M154,100 C155,82 157,64 160,48"],
      stitches: ["M64,151 L136,151", "M51,193 L149,193"],
      folds: ["M68,64 C64,110 70,140 66,148", "M132,66 C136,110 130,140 134,148", "M100,62 C98,100 102,130 100,148", "M31,84 C29,130 31,170 28,206", "M169,84 C171,130 169,170 172,206", "M76,198 C74,204 76,208 74,212", "M124,198 C126,204 124,208 126,212"],
      cords: ["M92,50 C91,72 89,88 90,104", "M108,50 C109,72 111,88 110,104"],
    },
    back: {
      body: "M80,36 C90,32 110,32 120,36 L160,48 C164,54 165,62 165,72 L165,228 C141,233 59,233 35,228 L35,72 C35,62 36,54 40,48 Z",
      sleeves: ["M40,48 C30,54 25,64 24,80 L18,218 C24,223 35,224 43,221 L46,100 C45,82 43,64 40,48 Z", "M160,48 C170,54 175,64 176,80 L182,218 C176,223 165,224 157,221 L154,100 C155,82 157,64 160,48 Z"],
      ribs: ["M35,213 L165,213 L165,228 C141,233 59,233 35,228 Z", "M19,205 L45,208 L43,221 C35,224 24,223 18,218 Z", "M181,205 L155,208 L157,221 C165,224 176,223 182,218 Z"],
      panels: [{ d: "M76,36 C66,50 64,82 80,110 C88,120 112,120 120,110 C136,82 134,50 124,36 C112,30 88,30 76,36 Z", t: -0.06 }],
      seams: ["M100,32 L100,118", "M46,100 C45,82 43,64 40,48", "M154,100 C155,82 157,64 160,48"],
      stitches: ["M80,108 C90,116 110,116 120,108"],
      folds: ["M70,120 C66,160 72,190 68,212", "M130,120 C134,160 128,190 132,212", "M31,84 C29,130 31,170 28,206", "M169,84 C171,130 169,170 172,206"],
    },
  },
  shirt: {
    front: {
      body: "M80,34 C88,40 112,40 120,34 L160,47 C164,53 165,60 165,70 L163,232 C150,244 124,242 100,238 C76,242 50,244 37,232 L35,70 C35,60 36,53 40,47 Z",
      sleeves: ["M40,47 C30,53 26,63 25,78 L21,204 L45,206 L47,98 C46,80 44,63 40,47 Z", "M160,47 C170,53 174,63 175,78 L179,204 L155,206 L153,98 C154,80 156,63 160,47 Z"],
      under: "M80,34 C90,29 110,29 120,34 L120,39 C110,34 90,34 80,39 Z",
      ribs: [],
      panels: [{ d: "M21,204 L45,206 L45,218 C37,220 28,220 21,217 Z", t: -0.05 }, { d: "M179,204 L155,206 L155,218 C163,220 172,220 179,217 Z", t: -0.05 }, { d: "M96,46 L104,46 L104,238 L96,238 Z", t: -0.03 }, { d: "M55,84 L87,84 L87,118 L71,124 L55,118 Z", t: 0.02 }, { d: "M113,84 L145,84 L145,118 L129,124 L113,118 Z", t: 0.02 }, { d: "M54,81 L88,81 L88,92 L71,96 L54,92 Z", t: -0.06 }, { d: "M112,81 L146,81 L146,92 L129,96 L112,92 Z", t: -0.06 }, { d: "M100,48 L80,34 C78,42 74,52 69,62 L90,64 Z", t: 0.04 }, { d: "M100,48 L120,34 C122,42 126,52 131,62 L110,64 Z", t: 0.04 }],
      seams: ["M96,64 L96,238", "M104,64 L104,238", "M47,98 C46,80 44,63 40,47", "M153,98 C154,80 156,63 160,47"],
      stitches: ["M57,116 L71,121 L85,116", "M115,116 L129,121 L143,116", "M39,230 C54,239 76,238 100,234 C124,238 146,239 161,230"],
      folds: ["M66,128 C62,170 68,200 62,234", "M134,128 C138,170 132,200 138,234", "M31,90 C29,130 31,170 28,200", "M169,90 C171,130 169,170 172,200"],
      buttons: [[100, 72], [100, 102], [100, 132], [100, 162], [100, 192], [100, 222], [71, 92], [129, 92]],
    },
    back: {
      body: "M80,34 C90,30 110,30 120,34 L160,47 C164,53 165,60 165,70 L163,232 C150,244 124,242 100,238 C76,242 50,244 37,232 L35,70 C35,60 36,53 40,47 Z",
      sleeves: ["M40,47 C30,53 26,63 25,78 L21,204 L45,206 L47,98 C46,80 44,63 40,47 Z", "M160,47 C170,53 174,63 175,78 L179,204 L155,206 L153,98 C154,80 156,63 160,47 Z"],
      ribs: [],
      panels: [{ d: "M21,204 L45,206 L45,218 C37,220 28,220 21,217 Z", t: -0.05 }, { d: "M179,204 L155,206 L155,218 C163,220 172,220 179,217 Z", t: -0.05 }, { d: "M80,34 C90,30 110,30 120,34 L122,41 C110,36 90,36 78,41 Z", t: 0.03 }, { d: "M40,47 L80,34 C90,30 110,30 120,34 L160,47 C162,56 163,62 164,68 C130,74 70,74 36,68 C37,62 38,56 40,47 Z", t: 0.025 }],
      seams: ["M36,68 C70,74 130,74 164,68", "M97,72 L97,238", "M103,72 L103,238"],
      stitches: ["M39,230 C54,239 76,238 100,234 C124,238 146,239 161,230"],
      folds: ["M70,90 C66,150 72,200 66,234", "M130,90 C134,150 128,200 134,234", "M31,90 C29,130 31,170 28,200", "M169,90 C171,130 169,170 172,200"],
    },
  },
  jacket: {
    front: {
      body: "M80,34 C88,40 112,40 120,34 L162,48 C166,54 167,61 167,72 L166,230 L34,230 L33,72 C33,61 34,54 38,48 Z",
      sleeves: ["M38,48 C28,54 24,64 23,80 L19,218 C26,222 37,222 44,219 L46,100 C45,82 42,64 38,48 Z", "M162,48 C172,54 176,64 177,80 L181,218 C174,222 163,222 156,219 L154,100 C155,82 158,64 162,48 Z"],
      under: "M80,34 C90,30 110,30 120,34 L122,40 C110,35 90,35 78,40 Z",
      ribs: [],
      panels: [{ d: "M100,58 L106,58 L106,230 L100,230 Z", t: -0.07 }, { d: "M112,86 L142,86 L142,118 L112,118 Z", t: 0.025 }, { d: "M46,152 L88,152 L88,198 L46,198 Z", t: 0.025 }, { d: "M112,152 L154,152 L154,198 L112,198 Z", t: 0.025 }, { d: "M100,58 L80,34 C72,40 64,50 58,64 L90,72 Z", t: -0.04 }, { d: "M100,58 L120,34 C128,40 136,50 142,64 L110,72 Z", t: -0.04 }],
      seams: ["M100,58 L100,230", "M46,100 C45,82 42,64 38,48", "M154,100 C155,82 158,64 162,48"],
      stitches: ["M114,88 L140,88 L140,116 L114,116 Z", "M48,154 L86,154 L86,196 L48,196 Z", "M114,154 L152,154 L152,196 L114,196 Z", "M35,224 L165,224", "M22,208 L44,210", "M178,208 L156,210"],
      folds: ["M70,74 C66,110 72,130 68,150", "M130,122 C134,136 130,146 132,150", "M68,200 C66,212 70,220 66,228", "M30,92 C28,140 30,180 27,214", "M170,92 C172,140 170,180 173,214"],
      buttons: [[106, 84], [106, 118], [106, 152], [106, 186], [106, 218]],
    },
    back: {
      body: "M80,34 C90,30 110,30 120,34 L162,48 C166,54 167,61 167,72 L166,230 L34,230 L33,72 C33,61 34,54 38,48 Z",
      sleeves: ["M38,48 C28,54 24,64 23,80 L19,218 C26,222 37,222 44,219 L46,100 C45,82 42,64 38,48 Z", "M162,48 C172,54 176,64 177,80 L181,218 C174,222 163,222 156,219 L154,100 C155,82 158,64 162,48 Z"],
      ribs: [],
      panels: [{ d: "M80,34 C90,30 110,30 120,34 L126,46 C110,39 90,39 74,46 Z", t: -0.04 }],
      seams: ["M36,76 C70,82 130,82 164,76", "M46,100 C45,82 42,64 38,48", "M154,100 C155,82 158,64 162,48"],
      stitches: ["M35,224 L165,224", "M36,80 C70,86 130,86 164,80"],
      folds: ["M70,90 C66,150 72,196 68,228", "M130,90 C134,150 128,196 132,228", "M30,92 C28,140 30,180 27,214", "M170,92 C172,140 170,180 173,214"],
    },
  },
  coat: {
    front: {
      body: "M80,34 C88,40 112,40 120,34 L164,50 C168,56 169,63 169,74 L174,294 L26,294 L31,74 C31,63 32,56 36,50 Z",
      sleeves: ["M36,50 C26,56 22,66 21,82 L16,240 C23,244 34,244 42,241 L45,104 C44,86 40,66 36,50 Z", "M164,50 C174,56 178,66 179,82 L184,240 C177,244 166,244 158,241 L155,104 C156,86 160,66 164,50 Z"],
      under: "M80,34 C90,28 110,28 120,34 L118,42 C110,37 90,37 82,42 Z",
      ribs: [],
      panels: [{ d: "M100,128 L106,128 L106,294 L100,294 Z", t: -0.06 }, { d: "M100,128 L80,34 C74,44 70,56 66,72 L76,78 L70,90 Z", t: 0.045 }, { d: "M100,128 L120,34 C126,44 130,56 134,72 L124,78 L130,90 Z", t: 0.045 }, { d: "M42,206 L84,206 L84,217 L42,217 Z", t: -0.05 }, { d: "M116,206 L158,206 L158,217 L116,217 Z", t: -0.05 }],
      seams: ["M100,128 L100,294", "M45,104 C44,86 40,66 36,50", "M155,104 C156,86 160,66 164,50", "M42,217 L84,217", "M116,217 L158,217"],
      stitches: ["M28,288 L172,288"],
      folds: ["M60,96 C56,170 64,230 54,292", "M140,96 C144,170 136,230 146,292", "M84,140 C82,200 86,250 82,292", "M28,96 C26,150 28,200 24,236", "M172,96 C174,150 172,200 176,236"],
      buttons: [[112, 146], [112, 180], [112, 214]],
    },
    back: {
      body: "M80,34 C90,30 110,30 120,34 L164,50 C168,56 169,63 169,74 L174,294 L26,294 L31,74 C31,63 32,56 36,50 Z",
      sleeves: ["M36,50 C26,56 22,66 21,82 L16,240 C23,244 34,244 42,241 L45,104 C44,86 40,66 36,50 Z", "M164,50 C174,56 178,66 179,82 L184,240 C177,244 166,244 158,241 L155,104 C156,86 160,66 164,50 Z"],
      ribs: [],
      panels: [{ d: "M80,34 C90,30 110,30 120,34 L124,48 C110,41 90,41 76,48 Z", t: 0.04 }, { d: "M100,232 L106,232 L106,294 L100,294 Z", t: -0.07 }],
      seams: ["M100,44 L100,294", "M45,104 C44,86 40,66 36,50", "M155,104 C156,86 160,66 164,50"],
      stitches: ["M28,288 L172,288"],
      folds: ["M62,96 C58,170 66,230 56,292", "M138,96 C142,170 134,230 144,292", "M28,96 C26,150 28,200 24,236", "M172,96 C174,150 172,200 176,236"],
    },
  },
} as const;

const KINDS = ["tee", "knit", "hoodie", "shirt", "jacket", "coat"] as const;

const SIDE = {
  tee: { hem: 240, long: false, hood: false, width: 0.23 },
  knit: { hem: 232, long: true, hood: false, width: 0.25 },
  hoodie: { hem: 234, long: true, hood: true, width: 0.33 },
  shirt: { hem: 244, long: true, hood: false, width: 0.25 },
  jacket: { hem: 234, long: true, hood: false, width: 0.27 },
  coat: { hem: 296, long: true, hood: false, width: 0.27 },
} as const;

function sideShapes(kind: GarmentKind) {
  const side = SIDE[kind];
  const hem = side.hem;
  const cuff = side.long ? hem - 24 : 104;
  const body = `M86,60 C85,96 88,132 85,168 C83,196 84,${hem - 18} 85,${hem} C92,${hem + 5} 109,${hem + 5} 116,${hem} C117,${hem - 18} 118,196 116,168 C113,132 116,96 114,60 Z`;
  const sleeve = `M84,56 C84,47 90,43 100,43 C110,43 116,47 116,56 C117,${Math.round(cuff * 0.62)} 119,${cuff - 14} 119,${cuff - 2} C119,${cuff + 4} 116,${cuff + 7} 111,${cuff + 7} C100,${cuff + 8} 90,${cuff + 6} 83,${cuff + 2} C80,${cuff - 1} 80,${cuff - 6} 81,${cuff - 10} C83,${cuff - 24} 83,70 84,56 Z`;
  const hood = side.hood ? "M110,46 C128,36 138,54 134,76 C130,90 118,94 113,86 C113,74 112,60 110,46 Z" : null;
  return { body, sleeve, hood, cuff };
}

function artFor(kind: GarmentKind, side: "front" | "back"): Art {
  const entry = ART[kind] as unknown as { front: Art; back: Art };
  return side === "front" ? entry.front : entry.back;
}

function silhouettePaths(art: Art) {
  return [art.body, ...art.sleeves, ...(art.hood ? [art.hood] : [])];
}

const maskCache = new Map();
function silhouetteMask(kind: GarmentKind, side: "front" | "back") {
  const key = `${kind}:${side}`;
  const cached = maskCache.get(key) as string | undefined;
  if (cached) return cached;
  const paths = silhouettePaths(artFor(kind, side)).map((d) => `<path d='${d}'/>`).join("");
  const url = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${VB_W} ${VB_H}' preserveAspectRatio='xMidYMin meet'>${paths}</svg>`)}")`;
  maskCache.set(key, url);
  return url;
}

function mix(color: string, amount: number) {
  if (amount === 0) return color;
  const keep = Math.round((1 - Math.min(1, Math.abs(amount))) * 1000) / 10;
  return `color-mix(in oklab, ${color} ${keep}%, ${amount > 0 ? "white" : "black"})`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lambert(angle: number) {
  const r = (angle * Math.PI) / 180;
  const diffuse = Math.max(0, Math.sin(r) * 0.42 + Math.cos(r) * 0.91);
  return 0.66 + 0.34 * diffuse;
}

function Defs({ uid }: { uid: string }) {
  return (
    <svg aria-hidden="true" width="0" height="0" className={s.defs} focusable="false">
      <defs>
        {KINDS.map((kind) => (["front", "back"] as const).map((side) => (
          <clipPath key={`${kind}-${side}`} id={`${uid}-clip-${kind}-${side}`}>
            {silhouettePaths(artFor(kind, side)).map((d) => <path key={d} d={d} />)}
          </clipPath>
        )))}
        <linearGradient id={`${uid}-volume`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="black" stopOpacity="0.34" />
          <stop offset="0.16" stopColor="black" stopOpacity="0.1" />
          <stop offset="0.42" stopColor="white" stopOpacity="0.07" />
          <stop offset="0.58" stopColor="white" stopOpacity="0.04" />
          <stop offset="0.84" stopColor="black" stopOpacity="0.12" />
          <stop offset="1" stopColor="black" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id={`${uid}-drape`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.16" />
          <stop offset="0.22" stopColor="white" stopOpacity="0" />
          <stop offset="0.75" stopColor="black" stopOpacity="0.04" />
          <stop offset="1" stopColor="black" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={`${uid}-sidevol`} gradientUnits="userSpaceOnUse" x1="80" x2="120" y1="0" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0.14" />
          <stop offset="0.28" stopColor="white" stopOpacity="0.04" />
          <stop offset="0.7" stopColor="black" stopOpacity="0.08" />
          <stop offset="0.95" stopColor="black" stopOpacity="0.3" />
          <stop offset="1" stopColor="black" stopOpacity="0.18" />
        </linearGradient>
        <filter id={`${uid}-cloth`} x="-12%" y="-4%" width="124%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.016 0.028" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {KINDS.map((kind) => (
          <React.Fragment key={`side-${kind}`}>
            <clipPath id={`${uid}-sb-${kind}`}><path d={sideShapes(kind).body} /></clipPath>
            <clipPath id={`${uid}-ss-${kind}`}><path d={sideShapes(kind).sleeve} /></clipPath>
          </React.Fragment>
        ))}
        <linearGradient id={`${uid}-wood`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="color-mix(in oklab, sienna 55%, white)" />
          <stop offset="0.45" stopColor="color-mix(in oklab, sienna 80%, black)" />
          <stop offset="1" stopColor="color-mix(in oklab, sienna 45%, black)" />
        </linearGradient>
        <linearGradient id={`${uid}-woodgrain`} gradientUnits="userSpaceOnUse" spreadMethod="repeat" x1="0" x2="11" y1="0" y2="0.6">
          <stop offset="0" stopColor="black" stopOpacity="0" />
          <stop offset="0.45" stopColor="black" stopOpacity="0.16" />
          <stop offset="0.6" stopColor="white" stopOpacity="0.08" />
          <stop offset="1" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-chrome`} gradientUnits="userSpaceOnUse" x1="98.5" x2="101.7" y1="0" y2="0">
          <stop offset="0" stopColor="color-mix(in oklab, white 45%, gray)" />
          <stop offset="0.35" stopColor="white" />
          <stop offset="0.78" stopColor="color-mix(in oklab, gray 65%, black)" />
          <stop offset="1" stopColor="color-mix(in oklab, gray 75%, white)" />
        </linearGradient>
        <pattern id={`${uid}-rib`} width="2.6" height="8" patternUnits="userSpaceOnUse">
          <rect width="1.1" height="8" fill="black" fillOpacity="0.2" />
          <rect x="1.3" width="0.7" height="8" fill="white" fillOpacity="0.08" />
        </pattern>
        <pattern id={`${uid}-knit`} width="5" height="4" patternUnits="userSpaceOnUse">
          <path d="M0,0 L2.5,4 L5,0" fill="none" stroke="black" strokeOpacity="0.09" strokeWidth="0.7" />
        </pattern>
        <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.55" />
          </feComponentTransfer>
        </filter>
        <filter id={`${uid}-soft`} x="-20%" y="-5%" width="140%" height="110%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
    </svg>
  );
}

const HOOK = "M100,36 L100,-0.4 C100,-3.4 102.2,-4.2 103.9,-2.8 C104.9,-2 105.4,-1.2 105.6,-0.2";
const HOOK_HI = "M99.5,30 L99.5,-0.2 C99.5,-2.4 101,-3.2 102.4,-2.6";
const BAR = "M38,57 Q70,38 100,36 Q130,38 162,57";
const BAR_HI = "M40,54.5 Q71,35.5 100,33.5 Q129,35.5 160,54.5";

function Hook({ uid }: { uid: string }) {
  return (
    <>
      <path d={HOOK} fill="none" stroke="black" strokeOpacity="0.28" strokeWidth="3.4" strokeLinecap="round" transform="translate(0.9 1.1)" />
      <path d={HOOK} fill="none" stroke={`url(#${uid}-chrome)`} strokeWidth="2.6" strokeLinecap="round" />
      <path d={HOOK_HI} fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="0.6" strokeLinecap="round" />
      <ellipse cx="105.9" cy="0.6" rx="1.9" ry="0.9" fill="black" fillOpacity="0.4" />
      <rect x="96" y="27" width="8" height="9" rx="2" fill={`url(#${uid}-chrome)`} />
      <rect x="97.2" y="28.2" width="2" height="6.6" rx="1" fill="white" fillOpacity="0.5" />
    </>
  );
}

function Hanger({ uid, side, kind, material }: { uid: string; side: "front" | "back"; kind: GarmentKind | null; material: "wood" | "matte" | "none" }) {
  const art = kind ? artFor(kind, side) : null;
  const bar = material === "wood" ? `url(#${uid}-wood)` : "currentColor";
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMin meet" className={`${s.layer} ${material === "matte" ? s.matte : ""}`}>
      {art?.hood && <path d={art.hood} fill="var(--garment-color)" />}
      {art?.hood && <path d={art.hood} fill="black" fillOpacity="0.22" />}
      {art?.under && <path d={art.under} fill="var(--garment-under)" />}
      {material !== "none" && !kind && <Hook uid={uid} />}
      {material !== "none" && kind && (
        <>
          <path d={BAR} fill="none" stroke="black" strokeOpacity="0.25" strokeWidth="9.5" strokeLinecap="round" transform="translate(0.6 1.6)" />
          <path d={BAR} fill="none" stroke={bar} strokeWidth="8.5" strokeLinecap="round" />
          {material === "wood" && <path d={BAR} fill="none" stroke={`url(#${uid}-woodgrain)`} strokeWidth="8.5" strokeLinecap="round" />}
          <path d={BAR_HI} fill="none" stroke="white" strokeOpacity={material === "wood" ? 0.3 : 0.14} strokeWidth="1.1" strokeLinecap="round" />
          <Hook uid={uid} />
        </>
      )}
    </svg>
  );
}

function SideHanger({ uid, material }: { uid: string; material: "wood" | "matte" | "none" }) {
  if (material === "none") return null;
  const bar = material === "wood" ? `url(#${uid}-wood)` : "currentColor";
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMin meet" className={`${s.layer} ${material === "matte" ? s.matte : ""}`}>
      <path d="M97.8,35 L102.2,35 L104.5,50 L95.5,50 Z" fill={bar} />
      <path d="M98.6,36 L100,36 L100,49 L97.3,49 Z" fill="white" fillOpacity="0.22" />
      <Hook uid={uid} />
    </svg>
  );
}

function Fabric({ uid, kind, side, color, trim }: { uid: string; kind: GarmentKind; side: "front" | "back"; color: string; trim: string }) {
  const art = artFor(kind, side);
  const clip = `url(#${uid}-clip-${kind}-${side})`;
  const knitted = kind === "knit";
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMin meet" className={s.layer}>
      <path d={art.body} fill={color} />
      {art.sleeves.map((d) => <path key={d} d={d} fill={color} />)}
      <g clipPath={clip}>
        {knitted && <rect width={VB_W} height={VB_H} fill={`url(#${uid}-knit)`} />}
        {art.panels.map((panel) => <path key={panel.d} d={panel.d} fill={mix(color, panel.t)} />)}
        {art.ribs.map((d) => <path key={d} d={d} fill={mix(trim, 0)} />)}
        {art.ribs.map((d) => <path key={`${d}-rib`} d={d} fill={`url(#${uid}-rib)`} />)}
        <g filter={`url(#${uid}-soft)`} fill="none" strokeLinecap="round">
          {art.folds.map((d) => <path key={d} d={d} stroke="black" strokeOpacity="0.22" strokeWidth="4" />)}
          {art.folds.map((d) => <path key={`${d}-hi`} d={d} stroke="white" strokeOpacity="0.1" strokeWidth="2" transform="translate(2.2 0)" />)}
          {art.sleeves.map((d) => <path key={`${d}-edge`} d={d} stroke="black" strokeOpacity="0.2" strokeWidth="3" />)}
        </g>
        <rect width={VB_W} height={VB_H} fill={`url(#${uid}-volume)`} />
        <rect width={VB_W} height={VB_H} fill={`url(#${uid}-drape)`} />
        <rect width={VB_W} height={VB_H} filter={`url(#${uid}-grain)`} opacity="0.16" style={{ mixBlendMode: "multiply" }} />
      </g>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {art.seams.map((d) => <path key={d} d={d} stroke="black" strokeOpacity="0.22" strokeWidth="0.8" />)}
        {art.stitches.map((d) => <path key={d} d={d} stroke={mix(color, 0.35)} strokeOpacity="0.5" strokeWidth="0.6" strokeDasharray="1.6 1.4" />)}
        {art.cords?.map((d) => <path key={d} d={d} stroke={trim} strokeWidth="1.8" />)}
      </g>
      {art.cords?.map((d) => {
        const end = d.trim().split(" ").at(-1)?.split(",").map(Number) ?? [0, 0];
        return <rect key={`${d}-tip`} x={(end[0] ?? 0) - 1.4} y={(end[1] ?? 0) - 1} width="2.8" height="6" rx="1" fill={mix(trim, -0.3)} />;
      })}
      {art.buttons?.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="2.6" fill={mix(trim, -0.15)} />
          <circle cx={(x ?? 0) - 0.6} cy={(y ?? 0) - 0.7} r="0.9" fill="white" fillOpacity="0.45" />
        </g>
      ))}
    </svg>
  );
}

function SideArt({ uid, kind, color, trim }: { uid: string; kind: GarmentKind; color: string; trim: string }) {
  const { body, sleeve, hood, cuff } = sideShapes(kind);
  const knitted = kind === "knit";
  const soft = `url(#${uid}-soft)`;
  const hem = SIDE[kind].hem;
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMin meet" className={s.layer}>
      <g filter={`url(#${uid}-cloth)`}>
        {hood && <path d={hood} fill={mix(color, -0.14)} />}
        {hood && <path d={hood} fill="none" stroke="black" strokeOpacity="0.2" strokeWidth="1.2" />}
        <path d={body} fill={color} />
        <g clipPath={`url(#${uid}-sb-${kind})`}>
          {knitted && <rect width={VB_W} height={VB_H} fill={`url(#${uid}-knit)`} />}
          <g filter={soft} fill="none" strokeLinecap="round">
            <path d={`M90,${cuff + 10} C87,150 92,190 88,${hem - 4}`} stroke="black" strokeOpacity="0.24" strokeWidth="2.6" />
            <path d={`M92,${cuff + 10} C89,150 94,190 90,${hem - 4}`} stroke="white" strokeOpacity="0.14" strokeWidth="1.2" />
            <path d={`M106,${cuff + 6} C109,140 104,186 108,${hem - 2}`} stroke="black" strokeOpacity="0.17" strokeWidth="2.2" />
            <path d={`M107.6,${cuff + 6} C110.6,140 105.6,186 109.6,${hem - 2}`} stroke="white" strokeOpacity="0.1" strokeWidth="1" />
            <path d={`M99,${cuff + 30} C97,170 101,205 98,${hem - 2}`} stroke="black" strokeOpacity="0.1" strokeWidth="2" />
            <path d={`M112,${cuff + 40} C113,170 111,200 113,${hem - 10}`} stroke="black" strokeOpacity="0.12" strokeWidth="1.6" />
            <path d={`M84,${cuff + 50} C86,160 85,200 86,${hem - 6}`} stroke="white" strokeOpacity="0.2" strokeWidth="1.4" />
            <path d={`M80,${cuff + 6} C90,${cuff + 12} 110,${cuff + 12} 120,${cuff + 7}`} stroke="black" strokeOpacity="0.4" strokeWidth="6" />
            <path d={`M84,${hem + 1} C92,${hem + 6} 108,${hem + 6} 116,${hem + 1}`} stroke="black" strokeOpacity="0.32" strokeWidth="6" />
          </g>
          <rect width={VB_W} height={VB_H} fill={`url(#${uid}-sidevol)`} />
          <rect width={VB_W} height={VB_H} fill={`url(#${uid}-drape)`} />
          <rect width={VB_W} height={VB_H} filter={`url(#${uid}-grain)`} opacity="0.16" style={{ mixBlendMode: "multiply" }} />
        </g>
        <path d={sleeve} fill={color} />
        <g clipPath={`url(#${uid}-ss-${kind})`}>
          {knitted && <rect width={VB_W} height={VB_H} fill={`url(#${uid}-knit)`} />}
          <g filter={soft} fill="none" strokeLinecap="round">
            <path d={`M91,62 C88,78 90,${cuff - 14} 91,${cuff}`} stroke="black" strokeOpacity="0.16" strokeWidth="2.6" />
            <path d={`M92.6,62 C89.6,78 91.6,${cuff - 14} 92.6,${cuff}`} stroke="white" strokeOpacity="0.12" strokeWidth="1.1" />
            <path d={`M109,58 C112,76 110,${cuff - 14} 109,${cuff}`} stroke="black" strokeOpacity="0.2" strokeWidth="2.6" />
            <path d={`M86,72 C94,80 104,86 115,${cuff - 10}`} stroke="black" strokeOpacity="0.1" strokeWidth="2.4" />
            <path d="M84,53 C92,49 108,49 116,53" stroke="black" strokeOpacity="0.24" strokeWidth="3.6" />
            <path d={`M81,${cuff - 2} C92,${cuff + 4} 108,${cuff + 5} 119,${cuff + 2}`} stroke="black" strokeOpacity="0.34" strokeWidth="3.2" />
            <path d={`M85,60 C84,80 85,${cuff - 20} 85,${cuff - 4}`} stroke="white" strokeOpacity="0.22" strokeWidth="1.4" />
            <ellipse cx="94" cy="47.5" rx="6" ry="2.4" fill="white" fillOpacity="0.22" stroke="none" />
          </g>
          <rect width={VB_W} height={VB_H} fill={`url(#${uid}-sidevol)`} />
          <rect width={VB_W} height={VB_H} fill={`url(#${uid}-drape)`} />
          <rect width={VB_W} height={VB_H} filter={`url(#${uid}-grain)`} opacity="0.16" style={{ mixBlendMode: "multiply" }} />
        </g>
        <path d={`M82,${cuff + 1} C92,${cuff + 6} 108,${cuff + 7} 118,${cuff + 4}`} fill="none" stroke={mix(color, 0.35)} strokeOpacity="0.45" strokeWidth="0.6" strokeDasharray="1.6 1.4" />
        <path d={`M86,${hem - 3} C92,${hem + 1} 109,${hem + 1} 115,${hem - 3}`} fill="none" stroke={mix(color, 0.35)} strokeOpacity="0.4" strokeWidth="0.6" strokeDasharray="1.6 1.4" />
      </g>
      <ellipse cx="100" cy="46" rx="10" ry="3.2" fill={trim} />
      <ellipse cx="100" cy="46" rx="10" ry="3.2" fill={`url(#${uid}-rib)`} />
      <ellipse cx="100" cy="46" rx="10" ry="3.2" fill="none" stroke="black" strokeOpacity="0.2" strokeWidth="0.6" />
    </svg>
  );
}

function Photo({ src, alt, full }: { src: string; alt: string; full: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} draggable={false} className={`${s.photo} ${full ? s.photoFull : s.photoInset}`} />;
}

type Sim = {
  x: number[]; vx: number[]; tx: number[]; px: number[];
  turn: number[]; vturn: number[]; tturn: number[];
  swing: number[]; vswing: number[];
  tag: number[]; vtag: number[];
  drag: number; grab: number; free: number; last: number; raf: number;
};

function emptySim(): Sim {
  return { x: [], vx: [], tx: [], px: [], turn: [], vturn: [], tturn: [], swing: [], vswing: [], tag: [], vtag: [], drag: -1, grab: 0, free: 0, last: 0, raf: 0 };
}

function footprint(h: number, angle: number, sideW = 0.4) {
  const e = clamp(1 - angle / REST, 0, 1);
  const ease = e * e * (3 - 2 * e);
  return h * ASPECT * (sideW + (0.94 - sideW) * ease);
}

export function ClothingRailHero({
  items,
  eyebrow,
  heading,
  caption,
  action,
  autoplay = false,
  interval = 2600,
  hanger = "wood",
  labels = DEFAULT_LABELS,
  onOpenChange,
  className,
  ...rest
}: ClothingRailHeroProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const count = items.length;
  const stageRef = React.useRef(null as HTMLDivElement | null);
  const slots = React.useRef([] as (HTMLButtonElement | null)[]);
  const swings = React.useRef([] as (HTMLSpanElement | null)[]);
  const turns = React.useRef([] as (HTMLSpanElement | null)[]);
  const sides = React.useRef([] as (HTMLSpanElement | null)[]);
  const drapes = React.useRef([] as (HTMLSpanElement | null)[]);
  const shades = React.useRef([] as (HTMLSpanElement | null)[]);
  const shadows = React.useRef([] as (HTMLSpanElement | null)[]);
  const tags = React.useRef([] as (HTMLSpanElement | null)[]);
  const sim = React.useRef(emptySim());
  const [size, setSize] = React.useState({ width: 0, h: 300, carousel: false });
  const [active, setActive] = React.useState(null as number | null);
  const [focusIndex, setFocusIndex] = React.useState(0);
  const [openIndex, setOpenIndex] = React.useState(null as number | null);
  const [reduced, setReduced] = React.useState(false);
  const [playing, setPlaying] = React.useState(autoplay);
  const [lifted, setLifted] = React.useState(null as number | null);
  const returnFocus = React.useRef(null as number | null);
  const pendingOpen = React.useRef(-1);
  const pointer = React.useRef({ id: -1, index: -1, x: 0, y: 0, t: 0, moved: false, kind: "", swipe: 0, lastX: 0, lastT: 0, v: 0 });
  const sideWidths = React.useMemo(() => items.map((item) => (item.image ? (item.sideImage ? 0.3 : 0.4) : SIDE[item.kind ?? "tee"].width)), [items]);
  const live = React.useRef({ active: null as number | null, size, reduced, count, openIndex: null as number | null, carouselIndex: 0, sideWidths });
  live.current = { ...live.current, active, size, reduced, count, openIndex, sideWidths };

  const carouselIndex = size.carousel ? (active ?? live.current.carouselIndex) : null;

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => { setPlaying(autoplay); }, [autoplay]);

  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = (width: number) => {
      const sideW = live.current.sideWidths.reduce((sum, w) => sum + w, 0) / Math.max(1, live.current.sideWidths.length);
      const restK = footprint(1, REST, sideW) + GAP;
      const activeK = footprint(1, 0, sideW) + GAP;
      const fit = (width - 24) / (count * restK + (activeK - restK));
      const carousel = fit < MIN_WIDE_H;
      const h = carousel ? Math.min(CAROUSEL_H, Math.max(220, width * 0.86)) : Math.min(MAX_H, fit);
      setSize((old) => (Math.abs(old.width - width) < 0.5 && old.carousel === carousel && Math.abs(old.h - h) < 0.5 ? old : { width, h: Math.round(h), carousel }));
    };
    measure(stage.clientWidth);
    const observer = new ResizeObserver((entries) => { const box = entries[0]; if (box) measure(box.contentRect.width); });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [count]);

  const targets = React.useCallback((h: number, width: number, carousel: boolean, front: number | null) => {
    const feet = items.map((_, i) => footprint(h, i === front ? 0 : REST, sideWidths[i]) + h * GAP);
    if (carousel) {
      const centre = front ?? 0;
      const xs = feet.map(() => 0);
      xs[centre] = width / 2;
      for (let i = centre + 1; i < feet.length; i++) xs[i] = (xs[i - 1] ?? 0) + ((feet[i - 1] ?? 0) + (feet[i] ?? 0)) / 2;
      for (let i = centre - 1; i >= 0; i--) xs[i] = (xs[i + 1] ?? 0) - ((feet[i + 1] ?? 0) + (feet[i] ?? 0)) / 2;
      return xs;
    }
    const total = feet.reduce((sum, f) => sum + f, 0);
    let cursor = (width - total) / 2;
    return feet.map((f) => { const x = cursor + f / 2; cursor += f; return x; });
  }, [items, sideWidths]);

  const paint = React.useCallback((i: number) => {
    const st = sim.current;
    const { h } = live.current.size;
    const w = h * ASPECT;
    const slot = slots.current[i];
    if (!slot) return;
    const angle = st.turn[i] ?? REST;
    const swing = st.swing[i] ?? 0;
    slot.style.transform = `translate3d(${((st.x[i] ?? 0) - w / 2).toFixed(2)}px,0,0)`;
    const sw = swings.current[i];
    if (sw) sw.style.transform = `rotate(${swing.toFixed(3)}deg)`;
    const e = clamp(1 - angle / REST, 0, 1);
    const tu = turns.current[i];
    const sd = sides.current[i];
    if (tu) {
      tu.style.transform = `perspective(${PERSPECTIVE}px) rotateY(${angle.toFixed(2)}deg)`;
      tu.style.opacity = sd ? clamp((e - 0.44) / 0.12, 0, 1).toFixed(3) : "1";
    }
    if (sd) {
      sd.style.opacity = clamp((0.56 - e) / 0.12, 0, 1).toFixed(3);
      sd.style.transform = `perspective(${PERSPECTIVE}px) rotateY(${(Math.min(1, e * 2) * -84).toFixed(2)}deg)`;
    }
    const lag = clamp(-(st.vswing[i] ?? 0) * 0.018, -5, 5);
    const dr = drapes.current[i];
    if (dr) dr.style.setProperty("--drape", `${lag.toFixed(3)}deg`);
    const sh = shades.current[i];
    if (sh) sh.style.setProperty("--shade", (1 - lambert(angle)).toFixed(3));
    const shadow = shadows.current[i];
    if (shadow) shadow.style.transform = `translate3d(${(w * 0.05).toFixed(1)}px, ${(h * 0.035).toFixed(1)}px, 0) scaleX(${Math.max(0.12, Math.abs(Math.cos((angle * Math.PI) / 180))).toFixed(3)})`;
    const tag = tags.current[i];
    if (tag) tag.style.transform = `rotate(${(-12 + (st.tag[i] ?? 0)).toFixed(2)}deg)`;
  }, []);

  const step = React.useCallback((now: number) => {
    const st = sim.current;
    const n = live.current.count;
    const dt = st.last ? Math.min(0.034, (now - st.last) / 1000) : 1 / 60;
    st.last = now;
    const { h, width, carousel } = live.current.size;
    let busy = false;
    const sub = 2;
    const sdt = dt / sub;
    for (let k = 0; k < sub; k++) {
      for (let i = 0; i < n; i++) {
        const before = st.vx[i] ?? 0;
        if (i !== st.drag) {
          const restoring = now > st.free;
          const stiff = restoring ? 130 : 0;
          const damp = restoring ? 2 * Math.sqrt(130) * 0.86 : 3.2;
          const ax = -stiff * ((st.x[i] ?? 0) - (st.tx[i] ?? 0)) - damp * before;
          st.vx[i] = before + ax * sdt;
          st.x[i] = (st.x[i] ?? 0) + (st.vx[i] ?? 0) * sdt;
        }
        const accel = ((st.vx[i] ?? 0) - before) / sdt;
        const ta = -150 * ((st.turn[i] ?? 0) - (st.tturn[i] ?? 0)) - 2 * Math.sqrt(150) * 0.78 * (st.vturn[i] ?? 0);
        st.vturn[i] = (st.vturn[i] ?? 0) + ta * sdt;
        st.turn[i] = (st.turn[i] ?? 0) + (st.vturn[i] ?? 0) * sdt;
        const sa = -24 * (st.swing[i] ?? 0) - 2.1 * (st.vswing[i] ?? 0) - clamp(accel, -6000, 6000) * 0.0045;
        st.vswing[i] = (st.vswing[i] ?? 0) + sa * sdt;
        st.swing[i] = clamp((st.swing[i] ?? 0) + (st.vswing[i] ?? 0) * sdt, -12, 12);
        const tagA = -46 * ((st.tag[i] ?? 0) - (st.swing[i] ?? 0) * 0.6) - 3.4 * (st.vtag[i] ?? 0) - (st.vswing[i] ?? 0) * 0.9;
        st.vtag[i] = (st.vtag[i] ?? 0) + tagA * sdt;
        st.tag[i] = clamp((st.tag[i] ?? 0) + (st.vtag[i] ?? 0) * sdt, -30, 30);
      }
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < n - 1; i++) {
          const a = st.x[i] ?? 0;
          const b = st.x[i + 1] ?? 0;
          const minGap = (footprint(h, st.turn[i] ?? REST, live.current.sideWidths[i]) + footprint(h, st.turn[i + 1] ?? REST, live.current.sideWidths[i + 1])) / 2 + h * 0.012;
          const overlap = minGap - (b - a);
          if (overlap <= 0) continue;
          if (i === st.drag) st.x[i + 1] = b + overlap;
          else if (i + 1 === st.drag) st.x[i] = a - overlap;
          else { st.x[i] = a - overlap / 2; st.x[i + 1] = b + overlap / 2; }
          const va = st.vx[i] ?? 0;
          const vb = st.vx[i + 1] ?? 0;
          if (va > vb) {
            const shared = (va + vb) / 2;
            if (i !== st.drag) st.vx[i] = shared;
            if (i + 1 !== st.drag) st.vx[i + 1] = shared;
          }
        }
      }
      if (!carousel && n > 0) {
        const edge = h * 0.06;
        const first = edge + footprint(h, st.turn[0] ?? REST, live.current.sideWidths[0]) / 2;
        const last = width - edge - footprint(h, st.turn[n - 1] ?? REST, live.current.sideWidths[n - 1]) / 2;
        if ((st.x[0] ?? 0) < first) { st.x[0] = first; st.vx[0] = Math.abs(st.vx[0] ?? 0) * 0.3; }
        if ((st.x[n - 1] ?? 0) > last) { st.x[n - 1] = last; st.vx[n - 1] = -Math.abs(st.vx[n - 1] ?? 0) * 0.3; }
      }
    }
    for (let i = 0; i < n; i++) {
      paint(i);
      if (Math.abs((st.vx[i] ?? 0)) > 0.4 || (now > st.free && Math.abs((st.x[i] ?? 0) - (st.tx[i] ?? 0)) > 0.25) || Math.abs((st.turn[i] ?? 0) - (st.tturn[i] ?? 0)) > 0.05 || Math.abs(st.vturn[i] ?? 0) > 0.05 || Math.abs(st.swing[i] ?? 0) > 0.02 || Math.abs(st.vswing[i] ?? 0) > 0.05 || Math.abs((st.tag[i] ?? 0)) > 0.05 || Math.abs(st.vtag[i] ?? 0) > 0.08) busy = true;
    }
    if (st.drag >= 0 || now < st.free) busy = true;
    if (busy) st.raf = requestAnimationFrame(step);
    else {
      st.raf = 0; st.last = 0;
      for (let i = 0; i < n; i++) { if (now > st.free) st.x[i] = st.tx[i] ?? 0; st.swing[i] = 0; st.vswing[i] = 0; st.tag[i] = 0; st.vtag[i] = 0; paint(i); }
    }
  }, [paint]);

  const kick = React.useCallback(() => {
    const st = sim.current;
    if (live.current.reduced) {
      for (let i = 0; i < live.current.count; i++) { st.x[i] = st.tx[i] ?? 0; st.turn[i] = st.tturn[i] ?? REST; st.vx[i] = 0; st.vturn[i] = 0; st.swing[i] = 0; st.vswing[i] = 0; paint(i); }
      return;
    }
    if (!st.raf) { st.last = 0; st.raf = requestAnimationFrame(step); }
  }, [paint, step]);

  const impulse = React.useCallback((i: number, amount: number) => {
    const st = sim.current;
    if (live.current.reduced || i < 0 || i >= live.current.count) return;
    st.vswing[i] = (st.vswing[i] ?? 0) + amount;
    kick();
  }, [kick]);

  React.useLayoutEffect(() => {
    if (!size.width) return;
    const st = sim.current;
    const front = size.carousel ? (active ?? live.current.carouselIndex) : active;
    const xs = targets(size.h, size.width, size.carousel, front);
    const fresh = st.x.length !== count;
    for (let i = 0; i < count; i++) {
      st.tx[i] = (xs[i] ?? 0) + (size.carousel ? pointer.current.swipe : 0);
      st.tturn[i] = i === front ? 0 : REST;
      if (fresh || reduced) {
        st.x[i] = st.tx[i] ?? 0; st.vx[i] = 0; st.px[i] = 0;
        st.turn[i] = st.tturn[i] ?? REST; st.vturn[i] = 0;
        st.swing[i] = st.swing[i] ?? 0; st.vswing[i] = st.vswing[i] ?? 0; st.tag[i] = 0; st.vtag[i] = 0;
      }
    }
    if (fresh) { st.x.length = count; for (let i = 0; i < count; i++) paint(i); }
    kick();
  }, [size, active, count, reduced, targets, paint, kick]);

  const brushed = React.useRef(false);
  React.useEffect(() => {
    if (!size.width || brushed.current || reduced) return;
    brushed.current = true;
    const timers = items.map((_, i) => window.setTimeout(() => impulse(i, 46 - i * 2.5), 120 + i * 55));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [size.width, reduced, items, impulse]);

  React.useEffect(() => () => { cancelAnimationFrame(sim.current.raf); sim.current.raf = 0; }, []);

  React.useLayoutEffect(() => {
    if (openIndex !== null || lifted !== null || returnFocus.current === null) return;
    const index = returnFocus.current;
    returnFocus.current = null;
    slots.current[index]?.focus({ preventScroll: true });
  }, [openIndex, lifted]);

  const choose = React.useCallback((index: number | null) => {
    setActive((old) => {
      if (old === index) return old;
      if (index !== null) { impulse(index - 1, -30); impulse(index + 1, 30); }
      if (old !== null && old !== index) { impulse(old - 1, 14); impulse(old + 1, -14); }
      if (index !== null) live.current.carouselIndex = index;
      return index;
    });
  }, [impulse]);

  const stop = React.useCallback(() => setPlaying(false), []);

  React.useEffect(() => {
    if (!playing || reduced || openIndex !== null || count === 0 || !size.width) return;
    const first = window.setTimeout(function advance() {
      const current = live.current.active;
      choose(current === null ? 0 : (current + 1) % live.current.count);
      timer = window.setTimeout(advance, interval);
    }, active === null ? 1100 : interval);
    let timer = first;
    return () => window.clearTimeout(timer);
  }, [playing, reduced, openIndex, count, interval, size.width, choose, active]);

  const open = React.useCallback((index: number) => {
    stop();
    setActive(index);
    setOpenIndex(index);
    onOpenChange?.(index);
  }, [onOpenChange, stop]);

  const close = React.useCallback(() => {
    setOpenIndex(null);
    onOpenChange?.(null);
  }, [onOpenChange]);

  /** Ratio between on-screen px and layout px (the site scales whole views on small screens). */
  function scaleOf(stage: HTMLElement, box: DOMRect) {
    return stage.clientWidth > 0 && box.width > 0 ? box.width / stage.clientWidth : 1;
  }

  function nearest(clientX: number, clientY: number) {
    const stage = stageRef.current;
    if (!stage) return null;
    const box = stage.getBoundingClientRect();
    const k = scaleOf(stage, box);
    const x = (clientX - box.left) / k;
    const y = (clientY - box.top) / k;
    const { h } = live.current.size;
    if (y < 0 || y > h + 46) return null;
    const st = sim.current;
    let best = null as number | null;
    let distance = Infinity;
    for (let i = 0; i < live.current.count; i++) {
      const half = footprint(h, st.turn[i] ?? REST, live.current.sideWidths[i]) / 2 + 4;
      const d = Math.abs(x - (st.x[i] ?? 0));
      if (d < half && d < distance) { best = i; distance = d; }
    }
    return best;
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const p = pointer.current;
    const st = sim.current;
    const stage = stageRef.current;
    if (p.id === event.pointerId && stage) {
      const box = stage.getBoundingClientRect();
      const k = scaleOf(stage, box);
      const dx = (event.clientX - p.x) / k;
      const now = performance.now();
      if (!p.moved && Math.abs(dx) > 6 / k && Math.abs(event.clientX - p.x) > Math.abs(event.clientY - p.y)) {
        p.moved = true;
        stop();
        if (stage.isConnected) stage.setPointerCapture(event.pointerId);
        if (!live.current.size.carousel && p.index >= 0) {
          st.drag = p.index;
          st.grab = (event.clientX - box.left) / k - (st.x[p.index] ?? 0);
        }
      }
      if (p.moved) {
        const v = (event.clientX - p.lastX) / k / Math.max(1, now - p.lastT);
        p.v = p.v * 0.6 + v * 0.4;
        p.lastX = event.clientX; p.lastT = now;
        if (st.drag >= 0) {
          const x = (event.clientX - box.left) / k - st.grab;
          st.vx[st.drag] = p.v * 1000;
          st.x[st.drag] = x;
          st.free = now + 900;
          kick();
        } else if (live.current.size.carousel) {
          p.swipe = dx;
          const xs = targets(live.current.size.h, live.current.size.width, true, live.current.active ?? live.current.carouselIndex);
          for (let i = 0; i < live.current.count; i++) st.tx[i] = (xs[i] ?? 0) + dx;
          kick();
        }
      }
      return;
    }
    if (event.pointerType !== "mouse" || live.current.size.carousel || live.current.openIndex !== null) return;
    const hit = nearest(event.clientX, event.clientY);
    const current = live.current.active;
    if (current !== null && hit !== current) {
      const box = stage?.getBoundingClientRect();
      const k = stage && box ? scaleOf(stage, box) : 1;
      const keep = box ? Math.abs((event.clientX - box.left) / k - (st.x[current] ?? 0)) < footprint(live.current.size.h, 0) / 2 + 14 : false;
      if (keep && (hit === null || Math.abs((event.clientY - (box?.top ?? 0)) / k) < live.current.size.h + 40)) return;
    }
    if (hit !== null) { stop(); choose(hit); }
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    const hit = nearest(event.clientX, event.clientY);
    const now = performance.now();
    pendingOpen.current = -1;
    pointer.current = { id: event.pointerId, index: hit ?? -1, x: event.clientX, y: event.clientY, t: now, moved: false, kind: event.pointerType, swipe: 0, lastX: event.clientX, lastT: now, v: 0 };
  };

  const finishPointer = (event: React.PointerEvent, cancelled: boolean) => {
    const p = pointer.current;
    if (p.id !== event.pointerId) return;
    const st = sim.current;
    const stage = stageRef.current;
    if (stage?.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    pointer.current = { ...p, id: -1 };
    if (st.drag >= 0) {
      st.drag = -1;
      st.free = performance.now() + 700;
      kick();
      return;
    }
    if (p.moved && live.current.size.carousel) {
      const dx = event.clientX - p.x;
      const current = live.current.active ?? live.current.carouselIndex;
      const stepBy = Math.abs(dx) > 40 || Math.abs(p.v) > 0.45 ? (dx < 0 ? 1 : -1) : 0;
      pointer.current.swipe = 0;
      choose(clamp(current + stepBy, 0, live.current.count - 1));
      for (let i = 0; i < live.current.count; i++) impulse(i, clamp(-p.v * 22, -30, 30));
      return;
    }
    if (cancelled || p.moved || p.index < 0) return;
    stop();
    const touch = p.kind !== "mouse";
    if (touch && live.current.active !== p.index) choose(p.index);
    else pendingOpen.current = p.index;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    stop();
    const from = active ?? focusIndex;
    const next = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : clamp(from + (event.key === "ArrowRight" ? 1 : -1), 0, count - 1);
    setFocusIndex(next);
    choose(next);
    slots.current[next]?.focus({ preventScroll: true });
  };

  const current = active === null ? null : items[active];
  const h = size.h;
  const boxW = h * ASPECT;
  const railY = Math.round(h * 0.07) + 10;
  const railR = Math.max(3, Math.round((RAIL_R / VB_H) * h * 10) / 10);
  const bottom = count ? Math.max(...items.map((item) => (item.image ? VB_H * PHOTO_BOTTOM : SIDE[item.kind ?? "tee"].hem + 8))) / VB_H : 1;

  return (
    <section
      {...rest}
      data-slot="clothing-rail-hero"
      data-mode={size.carousel ? "carousel" : "rail"}
      data-active={active ?? ""}
      aria-roledescription="clothing rail"
      className={`${s.root} ${className ?? ""}`}
    >
      <Defs uid={uid} />
      <div aria-hidden="true" className={s.wash} />
      {(eyebrow || heading) && (
        <header className={s.header}>
          {eyebrow && <p className={s.eyebrow}>{eyebrow}</p>}
          {heading && <h2 className={s.heading}>{heading}</h2>}
        </header>
      )}

      <div
        ref={stageRef}
        data-stage
        role="group"
        aria-label={heading ?? "Clothing rail"}
        className={s.stage}
        style={{ height: Math.round(railY + h * bottom + h * 0.05 + 12), overflowX: "clip" }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={(event) => finishPointer(event, false)}
        onPointerCancel={(event) => finishPointer(event, true)}
        onPointerLeave={(event) => { if (event.pointerType === "mouse" && pointer.current.id < 0 && !size.carousel && !document.activeElement?.matches("[data-garment]:focus-visible")) choose(null); }}
        onKeyDown={onKeyDown}
      >
        <div aria-hidden="true" data-rail className={s.rail} style={{ top: railY - railR, height: railR * 2 }}>
          <div className={s.railShadow} style={{ top: railR * 2 + 1 }} />
          <div className={s.railBar} />
          <div className={s.railGrain} />
          {[0, 1].map((side) => (
            <div key={side} className={`${s.bracket} ${side ? s.bracketR : s.bracketL}`}>
              <span className={`${s.screw} ${s.screwTop}`} />
              <span className={`${s.screw} ${s.screwBottom}`} />
            </div>
          ))}
        </div>

        {items.map((item, i) => {
          const kind = item.kind ?? "tee";
          const color = item.color ?? "var(--rail-muted)";
          const trim = item.trim ?? mix(color, -0.12);
          const turned = active === i;
          const mask = item.image ? `url("${item.image}")` : silhouetteMask(kind, "front");
          const photoBox = hanger === "none" ? s.boxAll : s.box8;
          return (
            <button
              key={item.id}
              ref={(node) => { slots.current[i] = node; }}
              type="button"
              data-garment={i}
              data-front={turned || undefined}
              tabIndex={i === (active ?? focusIndex) ? 0 : -1}
              aria-label={item.name}
              aria-describedby={`${uid}-caption`}
              aria-pressed={turned}
              className={s.slot}
              style={{ top: railY - (HOOK_TOP / VB_H) * h, width: boxW, height: h, zIndex: turned ? 30 : 10 + i, visibility: lifted === i ? "hidden" : undefined, transform: `translate3d(${((sim.current.x[i] ?? 0) - boxW / 2).toFixed(2)}px,0,0)` }}
              onFocus={() => { setFocusIndex(i); if (pointer.current.id < 0) { stop(); choose(i); } }}
              onClick={(event) => { const pending = pendingOpen.current; pendingOpen.current = -1; if (event.detail === 0 || pending === i) open(i); }}
            >
              <span ref={(node) => { swings.current[i] = node; }} className={s.fill} style={{ transformOrigin: `50% ${(HOOK_TOP / VB_H) * 100}%` }}>
                <span aria-hidden="true" className={s.shadowWrap} style={{ filter: `blur(${Math.max(3, h * 0.022).toFixed(1)}px)` }}>
                  <span ref={(node) => { shadows.current[i] = node; }} className={`${s.shadow} ${item.image ? photoBox : s.boxAll}`} style={{ WebkitMask: `${mask} top center / contain no-repeat`, mask: `${mask} top center / contain no-repeat` }} />
                </span>
                {(item.sideImage || !item.image) && (
                  <span ref={(node) => { sides.current[i] = node; }} data-face="side" className={s.fill} style={{ transform: `perspective(${PERSPECTIVE}px) rotateY(0deg)` }}>
                    <SideHanger uid={uid} material={hanger} />
                    {item.sideImage ? <Photo src={item.sideImage} alt="" full={hanger === "none"} /> : <SideArt uid={uid} kind={kind} color={color} trim={trim} />}
                  </span>
                )}
                <span ref={(node) => { turns.current[i] = node; }} data-turn className={`${s.fill} ${s.turn}`} style={{ transform: `perspective(${PERSPECTIVE}px) rotateY(${REST}deg)`, opacity: item.image && !item.sideImage ? 1 : 0 }}>
                  {(["front", "back"] as const).map((side) => (
                    <span key={side} data-face={side} className={s.face} style={{ transform: side === "back" ? "rotateY(180deg)" : undefined, ["--garment-color" as string]: color, ["--garment-under" as string]: mix(color, -0.42) }}>
                      <Hanger uid={uid} side={side} kind={item.image ? null : kind} material={hanger} />
                      <span ref={side === "front" ? (node) => { drapes.current[i] = node; } : undefined} data-drape className={s.drape} style={side === "back" ? { transform: "skewX(calc(var(--drape, 0deg) * -1))" } : undefined}>
                        {item.image
                          ? <Photo src={(side === "back" ? item.backImage : undefined) ?? item.image} alt="" full={hanger === "none"} />
                          : <Fabric uid={uid} kind={kind} side={side} color={color} trim={trim} />}
                        <span ref={side === "front" ? (node) => { shades.current[i] = node; } : undefined} className={`${s.shade} ${item.image ? photoBox : s.boxAll}`} style={{ opacity: "var(--shade, 0.2)", WebkitMask: `${item.image ? `url("${(side === "back" ? item.backImage : undefined) ?? item.image}")` : silhouetteMask(kind, side)} top center / contain no-repeat`, mask: `${item.image ? `url("${(side === "back" ? item.backImage : undefined) ?? item.image}")` : silhouetteMask(kind, side)} top center / contain no-repeat` }} />
                      </span>
                    </span>
                  ))}
                </span>
                {item.tag && (
                  <span ref={(node) => { tags.current[i] = node; }} aria-hidden="true" className={s.tag} style={{ top: (32 / VB_H) * h, transform: "rotate(-12deg)" }}>
                    <span className={s.tagLine} />
                    <span className={s.tagCard}>
                      <span className={s.tagHole} />
                      {item.tag}
                    </span>
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {size.carousel && count > 1 && (
        <div className={s.dots} role="group" aria-label={labels.show}>
          {items.map((item, i) => (
            <button key={item.id} type="button" aria-label={`${labels.show} ${item.name}`} aria-current={carouselIndex === i} onClick={() => { stop(); choose(i); }} className={`${s.dot} ${carouselIndex === i ? s.dotOn : ""}`} />
          ))}
        </div>
      )}

      <div className={s.footer}>
        <div id={`${uid}-caption`} aria-live="polite" className={s.captionBox}>
          <p key={current?.id ?? "caption"} className={s.captionName}>{current ? current.name : caption}</p>
          {current?.description && <p key={`${current.id}-d`} className={s.captionDesc}>{current.description}</p>}
        </div>
        {action}
      </div>

      {openIndex !== null && items[openIndex] && (
        <Detail
          uid={uid}
          item={items[openIndex]}
          index={openIndex}
          total={count}
          hanger={hanger}
          labels={labels}
          reduced={reduced}
          source={() => turns.current[openIndex]?.getBoundingClientRect() ?? null}
          onLift={(lift) => setLifted(lift ? openIndex : null)}
          onClose={() => { const index = openIndex; returnFocus.current = index; close(); impulse(index, (index % 2 ? 1 : -1) * 44); }}
        />
      )}
    </section>
  );
}

function Detail({ uid, item, index, total, hanger, labels, reduced, source, onLift, onClose }: {
  uid: string;
  item: RailGarment;
  index: number;
  total: number;
  hanger: "wood" | "matte" | "none";
  labels: ClothingRailHeroLabels;
  reduced: boolean;
  source: () => DOMRect | null;
  onLift: (lifted: boolean) => void;
  onClose: () => void;
}) {
  const dialogRef = React.useRef(null as HTMLDivElement | null);
  const figureRef = React.useRef(null as HTMLDivElement | null);
  const spinRef = React.useRef(null as HTMLDivElement | null);
  const closeRef = React.useRef(null as HTMLButtonElement | null);
  const [side, setSide] = React.useState("front" as "front" | "back");
  const [shown, setShown] = React.useState(false);
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const angle = React.useRef({ value: 0, target: 0, velocity: 0, raf: 0, last: 0, dragging: false, startX: 0, startY: 0, startAngle: 0, moved: false });
  const closing = React.useRef(false);
  const kind = item.kind ?? "tee";
  const color = item.color ?? "var(--rail-muted)";
  const trim = item.trim ?? mix(color, -0.12);
  const zoomSrc = (side === "back" ? item.backImage : undefined) ?? item.image;
  const titleId = `${uid}-detail-title`;

  const spin = React.useCallback(() => {
    const a = angle.current;
    const node = spinRef.current;
    const loop = (now: number) => {
      const dt = a.last ? Math.min(0.034, (now - a.last) / 1000) : 1 / 60;
      a.last = now;
      const accel = -90 * (a.value - a.target) - 2 * Math.sqrt(90) * 0.82 * a.velocity;
      a.velocity += accel * dt;
      a.value += a.velocity * dt;
      if (node) node.style.transform = `rotateY(${a.value.toFixed(2)}deg)`;
      if (Math.abs(a.value - a.target) < 0.05 && Math.abs(a.velocity) < 0.05) { a.value = a.target; if (node) node.style.transform = `rotateY(${a.value}deg)`; a.raf = 0; a.last = 0; return; }
      a.raf = requestAnimationFrame(loop);
    };
    if (reduced) { a.value = a.target; if (node) node.style.transform = `rotateY(${a.value}deg)`; return; }
    if (!a.raf) a.raf = requestAnimationFrame(loop);
  }, [reduced]);

  const turnTo = React.useCallback((next: "front" | "back") => {
    const a = angle.current;
    const base = Math.round(a.value / 360) * 360;
    a.target = base + (next === "back" ? 180 : 0);
    if (Math.abs(a.target - a.value) > 180) a.target -= 360 * Math.sign(a.target - a.value);
    setSide(next);
    spin();
  }, [spin]);

  React.useLayoutEffect(() => {
    const figure = figureRef.current;
    const from = source();
    closeRef.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let animation = null as Animation | null;
    if (figure && from && !reduced && from.width > 0) {
      const to = figure.getBoundingClientRect();
      const scale = from.height / to.height;
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top - to.top;
      const lift = Math.min(90, Math.abs(dy) * 0.25 + 30);
      onLift(true);
      animation = figure.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - lift}px) scale(${(scale + 1) / 2 * 1.03}) rotate(${dx > 0 ? -2.5 : 2.5}deg)`, offset: 0.5 },
        { transform: "none" },
      ], { duration: 680, easing: "cubic-bezier(.22,.85,.3,1)" });
    }
    const raf = requestAnimationFrame(() => setShown(true));
    const spinning = angle.current;
    return () => { cancelAnimationFrame(raf); animation?.cancel(); document.body.style.overflow = overflow; cancelAnimationFrame(spinning.raf); onLift(false); };
  }, [source, reduced, onLift]);

  const dismiss = React.useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setShown(false);
    const figure = figureRef.current;
    const to = source();
    if (!figure || !to || reduced || to.width === 0) { onClose(); return; }
    const from = figure.getBoundingClientRect();
    const scale = to.height / from.height;
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top - from.top;
    const animation = figure.animate([
      { transform: "none" },
      { transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 30}px) scale(${(scale + 1) / 2})`, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
    ], { duration: 560, easing: "cubic-bezier(.45,0,.55,1)", fill: "forwards" });
    animation.onfinish = () => onClose();
  }, [source, reduced, onClose]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.contains(event.target as Node)) return;
      if (event.key === "Escape") {
        event.preventDefault();
        if (zoomOpen) setZoomOpen(false);
        else dismiss();
      } else if (!zoomOpen && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        turnTo(side === "front" ? "back" : "front");
      } else if (event.key === "Tab") {
        const first = dialog.querySelector("button");
        if (first) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismiss, turnTo, side, zoomOpen]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (zoomOpen) setZoomOpen(false);
      else dismiss();
      return;
    }
    if (!zoomOpen && (event.key === "ArrowLeft" || event.key === "ArrowRight")) { turnTo(side === "front" ? "back" : "front"); return; }
    if (event.key !== "Tab") return;
    const scope = zoomOpen ? dialogRef.current?.querySelector("[data-zoom-overlay]") : dialogRef.current;
    const controls = [...(scope?.querySelectorAll("button") ?? [])].filter((node) => !node.disabled);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const stage = (
    <div ref={figureRef} className={s.figure}>
      <div aria-hidden="true" className={s.cord} style={{ top: `calc(-40vh + ${(HOOK_TOP / VB_H) * 100}%)` }} />
      <div
        data-garment-stage
        className={`${s.spinHost} ${item.image ? s.spinHostZoomable : ""}`}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const a = angle.current;
          a.dragging = true;
          a.startX = event.clientX;
          a.startY = event.clientY;
          a.startAngle = a.value;
          a.moved = false;
          cancelAnimationFrame(a.raf);
          a.raf = 0;
          a.last = 0;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const a = angle.current;
          if (!a.dragging) return;
          const dx = event.clientX - a.startX;
          const dy = event.clientY - a.startY;
          if (!a.moved && Math.hypot(dx, dy) > 6) a.moved = true;
          if (!a.moved) return;
          a.value = clamp(a.startAngle + dx * 0.45, a.startAngle - 220, a.startAngle + 220);
          if (spinRef.current) spinRef.current.style.transform = `rotateY(${a.value.toFixed(2)}deg)`;
        }}
        onPointerUp={(event) => {
          const a = angle.current;
          if (!a.dragging) return;
          a.dragging = false;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          if (!a.moved) {
            if (item.image) setZoomOpen(true);
            return;
          }
          const facing = (((a.value % 360) + 360) % 360);
          turnTo(facing > 90 && facing < 270 ? "back" : "front");
        }}
        onPointerCancel={() => {
          const a = angle.current;
          a.dragging = false;
          if (a.moved) turnTo(side);
        }}
      >
        <div ref={spinRef} className={s.spin}>
          {(["front", "back"] as const).map((face) => (
            <div key={face} className={s.face} style={{ transform: face === "back" ? "rotateY(180deg)" : undefined, ["--garment-color" as string]: color, ["--garment-under" as string]: mix(color, -0.42) }}>
              <Hanger uid={uid} side={face} kind={item.image ? null : kind} material={hanger} />
              {item.image
                ? <Photo src={(face === "back" ? item.backImage : undefined) ?? item.image} alt={face === "front" ? item.name : ""} full={hanger === "none"} />
                : <Fabric uid={uid} kind={kind} side={face} color={color} trim={trim} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className={s.dialog} onKeyDown={onKeyDown}>
      <div aria-hidden="true" className={`${s.backdrop} ${shown ? s.backdropOn : ""}`} onClick={dismiss} />
      <button ref={closeRef} type="button" onClick={dismiss} className={`${s.closeBtn} ${shown ? s.shownOn : ""}`}>
        {labels.close}
        <svg aria-hidden="true" viewBox="0 0 16 16" className={s.closeIcon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
      </button>
      <div className={s.detailGrid}>
        {stage}
        <div className={`${s.info} ${shown ? s.infoOn : ""}`}>
          <p className={s.count}>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</p>
          <h3 id={titleId} className={s.title}>{item.name}</h3>
          {item.description && <p className={s.desc}>{item.description}</p>}
          {item.details && item.details.length > 0 && (
            <ul className={s.chips}>
              {item.details.map((detail) => <li key={detail} className={s.chip}>{detail}</li>)}
            </ul>
          )}
          <div role="group" aria-label={`${labels.front} / ${labels.back}`} className={s.toggle}>
            {(["front", "back"] as const).map((face) => (
              <button key={face} type="button" aria-pressed={side === face} onClick={() => turnTo(face)} className={`${s.toggleBtn} ${side === face ? s.toggleBtnOn : ""}`}>
                {face === "front" ? labels.front : labels.back}
                <span aria-hidden="true" className={s.underline} />
              </button>
            ))}
          </div>
        </div>
      </div>
      {zoomOpen && zoomSrc && (
        <ZoomOverlay
          src={zoomSrc}
          alt={item.name}
          closeLabel={labels.close}
          reduced={reduced}
          onClose={() => {
            setZoomOpen(false);
            closeRef.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </div>,
    document.body,
  );
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 3.5;
const ZOOM_STEP = 0.5;

function ZoomOverlay({ src, alt, closeLabel, reduced, onClose }: {
  src: string;
  alt: string;
  closeLabel: string;
  reduced: boolean;
  onClose: () => void;
}) {
  const canvasRef = React.useRef<HTMLDivElement | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const closeZoomRef = React.useRef<HTMLButtonElement | null>(null);
  const [scale, setScale] = React.useState(() => (typeof window !== "undefined" && window.innerWidth < 768 ? 1.8 : 2));
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [panning, setPanning] = React.useState(false);
  const stateRef = React.useRef({ scale: 2, pos: { x: 0, y: 0 } });
  const pointers = React.useRef(new Map<number, { x: number; y: number }>());
  const gesture = React.useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0, moved: false, pinched: false, pinchDist: 0, pinchScale: 2 });

  React.useEffect(() => {
    stateRef.current = { scale, pos };
  }, [scale, pos]);

  React.useEffect(() => {
    closeZoomRef.current?.focus({ preventScroll: true });
  }, []);

  const clampPos = React.useCallback((x: number, y: number, nextScale: number) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || nextScale <= 1) return { x: 0, y: 0 };
    const maxX = Math.max(0, (img.offsetWidth * nextScale - canvas.clientWidth * 0.35) / 2);
    const maxY = Math.max(0, (img.offsetHeight * nextScale - canvas.clientHeight * 0.35) / 2);
    return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
  }, []);

  const applyScale = React.useCallback((next: number) => {
    const clamped = Math.round(clamp(next, ZOOM_MIN, ZOOM_MAX) * 100) / 100;
    setScale(clamped);
    setPos((prev) => clampPos(prev.x, prev.y, clamped));
  }, [clampPos]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      applyScale(stateRef.current.scale - event.deltaY * 0.0025);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [applyScale]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const g = gesture.current;
    if (pointers.current.size === 1) {
      g.startX = event.clientX;
      g.startY = event.clientY;
      g.startPosX = stateRef.current.pos.x;
      g.startPosY = stateRef.current.pos.y;
      g.moved = false;
      g.pinched = false;
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      g.pinchDist = Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.y ?? 0) - (b?.y ?? 0));
      g.pinchScale = stateRef.current.scale;
      g.moved = true;
      g.pinched = true;
      setPanning(true);
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const g = gesture.current;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.y ?? 0) - (b?.y ?? 0));
      if (g.pinchDist > 0) applyScale(g.pinchScale * (dist / g.pinchDist));
      return;
    }
    if (g.pinched) return;
    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;
    if (!g.moved && Math.hypot(dx, dy) > 6) {
      g.moved = true;
      setPanning(true);
    }
    if (!g.moved) return;
    setPos(clampPos(g.startPosX + dx, g.startPosY + dy, stateRef.current.scale));
  };

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const g = gesture.current;
    if (pointers.current.size === 0) {
      setPanning(false);
      if (!cancelled && !g.moved && !g.pinched) onClose();
    } else if (pointers.current.size === 1) {
      const [remaining] = [...pointers.current.values()];
      if (remaining) {
        g.startX = remaining.x;
        g.startY = remaining.y;
        g.startPosX = stateRef.current.pos.x;
        g.startPosY = stateRef.current.pos.y;
      }
    }
  };

  return (
    <div data-zoom-overlay className={s.zoomOverlay} role="region" aria-label={alt}>
      <div
        ref={canvasRef}
        className={`${s.zoomCanvas} ${panning ? s.zoomCanvasPanning : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => finishPointer(event, false)}
        onPointerCancel={(event) => finishPointer(event, true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          className={`${s.zoomImg} ${panning || reduced ? s.zoomImgInstant : ""}`}
          style={{ transform: `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0) scale(${scale})` }}
        />
      </div>
      <div className={s.zoomBar} onPointerDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={s.zoomCtrl}
          aria-label="Alejar"
          disabled={scale <= ZOOM_MIN}
          onClick={() => applyScale(scale - ZOOM_STEP)}
        >
          −
        </button>
        <span className={s.zoomPct} aria-live="polite">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          className={s.zoomCtrl}
          aria-label="Acercar"
          disabled={scale >= ZOOM_MAX}
          onClick={() => applyScale(scale + ZOOM_STEP)}
        >
          +
        </button>
        <button ref={closeZoomRef} type="button" className={s.zoomClose} onClick={onClose}>
          {closeLabel}
          <svg aria-hidden="true" viewBox="0 0 16 16" className={s.closeIcon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>
      </div>
    </div>
  );
}

export default ClothingRailHero;
