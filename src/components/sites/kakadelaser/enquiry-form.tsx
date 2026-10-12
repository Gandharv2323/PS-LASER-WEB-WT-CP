"use client";

import { useState } from "react";
import { services, whatsapp } from "@/lib/pslaser/data";

type Fields = { name: string; phone: string; email: string; service: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", phone: "", email: "", service: "", message: "" };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  const digits = f.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) e.phone = "Please enter a valid phone number (10 digits).";
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Please enter a valid email or leave it blank.";
  if (!f.service) e.service = "Please choose a service.";
  if (f.message.trim().length < 10) e.message = "Please describe your requirement (at least 10 characters).";
  return e;
}

function compose(f: Fields): string {
  return [
    "Hi PS Laser, I have an enquiry from your website.",
    `Name: ${f.name.trim()}`,
    `Phone: ${f.phone.trim()}`,
    f.email.trim() ? `Email: ${f.email.trim()}` : null,
    `Service: ${f.service}`,
    `Requirement: ${f.message.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Enquiry form with client-side validation. There is no backend: on submit it opens
 * WhatsApp with the composed message, and the user sends it from WhatsApp.
 */
export function EnquiryForm() {
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [opened, setOpened] = useState(false);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setF((prev) => ({ ...prev, [k]: value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(f);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`enq-${first}`)?.focus();
      return;
    }
    window.open(whatsapp(compose(f)), "_blank", "noopener,noreferrer");
    setOpened(true);
  };

  const field = (k: keyof Fields) => ({
    id: `enq-${k}`,
    name: k,
    value: f[k],
    onChange: set(k),
    className: `form-control${errors[k] ? " is-invalid" : ""}`,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `enq-${k}-err` : undefined,
  });

  const err = (k: keyof Fields) =>
    errors[k] ? (
      <div id={`enq-${k}-err`} className="invalid-feedback d-block">
        {errors[k]}
      </div>
    ) : null;

  return (
    <form className="ps-enquiry" onSubmit={onSubmit} noValidate>
      <div className="form-row">
        <div className="form-group col-md-6">
          <label htmlFor="enq-name">Name *</label>
          <input type="text" autoComplete="name" {...field("name")} />
          {err("name")}
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="enq-phone">Phone *</label>
          <input type="tel" inputMode="tel" autoComplete="tel" {...field("phone")} />
          {err("phone")}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group col-md-6">
          <label htmlFor="enq-email">
            Email <span className="ps-optional">(optional)</span>
          </label>
          <input type="email" autoComplete="email" {...field("email")} />
          {err("email")}
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="enq-service">Service *</label>
          <select {...field("service")}>
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value="Other / not sure">Other / not sure</option>
          </select>
          {err("service")}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="enq-message">Your requirement *</label>
        <textarea
          rows={5}
          placeholder="Material, thickness, size, quantity, finish. You can attach the drawing in WhatsApp."
          {...field("message")}
        />
        {err("message")}
      </div>
      <button type="submit" className="btn ps-wa-submit">
        <i className="bx bxl-whatsapp" aria-hidden="true" /> Send via WhatsApp
      </button>
      <p className="ps-form-note" role="status">
        {opened
          ? "WhatsApp opened in a new tab with your message. Press send there to reach us."
          : "This opens WhatsApp with your message filled in. Nothing is stored on this website."}
      </p>
    </form>
  );
}
