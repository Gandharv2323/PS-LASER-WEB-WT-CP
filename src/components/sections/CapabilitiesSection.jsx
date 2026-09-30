import { motion, useInView } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

/**
 * Capabilities Section - Cinematic with Counting Animation
 * Big numbers that build trust with animated counting
 */

function CountUp({ end, duration = 2, suffix = '' }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        if (!isInView) return

        let startTime
        const startValue = 0
        const endValue = parseFloat(end)

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)

            setCount(Math.floor(easeOutQuart * endValue))

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                setCount(endValue)
            }
        }

        requestAnimationFrame(animate)
    }, [isInView, end, duration])

    return <span ref={ref}>{count}{suffix}</span>
}

const capabilities = [
    { value: 0.1, prefix: '±', suffix: '', unit: 'mm', label: 'Tolerance', isDecimal: true },
    { value: 175, prefix: '', suffix: '', unit: 'Ton', label: 'Press Capacity', isDecimal: false },
    { value: 1000, prefix: '', suffix: '+', unit: 'Hrs', label: 'Salt Spray Test', isDecimal: false }
]

function CapabilitiesSection() {
    return (
        <section className="cinematic-section capabilities-section" id="capabilities">
            {/* Dark Background */}
            <div className="section-bg" style={{ background: '#0a0a0a' }}></div>

            {/* Content */}
            <motion.div
                className="section-content capabilities-content"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <span className="section-label" style={{ textAlign: 'center', display: 'block', marginBottom: '3rem' }}>
                    Our Capabilities
                </span>

                <div className="capabilities-grid">
                    {capabilities.map((cap, index) => (
                        <motion.div
                            key={cap.label}
                            className="capability-item"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 + 0.3 }}
                        >
                            <span className="capability-value">
                                {cap.prefix}
                                {cap.isDecimal ? (
                                    <span>0.1</span>
                                ) : (
                                    <CountUp end={cap.value} duration={2.5} suffix={cap.suffix} />
                                )}
                                <span className="capability-unit">{cap.unit}</span>
                            </span>
                            <span className="capability-label">{cap.label}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    )
}

export default CapabilitiesSection
