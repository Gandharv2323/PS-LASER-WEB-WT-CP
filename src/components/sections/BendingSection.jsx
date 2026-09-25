import { motion } from 'framer-motion'

/**
 * CNC Bending Section - Cinematic
 * Precision and control
 */
function BendingSection() {
    return (
        <section className="cinematic-section" id="bending">
            {/* Background */}
            {/* Background Image */}
            <div className="section-bg">
                <img src="/bg-bending.png" alt="CNC Bending Machine" />
            </div>
            <div className="section-overlay" style={{ background: 'rgba(10,10,10,0.4)' }}></div>

            {/* Content */}
            <motion.div
                className="section-content"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <span className="section-label">CNC Technology</span>
                <h2 className="section-title">
                    CNC<br />Bending
                </h2>
                <p className="section-subtitle">
                    HYDRAULIC PRESS BRAKE | PRECISION FORMING
                </p>

                <div className="section-specs">
                    <div className="spec-item">
                        <span className="spec-value">175 Ton</span>
                        <span className="spec-label">Press Capacity</span>
                    </div>
                    <div className="spec-item">
                        <span className="spec-value">3 Meter</span>
                        <span className="spec-label">Bending Length</span>
                    </div>
                    <div className="spec-item">
                        <span className="spec-value">±0.1mm</span>
                        <span className="spec-label">Accuracy</span>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}

export default BendingSection
