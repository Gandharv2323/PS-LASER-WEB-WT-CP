import { motion } from 'framer-motion'
import { useState } from 'react'

/**
 * Portfolio Section - Cinematic Gallery
 * Previous work showcase
 */

const portfolioItems = [
    {
        id: 1,
        title: 'Industrial Enclosures',
        category: 'Laser Cutting',
        image: '/gallery-1.png'
    },
    {
        id: 2,
        title: 'Control Panel Housings',
        category: 'Sheet Metal',
        image: '/gallery-2.png'
    },
    {
        id: 3,
        title: 'Precision Brackets',
        category: 'CNC Bending',
        image: '/gallery-3.png'
    },
    {
        id: 4,
        title: 'Machine Guards',
        category: 'Fabrication',
        image: '/gallery-4.png'
    },
    {
        id: 5,
        title: 'Custom Fixtures',
        category: 'Welding',
        image: '/gallery-5.png'
    },
    {
        id: 6,
        title: 'Powder Coated Parts',
        category: 'Powder Coating',
        image: '/gallery-6.png'
    },
    {
        id: 7,
        title: 'Precision Laser Cut Patterns',
        category: 'Laser Cutting',
        image: '/portfolio-7.png'
    },
    {
        id: 8,
        title: 'Heavy Structural Fabrication',
        category: 'Fabrication',
        image: '/portfolio-8.png'
    }
]

function PortfolioSection() {
    const [activeFilter, setActiveFilter] = useState('All')
    const filters = ['All', 'Laser Cutting', 'Sheet Metal', 'CNC Bending', 'Fabrication', 'Welding', 'Powder Coating']

    const filteredItems = activeFilter === 'All'
        ? portfolioItems
        : portfolioItems.filter(item => item.category === activeFilter)

    return (
        <section className="cinematic-section portfolio-section" id="portfolio">
            <div className="section-bg" style={{ background: 'var(--color-bg)' }}></div>

            <div className="portfolio-content">
                <motion.div
                    className="portfolio-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="section-label">Portfolio</span>
                    <h2 className="section-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        Previous Work
                    </h2>
                </motion.div>

                {/* Filters */}
                <motion.div
                    className="portfolio-filters"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: 0.2 }}
                >
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </motion.div>

                {/* Gallery Grid */}
                <motion.div
                    className="portfolio-grid"
                    layout
                >
                    {filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            className="portfolio-item"
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="portfolio-image">
                                <img src={item.image} alt={item.title} />
                                <div className="portfolio-overlay">
                                    <span className="portfolio-category">{item.category}</span>
                                    <h3 className="portfolio-title">{item.title}</h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default PortfolioSection
