import './Footer.css'

/**
 * Footer Component
 * Clean, minimal footer
 */

function Footer() {
    const currentYear = new Date().getFullYear()

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Brand */}
                    <div className="footer-brand">
                        <span className="footer-logo">PS LASER</span>
                        <p className="footer-tagline">Precision Engineering & Sheet Metal Manufacturing</p>
                    </div>

                    {/* Navigation */}
                    <nav className="footer-nav">
                        <button onClick={() => scrollToSection('machines')}>Equipment</button>
                        <button onClick={() => scrollToSection('services')}>Services</button>
                        <button onClick={() => scrollToSection('quality')}>Quality</button>
                        <button onClick={() => scrollToSection('about')}>About</button>
                        <button onClick={() => scrollToSection('contact')}>Contact</button>
                    </nav>

                    {/* Contact */}
                    <div className="footer-contact">
                        <span>+91 7719976990</span>
                        <span>pslaser24@gmail.com</span>
                    </div>
                </div>

                {/* Bottom */}
                <div className="footer-bottom">
                    <span className="copyright">© {currentYear} PS Laser</span>
                    <span className="gst">GST: 27ABHFP5667Q1Z8</span>
                </div>
            </div>
        </footer>
    )
}

export default Footer
