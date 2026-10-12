import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './LoadingScreen.css'

/**
 * Loading Screen with Welcome GIF
 * Shows full-screen animated GIF while site loads
 */
function LoadingScreen({ onLoadComplete }) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Display time for GIF animation
        const loadTime = setTimeout(() => {
            setIsLoading(false)
            if (onLoadComplete) onLoadComplete()
        }, 3500)

        return () => clearTimeout(loadTime)
    }, [onLoadComplete])

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    className="loading-screen"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                    <img
                        src="/welcome.gif"
                        alt="Welcome to PS Laser"
                        className="welcome-gif"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default LoadingScreen
