import { GENERAL_QUOTE_MESSAGE, whatsapp } from "@/lib/pslaser/data";
import { WhatsAppIcon } from "./icons";
import styles from "./floating-whatsapp.module.css";

/** Fixed bottom-right WhatsApp button (mounted once in the site layout). */
export function FloatingWhatsApp() {
  return (
    <a
      href={whatsapp(GENERAL_QUOTE_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.fab}
      aria-label="Chat with PS Laser on WhatsApp"
    >
      <WhatsAppIcon />
      <span className={styles.label}>WhatsApp</span>
    </a>
  );
}
