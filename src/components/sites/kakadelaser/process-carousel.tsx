"use client";

import { useEffect, useState } from "react";
import { process } from "@/lib/pslaser/data";

// Same owl-style loop the clone used for testimonials, now cycling PS Laser's
// manufacturing flow: all slides side by side in one stage with a clone at each end.
const AUTOPLAY = 5000;
const SPEED = 250;
const ITEMS = process.map((p, i) => ({ ...p, n: String(i + 1).padStart(2, "0") }));
const N = ITEMS.length;
const SLOTS = [ITEMS[N - 1], ...ITEMS, ITEMS[0]];

export function ProcessCarousel() {
  // pos indexes SLOTS; real slides live at 1..N
  const [pos, setPos] = useState(1);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setAnimate(true);
      setPos((p) => p + 1);
    }, AUTOPLAY);
    return () => window.clearTimeout(t);
  }, [pos]);

  useEffect(() => {
    if (pos !== 0 && pos !== N + 1) return;
    // landed on a clone: jump to the matching real slide without a transition
    const t = window.setTimeout(() => {
      setAnimate(false);
      setPos(pos === 0 ? N : 1);
    }, SPEED);
    return () => window.clearTimeout(t);
  }, [pos]);

  const active = (pos - 1 + N) % N;

  return (
    <section id="process" className="testimonials">
      <div className="container" data-aos="zoom-in">
        <div className="section-title">
          <h3>
            Manufacturing <span>Flow</span>
          </h3>
        </div>
        <div className="owl-carousel testimonials-carousel owl-loaded owl-drag">
          <div className="owl-stage-outer">
            <div
              className="owl-stage"
              style={{
                width: `${SLOTS.length * 100}%`,
                transform: `translate3d(${(-pos * 100) / SLOTS.length}%, 0, 0)`,
                transition: animate ? `all ${SPEED / 1000}s ease 0s` : "all 0s ease 0s",
              }}
            >
              {SLOTS.map((item, n) => (
                <div
                  key={`${item.n}-${n}`}
                  className={`owl-item${n === 0 || n === N + 1 ? " cloned" : ""}${n === pos ? " active" : ""}`}
                  style={{ width: `${100 / SLOTS.length}%` }}
                  aria-hidden={n !== pos}
                >
                  <div className="testimonial-item">
                    <div className="ps-step-num">{item.n}</div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="owl-dots">
            {ITEMS.map((t, n) => (
              <button
                key={t.n}
                type="button"
                aria-label={`Step ${n + 1}: ${t.title}`}
                className={`owl-dot${n === active ? " active" : ""}`}
                onClick={() => {
                  setAnimate(true);
                  setPos(n + 1);
                }}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
