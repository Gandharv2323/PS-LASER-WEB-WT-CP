"use server";

/**
 * Server Action used with React 19 useActionState: posts the enquiry to the Node/Express
 * API (CONTRACT: POST :4000/api/enquiries). Runs on the server, so no CORS and no API URL
 * in the browser. If Node is down we still return a WhatsApp link (WhatsApp-first).
 */
import { apiFetch, ApiError } from "@/lib/api/client";
import { NODE_API } from "@/lib/api/config";
import { enquiryCreatedSchema } from "@/lib/api/schemas";
import type { EnquiryInput, FieldErrors } from "@/lib/api/types";
import { whatsapp } from "@/lib/pslaser/data";

export interface SentEnquiry {
  readonly key: string;
  readonly name: string;
  readonly summary: string;
  readonly status: "sending" | "stored" | "whatsapp-only";
  readonly id?: number;
}

export interface EnquiryState {
  readonly status: "idle" | "sent" | "offline" | "invalid" | "error";
  readonly message: string;
  readonly whatsappUrl?: string;
  readonly fieldErrors?: FieldErrors<EnquiryInput>;
  readonly values?: Partial<Record<"name" | "phone" | "email" | "message" | "quantity", string>>;
  readonly history: readonly SentEnquiry[];
}

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};

export async function submitEnquiry(prev: EnquiryState, fd: FormData): Promise<EnquiryState> {
  const values = {
    name: str(fd, "name"),
    phone: str(fd, "phone"),
    email: str(fd, "email"),
    message: str(fd, "message"),
    quantity: str(fd, "quantity"),
  };
  const estimate = str(fd, "estimate");

  const fieldErrors: FieldErrors<EnquiryInput> = {};
  if (values.name.length < 2) fieldErrors.name = "Please enter your name.";
  const digits = values.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) fieldErrors.phone = "Please enter a valid 10-digit phone number.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) fieldErrors.email = "Enter a valid email or leave it blank.";
  if (values.message.length < 10) fieldErrors.message = "Describe your requirement (at least 10 characters).";
  if (Object.keys(fieldErrors).length) {
    return { ...prev, status: "invalid", message: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const message = [values.message, values.quantity ? `Quantity: ${values.quantity}` : "", estimate ? `Estimate: ${estimate}` : ""]
    .filter(Boolean)
    .join("\n");
  const body: EnquiryInput = {
    name: values.name,
    phone: values.phone,
    email: values.email || undefined,
    serviceSlug: "laser-cutting",
    message,
    source: "nextjs-quote",
  };
  const fallbackUrl = whatsapp(`Hi PS Laser, I'm ${values.name} (${values.phone}).\n${message}`);
  const key = `${Date.now()}`;

  try {
    const created = await apiFetch(`${NODE_API}/api/enquiries`, enquiryCreatedSchema, { method: "POST", json: body, cache: "no-store" });
    return {
      status: "sent",
      message: `Enquiry #${created.id} saved. Send it on WhatsApp too for the fastest reply.`,
      whatsappUrl: created.whatsappUrl || fallbackUrl,
      history: [{ key, name: values.name, summary: values.message.slice(0, 60), status: "stored", id: created.id }, ...prev.history],
    };
  } catch (e) {
    if (e instanceof ApiError && e.kind === "http" && e.status === 400) {
      return { ...prev, status: "invalid", message: e.message, fieldErrors: e.body?.fieldErrors, values };
    }
    return {
      status: "offline",
      message: "Our enquiry server is offline right now, so nothing was stored. Please send it on WhatsApp instead.",
      whatsappUrl: fallbackUrl,
      history: [{ key, name: values.name, summary: values.message.slice(0, 60), status: "whatsapp-only" }, ...prev.history],
    };
  }
}
