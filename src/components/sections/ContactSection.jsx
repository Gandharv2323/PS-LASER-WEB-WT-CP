import { motion } from 'framer-motion'

/**
 * Contact Section - Cinematic Professional Layout
 * Clear and confident call to action with structured info
 */

const phoneNumbers = [
    { number: '+91 7719976990', name: 'Swapnil Tanpure', isPrimary: true },
    { number: '+91 9763679499', name: 'Pranil Talap', isPrimary: false },
    { number: '+91 9764364704', name: 'Umesh Tanpure', isPrimary: false },
    { number: '+91 9623161813', name: 'Sonu Agrawal', isPrimary: false }
]

function ContactSection() {
    const whatsappMessage = `Hi, I would like to get a quotation for CNC laser cutting, bending, powder coating, or fabrication work.`
    const whatsappLink = `https://wa.me/917719976990?text=${encodeURIComponent(whatsappMessage)}`

    return (
        <section className="cinematic-section contact-section" id="contact">
            {/* Dark Background - Ensure z-index 0 */}
            <div className="section-bg" style={{ background: '#0a0a0a', zIndex: 0 }}></div>

            {/* Content - Ensure z-index 10 via CSS */}
            <div className="contact-wrapper">
                <motion.div
                    className="contact-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="section-label">Contact</span>
                    <h2 className="section-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        Ready to Discuss<br />Your Requirement?
                    </h2>

                    <a href={whatsappLink} className="contact-cta-btn" target="_blank" rel="noopener noreferrer">
                        <img src="/whatsapp.gif" alt="" className="cta-whatsapp-icon" />
                        Request a Quote
                    </a>
                </motion.div>

                {/* Contact Info Grid */}
                <motion.div
                    className="contact-info-professional"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {/* Phone Column */}
                    <div className="contact-column">
                        <h4 className="contact-column-title">Phone</h4>
                        <div className="phone-list-professional">
                            {phoneNumbers.map((phone, index) => (
                                <a
                                    key={index}
                                    href={`tel:${phone.number.replace(/\s/g, '')}`}
                                    className={`phone-entry ${phone.isPrimary ? 'primary' : ''}`}
                                >
                                    <span className="phone-number-text">{phone.number}</span>
                                    <span className="phone-name-text">{phone.name}</span>
                                    {phone.isPrimary && <span className="primary-badge">Primary</span>}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Email Column */}
                    <div className="contact-column">
                        <h4 className="contact-column-title">Email</h4>
                        <a href="mailto:pslaser24@gmail.com" className="contact-email">
                            pslaser24@gmail.com
                        </a>
                    </div>

                    {/* Address Column */}
                    <div className="contact-column">
                        <h4 className="contact-column-title">Address</h4>
                        <address className="contact-address">
                            Gat No. 753, Velu Bag<br />
                            Tal-Bhor, Pune – 412205<br />
                            Maharashtra, India
                        </address>
                    </div>

                    {/* GST Column */}
                    <div className="contact-column">
                        <h4 className="contact-column-title">GST</h4>
                        <span className="contact-gst">27ABHFP5667Q1Z8</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default ContactSection
