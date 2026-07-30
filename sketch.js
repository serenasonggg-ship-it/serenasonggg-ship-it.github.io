"use strict";

const LOOP_MS = 10371.7;
const INK = [132 / 255, 18 / 255, 64 / 255];
const PAPER = [255 / 255, 253 / 255, 254 / 255];
const ROOT_Y = 12;
const SEGMENTS = 128;
const LAYERS = 38;
const GRID_SIZE = 3.0;
const GRID_ROTATION = (10 * Math.PI) / 180;
const DOT_GAMMA = 1.2;
const EXPOSURE = 1.04;
const SCALE_DIVISOR = 780;

let scene;
let postShader;
let mesh = {};
let debugOuterVertices = [];
let smoothedFps = 60;
let lastState = null;
let renderScale = 1;
let canvasW = 748;
let canvasH = 748;
let mouseTargetX = 0;
let mouseTargetY = 0;
let mouseEaseX = 0;
let mouseEaseY = 0;

const query = readQuery();

const profile = [
  { y: -164, rx: 0, rz: 0, cx: -3, cz: 0 },
  { y: -181, rx: 40, rz: 34, cx: -2, cz: 1 },
  { y: -190, rx: 92, rz: 76, cx: -1, cz: 2 },
  { y: -187, rx: 137, rz: 112, cx: 1, cz: 2 },
  { y: -176, rx: 170, rz: 141, cx: 2, cz: 1 },
  { y: -151, rx: 187, rz: 155, cx: 3, cz: 0 },
  { y: -115, rx: 191, rz: 159, cx: 4, cz: -1 },
  { y: -70, rx: 186, rz: 156, cx: 5, cz: -2 },
  { y: -20, rx: 175, rz: 149, cx: 5, cz: -2 },
  { y: 33, rx: 162, rz: 141, cx: 4, cz: -1 },
  { y: 84, rx: 153, rz: 132, cx: 3, cz: 0 },
  { y: 130, rx: 145, rz: 120, cx: 1, cz: 1 },
  { y: 171, rx: 126, rz: 102, cx: -1, cz: 1 },
  { y: 204, rx: 62, rz: 50, cx: -3, cz: 0 },
  { y: 202, rx: 0, rz: 0, cx: -4, cz: 0 },
];

const HALFTONE_VERT = `
  precision highp float;
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  varying vec2 vTexCoord;

  void main() {
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  }
`;

const HALFTONE_FRAG = `
  precision highp float;
  uniform sampler2D uScene;
  uniform vec2 uResolution;
  uniform float uGridSize;
  uniform float uGridRotation;
  uniform float uDotGamma;
  uniform float uExposure;
  uniform float uHalftone;
  uniform vec3 uPaper;
  uniform vec3 uInk;
  varying vec2 vTexCoord;

  void main() {
    vec4 sceneSample = texture2D(uScene, vTexCoord);
    if (uHalftone < 0.5) {
      gl_FragColor = vec4(sceneSample.rgb, 1.0);
      return;
    }

    float luma = dot(sceneSample.rgb, vec3(0.2126, 0.7152, 0.0722));
    float rawDarkness = luma > 0.985 ? 0.0 : clamp((1.0 - luma) * uExposure, 0.0, 1.0);
    float darkness = pow(rawDarkness, uDotGamma);

    float c = cos(uGridRotation);
    float s = sin(uGridRotation);
    vec2 rotated = mat2(c, -s, s, c) * gl_FragCoord.xy;
    vec2 local = fract(rotated / uGridSize) - 0.5;
    float radius = min(0.475, 0.94 * sqrt(max(darkness, 0.0) / 3.14159265));
    float distToCenter = length(local);
    float aa = 0.055;
    float dotMask = 1.0 - smoothstep(radius - aa, radius + aa, distToCenter);
    dotMask *= step(0.0005, darkness);

    gl_FragColor = vec4(mix(uPaper, uInk, dotMask), 1.0);
  }
`;

function readQuery() {
  const params = new URLSearchParams(window.location.search);
  const rawPhase = params.get("phase");
  let frozenPhase = null;
  if (rawPhase && rawPhase !== "live") {
    const parsed = Number(rawPhase);
    if (Number.isFinite(parsed)) frozenPhase = mod(parsed, 1);
  }

  const allowedParts = new Set(["all", "shell", "bones", "cut", "stem"]);
  const rawPart = params.get("part") || "all";
  return {
    frozenPhase,
    part: allowedParts.has(rawPart) ? rawPart : "all",
    halftone: params.get("halftone") !== "0",
    debug: params.get("debug") === "1",
  };
}

