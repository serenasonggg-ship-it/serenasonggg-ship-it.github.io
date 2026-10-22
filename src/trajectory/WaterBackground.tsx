import { useEffect, useRef } from 'react';

// Render at a fraction of the viewport; the surface is soft, so upscaling is invisible and keeps the GPU cost low.
const RENDER_SCALE = 0.6;
const MAX_RIPPLES = 8;
const FALLBACK = '#313d42';

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_depth;
uniform vec4 u_rip[${MAX_RIPPLES}];

float hash1(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash1(i), hash1(i + vec2(1.0, 0.0)), f.x),
             mix(hash1(i + vec2(0.0, 1.0)), hash1(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 disp = vec2(0.0);
  float height = 0.0;
  for (int k = 0; k < ${MAX_RIPPLES}; k++) {
    vec4 r = u_rip[k];
    float age = u_time - r.z;
    if (r.w <= 0.0 || age < 0.0 || age > 4.0) continue;
    vec2 dv = frag - r.xy;
    float d = length(dv);
    float front = age * 160.0;
    float ring = exp(-pow((d - front) / 45.0, 2.0));
    float wave = sin((d - front) * 0.09) * ring * exp(-age * 1.1) * r.w;
    disp += (dv / max(d, 1.0)) * wave * 12.0;
    height += wave;
  }

  float t = u_time;
  vec2 uv = (frag + disp) / u_res.y * 1.4;
  float shade = vnoise(uv * 0.9 + t * 0.04) * 0.6 + vnoise(uv * 1.8 - t * 0.03) * 0.4;

  // u_depth: 0 at the top of the page (deep sea, grey-blue) to 1 at the bottom (near the surface, light aqua).
  float y = frag.y / u_res.y;
  vec3 deep = mix(vec3(0.277, 0.357, 0.398), vec3(0.42, 0.72, 0.76), u_depth);
  vec3 shallow = mix(vec3(0.36, 0.44, 0.46), vec3(0.76, 0.93, 0.92), u_depth);
  vec3 col = mix(deep, shallow, 0.2 + 0.45 * y + 0.35 * shade);
  col += height * 0.16 + dot(disp, vec2(0.5, 0.8)) * 0.004;

  float rays = (0.5 + 0.5 * sin(frag.x * 0.012 + frag.y * 0.004 + t * 0.2))
             * (0.5 + 0.5 * sin(frag.x * 0.021 - t * 0.13));
  col += rays * y * y * 0.18 * u_depth;

  col *= 1.0 - mix(0.4, 0.08, u_depth);
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function WaterBackground({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!canvas || !gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_res');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRip = gl.getUniformLocation(program, 'u_rip');
    const uDepth = gl.getUniformLocation(program, 'u_depth');

    const ripples = new Float32Array(MAX_RIPPLES * 4);
    let nextSlot = 0;
    let lastRipple = 0;
    let raf = 0;
    let depth = 0;
    const start = performance.now();
    const now = () => (performance.now() - start) / 1000;

    const addRipple = (clientX: number, clientY: number, strength: number) => {
      const o = nextSlot * 4;
      ripples[o] = clientX * RENDER_SCALE;
      ripples[o + 1] = (window.innerHeight - clientY) * RENDER_SCALE;
      ripples[o + 2] = now();
      ripples[o + 3] = strength;
      nextSlot = (nextSlot + 1) % MAX_RIPPLES;
    };

    const resize = () => {
      canvas.width = Math.max(1, Math.round(window.innerWidth * RENDER_SCALE));
      canvas.height = Math.max(1, Math.round(window.innerHeight * RENDER_SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const scrollDepth = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    const render = (time: number) => {
      gl.uniform1f(uTime, time);
      gl.uniform1f(uDepth, depth);
      gl.uniform4fv(uRip, ripples);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const loop = () => {
      depth += (scrollDepth() - depth) * 0.08;
      render(now());
      raf = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      const t = now();
      if (t - lastRipple < 0.12) return;
      lastRipple = t;
      addRipple(event.clientX, event.clientY, 0.6);
    };
    const onDown = (event: PointerEvent) => addRipple(event.clientX, event.clientY, 1.5);

    resize();
    window.addEventListener('resize', resize);
    if (reducedMotion) {
      const renderStatic = () => {
        depth = scrollDepth();
        render(12);
      };
      renderStatic();
      window.addEventListener('resize', renderStatic);
      window.addEventListener('scroll', renderStatic, { passive: true });
      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('resize', renderStatic);
        window.removeEventListener('scroll', renderStatic);
      };
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    raf = requestAnimationFrame(loop);
    const drops = window.setInterval(() => {
      addRipple(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 0.5);
    }, 2600);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(drops);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ backgroundColor: FALLBACK }}
      aria-hidden="true"
    />
  );
}
