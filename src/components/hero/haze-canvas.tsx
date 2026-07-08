"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  NoBlending,
  RGBAFormat,
  ShaderMaterial,
  Vector2,
  Vector4,
} from "three";
import type { MotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const MAP_SIZE = 64;

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Six thin white smoke layers — tall vertical wisps of ridged fbm rising and
 * curling like cigarette smoke, each with its own scale, opacity, drift speed,
 * pointer parallax depth, and staggered reveal. The portrait's luminance map (uMap)
 * thins the haze over bright skin, boosts it slightly in dark regions, and
 * bends the flow along bright/dark contours via the mask gradient.
 */
const fragmentShader = /* glsl */ `
  varying vec2 vUv;

  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform sampler2D uMap;
  uniform vec4 uRect;   // portrait rect in section uv: x0, y0 (bottom-left), w, h
  uniform float uReady;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(17.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  vec2 curlFlow(vec2 p, float t, float seed) {
    vec2 q = p * 0.9 + vec2(seed * 7.1, seed * 3.9) + vec2(t * 0.032, -t * 0.021);
    float e = 0.22;
    float dx = noise(q + vec2(e, 0.0)) - noise(q - vec2(e, 0.0));
    float dy = noise(q + vec2(0.0, e)) - noise(q - vec2(0.0, e));
    return normalize(vec2(dy, -dx) + vec2(0.001));
  }

  vec2 curvedPath(vec2 p, float t, float seed, float strength) {
    vec2 flow = vec2(0.0);
    vec2 q = p;
    for (int j = 0; j < 3; j++) {
      float fj = float(j);
      vec2 v = curlFlow(q + flow * 0.7, t * (0.55 + fj * 0.18), seed + fj * 0.37);
      flow += v * strength * (1.0 - fj * 0.22);
      q += v * 0.28;
    }
    return flow;
  }

  float plumeMask(vec2 uv, vec2 flow, float t, float seed, float fi) {
    vec2 q = uv;
    q += flow * vec2(0.34, 0.24);
    q += vec2(
      sin(t * (0.05 + 0.015 * fi) + seed * 6.0),
      cos(t * (0.04 + 0.012 * fi) + seed * 3.0)
    ) * 0.018;

    float side = mix(0.24, 0.76, step(0.5, fract(seed * 3.17 + fi * 0.21)));
    float center = side
      + sin(q.y * (2.1 + seed * 1.2) + t * (0.16 + seed * 0.06) + seed * 8.0) * (0.16 + 0.04 * seed)
      + sin(q.y * (5.2 + fi * 0.3) - t * (0.11 + seed * 0.05) + seed * 5.0) * 0.055;
    float width = 0.24
      + 0.06 * fbm(q * vec2(2.0, 1.4) + vec2(seed * 11.0))
      + 0.024 * fi;
    float ribbon = 1.0 - smoothstep(width * 0.34, width, abs(q.x - center));
    float torn = smoothstep(
      0.28,
      0.82,
      fbm(q * vec2(3.0, 4.5) + flow * 1.2 + vec2(t * 0.05, -t * 0.035))
    );
    float veil = smoothstep(
      0.18,
      0.9,
      fbm(q * vec2(0.9, 1.35) + vec2(seed * 2.0, -t * 0.035))
    );

    float sideLift = smoothstep(0.08, 0.42, abs(uv.x - 0.5));
    return clamp((ribbon * (0.55 + 0.45 * torn) + veil * 0.28) * (0.72 + sideLift * 0.45), 0.0, 1.0);
  }

  // r: luminance * alpha, g: "bright subject" mask. Zero outside the portrait rect.
  vec2 portraitField(vec2 uv) {
    vec2 puv = (uv - uRect.xy) / uRect.zw;
    vec2 inside = step(vec2(0.0), puv) * step(puv, vec2(1.0));
    return texture2D(uMap, clamp(puv, 0.0, 1.0)).rg * (inside.x * inside.y * uReady);
  }

  void main() {
    vec2 uv = vUv;
    vec2 suv = vec2(uv.x * uAspect, uv.y);

    vec2 port = portraitField(uv);
    float lum = port.x;
    float subj = port.y;

    // Contour flow: gradient of the subject mask, rotated 90deg, so streaks
    // slide along the silhouette instead of crossing it.
    float e = 0.02;
    float gx = portraitField(uv + vec2(e, 0.0)).y - portraitField(uv - vec2(e, 0.0)).y;
    float gy = portraitField(uv + vec2(0.0, e)).y - portraitField(uv - vec2(0.0, e)).y;
    vec2 curl = vec2(-gy, gx);
    float rim = clamp(length(vec2(gx, gy)) * 2.4, 0.0, 1.0);

    // Very slow domain warp — lazy ink-in-water curls, never boiling.
    vec2 wp = suv * 0.85 + vec2(uTime * 0.016, -uTime * 0.007);
    vec2 warp = vec2(fbm(wp), fbm(wp + vec2(4.7, 2.1))) - 0.5;

    // Pure white smoke — the colored glows behind provide all the tint.
    vec3 smokeCol = vec3(1.0);

    vec3 col = vec3(0.0);

    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float seed = hash(vec2(fi * 17.19, fi + 3.71));
      float angle = seed * 6.2831853;
      vec2 drift = vec2(cos(angle), sin(angle) * 0.55 - 0.35) * (0.02 + 0.006 * fi);
      vec2 crossDrift = vec2(cos(angle + 1.85), sin(angle + 1.85)) * (0.008 + 0.002 * fi);
      float scale = 1.05 + 0.5 * fi;
      // Slightly tall features, then curved by the flow field below.
      vec2 stretch = vec2(0.48 + 0.04 * seed, 1.48 + 0.22 * fi);

      vec2 p = suv;
      vec2 flow = curvedPath(suv * (0.8 + 0.08 * fi), uTime, seed, 0.075 + 0.014 * fi);
      p += uPointer * (0.006 + 0.006 * fi);
      p += curl * rim * (0.055 + 0.02 * fi);
      p += warp * (0.17 + 0.05 * fi);
      p += flow;
      p += vec2(
        sin((suv.y + fi) * (2.2 + 0.35 * fi) + uTime * (0.12 + 0.02 * fi)),
        cos((suv.x + fi) * (2.8 + 0.25 * fi) - uTime * (0.1 + 0.018 * fi))
      ) * (0.032 + 0.006 * fi);
      p = rot((seed - 0.5) * 0.85 + 0.09 * sin(uTime * 0.12 + fi)) * p;
      p = p * stretch * scale
        + drift * uTime
        + crossDrift * sin(uTime * (0.32 + seed))
        + flow * (0.9 + 0.18 * fi)
        + vec2(7.31 * fi, 3.17 * fi);

      float n = fbm(p);
      float lo = 0.42 - 0.018 * fi;
      float fiber = smoothstep(lo, lo + 0.38, n);
      fiber = pow(fiber, 1.25);
      float plume = plumeMask(uv, flow, uTime, seed, fi);
      float breakup = smoothstep(0.22, 0.92, fbm(p * 0.58 + flow * 1.7));
      float layer = plume * (0.46 + 0.38 * fiber) + fiber * breakup * 0.24;

      float reveal = smoothstep(0.15 + fi * 0.12, 1.25 + fi * 0.12, uTime);
      float op = 0.086 - 0.007 * fi;

      col += smokeCol * layer * op * reveal;
    }

    float ambient = smoothstep(
      0.24,
      0.88,
      fbm(suv * 0.62 + warp * 0.9 + vec2(-uTime * 0.012, uTime * 0.009))
    );
    col += smokeCol * ambient * 0.02;

    // No portrait masking needed — the haze layer sits behind the portrait
    // in the DOM stacking order, so it can never draw over the photo.

    // Broad, warp-modulated falloff at the frame — no visible boundary.
    float ex = smoothstep(0.0, 0.16 + 0.06 * warp.y, uv.x)
             * smoothstep(1.0, 0.84 - 0.06 * warp.x, uv.x);
    float ey = smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);
    col *= ex * ey;

    // Dither to kill banding in the near-black gradients.
    col += (hash(uv * 913.7 + uTime) - 0.5) * 0.004;

    // Premultiplied output with alpha = brightest channel: the browser
    // composites this as src + dst * (1 - a), i.e. a screen-like "adds light"
    // blend that stays correct inside any stacking context.
    vec3 outCol = max(col, 0.0);
    float alpha = clamp(max(outCol.r, max(outCol.g, outCol.b)), 0.0, 1.0);
    gl_FragColor = vec4(outCol, alpha);
  }
`;

/**
 * Bakes the portrait into a small, blurred luminance/mask texture. r holds
 * luminance x alpha; g holds a "bright subject" mask (alpha weighted by
 * luminance), so both PNG cutouts and dark-background photos resolve to the
 * same thing: where the lit subject is. Returns null (haze skips portrait
 * interaction) if the image can't be loaded CORS-clean.
 */
function useLuminanceMap(url: string | null) {
  const [tex, setTex] = useState<DataTexture | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const c = document.createElement("canvas");
        c.width = MAP_SIZE;
        c.height = MAP_SIZE;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.filter = "blur(2px)";
        ctx.drawImage(img, 0, 0, MAP_SIZE, MAP_SIZE);
        const { data } = ctx.getImageData(0, 0, MAP_SIZE, MAP_SIZE);

        const out = new Uint8Array(MAP_SIZE * MAP_SIZE * 4);
        for (let y = 0; y < MAP_SIZE; y++) {
          // Flip rows so texture v=0 is the bottom of the image.
          const srcRow = (MAP_SIZE - 1 - y) * MAP_SIZE;
          const dstRow = y * MAP_SIZE;
          for (let x = 0; x < MAP_SIZE; x++) {
            const si = (srcRow + x) * 4;
            const di = (dstRow + x) * 4;
            const a = data[si + 3] / 255;
            const lum =
              (0.299 * data[si] + 0.587 * data[si + 1] + 0.114 * data[si + 2]) / 255;
            const t = (lum - 0.05) / 0.25;
            const maskRamp = Math.min(1, Math.max(0, t)) ** 2 * (3 - 2 * Math.min(1, Math.max(0, t)));
            out[di] = Math.round(lum * a * 255);
            out[di + 1] = Math.round(a * maskRamp * 255);
            out[di + 3] = 255;
          }
        }

        const t = new DataTexture(out, MAP_SIZE, MAP_SIZE, RGBAFormat);
        t.minFilter = LinearFilter;
        t.magFilter = LinearFilter;
        t.wrapS = ClampToEdgeWrapping;
        t.wrapT = ClampToEdgeWrapping;
        t.needsUpdate = true;
        setTex(t);
      } catch {
        // Canvas tainted (no CORS headers) — haze renders without interaction.
      }
    };
    img.src = url;
    return () => {
      cancelled = true;
      img.onload = null;
    };
  }, [url]);

  useEffect(() => () => tex?.dispose(), [tex]);

  return tex;
}