function setup() {
  document.documentElement.dataset.appleStage = "loading";
  pixelDensity(1);
  computeCanvasSize();
  const c = createCanvas(canvasW, canvasH, WEBGL);
  c.parent("apple-holder");
  frameRate(60);
  noStroke();

  scene = createGraphics(canvasW, canvasH, WEBGL);
  scene.pixelDensity(1);
  scene.noStroke();
  postShader = createShader(HALFTONE_VERT, HALFTONE_FRAG);

  const shell = buildAppleShell();
  mesh.outer = finishGeometry(shell.outer, "apple-outer");
  mesh.inner = finishGeometry(shell.inner, "apple-inner");
  mesh.cut = finishGeometry(shell.cut, "apple-cut");
  mesh.stem = finishGeometry(buildStem(), "apple-stem");
  mesh.bones = finishGeometry(buildSkeleton(), "apple-bones");

  textFont("monospace");
  window.__APPLE_ANATOMY__ = {
    ready: true,
    loopMs: LOOP_MS,
    canvas: [canvasW, canvasH],
    params: { ...query },
    getState: () => (lastState ? { ...lastState } : null),
  };
  document.documentElement.dataset.appleStage = "ready";
}

function computeCanvasSize() {
  canvasW = Math.max(320, windowWidth);
  canvasH = Math.max(420, windowHeight);
  renderScale = Math.min(canvasW, canvasH) / SCALE_DIVISOR;
}

function windowResized() {
  computeCanvasSize();
  resizeCanvas(canvasW, canvasH);
  if (scene) scene.resizeCanvas(canvasW, canvasH);
}

window.addEventListener("mousemove", (e) => {
  mouseTargetX = e.clientX / Math.max(1, window.innerWidth) - 0.5;
  mouseTargetY = e.clientY / Math.max(1, window.innerHeight) - 0.5;
});

window.addEventListener(
  "touchmove",
  (e) => {
    if (!e.touches || !e.touches[0]) return;
    mouseTargetX = e.touches[0].clientX / Math.max(1, window.innerWidth) - 0.5;
    mouseTargetY = e.touches[0].clientY / Math.max(1, window.innerHeight) - 0.5;
  },
  { passive: true }
);

function draw() {
  const phase =
    query.frozenPhase === null
      ? mod(millis() / LOOP_MS, 1)
      : query.frozenPhase;
  mouseEaseX = lerp(mouseEaseX, mouseTargetX, 0.05);
  mouseEaseY = lerp(mouseEaseY, mouseTargetY, 0.05);
  const angleY =
    radians(-8) - TWO_PI * phase + mouseEaseX * radians(26);

  renderScene(angleY);
  renderPost();

  smoothedFps = lerp(smoothedFps, frameRate(), 0.075);
  const bounds = query.debug ? projectedBounds(angleY) : null;
  lastState = {
    phase,
    fps: smoothedFps,
    angleDegrees: degrees(angleY),
    part: query.part,
    halftone: query.halftone,
    bounds,
  };
  document.documentElement.dataset.appleFrame = String(frameCount);
  document.documentElement.dataset.applePhase = phase.toFixed(6);
  document.documentElement.dataset.appleFps = smoothedFps.toFixed(2);
  if (bounds) {
    document.documentElement.dataset.appleBounds = JSON.stringify(bounds);
  }

  if (query.debug) drawDebug(lastState);
}

function renderScene(angleY) {
  const g = scene;
  g.push();
  g.background(255, 253, 254);
  g.camera(0, 0, 800, 0, 0, 0, 0, 1, 0);
  g.ortho(
    -canvasW / 2,
    canvasW / 2,
    -canvasH / 2,
    canvasH / 2,
    0.1,
    1800
  );
  g.ambientLight(126, 126, 126);
  g.directionalLight(168, 168, 168, -0.28, -0.5, -1);
  g.directionalLight(62, 62, 62, 0.7, 0.15, -0.55);

  g.scale(renderScale);
  const stageOffset = canvasW > 900 ? (canvasW * 0.17) / renderScale : 0;
  g.translate(stageOffset, ROOT_Y, 0);
  g.rotateZ(radians(1));
  g.rotateX(radians(-3) + mouseEaseY * radians(10));
  g.rotateY(angleY);
  g.noStroke();

  if (query.part === "all" || query.part === "shell") {
    g.ambientMaterial(176);
    drawGeometry(g, mesh.outer);
    g.ambientMaterial(143);
    drawGeometry(g, mesh.inner);
  }

  if (query.part === "all" || query.part === "cut") {
    g.ambientMaterial(116);
    drawGeometry(g, mesh.cut);
  }

  if (query.part === "all" || query.part === "stem") {
    g.ambientMaterial(82);
    drawGeometry(g, mesh.stem);
  }

  if (query.part === "all" || query.part === "bones") {
    g.ambientMaterial(134);
    drawGeometry(g, mesh.bones);
  }
  g.pop();
}

