import { motion } from 'framer-motion'
import './Process.css'

/**
 * Process Section
 * 5-step manufacturing timeline
 */

const steps = [
    {
        number: '01',
        title: 'Design Review',
        description: 'CAD file analysis and DFM optimization'
    },
    {
        number: '02',
        title: 'Material Selection',
        description: 'Grade verification and stock preparation'
    },
    {
        number: '03',
        title: 'Precision Cutting',
        description: 'CNC laser cutting with ±0.1mm tolerance'
    },
    {
        number: '04',
        title: 'Forming & Finishing',
        description: 'Bending, welding, and surface treatment'
    },
    {
        number: '05',
        title: 'Quality & Delivery',
        description: 'CMM inspection and secure packaging'
    }
]

function Process() {
    return (
        <section className="section process" id="process">
            <div className="container">
                {/* Section Header */}
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="subtitle">Process</span>
                    <h2>Manufacturing Flow</h2>
                </motion.div>

                {/* Timeline */}
                <div className="process-timeline">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className="process-step"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <div className="step-number">{step.number}</div>
                            <div className="step-line"></div>
                            <div className="step-content">
                                <h3 className="step-title">{step.title}</h3>
                                <p className="step-description">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Process
