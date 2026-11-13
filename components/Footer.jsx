import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

const Footer = () => {
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef(null);
  const cursorPos = useMotionValue({ x: 0, y: 0 });
  const scrubTime = useTransform(cursorPos, ({ x }) => {
    // Desktop gaze-based scrubbing
    if (typeof window !== 'undefined' && window.innerWidth > 700) {
      const maxScrub = 10; // seconds
      const scrubPos = Math.max(0, Math.min(maxScrub, x / window.innerWidth * maxScrub));
      return scrubPos;
    }
    return 0;
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorPos.set({ x: e.clientX, y: e.clientY });
    };

    if (!shouldReduceMotion) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [cursorPos, shouldReduceMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || shouldReduceMotion) return;

    const scrubAnimation = animate((progress) => {
      if (video) {
        video.currentTime = progress * 10; // 10 seconds max
      }
    }, {
      duration: 0.5,
      ease: 'easeOut',
    });

    return () => {
      scrubAnimation.stop();
    };
  }, [scrubTime, shouldReduceMotion]);

  return (
    <footer className="relative w-full bg-[#f7f8fa] pt-12 pb-8 md:pt-16 md:pb-12" role="contentinfo">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Background Video */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            poster="/images/footer-poster.jpg"
          >
            <source src="/videos/footer-background.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Content Layer */}
        <div className="relative z-10">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center mb-8 md:flex-row md:justify-between md:items-start md:mb-12">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <div className="w-32 md:w-[17vw] max-w-[210px] mx-auto md:mx-0">
                <img
                  src="/logos/logo-footer.svg"
                  alt="CoupleSpace"
                  className="w-full h-auto"
                  width={210}
                  height={100}
                />
              </div>
              <p className="mt-4 text-sm text-[#6B6B6B] font-light leading-relaxed">
                A private space for two to share moments, memories, and life together.
              </p>
            </div>

            <div className="flex gap-4 mt-6 md:mt-0">
              <a
                href="https://www.linkedin.com/company/couplespace"
                className="block w-10 h-10"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-7 2h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1m-5 0H5v14h14V5H7m7 11a1 1 0 0 1-.867-.5 1 1 0 0 1 1.731-1A3 3 0 0 1 12 13a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-2.127-.889 1 1 0 0 1-.867-.5V17h-2v-6h2v-1a2 2 0 0 1 2-2 2 2 0 0 1 2 2v1h2v6h-2v5a3 3 0 0 1-3-3z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/couplespace"
                className="block w-10 h-10"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M7.8 2h8.4C16.32 2 17 2.67 17 3.5v8.4c0 .83-.67 1.5-1.5 1.5H9.3c-.83 0-1.5-.67-1.5-1.5V3.5c0-.83.67-1.5 1.5-1.5m0 2h-4C5.22 4 4 5.22 4 6.5v4C4 11.78 5.22 13 6.5 13h4c1.28 0 2.5-1.22 2.5-2.5V6.5c0-1.28-1.22-2.5-2.5-2.5m0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5m8.4 2c-.92 0-1.84.07-2.75.2-.68.18-1.32.39-1.8.7-.27.12-.53.24-.77.32a4.35 4.35 0 0 1-1.07.08 4 4 0 0 1-4-4V8.5c0-.92.07-1.84.2-2.75.18-.68.39-1.32.7-1.8.12-.27.24-.53.32-.77a4 4 0 0 1 .08-1.07c.27-.18.63-.3.99-.4.36-.1.74-.16 1.13-.16h4.1c.41 0 .72.26.84.66l.76 2.27a.52.52 0 0 0 .98-.18l.05-2.27c.1-.26.38-.43.66-.43m-8.4 1.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4m8.4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-4.2-4c-.28 0-.5.22-.5.5v6.18c0 .28.22.5.5.5h8.4c.28 0 .5-.22.5-.5V9.2c0-.28-.22-.5-.5-.5h-8.4z"/>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@couplespace"
                className="block w-10 h-10"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M9 20c-.55 0-1.09.07-1.61.2-.84.24-1.53.54-2.07.94-.33.23-.58.44-.78.66-.2.22-.36.44-.49.67-.13.23-.24.48-.31.74-.08.26-.12.54-.12.82 0 .28.04.56.12.82.08.26.23.5.44.7.21.2.49.38.81.5.32.12.66.18 1.01.18.35 0 .69-.06 1.01-.18.32-.12.6-.3.81-.5.23-.2.42-.44.55-.7.08-.26.12-.54.12-.82 0-.28-.04-.56-.12-.82-.08-.26-.23-.5-.44-.7-.21-.2-.49-.38-.81-.5-.32-.12-.66-.18-1.01-.18M9 16c-.55 0-1.09.07-1.61.2-.84.24-1.53.54-2.07.94-.33.23-.58.44-.78.66-.2.22-.36.44-.49.67-.13.23-.24.48-.31.74-.08.26-.12.54-.12.82 0 .28.04.56.12.82.08.26.23.5.44.7.21.2.49.38.81.5.32.12.66.18 1.01.18.35 0 .69-.06 1.01-.18.32-.12.6-.3.81-.5.23-.2.42-.44.55-.7.08-.26.12-.54.12-.82 0-.28-.04-.56-.12-.82-.08-.26-.23-.5-.44-.7-.21-.2-.49-.38-.81-.5-.32-.12-.66-.18-1.01-.18M12 13.5c-2.5 0-4.5-1.57-4.5-3.5S9.5 6.5 12 6.5c2.5 0 4.5 1.57 4.5 3.5-2.5 0-4.5-1.57-4.5-3.5zm6 4.5c-.55 0-1.09.07-1.61.2-.84.24-1.53.54-2.07.94-.33.23-.58.44-.78.66-.2.22-.36.44-.49.67-.13.23-.24.48-.31.74-.08.26-.12.54-.12.82 0 .28.04.56.12.82.08.26.23.5.44.7.21.2.49.38.81.5.32.12.66.18 1.01.18.35 0 .69-.06 1.01-.18.32-.12.6-.3.81-.5.23-.2.42-.44.55-.7.08-.26.12-.54.12-.82 0-.28-.04-.56-.12-.82-.08-.26-.23-.5-.44-.7-.21-.2-.49-.38-.81-.5-.32-.12-.66-.18-1.01-.18M12 8.5c.55 0 1.09-.07 1.61-.2.84-.24 1.53-.54 2.07-.94.33-.23.58-.44.78-.66.2-.22.36-.44.49-.67.13-.23.24-.48.31-.74.08-.26.12-.54.12-.82 0-.28-.04-.56-.12-.82-.08-.26-.23-.5-.44-.7-.21-.2-.49-.38-.81-.5-.32-.12-.66-.18-1.01-.18-.35 0-.69.06-1.01.18-.32.12-.6.3-.81.5-.23.2-.42.44-.55.7-.08.26-.12.54-.12.82 0.28.04.56.12.82.08.26.23.5.44.7.21.2.49.38.81.5.32.12.66.18 1.01.18"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 gap-6 mt-12 md:grid-cols-4 md:gap-8">
            <div>
              <h3 className="text-sm font-semibold text-[#080909] mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-[#6B6B6B]">
                <li><a href="/features" className="hover:text-[#080909] transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-[#080909] transition-colors">Pricing</a></li>
                <li><a href="/security" className="hover:text-[#080909] transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#080909] mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-[#6B6B6B]">
                <li><a href="/about" className="hover:text-[#080909] transition-colors">About</a></li>
                <li><a href="/careers" className="hover:text-[#080909] transition-colors">Careers</a></li>
                <li><span className="text-[#080909] font-medium">Privacy Policy</span></li>
                <li><span className="text-[#080909] font-medium">Terms of Service</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#080909] mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-[#6B6B6B]">
                <li><a href="/help" className="hover:text-[#080909] transition-colors">Help Center</a></li>
                <li><a href="/blog" className="hover:text-[#080909] transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-[#080909] transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#080909] mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-[#6B6B6B]">
                <li><span className="text-[#080909] font-medium">© 2024 CoupleSpace</span></li>
                <li><span className="text-[#080909] font-medium">All rights reserved</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;