function renderPost() {
  background(255, 253, 254);
  shader(postShader);
  postShader.setUniform("uScene", scene);
  postShader.setUniform("uResolution", [width, height]);
  postShader.setUniform("uGridSize", GRID_SIZE * Math.max(renderScale, 0.72));
  postShader.setUniform("uGridRotation", GRID_ROTATION);
  postShader.setUniform("uDotGamma", DOT_GAMMA);
  postShader.setUniform("uExposure", EXPOSURE);
  postShader.setUniform("uHalftone", query.halftone ? 1 : 0);
  postShader.setUniform("uPaper", PAPER);
  postShader.setUniform("uInk", INK);
  noStroke();
  rect(-width / 2, -height / 2, width, height);
  resetShader();
}

function buildAppleShell() {
  const outer = new p5.Geometry();
  const inner = new p5.Geometry();
  const cut = new p5.Geometry();

  for (let i = 0; i < LAYERS; i += 1) {
    const v = i / (LAYERS - 1);
    for (let j = 0; j < SEGMENTS; j += 1) {
      const theta = (TWO_PI * j) / SEGMENTS;
      const pOuter = applePoint(v, theta, false);
      const pInner = applePoint(v, theta, true);
      outer.vertices.push(toP5(pOuter));
      inner.vertices.push(toP5(pInner));
      debugOuterVertices.push(pOuter);
    }
  }

  for (let i = 0; i < LAYERS - 1; i += 1) {
    const vMid = (i + 0.5) / (LAYERS - 1);
    for (let j = 0; j < SEGMENTS; j += 1) {
      const jNext = (j + 1) % SEGMENTS;
      const thetaMid = (TWO_PI * (j + 0.5)) / SEGMENTS;
      if (insideAnyWindow(vMid, thetaMid)) continue;

      const a = i * SEGMENTS + j;
      const b = (i + 1) * SEGMENTS + j;
      const c = (i + 1) * SEGMENTS + jNext;
      const d = i * SEGMENTS + jNext;
      outer.faces.push([a, b, c], [a, c, d]);
      inner.faces.push([a, c, b], [a, d, c]);
    }
  }

  addWindowWalls(cut, "narrow");
  addWindowWalls(cut, "main");
  return { outer, inner, cut };
}

function applePoint(v, theta, isInner) {
  const s = sampleProfile(v);
  const waist = Math.sin(Math.PI * clamp(v, 0, 1));
  const a1 = -0.019 - 0.012 * waist;
  const a2 = 0.009 + 0.006 * Math.sin(Math.PI * v + 0.5);
  const a3 = 0.006 + 0.004 * Math.sin(TWO_PI * v + 1.1);
  const radial =
    1 +
    a1 * Math.cos(theta + 0.16) +
    a2 * Math.cos(2 * theta - 0.63) +
    a3 * Math.cos(3 * theta + 1.08);

  const thickness = 8.2 + 1.8 * Math.sin(Math.PI * v);
  const edgeFade = Math.min(1, v * 15, (1 - v) * 15);
  const shrink = isInner ? thickness * edgeFade : 0;

  const rx = Math.max(0.35, s.rx - shrink);
  const rz = Math.max(0.35, s.rz - shrink * 0.88);
  let y = s.y;

  const topWeight = smoothstep(0.27, 0.01, v) * smoothstep(0, 0.045, v);
  const topShoulders =
    -6.2 *
    topWeight *
    (0.48 + 0.52 * Math.cos(2 * (theta - 0.04))) *
    (1 + 0.12 * Math.cos(theta + 0.8));
  const bottomWeight = smoothstep(0.76, 0.98, v) * smoothstep(1, 0.93, v);
  const bottomLobes =
    7.5 * bottomWeight * (0.3 + 0.7 * Math.cos(2 * (theta + 0.08)));
  y += topShoulders + bottomLobes;

  if (isInner) {
    const towardCenter = y < 9 ? 1 : -1;
    y += towardCenter * thickness * 0.7 * edgeFade;
  }

  return V(
    s.cx + rx * radial * Math.cos(theta),
    y,
    s.cz + rz * radial * Math.sin(theta)
  );
}

