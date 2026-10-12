import { motion } from 'framer-motion'

/**
 * What We Do Section - Cinematic
 * Context without explanation
 */
function WhatWeDoSection() {
    return (
        <section className="cinematic-section" id="what-we-do">
            {/* Background Image */}
            <div className="section-bg">
                <img
                    src="/hero_background_frame_1768236738290.png"
                    alt="Factory"
                />
            </div>
            <div className="section-overlay"></div>

            {/* Content */}
            <motion.div
                className="section-content"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="section-title">
                    We Manufacture<br />
                    Precision Metal<br />
                    Components
                </h2>
                <p className="section-subtitle">
                    USING ADVANCED LASER TECHNOLOGY
                </p>
            </motion.div>
        </section>
    )
}

export default WhatWeDoSection
