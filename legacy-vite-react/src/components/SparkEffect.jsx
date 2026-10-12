import { useEffect, useRef, useCallback } from 'react'

/**
 * SparkEffect Component
 * Realistic laser-cutting spark simulation
 * Uses elongated particle trails with proper physics
 */

function SparkEffect() {
    const canvasRef = useRef(null)
    const particlesRef = useRef([])
    const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 })
    const animationRef = useRef(null)
    const lastSpawnRef = useRef(0)

    // Create a realistic spark particle
    const createSpark = useCallback((x, y, velocityX, velocityY) => {
        // Sparks shoot outward from cursor movement direction
        const baseAngle = Math.atan2(velocityY, velocityX) + Math.PI
        const spread = (Math.random() - 0.5) * 1.5 // Spread angle
        const angle = baseAngle + spread

        // Variable speed - some fast, some slow
        const speed = 2 + Math.random() * 6

        // Tiny particle size - real sparks are very small
        const size = 0.5 + Math.random() * 1.5

        // Temperature-based color (hot core to cooler edge)
        const temperature = Math.random()
        let r, g, b
        if (temperature > 0.7) {
            // White-hot core
            r = 255
            g = 240 + Math.random() * 15
            b = 200 + Math.random() * 55
        } else if (temperature > 0.3) {
            // Orange-yellow
            r = 255
            g = 120 + Math.random() * 80
            b = 20 + Math.random() * 40
        } else {
            // Deep orange-red
            r = 255
            g = 60 + Math.random() * 60
            b = 10 + Math.random() * 30
        }

        return {
            x,
            y,
            vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
            vy: Math.sin(angle) * speed - 1 - Math.random() * 2, // Upward initial bias
            size,
            life: 1,
            decay: 0.015 + Math.random() * 0.025,
            gravity: 0.12 + Math.random() * 0.08,
            r, g, b,
            brightness: 0.8 + Math.random() * 0.2,
            // Trail positions for motion blur
            trail: []
        }
    }, [])

    // Always active - fullscreen sparks
    const isInActiveZone = useCallback(() => {
        return true
    }, [])

    // Animation loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')

        // Clear with slight fade for subtle trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Update and draw particles
        particlesRef.current = particlesRef.current.filter(p => {
            // Store position for trail
            p.trail.unshift({ x: p.x, y: p.y })
            if (p.trail.length > 4) p.trail.pop()

            // Physics
            p.vy += p.gravity
            p.vx *= 0.99
            p.x += p.vx
            p.y += p.vy
            p.life -= p.decay

            // Flicker
            p.brightness = 0.6 + Math.random() * 0.4

            if (p.life <= 0) return false

            // Draw spark trail (motion blur)
            if (p.trail.length > 1) {
                ctx.beginPath()
                ctx.moveTo(p.trail[p.trail.length - 1].x, p.trail[p.trail.length - 1].y)

                for (let i = p.trail.length - 2; i >= 0; i--) {
                    ctx.lineTo(p.trail[i].x, p.trail[i].y)
                }
                ctx.lineTo(p.x, p.y)

                const gradient = ctx.createLinearGradient(
                    p.trail[p.trail.length - 1].x,
                    p.trail[p.trail.length - 1].y,
                    p.x,
                    p.y
                )
                gradient.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`)
                gradient.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.life * p.brightness * 0.6})`)

                ctx.strokeStyle = gradient
                ctx.lineWidth = p.size * p.life
                ctx.lineCap = 'round'
                ctx.stroke()
            }

            // Draw spark head (bright point)
            const headAlpha = p.life * p.brightness
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${headAlpha})`
            ctx.fill()

            // Hot core glow
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size * p.life * 0.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 255, 255, ${headAlpha * 0.8})`
            ctx.fill()

            return true
        })

        animationRef.current = requestAnimationFrame(animate)
    }, [])

    // Mouse move handler
    const handleMouseMove = useCallback((e) => {
        const now = Date.now()
        const { x: lastX, y: lastY } = mouseRef.current

        // Calculate velocity
        const velocityX = e.clientX - lastX
        const velocityY = e.clientY - lastY
        const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY)

        mouseRef.current = {
            x: e.clientX,
            y: e.clientY,
            lastX: e.clientX,
            lastY: e.clientY
        }

        // Throttle spawn rate
        if (now - lastSpawnRef.current < 30) return
        lastSpawnRef.current = now

        // Only spawn in active zones
        if (!isInActiveZone(e.clientY)) return

        // Spawn based on movement speed (faster = more sparks)
        const spawnCount = Math.min(Math.floor(speed / 8) + 1, 4)

        if (speed > 3) { // Only spawn if moving
            for (let i = 0; i < spawnCount; i++) {
                particlesRef.current.push(
                    createSpark(
                        e.clientX + (Math.random() - 0.5) * 8,
                        e.clientY + (Math.random() - 0.5) * 8,
                        velocityX,
                        velocityY
                    )
                )
            }
        }

        // Cap particles
        if (particlesRef.current.length > 80) {
            particlesRef.current = particlesRef.current.slice(-80)
        }
    }, [createSpark, isInActiveZone])

    // Resize handler
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }, [])

    useEffect(() => {
        // Respect reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const canvas = canvasRef.current
        if (!canvas) return

        handleResize()
        window.addEventListener('resize', handleResize)
        window.addEventListener('mousemove', handleMouseMove)

        animationRef.current = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('mousemove', handleMouseMove)
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [animate, handleMouseMove, handleResize])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999,
                mixBlendMode: 'screen'
            }}
            aria-hidden="true"
        />
    )
}

export default SparkEffect
