import { motion } from 'framer-motion'
import './MachineCards.css'

/**
 * Machine Specifications Section
 * Clean, text-driven layout showcasing laser cutting capabilities
 */

const machines = [
    {
        id: 1,
        name: 'HSG Laser',
        power: '3 KW',
        size: '3m × 1.5m',
        type: 'High Power',
        highlight: true
    },
    {
        id: 2,
        name: 'HSG Laser',
        power: '1.5 KW',
        size: '3m × 1.5m',
        type: 'Precision',
        highlight: false
    }
]

const materials = [
    { name: 'Mild Steel', capacity: '20mm' },
    { name: 'Stainless Steel', capacity: '10mm' },
    { name: 'Aluminum', capacity: '8mm' },
    { name: 'Brass', capacity: '4mm' },
    { name: 'Copper', capacity: '4mm' }
]

function MachineCards() {
    return (
        <section className="section section-dark machines" id="machines">
            <div className="container">
                {/* Section Header */}
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="subtitle">Equipment</span>
                    <h2>Precision Machinery</h2>
                </motion.div>

                {/* Machine Cards */}
                <div className="machines-grid">
                    {machines.map((machine, index) => (
                        <motion.div
                            key={machine.id}
                            className={`machine-card ${machine.highlight ? 'machine-highlight' : ''}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <span className="machine-type">{machine.type}</span>
                            <h3 className="machine-name">{machine.name}</h3>
                            <div className="machine-specs">
                                <div className="spec">
                                    <span className="spec-label">Power</span>
                                    <span className="spec-value">{machine.power}</span>
                                </div>
                                <div className="spec">
                                    <span className="spec-label">Bed Size</span>
                                    <span className="spec-value">{machine.size}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Material Capacity */}
                <motion.div
                    className="material-capacity"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h3>Material Capacity</h3>
                    <div className="materials-grid">
                        {materials.map((material) => (
                            <div key={material.name} className="material-item">
                                <span className="material-name">{material.name}</span>
                                <span className="material-value">{material.capacity}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default MachineCards