type HazePlaneProps = {
  lumMap: DataTexture | null;
  portraitRef: React.RefObject<HTMLImageElement | null>;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
};

function HazePlane({ lumMap, portraitRef, pointerX, pointerY }: HazePlaneProps) {
  const fallbackMap = useMemo(() => {
    const t = new DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, RGBAFormat);
    t.needsUpdate = true;
    return t;
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uPointer: { value: new Vector2(0, 0) },
          uMap: { value: null },
          uRect: { value: new Vector4(0, 0, 1, 1) },
          uReady: { value: 0 },
        },
        vertexShader,
        fragmentShader,
        depthTest: false,
        depthWrite: false,
        // The quad is the only draw over a transparent clear — write the
        // premultiplied color/alpha straight into the buffer.
        blending: NoBlending,
      }),
    []
  );

  useEffect(() => {
    material.uniforms.uMap.value = lumMap ?? fallbackMap;
    material.uniforms.uReady.value = lumMap ? 1 : 0;
  }, [lumMap, fallbackMap, material]);

  useEffect(
    () => () => {
      material.dispose();
      fallbackMap.dispose();
    },
    [material, fallbackMap]
  );

  const lastMeasure = useRef(0);

  useFrame((state) => {
    const u = material.uniforms;
    const t = state.clock.elapsedTime;
    u.uTime.value = t;
    u.uAspect.value = state.size.width / Math.max(state.size.height, 1);
    u.uPointer.value.set(pointerX.get(), -pointerY.get());

    // Track where the portrait sits on screen (throttled — the mask is soft,
    // sub-frame precision buys nothing).
    if (t - lastMeasure.current > 0.12) {
      lastMeasure.current = t;
      const img = portraitRef.current;
      if (img) {
        const c = state.gl.domElement.getBoundingClientRect();
        if (c.width > 0 && c.height > 0) {
          const r = img.getBoundingClientRect();
          u.uRect.value.set(
            (r.left - c.left) / c.width,
            1 - (r.bottom - c.top) / c.height,
            Math.max(r.width / c.width, 1e-4),
            Math.max(r.height / c.height, 1e-4)
          );
        }
      }
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

type HazeCanvasProps = {
  portraitUrl: string | null;
  portraitRef: React.RefObject<HTMLImageElement | null>;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  /** When false the render loop is fully suspended (hero scrolled offscreen). */
  active?: boolean;
};

/**
 * Full-section atmospheric haze. Rendered at reduced resolution and softened
 * with a CSS blur (it's haze — upscaling is free softness). The shader emits
 * premultiplied color + alpha so the transparent canvas composites additively
 * over the portrait: invisible over black, only ever adds light. Skipped
 * entirely under prefers-reduced-motion.
 */
export function HazeCanvas({
  portraitUrl,
  portraitRef,
  pointerX,
  pointerY,
  active = true,
}: HazeCanvasProps) {
  const reducedMotion = useReducedMotion();
  const lumMap = useLuminanceMap(reducedMotion ? null : portraitUrl);

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ filter: "blur(5px)" }}
    >
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[0.55, 0.8]}
        gl={{
          alpha: true,
          antialias: false,
          depth: false,
          stencil: false,
          powerPreference: "low-power",
        }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ width: "100%", height: "100%" }}
      >
        <HazePlane
          lumMap={lumMap}
          portraitRef={portraitRef}
          pointerX={pointerX}
          pointerY={pointerY}
        />
      </Canvas>
    </div>
  );
}
