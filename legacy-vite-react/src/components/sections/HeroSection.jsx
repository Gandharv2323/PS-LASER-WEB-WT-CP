import { motion } from 'framer-motion'

/**
 * Hero Section - Cinematic
 * Full-screen video with brand identity
 */
function HeroSection() {
    return (
        <section className="cinematic-section hero-section" id="hero">
            {/* Video Background */}
            <div className="section-bg">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                >
                    <source src="/Luxury_Video_Generation_Request.mp4" type="video/mp4" />
                </video>
            </div>
            <div className="section-overlay"></div>

            {/* Content */}
            <motion.div
                className="section-content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
            >
                <div className="hero-brand">
                    <img src="/ps-logo.png" alt="PS Laser" className="hero-logo" />
                    <span className="hero-name">
                        <span className="ps-orange">PS</span> LASER
                    </span>
                </div>

                <h1 className="section-title">
                    Precision<br />Engineering
                </h1>
                <p className="section-subtitle">
                    ADVANCED LASER & SHEET METAL MANUFACTURING
                </p>
            </motion.div>

            {/* Scroll Indicator */}
            <div className="scroll-indicator">
                <span className="scroll-line"></span>
            </div>
        </section>
    )
}

export default HeroSection
