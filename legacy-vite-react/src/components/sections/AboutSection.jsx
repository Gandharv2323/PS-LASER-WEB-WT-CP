import { motion } from 'framer-motion'

/**
 * About Section - Cinematic
 * Human credibility without marketing
 */
function AboutSection() {
    return (
        <section className="cinematic-section" id="about">
            {/* Background */}
            <div className="section-bg" style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #151515 100%)' }}>
                {/* Replace with factory exterior image when available */}
            </div>
            <div className="section-overlay" style={{ background: 'rgba(10,10,10,0.5)' }}></div>

            {/* Content */}
            <motion.div
                className="section-content"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <span className="section-label">About</span>
                <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', lineHeight: 1.4 }}>
                    PS Laser is a precision<br />
                    engineering manufacturer<br />
                    serving industrial and OEM<br />
                    clients with reliable, controlled,<br />
                    and scalable processes.
                </h2>

                <div className="section-specs" style={{ marginTop: '3rem' }}>
                    <div className="spec-item">
                        <span className="spec-value">Pune</span>
                        <span className="spec-label">Maharashtra, India</span>
                    </div>
                    <div className="spec-item">
                        <span className="spec-value">GST</span>
                        <span className="spec-label">27ABHFP5667Q1Z8</span>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}

export default AboutSection
