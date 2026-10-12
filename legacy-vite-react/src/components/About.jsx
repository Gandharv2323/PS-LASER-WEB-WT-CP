import { motion } from 'framer-motion'
import './About.css'

/**
 * About Section
 * Clean, structured layout with mission and values
 */

const values = [
    { name: 'Integrity', description: 'Transparent in all dealings' },
    { name: 'Quality', description: 'Uncompromising standards' },
    { name: 'Innovation', description: 'Continuous advancement' },
    { name: 'Productivity', description: 'Efficient delivery' }
]

function About() {
    return (
        <section className="section section-darker about" id="about">
            <div className="container">
                {/* Section Header */}
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="subtitle">About</span>
                    <h2>PS Laser</h2>
                </motion.div>

                <div className="about-grid">
                    {/* Company Info */}
                    <motion.div
                        className="about-info"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="info-block">
                            <span className="info-label">Location</span>
                            <p className="info-text">Velu (Khed Shivapur), Pune</p>
                        </div>

                        <div className="info-block">
                            <span className="info-label">Mission</span>
                            <p className="info-text">
                                Delivering precision engineering solutions with consistent quality and reliable service.
                            </p>
                        </div>

                        <div className="info-block">
                            <span className="info-label">Vision</span>
                            <p className="info-text">
                                Setting benchmarks in precision manufacturing through continuous improvement.
                            </p>
                        </div>
                    </motion.div>

                    {/* Core Values */}
                    <motion.div
                        className="about-values"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <span className="values-title">Core Values</span>
                        <div className="values-list">
                            {values.map((value) => (
                                <div key={value.name} className="value-item">
                                    <span className="value-name">{value.name}</span>
                                    <span className="value-desc">{value.description}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default About
