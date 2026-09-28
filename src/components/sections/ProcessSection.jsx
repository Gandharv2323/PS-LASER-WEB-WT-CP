import { motion } from 'framer-motion'

/**
 * Process Section - Animated Manufacturing Flow
 * Step-by-step process visualization
 */

const processSteps = [
    {
        number: '01',
        title: 'Design & Planning',
        description: 'CAD/CAM programming and material planning'
    },
    {
        number: '02',
        title: 'Laser Cutting',
        description: 'Precision CNC laser cutting with fiber technology'
    },
    {
        number: '03',
        title: 'Forming & Bending',
        description: 'CNC press brake operations for precise angles'
    },
    {
        number: '04',
        title: 'Welding & Assembly',
        description: 'Laser, MIG, TIG welding and fabrication'
    },
    {
        number: '05',
        title: 'Surface Treatment',
        description: '5-tank pretreatment and powder coating'
    },
    {
        number: '06',
        title: 'Quality & Dispatch',
        description: 'Inspection, packaging and delivery'
    }
]

function ProcessSection() {
    return (
        <section className="cinematic-section process-section" id="process">
            <div className="section-bg" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #0d0d0d 100%)' }}></div>

            <div className="process-content">
                <motion.div
                    className="process-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="section-label">Process</span>
                    <h2 className="section-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        Manufacturing Flow
                    </h2>
                </motion.div>

                {/* Process Timeline */}
                <div className="process-timeline">
                    {processSteps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            className="process-step-item"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                        >
                            <div className="step-number">{step.number}</div>
                            <div className="step-connector"></div>
                            <div className="step-content">
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ProcessSection
