"use client";

import { useEffect, useRef } from "react";

/** Brilho que segue o mouse (só ponteiro fino e sem "reduzir movimento"). Só transform/opacity. */
export function BrilhoCursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    const g = { x: innerWidth / 2, y: innerHeight / 2, tx: 0, ty: 0, on: false, raf: 0 };
    const tick = () => {
      g.x += (g.tx - g.x) * 0.16;
      g.y += (g.ty - g.y) * 0.16;
      el.style.transform = `translate3d(${g.x.toFixed(1)}px,${g.y.toFixed(1)}px,0)`;
      g.raf = Math.abs(g.tx - g.x) + Math.abs(g.ty - g.y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      g.tx = e.clientX;
      g.ty = e.clientY;
      if (!g.on) {
        g.on = true;
        g.x = g.tx;
        g.y = g.ty;
        el.style.opacity = "1";
      }
      if (!g.raf) g.raf = requestAnimationFrame(tick);
    };
    const sair = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        g.on = false;
        el.style.opacity = "0";
      }
    };
    addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerout", sair);
    return () => {
      removeEventListener("pointermove", mover);
      document.removeEventListener("pointerout", sair);
      cancelAnimationFrame(g.raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[45] -mt-[280px] -ml-[280px] h-[560px] w-[560px] rounded-full opacity-0 mix-blend-screen transition-opacity duration-300 ease-[var(--ease-out)] will-change-transform max-[819px]:hidden"
      style={{ background: "radial-gradient(circle,rgba(90,200,250,.22) 0%,rgba(90,200,250,.1) 18%,rgba(139,92,246,.08) 38%,rgba(139,92,246,0) 68%)" }}
    />
  );
}
