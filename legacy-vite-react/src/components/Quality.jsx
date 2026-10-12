import { motion } from 'framer-motion'
import './Quality.css'

/**
 * Quality Section
 * Text-driven layout emphasizing process discipline
 */

const tools = [
    { name: 'Vernier Caliper', precision: '±0.02mm' },
    { name: 'Digital Micrometer', precision: '±0.001mm' },
    { name: 'Digital Height Gauge', precision: '±0.01mm' }
]

const systems = [
    { name: 'CAD-CAM Integration', description: 'Design to manufacturing' },
    { name: 'Nesting Software', description: 'Material optimization' },
    { name: 'Bending Simulation', description: 'Virtual validation' },
    { name: 'Blank Development', description: 'Flat pattern calculation' }
]

function Quality() {
    return (
        <section className="section section-dark quality" id="quality">
            <div className="container">
                {/* Section Header */}
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="subtitle">Quality</span>
                    <h2>Measured. Verified. Delivered.</h2>
                </motion.div>

                <div className="quality-grid">
                    {/* Measurement Tools */}
                    <motion.div
                        className="quality-block"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3 className="block-title">Measurement Tools</h3>
                        <div className="tools-list">
                            {tools.map((tool) => (
                                <div key={tool.name} className="tool-item">
                                    <span className="tool-name">{tool.name}</span>
                                    <span className="tool-precision">{tool.precision}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Software Systems */}
                    <motion.div
                        className="quality-block"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h3 className="block-title">Software Systems</h3>
                        <div className="systems-list">
                            {systems.map((system) => (
                                <div key={system.name} className="system-item">
                                    <span className="system-name">{system.name}</span>
                                    <span className="system-desc">{system.description}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Quality Metrics */}
                <motion.div
                    className="quality-metrics"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="metric">
                        <span className="metric-value">99.9%</span>
                        <span className="metric-label">Accuracy</span>
                    </div>
                    <div className="metric">
                        <span className="metric-value">±0.1mm</span>
                        <span className="metric-label">Tolerance</span>
                    </div>
                    <div className="metric">
                        <span className="metric-value">100%</span>
                        <span className="metric-label">Inspection</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default Quality
