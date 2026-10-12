import { useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import './Gallery.css'

/**
 * Gallery Section
 * Portfolio showcase with parallax images
 */

const projects = [
    {
        id: 1,
        image: '/gallery-1.png',
        title: 'Precision Components',
        category: 'Laser Cutting',
        description: 'Intricate steel parts including gears, brackets, and perforated panels'
    },
    {
        id: 2,
        image: '/gallery-2.png',
        title: 'Industrial Parts',
        category: 'Laser Cutting',
        description: 'Stainless steel components with precise geometric cuts'
    },
    {
        id: 3,
        image: '/gallery-3.png',
        title: 'Enclosures',
        category: 'Powder Coating',
        description: 'Fabricated metal enclosures with premium powder coating finish'
    },
    {
        id: 4,
        image: '/gallery-4.png',
        title: 'Perforated Sheets',
        category: 'Laser Cutting',
        description: 'Aluminum sheets with various pattern cutouts'
    },
    {
        id: 5,
        image: '/gallery-5.png',
        title: 'Formed Components',
        category: 'CNC Bending',
        description: 'Bent and formed sheet metal brackets and enclosure panels'
    },
    {
        id: 6,
        image: '/gallery-6.png',
        title: 'Decorative Panel',
        category: 'Laser Cutting',
        description: 'Intricate geometric pattern for architectural application'
    }
]

function GalleryItem({ project, index, onClick }) {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    // Slow parallax effect on image
    const y = useTransform(scrollYProgress, [0, 1], [30, -30])

    return (
        <motion.div
            ref={ref}
            className="gallery-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={() => onClick(project)}
        >
            <div className="gallery-image">
                <motion.img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    style={{ y }}
                />
                <div className="gallery-overlay">
                    <span className="gallery-category">{project.category}</span>
                    <h3 className="gallery-title">{project.title}</h3>
                </div>
            </div>
        </motion.div>
    )
}

function Gallery() {
    const [selectedImage, setSelectedImage] = useState(null)

    const openLightbox = (project) => {
        setSelectedImage(project)
    }

    const closeLightbox = () => {
        setSelectedImage(null)
    }

    return (
        <section className="section section-darker gallery" id="gallery">
            <div className="container">
                {/* Section Header */}
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="subtitle">Portfolio</span>
                    <h2>Previous Work</h2>
                </motion.div>

                {/* Gallery Grid */}
                <div className="gallery-grid">
                    {projects.map((project, index) => (
                        <GalleryItem
                            key={project.id}
                            project={project}
                            index={index}
                            onClick={openLightbox}
                        />
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                    >
                        <motion.div
                            className="lightbox-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="lightbox-close" onClick={closeLightbox}>
                                <span></span>
                                <span></span>
                            </button>
                            <img src={selectedImage.image} alt={selectedImage.title} />
                            <div className="lightbox-info">
                                <span className="lightbox-category">{selectedImage.category}</span>
                                <h3>{selectedImage.title}</h3>
                                <p>{selectedImage.description}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

export default Gallery