function sampleProfile(v) {
  const x = clamp(v, 0, 1) * (profile.length - 1);
  const i = Math.floor(x);
  const t = x - i;
  const a = profile[clamp(i - 1, 0, profile.length - 1)];
  const b = profile[clamp(i, 0, profile.length - 1)];
  const c = profile[clamp(i + 1, 0, profile.length - 1)];
  const d = profile[clamp(i + 2, 0, profile.length - 1)];
  return {
    y: catmull(a.y, b.y, c.y, d.y, t),
    rx: Math.max(0, catmull(a.rx, b.rx, c.rx, d.rx, t)),
    rz: Math.max(0, catmull(a.rz, b.rz, c.rz, d.rz, t)),
    cx: catmull(a.cx, b.cx, c.cx, d.cx, t),
    cz: catmull(a.cz, b.cz, c.cz, d.cz, t),
  };
}

function windowData(kind, v) {
  const isMain = kind === "main";
  const vTop = isMain ? 0.105 : 0.125;
  const vBottom = isMain ? 0.925 : 0.905;
  const q = clamp((v - vTop) / (vBottom - vTop), 0, 1);
  const arch = Math.pow(Math.sin(Math.PI * q), 0.72);

  const top = radians(isMain ? 50 : 27);
  const middle = radians(isMain ? 98 : 50);
  const bottom = radians(isMain ? 57 : 32);
  const edgeWidth = lerp(top, bottom, smoothstep(0, 1, q));
  const total =
    lerp(edgeWidth, middle, arch) *
    (1 + 0.025 * Math.sin(TWO_PI * q + (isMain ? 0.7 : 1.8)));

  const base = radians(isMain ? 262 : 82);
  const drift =
    radians(isMain ? 8 : 6) * (smoothstep(0, 1, q) - 0.5) +
    radians(isMain ? 1.2 : -1.4) * Math.sin(Math.PI * q);
  const center = base + drift + (isMain ? radians(1.5) : radians(-1.8));

  const leftRatio =
    (isMain ? 0.535 : 0.49) +
    0.018 * Math.sin(TWO_PI * q + (isMain ? 0.2 : 1.2));
  return {
    active: v >= vTop && v <= vBottom,
    vTop,
    vBottom,
    center,
    left: total * leftRatio,
    right: total * (1 - leftRatio),
  };
}

function insideAnyWindow(v, theta) {
  return insideWindow("main", v, theta) || insideWindow("narrow", v, theta);
}

function insideWindow(kind, v, theta) {
  const w = windowData(kind, v);
  if (!w.active) return false;
  const d = angularDifference(theta, w.center);
  return d >= -w.left && d <= w.right;
}

function addWindowWalls(g, kind) {
  const probe = windowData(kind, 0.5);
  const stepsV = 34;
  for (const side of [-1, 1]) {
    for (let i = 0; i < stepsV; i += 1) {
      const v0 = lerp(probe.vTop, probe.vBottom, i / stepsV);
      const v1 = lerp(probe.vTop, probe.vBottom, (i + 1) / stepsV);
      const w0 = windowData(kind, v0);
      const w1 = windowData(kind, v1);
      const t0 = w0.center + (side < 0 ? -w0.left : w0.right);
      const t1 = w1.center + (side < 0 ? -w1.left : w1.right);
      addQuad(
        g,
        applePoint(v0, t0, false),
        applePoint(v1, t1, false),
        applePoint(v1, t1, true),
        applePoint(v0, t0, true),
        side > 0
      );
    }
  }

  for (const end of ["top", "bottom"]) {
    const v = end === "top" ? probe.vTop : probe.vBottom;
    const w = windowData(kind, v);
    const arcSteps = kind === "main" ? 22 : 14;
    for (let i = 0; i < arcSteps; i += 1) {
      const theta0 = lerp(w.center - w.left, w.center + w.right, i / arcSteps);
      const theta1 = lerp(
        w.center - w.left,
        w.center + w.right,
        (i + 1) / arcSteps
      );
      addQuad(
        g,
        applePoint(v, theta0, false),
        applePoint(v, theta1, false),
        applePoint(v, theta1, true),
        applePoint(v, theta0, true),
        end === "bottom"
      );
    }
  }
}

function buildStem() {
  const g = new p5.Geometry();
  const centers = [];
  const radii = [];
  const steps = 14;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    centers.push(
      V(
        -3 - 9 * t - 3.5 * t * t,
        -169 - 48 * t,
        -1 - 8 * t + 1.5 * Math.sin(Math.PI * t)
      )
    );
    radii.push(lerp(6.4, 4.1, t) * (1 - 0.035 * Math.sin(Math.PI * t)));
  }
  addTube(g, centers, radii, 10, true);
  return g;
}

