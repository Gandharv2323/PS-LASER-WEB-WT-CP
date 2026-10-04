import { motion } from 'framer-motion'
import './Hero.css'

/**
 * Hero Section Component
 * Clean, confident introduction with video background
 */
function Hero() {
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <section className="hero" id="hero">
            {/* Video Background */}
            <div className="hero-video-container">
                <video
                    className="hero-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                >
                    <source src="/Luxury_Video_Generation_Request.mp4" type="video/mp4" />
                </video>
                <div className="hero-overlay"></div>
            </div>

            {/* Hero Content */}
            <div className="hero-content">
                {/* Brand */}
                <motion.div
                    className="hero-brand"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <img src="/ps-logo.png" alt="PS Logo" className="brand-logo" />
                    <span className="brand-name"><span className="ps-orange">PS</span> LASER</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    className="hero-headline"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    Precision Engineering
                </motion.h1>

                {/* Sub-headline */}
                <motion.p
                    className="hero-subheadline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    Sheet Metal Manufacturing Excellence
                </motion.p>

                {/* CTA */}
                <motion.div
                    className="hero-cta"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <button
                        className="btn btn-primary"
                        onClick={() => scrollToSection('services')}
                    >
                        View Services
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => scrollToSection('contact')}
                    >
                        Contact
                    </button>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="scroll-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                onClick={() => scrollToSection('machines')}
            >
                <span className="scroll-line"></span>
            </motion.div>
        </section>
    )
}

export default Hero
