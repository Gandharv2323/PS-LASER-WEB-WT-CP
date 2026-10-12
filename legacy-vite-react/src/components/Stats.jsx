import { motion } from 'framer-motion'
import './Stats.css'

/**
 * Stats Section
 * Large numbers with monospace font for industrial feel
 */

const stats = [
    {
        number: '15+',
        label: 'Years Experience',
        suffix: ''
    },
    {
        number: '5000',
        label: 'Parts Delivered',
        suffix: '+'
    },
    {
        number: '±0.1',
        label: 'Tolerance (mm)',
        suffix: ''
    },
    {
        number: '100',
        label: 'Client Satisfaction',
        suffix: '%'
    }
]

function Stats() {
    return (
        <section className="stats" id="stats">
            <div className="container">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="stat-item"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <span className="stat-number">
                                {stat.number}
                                {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
                            </span>
                            <span className="stat-label">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Stats