function buildSkeleton() {
  const g = new p5.Geometry();
  addSpine(g);
  addRibCage(g);
  addSternum(g);
  addClavicles(g);
  addScapulae(g);
  addPelvis(g);
  return g;
}

function addSpine(g) {
  const count = 24;
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    const y = lerp(-116, 112, t);
    const x = 2.7 * Math.sin((t - 0.08) * Math.PI * 1.7);
    const z = -4.5 + 5.0 * Math.sin((t - 0.2) * Math.PI * 1.55);
    const bodyW = lerp(8.8, 11.8, smoothstep(0.05, 1, t));
    const bodyH = lerp(6.3, 8.2, t);
    const bodyD = lerp(7.2, 9.4, t);
    addEllipsoid(g, V(x, y, z), V(bodyW, bodyH, bodyD), 9, 4);

    const processLength = lerp(8, 12, Math.sin(Math.PI * t));
    addTube(
      g,
      [
        V(x - bodyW * 0.55, y, z - 0.5),
        V(x - bodyW * 0.55 - processLength, y + 0.7, z - 2.6),
      ],
      [2.2, 1.2],
      6,
      true
    );
    addTube(
      g,
      [
        V(x + bodyW * 0.55, y, z - 0.5),
        V(x + bodyW * 0.55 + processLength * 0.94, y - 0.5, z - 2.1),
      ],
      [2.2, 1.2],
      6,
      true
    );
    addTube(
      g,
      [V(x, y, z - bodyD * 0.48), V(x + 0.5, y + 1.2, z - bodyD - 5.2)],
      [2.1, 0.9],
      6,
      true
    );
  }
}

function addRibCage(g) {
  for (let rib = 0; rib < 12; rib += 1) {
    const t = rib / 11;
    const y = -96 + rib * 10.35;
    const lengthShape = Math.sin(Math.PI * (0.16 + 0.72 * t));
    const halfWidth = 47 + 34 * lengthShape - (rib > 9 ? (rib - 9) * 10 : 0);
    const frontZ = rib > 9 ? 24 - (rib - 10) * 4 : 48 - 4 * t;
    const endX = rib > 9 ? halfWidth * 0.66 : halfWidth * (0.28 + 0.08 * t);
    const drop = 8 + rib * 0.92;

    for (const side of [-1, 1]) {
      const asym = side < 0 ? 1.018 : 0.986;
      const p0 = V(side * 7, y, -4.5);
      const p1 = V(
        side * halfWidth * 0.72 * asym,
        y - 5.5 - rib * 0.08,
        -17 - rib * 0.2
      );
      const p2 = V(
        side * halfWidth * asym,
        y + drop * 0.7,
        9 + rib * 0.55
      );
      const p3 = V(
        side * endX * asym,
        y + drop + (side < 0 ? 0.8 : -0.3),
        frontZ
      );
      const points = [];
      const radii = [];
      const samples = rib > 9 ? 12 : 18;
      for (let j = 0; j <= samples; j += 1) {
        const u = j / samples;
        const point = bezier3(p0, p1, p2, p3, u);
        point.y += side * 0.65 * Math.sin(Math.PI * u);
        point.z += 1.6 * Math.sin(TWO_PI * u + rib * 0.23);
        points.push(point);
        radii.push(lerp(2.25 - 0.035 * rib, 1.22, u));
      }
      addTube(g, points, radii, 7, true);
    }
  }
}

function addSternum(g) {
  const sections = [
    { y: -84, w: 18, h: 17, d: 6 },
    { y: -65, w: 14.5, h: 18, d: 5.5 },
    { y: -44, w: 12.5, h: 19, d: 5.2 },
    { y: -22, w: 10.5, h: 19, d: 4.8 },
    { y: -1, w: 8, h: 16, d: 4.2 },
  ];
  for (const s of sections) {
    addBox(g, V(0, s.y, 48), s.w, s.h, s.d);
  }
  addTube(
    g,
    [V(0, 8, 47), V(0.4, 18, 45.5), V(0, 25, 43)],
    [3.5, 2.7, 1.2],
    7,
    true
  );
}

function addClavicles(g) {
  for (const side of [-1, 1]) {
    const points = [];
    const radii = [];
    const p0 = V(side * 7, -87, 48);
    const p1 = V(side * 30, -95, 46);
    const p2 = V(side * 63, -80, 30);
    const p3 = V(side * 99, -82 + (side < 0 ? 2 : -1), 9);
    const samples = 17;
    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const p = bezier3(p0, p1, p2, p3, t);
      p.y += side * 2.2 * Math.sin(TWO_PI * t);
      points.push(p);
      radii.push(lerp(3.2, 2.3, t));
    }
    addTube(g, points, radii, 7, true);
  }
}

