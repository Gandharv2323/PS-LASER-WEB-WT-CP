import { Mail, MapPin, Phone } from "lucide-react";
import { company, contacts, mapDirections } from "@/lib/pslaser/data";
import styles from "./contact-details.module.css";

type ContactDetailsProps = {
  /** Include email + address rows (default true). */
  full?: boolean;
  className?: string;
};

/** The four phone contacts (tel:), email (mailto:) and address with directions. */
export function ContactDetails({ full = true, className }: ContactDetailsProps) {
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <ul className={styles.people}>
        {contacts.map((c) => (
          <li key={c.tel}>
            <a href={`tel:${c.tel}`} className={styles.person}>
              <span className={styles.name}>
                {c.name}
                {c.primary && <span className={styles.tag}>WhatsApp</span>}
              </span>
              <span className={styles.phone}>
                <Phone aria-hidden="true" />
                {c.phone}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {full && (
        <div className={styles.rows}>
          <a href={`mailto:${company.email}`} className={styles.row}>
            <Mail aria-hidden="true" />
            <span>{company.email}</span>
          </a>
          <a href={mapDirections} target="_blank" rel="noopener noreferrer" className={styles.row}>
            <MapPin aria-hidden="true" />
            <span>
              {company.address}
              <span className={styles.dir}>Get directions →</span>
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
