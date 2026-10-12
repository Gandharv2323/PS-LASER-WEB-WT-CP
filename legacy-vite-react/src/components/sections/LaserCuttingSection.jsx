import { motion } from 'framer-motion'

/**
 * CNC Laser Cutting Section - Cinematic
 * Raw cutting capability with specs
 */
function LaserCuttingSection() {
    return (
        <section className="cinematic-section" id="laser-cutting">
            {/* Background - Video placeholder, using dark gradient */}
            {/* Background Image */}
            <div className="section-bg">
                <img src="/bg-laser-cutting.png" alt="High-tech CNC Laser Cutting" />
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
                <span className="section-label">CNC Technology</span>
                <h2 className="section-title">
                    Laser<br />Cutting
                </h2>
                <p className="section-subtitle">
                    HSG FIBER LASER | 3 KW & 1.5 KW
                </p>

                <div className="section-specs">
                    <div className="spec-item">
                        <span className="spec-value">16mm</span>
                        <span className="spec-label">Mild Steel</span>
                    </div>
                    <div className="spec-item">
                        <span className="spec-value">10mm</span>
                        <span className="spec-label">Stainless Steel</span>
                    </div>
                    <div className="spec-item">
                        <span className="spec-value">8mm</span>
                        <span className="spec-label">Aluminum</span>
                    </div>
                    <div className="spec-item">
                        <span className="spec-value">3m × 1.5m</span>
                        <span className="spec-label">Bed Size</span>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}

export default LaserCuttingSection