function addScapulae(g) {
  for (const side of [-1, 1]) {
    const sx = side;
    const zOffset = side < 0 ? -17 : -15;
    const poly = [
      V(sx * 96, -80, zOffset),
      V(sx * 67, -68, zOffset - 3),
      V(sx * 58, -21, zOffset - 1),
      V(sx * 74, 3, zOffset + 2),
      V(sx * 96, -28, zOffset + 1),
    ];
    if (side < 0) poly.reverse();
    addExtrudedPolygon(g, poly, 3.4);
    addTube(
      g,
      [
        V(sx * 92, -61, zOffset + 3.2),
        V(sx * 77, -48, zOffset + 5),
        V(sx * 63, -37, zOffset + 4),
      ],
      [2.4, 2.0, 1.0],
      6,
      true
    );
  }
}

function addPelvis(g) {
  addSacrum(g);
  for (const side of [-1, 1]) {
    const centerX = side * 43;
    const centerY = 108 + (side < 0 ? 0 : 2);
    const outer = [];
    const inner = [];
    const count = 12;
    for (let i = 0; i < count; i += 1) {
      const a = (TWO_PI * i) / count;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const outerFlare = 1.12 - 0.15 * sa;
      const innerFlare = 1.02 - 0.12 * sa;
      outer.push(
        V(
          centerX +
            side *
              (34 * outerFlare * ca -
                9 * sa +
                2.8 * Math.sin(2 * a + side * 0.25)),
          centerY + 46 * sa - 6 * Math.cos(2 * a) + side * 1.5 * Math.sin(a),
          -1 + 6 * Math.cos(a) + side * 1.4 * Math.sin(a)
        )
      );
      inner.push(
        V(
          centerX +
            side *
              (16.5 * innerFlare * ca -
                4.8 * sa +
                2.2 * Math.sin(2 * a + 0.55)),
          centerY +
            27 * sa -
            4 * Math.cos(2 * a + 0.3) +
            side * 1.2 * Math.sin(a + 0.4),
          1 + 3.5 * Math.cos(a) + side * 0.9 * Math.sin(a)
        )
      );
    }
    if (side < 0) {
      outer.reverse();
      inner.reverse();
    }
    addThickRing(g, outer, inner, 7);

    const upperStart = V(side * 28, 121, 5);
    const pubicEnd = V(side * 7, 144, 15);
    addTube(
      g,
      [upperStart, V(side * 21, 134, 10), pubicEnd],
      [4.0, 3.1, 2.4],
      7,
      true
    );
    addTube(
      g,
      [
        V(side * 57, 137, -1),
        V(side * 47, 155, 4),
        V(side * 17, 163, 10),
        V(side * 7, 149, 15),
      ],
      [4.8, 4.1, 3.2, 2.5],
      7,
      true
    );
  }
}

function addSacrum(g) {
  const front = [
    V(-18, 91, 1),
    V(18, 91, 1),
    V(14, 118, 4),
    V(7, 143, 7),
    V(-7, 143, 7),
    V(-14, 118, 4),
  ];
  addExtrudedPolygon(g, front, 10);
  for (let i = 0; i < 4; i += 1) {
    addTube(
      g,
      [V(-9 + i * 6, 101 + i * 8, 8), V(-6 + i * 4, 107 + i * 8, 10)],
      [1.2, 0.8],
      6,
      true
    );
  }
}

function addTube(g, points, radii, sides = 7, caps = true) {
  if (points.length < 2) return;
  const base = g.vertices.length;
  for (let i = 0; i < points.length; i += 1) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const tangent = vNorm(vSub(next, prev));
    const reference =
      Math.abs(tangent.y) > 0.82 ? V(0, 0, 1) : V(0, 1, 0);
    let n = vNorm(vCross(tangent, reference));
    if (vLength(n) < 0.001) n = V(1, 0, 0);
    const b = vNorm(vCross(tangent, n));
    const radius = Array.isArray(radii) ? radii[i] : radii;
    for (let j = 0; j < sides; j += 1) {
      const a = (TWO_PI * j) / sides;
      const offset = vAdd(
        vMul(n, Math.cos(a) * radius),
        vMul(b, Math.sin(a) * radius)
      );
      g.vertices.push(toP5(vAdd(points[i], offset)));
    }
  }

  for (let i = 0; i < points.length - 1; i += 1) {
    for (let j = 0; j < sides; j += 1) {
      const jn = (j + 1) % sides;
      const a = base + i * sides + j;
      const b = base + (i + 1) * sides + j;
      const c = base + (i + 1) * sides + jn;
      const d = base + i * sides + jn;
      g.faces.push([a, b, c], [a, c, d]);
    }
  }

  if (caps) {
    const firstCenter = g.vertices.length;
    g.vertices.push(toP5(points[0]));
    const lastCenter = g.vertices.length;
    g.vertices.push(toP5(points[points.length - 1]));
    const lastRing = base + (points.length - 1) * sides;
    for (let j = 0; j < sides; j += 1) {
      const jn = (j + 1) % sides;
      g.faces.push([firstCenter, base + jn, base + j]);
      g.faces.push([lastCenter, lastRing + j, lastRing + jn]);
    }
  }
}

