import { motion } from 'framer-motion'
import './Services.css'

/**
 * Services Section
 * Clean grid layout with minimal styling
 */

const services = [
    {
        id: 1,
        title: 'CNC Laser Cutting',
        description: 'Fiber laser cutting with ±0.1mm tolerance',
        specs: '3KW & 1.5KW'
    },
    {
        id: 2,
        title: 'CNC Bending',
        description: 'Smart bend technology with precise angle control',
        specs: '175T, 3m, 1–12mm'
    },
    {
        id: 3,
        title: 'CNC Turret Punching',
        description: 'Multi-tool punching for complex hole patterns',
        specs: 'Multi-station'
    },
    {
        id: 4,
        title: 'Powder Coating',
        description: 'PLC-based coating with 5-tank pretreatment',
        specs: '500–1000 hrs salt spray'
    },
    {
        id: 5,
        title: 'Laser Welding',
        description: 'Minimal heat affected zone for clean joints',
        specs: 'Precision finish'
    },
    {
        id: 6,
        title: 'Fabrication',
        description: 'Complete assembly from prototype to production',
        specs: 'Full service'
    }
]

function Services() {
    return (
        <section className="section section-darker services" id="services">
            <div className="container">
                {/* Section Header */}
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="subtitle">Capabilities</span>
                    <h2>Manufacturing Services</h2>
                </motion.div>

                {/* Services Grid */}
                <div className="services-grid">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            className="service-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                            <h3 className="service-title">{service.title}</h3>
                            <p className="service-description">{service.description}</p>
                            <span className="service-spec">{service.specs}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Services
