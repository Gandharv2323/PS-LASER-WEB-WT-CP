import { motion } from 'framer-motion'
import './ContactCTA.css'

/**
 * Contact Section
 * Clean, structured contact information
 */

const phoneNumbers = [
    { number: '+91 7719976990', name: 'Swapnil Tanpure', label: 'Primary' },
    { number: '+91 9763679499', name: 'Pranil Talap', label: null },
    { number: '+91 9764364704', name: 'Umesh Tanpure', label: null },
    { number: '+91 9623161813', name: 'Sonu Agrawal', label: null }
]

function ContactCTA() {
    const whatsappMessage = `Hi, I would like to get a quotation for the following work:

• CNC laser cutting
• CNC bending
• CNC punching
• Laser welding
• Powder coating
• Fabrication and assembly

Job details:
Material: ___
Thickness: ___
Quantity: ___
Drawing/File: Available

Please share the price and delivery time.

Thank you.`

    const emailSubject = 'Quotation Required – CNC & Fabrication Work'
    const emailBody = `Hi,

I hope you are doing well.

I would like to request a quotation for the following work:

• CNC laser cutting
• CNC bending
• CNC punching
• Laser welding
• Powder coating
• Fabrication and assembly

Job details are given below:
Material: ___
Thickness: ___
Quantity: ___
Surface finish (if any): ___
Drawing/File: Attached

Please share the quotation and expected delivery time.

Thanks and regards,
[Your Name]
[Company Name]
[Phone Number]`

    const whatsappLink = `https://wa.me/917719976990?text=${encodeURIComponent(whatsappMessage)}`
    // Gmail compose URL - always opens in Gmail
    const emailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=pslaser24@gmail.com&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

    return (
        <section className="section section-dark contact" id="contact">
            <div className="container">
                {/* Section Header */}
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="subtitle">Contact</span>
                    <h2>Get in Touch</h2>
                </motion.div>

                {/* Contact Actions */}
                <motion.div
                    className="contact-actions"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <a href={whatsappLink} className="contact-action whatsapp" target="_blank" rel="noopener noreferrer">
                        <img src="/whatsapp.gif" alt="WhatsApp" className="whatsapp-gif" />
                        <div className="whatsapp-text">
                            <span className="action-label">WhatsApp</span>
                            <span className="action-text">Start a conversation</span>
                        </div>
                    </a>
                    <a href={emailLink} className="contact-action email">
                        <span className="action-label">Email</span>
                        <span className="action-text">pslaser24@gmail.com</span>
                    </a>
                </motion.div>

                {/* Contact Details */}
                <motion.div
                    className="contact-grid"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {/* Phone */}
                    <div className="contact-block">
                        <span className="block-label">Phone</span>
                        <div className="phone-list">
                            {phoneNumbers.map((phone, index) => (
                                <a
                                    key={index}
                                    href={`tel:${phone.number.replace(/\s/g, '')}`}
                                    className="phone-item"
                                >
                                    <span className="phone-number">{phone.number}</span>
                                    <span className="phone-name">{phone.name}</span>
                                    {phone.label && <span className="phone-badge">{phone.label}</span>}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="contact-block">
                        <span className="block-label">Address</span>
                        <p className="address-text">
                            Gat No. 753, Velu Bag<br />
                            Tal-Bhor, Pune – 412205<br />
                            Maharashtra, India
                        </p>
                    </div>

                    {/* Business */}
                    <div className="contact-block">
                        <span className="block-label">GST</span>
                        <p className="gst-number">27ABHFP5667Q1Z8</p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default ContactCTA