function addEllipsoid(g, center, radii, lon = 10, lat = 5) {
  const top = g.vertices.length;
  g.vertices.push(toP5(V(center.x, center.y - radii.y, center.z)));
  const ringBase = g.vertices.length;
  for (let iy = 1; iy < lat; iy += 1) {
    const phi = -HALF_PI + (Math.PI * iy) / lat;
    const cp = Math.cos(phi);
    const sp = Math.sin(phi);
    for (let ix = 0; ix < lon; ix += 1) {
      const theta = (TWO_PI * ix) / lon;
      g.vertices.push(
        toP5(
          V(
            center.x + radii.x * cp * Math.cos(theta),
            center.y + radii.y * sp,
            center.z + radii.z * cp * Math.sin(theta)
          )
        )
      );
    }
  }
  const bottom = g.vertices.length;
  g.vertices.push(toP5(V(center.x, center.y + radii.y, center.z)));

  for (let ix = 0; ix < lon; ix += 1) {
    const xn = (ix + 1) % lon;
    g.faces.push([top, ringBase + ix, ringBase + xn]);
  }

  for (let iy = 0; iy < lat - 2; iy += 1) {
    for (let ix = 0; ix < lon; ix += 1) {
      const xn = (ix + 1) % lon;
      const a = ringBase + iy * lon + ix;
      const b = ringBase + (iy + 1) * lon + ix;
      const c = ringBase + (iy + 1) * lon + xn;
      const d = ringBase + iy * lon + xn;
      g.faces.push([a, b, c], [a, c, d]);
    }
  }

  const lastRing = ringBase + (lat - 2) * lon;
  for (let ix = 0; ix < lon; ix += 1) {
    const xn = (ix + 1) % lon;
    g.faces.push([lastRing + ix, bottom, lastRing + xn]);
  }
}

function addBox(g, center, sx, sy, sz) {
  const x = sx / 2;
  const y = sy / 2;
  const z = sz / 2;
  const vertices = [
    V(-x, -y, -z),
    V(x, -y, -z),
    V(x, y, -z),
    V(-x, y, -z),
    V(-x, -y, z),
    V(x, -y, z),
    V(x, y, z),
    V(-x, y, z),
  ].map((p) => vAdd(p, center));
  const faces = [
    [0, 2, 1],
    [0, 3, 2],
    [4, 5, 6],
    [4, 6, 7],
    [0, 1, 5],
    [0, 5, 4],
    [3, 7, 6],
    [3, 6, 2],
    [0, 4, 7],
    [0, 7, 3],
    [1, 2, 6],
    [1, 6, 5],
  ];
  const base = g.vertices.length;
  for (const p of vertices) g.vertices.push(toP5(p));
  for (const f of faces) g.faces.push(f.map((i) => base + i));
}

function addExtrudedPolygon(g, points, depth) {
  const base = g.vertices.length;
  const half = depth / 2;
  for (const p of points) g.vertices.push(toP5(V(p.x, p.y, p.z - half)));
  for (const p of points) g.vertices.push(toP5(V(p.x, p.y, p.z + half)));
  const n = points.length;
  for (let i = 1; i < n - 1; i += 1) {
    g.faces.push([base, base + i + 1, base + i]);
    g.faces.push([base + n, base + n + i, base + n + i + 1]);
  }
  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n;
    g.faces.push(
      [base + i, base + j, base + n + j],
      [base + i, base + n + j, base + n + i]
    );
  }
}

