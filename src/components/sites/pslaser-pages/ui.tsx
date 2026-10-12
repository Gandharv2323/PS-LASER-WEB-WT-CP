import Link from "next/link";
import type { ReactNode } from "react";
import { GENERAL_QUOTE_MESSAGE, process as processSteps, whatsapp } from "@/lib/pslaser/data";

type WaButtonProps = {
  message: string;
  children: ReactNode;
  variant?: "solid" | "outline" | "light";
  className?: string;
};

/** WhatsApp enquiry button (opens a new tab with a pre-filled message). */
export function WaButton({ message, children, variant = "solid", className = "" }: WaButtonProps) {
  return (
    <a
      href={whatsapp(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`psp-btn psp-btn-${variant} ${className}`.trim()}
    >
      <i className="bx bxl-whatsapp" aria-hidden="true" />
      <span>{children}</span>
    </a>
  );
}

type SectionTitleProps = { strong: string; light?: string; lead?: string; id?: string };

/** Kakade-style section heading: bold word + light word, orange rule, optional lead. */
export function SectionTitle({ strong, light, lead, id }: SectionTitleProps) {
  return (
    <div className="psp-title" data-aos="fade-up">
      <h2 id={id}>
        {strong} {light ? <span>{light}</span> : null}
      </h2>
      <span className="psp-rule" aria-hidden="true" />
      {lead ? <p>{lead}</p> : null}
    </div>
  );
}

const STEP_ICONS = ["bx-pencil", "bx-target-lock", "bx-layer", "bx-wrench", "bx-spray-can", "bx-check-shield"];

/** Six-step manufacturing flow. */
export function ProcessStrip() {
  return (
    <section className="psp-section psp-alt" id="process-flow" aria-labelledby="psp-process-title">
      <div className="container">
        <SectionTitle
          id="psp-process-title"
          strong="From Drawing"
          light="to Dispatch"
          lead="Every job moves through one shop, so nothing waits on an outside supplier."
        />
        <ol className="psp-process">
          {processSteps.map((s, i) => (
            <li key={s.title} data-aos="fade-up" data-aos-delay={String(i * 60)}>
              <span className="psp-process-num">{String(i + 1).padStart(2, "0")}</span>
              <i className={`bx ${STEP_ICONS[i] ?? "bx-check"}`} aria-hidden="true" />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

type CtaBandProps = { title: string; text: string; message?: string; button?: string };

/** Dark call-to-action band with WhatsApp + contact link. */
export function CtaBand({ title, text, message = GENERAL_QUOTE_MESSAGE, button = "Get a Quote on WhatsApp" }: CtaBandProps) {
  return (
    <section className="psp-cta" aria-label="Request a quote">
      <div className="container">
        <div className="psp-cta-inner" data-aos="fade-up">
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <div className="psp-cta-actions">
            <WaButton message={message}>{button}</WaButton>
            <Link href="/contact-us" className="psp-btn psp-btn-light">
              <i className="bx bx-phone" aria-hidden="true" />
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
