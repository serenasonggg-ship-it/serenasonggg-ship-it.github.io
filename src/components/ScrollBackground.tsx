import { useEffect, useRef, useState, type RefObject } from 'react';

const FRAME_COUNT = 241;
const SEQUENCES = ['/frames/v1', '/frames/v2'] as const;
const LOAD_CONCURRENCY = 6;
const EASING = 0.2;
// Video 2 takes over once the hero has scrolled this far.
const SWITCH_AT = 0.8;

const frameUrl = (base: string, i: number) => `${base}/${String(i).padStart(3, '0')}.jpg`;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

type Sequence = { frames: (HTMLImageElement | undefined)[]; drawn: number };

function loadSequence(base: string, sequence: Sequence, onFrame: () => void, signal: AbortSignal) {
  // Endpoints first so both ends of the scroll range have a frame immediately.
  const order = [0, FRAME_COUNT - 1, ...Array.from({ length: FRAME_COUNT - 2 }, (_, i) => i + 1)];
  let cursor = 0;

  const next = async (): Promise<void> => {
    while (cursor < order.length && !signal.aborted) {
      const index = order[cursor++];
      const img = new Image();
      img.src = frameUrl(base, index);
      try {
        await img.decode();
      } catch {
        continue;
      }
      if (signal.aborted) return;
      sequence.frames[index] = img;
      onFrame();
    }
  };

  for (let i = 0; i < LOAD_CONCURRENCY; i++) void next();
}

function nearestLoaded(frames: Sequence['frames'], index: number) {
  for (let offset = 0; offset < FRAME_COUNT; offset++) {
    const before = frames[index - offset];
    if (before) return before;
    const after = frames[index + offset];
    if (after) return after;
  }
  return undefined;
}

function drawCover(canvas: HTMLCanvasElement, img: HTMLImageElement) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
  const width = img.naturalWidth * scale;
  const height = img.naturalHeight * scale;
  ctx.drawImage(img, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
}

export default function ScrollBackground({ hero }: { hero: RefObject<HTMLElement> }) {
  const canvasRefs = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)];
  const [active, setActive] = useState<0 | 1>(0);

  useEffect(() => {
    const canvases = canvasRefs.map((ref) => ref.current);
    const heroNode = hero.current;
    if (!heroNode || canvases.some((canvas) => !canvas)) return;

    const sequences: Sequence[] = SEQUENCES.map(() => ({ frames: [], drawn: -1 }));
    const targets = [0, 0];
    const positions = [0, 0];
    let activeIndex: 0 | 1 = 0;
    let raf = 0;

    const draw = (i: number, force = false) => {
      const frame = Math.round(positions[i]);
      const sequence = sequences[i];
      if (!force && frame === sequence.drawn) return;
      const img = nearestLoaded(sequence.frames, frame);
      if (!img) return;
      drawCover(canvases[i]!, img);
      sequence.drawn = sequence.frames[frame] ? frame : -1;
    };

    const readScroll = () => {
      const switchPoint = heroNode.offsetHeight * SWITCH_AT;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      targets[0] = clamp01(y / heroNode.offsetHeight) * (FRAME_COUNT - 1);
      targets[1] = clamp01((y - switchPoint) / Math.max(1, maxScroll - switchPoint)) * (FRAME_COUNT - 1);

      const next = y >= switchPoint ? 1 : 0;
      if (next !== activeIndex) {
        activeIndex = next;
        setActive(next);
      }
    };

    const tick = () => {
      let settled = true;
      for (let i = 0; i < 2; i++) {
        positions[i] += (targets[i] - positions[i]) * EASING;
        if (Math.abs(targets[i] - positions[i]) < 0.05) positions[i] = targets[i];
        else settled = false;
        draw(i);
      }
      raf = settled ? 0 : requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvases.forEach((canvas, i) => {
        canvas!.width = Math.round(window.innerWidth * dpr);
        canvas!.height = Math.round(window.innerHeight * dpr);
        draw(i, true);
      });
      readScroll();
      schedule();
    };

    const onScroll = () => {
      readScroll();
      schedule();
    };

    const controller = new AbortController();
    SEQUENCES.forEach((base, i) =>
      loadSequence(base, sequences[i], () => {
        if (sequences[i].drawn !== Math.round(positions[i])) draw(i, true);
      }, controller.signal),
    );

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    resize();

    return () => {
      controller.abort();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
    };
  }, [hero]);

  return (
    <div className="fixed inset-0 z-0 bg-black" aria-hidden="true">
      {canvasRefs.map((ref, i) => (
        <canvas
          key={i}
          ref={ref}
          className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
          style={{ opacity: active === i ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
