import { motion } from 'framer-motion'

/**
 * Powder Coating Section - Cinematic
 * Durability and process discipline
 */
function PowderCoatingSection() {
    const processSteps = [
        'Pre-Treatment',
        'Drying',
        'Coating',
        'Curing'
    ]

    return (
        <section className="cinematic-section" id="powder-coating">
            {/* Background */}
            {/* Background Image */}
            <div className="section-bg">
                <img src="/bg-powder-coating.png" alt="Automated Powder Coating Line" />
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
                <span className="section-label">Surface Finishing</span>
                <h2 className="section-title">
                    Powder<br />Coating
                </h2>
                <p className="section-subtitle">
                    PLC CONTROLLED | 5-TANK PRETREATMENT
                </p>

                {/* Process Steps */}
                <div className="process-steps">
                    {processSteps.map((step, index) => (
                        <motion.div
                            key={step}
                            className="process-step"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                        >
                            {step}
                        </motion.div>
                    ))}
                </div>

                <div className="section-specs" style={{ marginTop: '3rem' }}>
                    <div className="spec-item">
                        <span className="spec-value">500-1000 Hrs</span>
                        <span className="spec-label">Salt Spray Resistance</span>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}

export default PowderCoatingSection