function addThickRing(g, outer, inner, depth) {
  const n = outer.length;
  const base = g.vertices.length;
  const half = depth / 2;
  for (const p of outer) g.vertices.push(toP5(V(p.x, p.y, p.z - half)));
  for (const p of inner) g.vertices.push(toP5(V(p.x, p.y, p.z - half)));
  for (const p of outer) g.vertices.push(toP5(V(p.x, p.y, p.z + half)));
  for (const p of inner) g.vertices.push(toP5(V(p.x, p.y, p.z + half)));

  const ob = base;
  const ib = base + n;
  const of = base + n * 2;
  const inf = base + n * 3;
  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n;
    g.faces.push([of + i, of + j, inf + j], [of + i, inf + j, inf + i]);
    g.faces.push([ob + i, ib + j, ob + j], [ob + i, ib + i, ib + j]);
    g.faces.push([ob + i, ob + j, of + j], [ob + i, of + j, of + i]);
    g.faces.push([ib + i, inf + j, ib + j], [ib + i, inf + i, inf + j]);
  }
}

function addQuad(g, a, b, c, d, flip = false) {
  const base = g.vertices.length;
  g.vertices.push(toP5(a), toP5(b), toP5(c), toP5(d));
  if (flip) g.faces.push([base, base + 2, base + 1], [base, base + 3, base + 2]);
  else g.faces.push([base, base + 1, base + 2], [base, base + 2, base + 3]);
}

function finishGeometry(g, id) {
  g.gid = id;
  g.computeNormals();
  return g;
}

function drawGeometry(g, geometry) {
  if (
    g &&
    g._renderer &&
    typeof g._renderer.drawBuffers === "function" &&
    g._renderer.retainedMode &&
    g._renderer.retainedMode.geometry &&
    g._renderer.retainedMode.geometry[geometry.gid]
  ) {
    g._renderer.drawBuffers(geometry.gid);
  } else {
    g.model(geometry);
  }
}

function projectedBounds(angleY) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const points = debugOuterVertices;
  for (let i = 0; i < points.length; i += 1) {
    const p = rotateRoot(points[i], angleY);
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const stemExtremes = [
    V(-3, -174, -1),
    V(-16, -222, -9),
    V(-22, -214, -13),
  ];
  for (const raw of stemExtremes) {
    const p = rotateRoot(raw, angleY);
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  return {
    x: minX + width / 2,
    y: minY + height / 2,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function rotateRoot(p, angleY) {
  let q = rotateYPoint(p, angleY);
  q = rotateXPoint(q, radians(-3));
  q = rotateZPoint(q, radians(1));
  q.y += ROOT_Y;
  return q;
}

function drawDebug(state) {
  const b = state.bounds;
  push();
  resetMatrix();
  translate(-width / 2, -height / 2, 2);
  noFill();
  stroke(132, 18, 64, 190);
  strokeWeight(1);
  rect(b.x, b.y, b.width, b.height);
  noStroke();
  fill(132, 18, 64);
  textSize(12);
  textAlign(LEFT, TOP);
  const lines = [
    `phase  ${state.phase.toFixed(5)}`,
    `fps    ${state.fps.toFixed(1)}`,
    `angle  ${state.angleDegrees.toFixed(2)}°`,
    `bbox   ${b.width.toFixed(1)} × ${b.height.toFixed(1)}`,
    `part   ${state.part}`,
  ];
  text(lines.join("\n"), 18, 18);
  pop();
}

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

function bezier3(a, b, c, d, t) {
  const u = 1 - t;
  return V(
    u * u * u * a.x +
      3 * u * u * t * b.x +
      3 * u * t * t * c.x +
      t * t * t * d.x,
    u * u * u * a.y +
      3 * u * u * t * b.y +
      3 * u * t * t * c.y +
      t * t * t * d.y,
    u * u * u * a.z +
      3 * u * u * t * b.z +
      3 * u * t * t * c.z +
      t * t * t * d.z
  );
}

function V(x, y, z) {
  return { x, y, z };
}

function toP5(v) {
  return createVector(v.x, v.y, v.z);
}

function vAdd(a, b) {
  return V(a.x + b.x, a.y + b.y, a.z + b.z);
}

function vSub(a, b) {
  return V(a.x - b.x, a.y - b.y, a.z - b.z);
}

function vMul(v, s) {
  return V(v.x * s, v.y * s, v.z * s);
}

function vCross(a, b) {
  return V(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}

function vLength(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function vNorm(v) {
  const m = vLength(v);
  return m > 1e-8 ? vMul(v, 1 / m) : V(0, 0, 0);
}

function rotateXPoint(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return V(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
}

function rotateYPoint(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return V(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
}

function rotateZPoint(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return V(p.x * c - p.y * s, p.x * s + p.y * c, p.z);
}

function angularDifference(a, b) {
  return mod(a - b + Math.PI, TWO_PI) - Math.PI;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function clamp(x, low, high) {
  return Math.max(low, Math.min(high, x));
}

function smoothstep(edge0, edge1, x) {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
