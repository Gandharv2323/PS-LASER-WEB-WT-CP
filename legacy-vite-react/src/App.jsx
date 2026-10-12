import { useState } from 'react'
import LoadingScreen from './components/LoadingScreen'
import Header from './components/Header'
import './components/Header.css'

// Cinematic Sections
import {
    HeroSection,
    WhatWeDoSection,
    LaserCuttingSection,
    BendingSection,
    PowderCoatingSection,
    FabricationSection,
    CapabilitiesSection,
    PortfolioSection,
    ProcessSection,
    AboutSection,
    ContactSection
} from './components/sections'

import CinematicOpening from './components/CinematicOpening'

/**
 * PS Laser - Cinematic Industrial Website
 * SpaceX-inspired vertical storytelling
 */
function App() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [showOpening, setShowOpening] = useState(false)
    const [appReady, setAppReady] = useState(false)

    // Handle initial load completion
    const handleLoadComplete = () => {
        setIsLoaded(true)
        setShowOpening(true)
    }

    // Handle cinematic opening completion
    const handleOpeningComplete = () => {
        setShowOpening(false)
        setAppReady(true)
    }

    return (
        <>
            <LoadingScreen onLoadComplete={handleLoadComplete} />

            {isLoaded && showOpening && !appReady && (
                <CinematicOpening onComplete={handleOpeningComplete} />
            )}

            <Header />

            <main className={`app ${appReady ? 'loaded' : ''}`}>
                <HeroSection />
                <WhatWeDoSection />
                <LaserCuttingSection />
                <BendingSection />
                <PowderCoatingSection />
                <FabricationSection />
                <ProcessSection />
                <PortfolioSection />
                <CapabilitiesSection />
                <AboutSection />
                <ContactSection />
            </main>
        </>
    )
}

export default App
