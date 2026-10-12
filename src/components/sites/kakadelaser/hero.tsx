"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { GENERAL_QUOTE_MESSAGE, company, whatsapp } from "@/lib/pslaser/data";

const G = "/sites/pslaser/gallery";

type Slide = { id: string; caption: string; image: string; video?: string };

const SLIDES: Slide[] = [
  {
    id: "ps-slide-video",
    caption: "PRECISION ENGINEERING",
    image: "/sites/pslaser/factory/website-hero-laser-head-ai.jpg",
    video: company.heroVideo,
  },
  { id: "ps-slide-laser", caption: "LASER CUTTING", image: `${G}/laser-cutting-bg.jpg` },
  { id: "ps-slide-bending", caption: "CNC BENDING", image: `${G}/cnc-bending-bg.jpg` },
  { id: "ps-slide-coating", caption: "POWDER COATING", image: `${G}/powder-coating-bg.jpg` },
];

const PROFILE_MESSAGE =
  "Hi PS Laser, please share your company profile (PDF) with machine list and capabilities.";

const INTERVAL = 5000;
const TRANSITION = 600;

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [moving, setMoving] = useState<{ to: number; dir: "left" | "right"; started: boolean } | null>(null);
  const busy = useRef(false);

  const go = useCallback(
    (to: number) => {
      if (busy.current || to === active) return;
      busy.current = true;
      const dir = to > active || (active === SLIDES.length - 1 && to === 0) ? "left" : "right";
      setMoving({ to, dir, started: false });
      // next frame: start the CSS transition
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setMoving((m) => (m ? { ...m, started: true } : m))),
      );
      window.setTimeout(() => {
        setActive(to);
        setMoving(null);
        busy.current = false;
      }, TRANSITION + 50);
    },
    [active],
  );

  const next = useCallback(() => go((active + 1) % SLIDES.length), [go, active]);
  const prev = useCallback(
    () => go((active - 1 + SLIDES.length) % SLIDES.length),
    [go, active],
  );

  // Bootstrap's carousel defaults: 5s interval, paused while hovered.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(next, INTERVAL);
    return () => window.clearInterval(t);
  }, [next, paused]);

  const itemClass = (i: number) => {
    const c = ["carousel-item"];
    if (moving) {
      const left = moving.dir === "left";
      if (i === active) {
        c.push("active");
        if (moving.started) c.push(left ? "carousel-item-left" : "carousel-item-right");
      } else if (i === moving.to) {
        c.push(left ? "carousel-item-next" : "carousel-item-prev");
        if (moving.started) c.push(left ? "carousel-item-left" : "carousel-item-right");
      }
    } else if (i === active) {
      c.push("active");
    }
    return c.join(" ");
  };

  return (
    <div
      id="carouselExampleIndicators"
      className="carousel slide"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <ol className="carousel-indicators">
        {SLIDES.map((s, i) => (
          <li
            key={s.id}
            className={i === (moving ? moving.to : active) ? "active" : undefined}
            onClick={() => go(i)}
          />
        ))}
      </ol>
      <div className="carousel-inner">
        {SLIDES.map((s, i) => (
          <div key={s.id} className={itemClass(i)}>
            {s.video ? (
              <video
                id={s.id}
                className="ps-slide d-block w-100"
                src={s.video}
                poster={s.image}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Fiber laser cutting sheet metal"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img id={s.id} className="ps-slide d-block w-100" src={s.image} alt={s.caption} />
            )}
            <div className="carousel-caption hero-caption">
              {createElement("h7", null, s.caption)}
            </div>
          </div>
        ))}
      </div>
      <a
        className="carousel-control-prev"
        href="#carouselExampleIndicators"
        role="button"
        onClick={(e) => {
          e.preventDefault();
          prev();
        }}
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="sr-only">Previous</span>
      </a>
      <a
        className="carousel-control-next"
        href="#carouselExampleIndicators"
        role="button"
        onClick={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="sr-only">Next</span>
      </a>
    </div>
  );
}

function HeroText({ mobile }: { mobile: boolean }) {
  return (
    <>
      <h1>
        {mobile ? (
          <>
            Precision Sheet Metal, <span>Built to Your Drawing</span>
          </>
        ) : (
          <>
            Custom Precision Engineering &amp; Sheet Metal Solutions,{" "}
            <span>Built to Your Drawing</span>
          </>
        )}
      </h1>
      <h2>
        Fiber laser cutting, CNC bending, Amada turret punching, laser welding, fabrication and
        powder coating, managed in one workshop at {company.locationLabel}.
      </h2>
      <div className={mobile ? "d-flex align-items-center justify-content-center" : "d-flex"}>
        <a
          href={whatsapp(GENERAL_QUOTE_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-get-started scrollto ps-btn-getquote"
        >
          Get Quote
        </a>
        <a
          href={whatsapp(PROFILE_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-get-started scrollto ps-btn-profile"
        >
          Company Profile
        </a>
      </div>
    </>
  );
}

export function Hero() {
  return (
    <section id="home-hero" className="hero d-flex align-items-center">
      <div className="container" data-aos="zoom-out" data-aos-delay="100">
        <div className="row">
          <div
            id="hero-left"
            className="col-lg-6 d-none d-lg-block hero-left"
            style={{ paddingTop: 20 }}
          >
            <HeroText mobile={false} />
            <div className="secure d-flex">
              <i className="bx bxl-whatsapp" />
              <div className="lock">
                <p>
                  Send your DXF / PDF drawing <br />
                  on WhatsApp for a quick quote
                </p>
              </div>
            </div>
          </div>
          <div id="hero-right" className="col-lg-6 col-sm-12 hero-right">
            <HeroCarousel />
          </div>
          <div id="hero-bottom" className="col-lg-6 d-block d-lg-none hero-bottom">
            <HeroText mobile />
          </div>
        </div>
      </div>
    </section>
  );
}
