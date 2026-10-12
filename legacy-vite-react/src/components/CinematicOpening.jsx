import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './CinematicOpening.css'

/**
 * Industrial Door Opening Animation
 * Realistic heavy metal doors with physics-accurate motion
 * and synchronized spark effects
 */
function CinematicOpening({ onComplete }) {
    const canvasRef = useRef(null)
    const audioContextRef = useRef(null)
    const animationFrameRef = useRef(null)
    const particlesRef = useRef([])
    const animationStartTimeRef = useRef(0)

    // Animation states - start opening immediately
    const [isOpening, setIsOpening] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    // Animation constants
    const DOOR_OPEN_DURATION = 3000 // 3 seconds
    const SPARK_DURATION = 2800 // Stop sparks slightly before doors finish
    const START_DELAY = 500 // Short delay before doors start moving

    // Detect mobile/low-end device
    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 768 ||
                navigator.hardwareConcurrency <= 4 ||
                /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
        }
        checkDevice()
    }, [])

    // Industrial sound generator using Web Audio API
    const playIndustrialSound = useCallback(() => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext
            if (!AudioContext) return

            const ctx = new AudioContext()
            audioContextRef.current = ctx
            const masterGain = ctx.createGain()
            masterGain.gain.value = isMobile ? 0.15 : 0.30
            masterGain.connect(ctx.destination)

            // Motor hum (low frequency)
            const motorOsc = ctx.createOscillator()
            const motorGain = ctx.createGain()
            motorOsc.type = 'sawtooth'
            motorOsc.frequency.value = 55
            motorGain.gain.setValueAtTime(0, ctx.currentTime)
            motorGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.3)
            motorGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.5)
            motorGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3)
            motorOsc.connect(motorGain)
            motorGain.connect(masterGain)
            motorOsc.start()
            motorOsc.stop(ctx.currentTime + 3.2)

            // Metal sliding sound (filtered noise)
            const bufferSize = ctx.sampleRate * 3
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
            const noiseData = noiseBuffer.getChannelData(0)
            for (let i = 0; i < bufferSize; i++) {
                noiseData[i] = (Math.random() * 2 - 1) * 0.3
            }
            const noiseSource = ctx.createBufferSource()
            noiseSource.buffer = noiseBuffer

            const noiseFilter = ctx.createBiquadFilter()
            noiseFilter.type = 'bandpass'
            noiseFilter.frequency.value = 800
            noiseFilter.Q.value = 1.5

            const noiseGain = ctx.createGain()
            noiseGain.gain.setValueAtTime(0, ctx.currentTime)
            noiseGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.4)
            noiseGain.gain.setValueAtTime(0.10, ctx.currentTime + 1.5)
            noiseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.8)

            noiseSource.connect(noiseFilter)
            noiseFilter.connect(noiseGain)
            noiseGain.connect(masterGain)
            noiseSource.start()
            noiseSource.stop(ctx.currentTime + 3.2)

            // Spark crackling (if not mobile)
            if (!isMobile) {
                const sparkInterval = setInterval(() => {
                    if (ctx.state === 'closed') {
                        clearInterval(sparkInterval)
                        return
                    }
                    const clickOsc = ctx.createOscillator()
                    const clickGain = ctx.createGain()
                    clickOsc.type = 'square'
                    clickOsc.frequency.value = 2000 + Math.random() * 3000
                    clickGain.gain.setValueAtTime(0.02, ctx.currentTime)
                    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02)
                    clickOsc.connect(clickGain)
                    clickGain.connect(masterGain)
                    clickOsc.start()
                    clickOsc.stop(ctx.currentTime + 0.03)
                }, 50 + Math.random() * 80)

                setTimeout(() => clearInterval(sparkInterval), SPARK_DURATION)
            }

            // Initial mechanical click
            const clickOsc = ctx.createOscillator()
            const clickGain = ctx.createGain()
            clickOsc.type = 'square'
            clickOsc.frequency.value = 150
            clickGain.gain.setValueAtTime(0.15, ctx.currentTime)
            clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
            clickOsc.connect(clickGain)
            clickGain.connect(masterGain)
            clickOsc.start()
            clickOsc.stop(ctx.currentTime + 0.1)

        } catch (e) {
            console.log('Audio not available:', e.message)
        }
    }, [isMobile])

    // Main animation trigger - runs once on mount
    useEffect(() => {
        // Start animation after short delay
        const startTimer = setTimeout(() => {
            setIsOpening(true)
            animationStartTimeRef.current = Date.now()
            playIndustrialSound()
        }, START_DELAY)

        // Complete animation after doors finish
        const completeTimer = setTimeout(() => {
            setIsVisible(false)
            if (audioContextRef.current) {
                try {
                    audioContextRef.current.close()
                } catch (e) { /* ignore */ }
            }
            if (onComplete) onComplete()
        }, START_DELAY + DOOR_OPEN_DURATION + 300)

        return () => {
            clearTimeout(startTimer)
            clearTimeout(completeTimer)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [onComplete, playIndustrialSound])

    // Realistic Spark Physics
    useEffect(() => {
        if (!isOpening) return

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        // Handle resize
        const setSize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        setSize()
        window.addEventListener('resize', setSize)

        // Spark particle with realistic physics
        const createSpark = () => {
            const centerX = window.innerWidth / 2
            const y = Math.random() * window.innerHeight

            const side = Math.random() > 0.5 ? 1 : -1
            const angle = (Math.random() * 0.5 + 0.1) * side
            const speed = 3 + Math.random() * 8

            return {
                x: centerX + (Math.random() - 0.5) * 4,
                y,
                vx: Math.cos(angle) * speed * side,
                vy: Math.sin(angle) * speed * 0.5 - 1,
                life: 1,
                decay: 0.04 + Math.random() * 0.06,
                gravity: 0.15 + Math.random() * 0.1,
                size: 0.5 + Math.random() * 1.2,
                color: {
                    r: 255,
                    g: 150 + Math.random() * 80,
                    b: 30 + Math.random() * 40
                }
            }
        }

        const maxParticles = isMobile ? 40 : 80
        let isAnimating = true

        const animate = () => {
            if (!isAnimating) return

            const elapsed = Date.now() - animationStartTimeRef.current
            const isStillSparking = elapsed < SPARK_DURATION

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Add new sparks while doors are opening
            if (isStillSparking && particlesRef.current.length < maxParticles) {
                const sparksToAdd = isMobile ? 2 : 4
                for (let i = 0; i < sparksToAdd; i++) {
                    if (Math.random() > 0.3) {
                        particlesRef.current.push(createSpark())
                    }
                }
            }

            // Update and draw particles
            particlesRef.current = particlesRef.current.filter(p => {
                p.vy += p.gravity
                p.vx *= 0.98
                p.x += p.vx
                p.y += p.vy
                p.life -= p.decay

                if (p.life <= 0) return false

                const alpha = p.life * 0.9
                const currentSize = p.size * p.life

                // Core (white-hot center)
                ctx.beginPath()
                ctx.arc(p.x, p.y, currentSize * 0.4, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`
                ctx.fill()

                // Outer glow (orange)
                ctx.beginPath()
                ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.6})`
                ctx.fill()

                return true
            })

            animationFrameRef.current = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            isAnimating = false
            window.removeEventListener('resize', setSize)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [isOpening, isMobile])

    // Door animation - heavy industrial feel
    const doorTransition = {
        duration: DOOR_OPEN_DURATION / 1000,
        ease: [0.25, 0.1, 0.25, 1]
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="cinematic-opening">
                    <canvas ref={canvasRef} className="opening-sparks" />

                    {/* Left Door */}
                    <motion.div
                        className="opening-door door-left"
                        initial={{ x: 0 }}
                        animate={{ x: isOpening ? '-100%' : 0 }}
                        transition={doorTransition}
                    >
                        <div className="door-surface" />
                        <div className="door-letter">P</div>
                        <div className="door-bolts">
                            <div className="bolt top-left" />
                            <div className="bolt top-center" />
                            <div className="bolt top-right" />
                            <div className="bolt mid-right" />
                            <div className="bolt bottom-left" />
                            <div className="bolt bottom-center" />
                            <div className="bolt bottom-right" />
                        </div>
                    </motion.div>

                    {/* Right Door */}
                    <motion.div
                        className="opening-door door-right"
                        initial={{ x: 0 }}
                        animate={{ x: isOpening ? '100%' : 0 }}
                        transition={doorTransition}
                    >
                        <div className="door-surface" />
                        <div className="door-letter">S</div>
                        <div className="door-bolts">
                            <div className="bolt top-left" />
                            <div className="bolt top-center" />
                            <div className="bolt top-right" />
                            <div className="bolt mid-left" />
                            <div className="bolt bottom-left" />
                            <div className="bolt bottom-center" />
                            <div className="bolt bottom-right" />
                        </div>
                    </motion.div>

                    {/* Central Seam */}
                    <motion.div
                        className="seam-glow"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: isOpening ? 0 : 1 }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            )}
        </AnimatePresence>
    )
}

export default CinematicOpening
