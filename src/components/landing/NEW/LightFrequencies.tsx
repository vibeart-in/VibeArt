import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useLayoutEffect, useRef } from 'react';
import './LightFrequencies.css';

gsap.registerPlugin(ScrollTrigger);

const LightFrequencies = () => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".animation-section",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1,
        }
      });

      // 1. Reveal Container
      tl.to(".svg-container", { autoAlpha: 1, duration: 0.1 }, 0)
      
      // 2. Grow Bars (ScaleY)
        .to(".svg-container", { 
          transform: "scaleY(1) translateY(0px)", 
          duration: 1, 
          ease: "power2.out" 
        }, 0)

      // 3. Reveal Text
        .to(".wavelength-label", { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.05 
        }, 0.2)

      // 4. Parallax Text Levels
        .to(".level-5", { y: "-25vh", duration: 1, ease: "none" }, 0)
        .to(".level-4", { y: "-20vh", duration: 1, ease: "none" }, 0)
        .to(".level-3", { y: "-15vh", duration: 1, ease: "none" }, 0)
        .to(".level-2", { y: "-10vh", duration: 1, ease: "none" }, 0)
        .to(".level-1", { y: "-5vh", duration: 1, ease: "none" }, 0);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="lf-container" ref={containerRef}>
      
      {/* Background Gradients (Restored) */}
      <div className="bg-gradients">
        <div className="bg-gradient bg-gradient-1"></div>
        <div className="bg-gradient bg-gradient-2"></div>
        <div className="bg-gradient bg-gradient-3"></div>
      </div>

      <section className="hero-section">
        <h1 className="hero-title">Scroll Down<br/>To Reveal Spectrum</h1>
      </section>

      <div className="scroll-space"></div>

      <div className="animation-section">
        <div className="footer-container">
          
          <div className="svg-container">
            <svg className="spectrum-svg" viewBox="0 0 1567 584" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Added filter="url(#blur)" to restore the blurry look */}
              <g clipPath="url(#clip)" filter="url(#blur)">
                <path d="M1219 584H1393V184H1219V584Z" fill="url(#grad0)" />
                <path d="M1045 584H1219V104H1045V584Z" fill="url(#grad1)" />
                <path d="M348 584H174L174 184H348L348 584Z" fill="url(#grad2)" />
                <path d="M522 584H348L348 104H522L522 584Z" fill="url(#grad3)" />
                <path d="M697 584H522L522 54H697L697 584Z" fill="url(#grad4)" />
                <path d="M870 584H1045V54H870V584Z" fill="url(#grad5)" />
                <path d="M870 584H697L697 0H870L870 584Z" fill="url(#grad6)" />
                <path d="M174 585H0.000183105L-3.75875e-06 295H174L174 585Z" fill="url(#grad7)" />
                <path d="M1393 584H1567V294H1393V584Z" fill="url(#grad8)" />
              </g>
              <defs>
                {/* Restored Blur Filter */}
                <filter id="blur" x="-30" y="-30" width="1627" height="644" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                  <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur" />
                </filter>

                {/* Restored Complex Multi-Stop Gradients */}
                <linearGradient id="grad0" x1="1306" y1="584" x2="1306" y2="184" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#340B05" />
                    <stop offset="0.18" stopColor="#0358F7" />
                    <stop offset="0.28" stopColor="#5092C7" />
                    <stop offset="0.41" stopColor="#E1ECFE" />
                    <stop offset="0.58" stopColor="#FFD400" />
                    <stop offset="0.68" stopColor="#FA3D1D" />
                    <stop offset="0.80" stopColor="#FD02F5" />
                    <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad1" x1="1132" y1="584" x2="1132" y2="104" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#340B05" />
                    <stop offset="0.18" stopColor="#0358F7" />
                    <stop offset="0.28" stopColor="#5092C7" />
                    <stop offset="0.41" stopColor="#E1ECFE" />
                    <stop offset="0.58" stopColor="#FFD400" />
                    <stop offset="0.68" stopColor="#FA3D1D" />
                    <stop offset="0.80" stopColor="#FD02F5" />
                    <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad2" x1="261" y1="584" x2="261" y2="184" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#340B05" />
                    <stop offset="0.18" stopColor="#0358F7" />
                    <stop offset="0.28" stopColor="#5092C7" />
                    <stop offset="0.41" stopColor="#E1ECFE" />
                    <stop offset="0.58" stopColor="#FFD400" />
                    <stop offset="0.68" stopColor="#FA3D1D" />
                    <stop offset="0.80" stopColor="#FD02F5" />
                    <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad3" x1="435" y1="584" x2="435" y2="104" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#340B05" />
                    <stop offset="0.18" stopColor="#0358F7" />
                    <stop offset="0.28" stopColor="#5092C7" />
                    <stop offset="0.41" stopColor="#E1ECFE" />
                    <stop offset="0.58" stopColor="#FFD400" />
                    <stop offset="0.68" stopColor="#FA3D1D" />
                    <stop offset="0.80" stopColor="#FD02F5" />
                    <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad4" x1="609.501" y1="584" x2="609.501" y2="54" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#340B05" />
                    <stop offset="0.18" stopColor="#0358F7" />
                    <stop offset="0.28" stopColor="#5092C7" />
                    <stop offset="0.41" stopColor="#E1ECFE" />
                    <stop offset="0.58" stopColor="#FFD400" />
                    <stop offset="0.68" stopColor="#FA3D1D" />
                    <stop offset="0.80" stopColor="#FD02F5" />
                    <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad5" x1="957.5" y1="584" x2="957.5" y2="54" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#340B05" />
                    <stop offset="0.18" stopColor="#0358F7" />
                    <stop offset="0.28" stopColor="#5092C7" />
                    <stop offset="0.41" stopColor="#E1ECFE" />
                    <stop offset="0.58" stopColor="#FFD400" />
                    <stop offset="0.68" stopColor="#FA3D1D" />
                    <stop offset="0.80" stopColor="#FD02F5" />
                    <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad6" x1="783.501" y1="584" x2="783.501" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#340B05" />
                    <stop offset="0.18" stopColor="#0358F7" />
                    <stop offset="0.28" stopColor="#5092C7" />
                    <stop offset="0.41" stopColor="#E1ECFE" />
                    <stop offset="0.58" stopColor="#FFD400" />
                    <stop offset="0.68" stopColor="#FA3D1D" />
                    <stop offset="0.80" stopColor="#FD02F5" />
                    <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad7" x1="87.0003" y1="585" x2="87.0003" y2="295" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#340B05" />
                    <stop offset="0.18" stopColor="#0358F7" />
                    <stop offset="0.28" stopColor="#5092C7" />
                    <stop offset="0.41" stopColor="#E1ECFE" />
                    <stop offset="0.58" stopColor="#FFD400" />
                    <stop offset="0.68" stopColor="#FA3D1D" />
                    <stop offset="0.80" stopColor="#FD02F5" />
                    <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad8" x1="1480" y1="584" x2="1480" y2="294" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#340B05" />
                    <stop offset="0.18" stopColor="#0358F7" />
                    <stop offset="0.28" stopColor="#5092C7" />
                    <stop offset="0.41" stopColor="#E1ECFE" />
                    <stop offset="0.58" stopColor="#FFD400" />
                    <stop offset="0.68" stopColor="#FA3D1D" />
                    <stop offset="0.80" stopColor="#FD02F5" />
                    <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <clipPath id="clip"><rect width="1567" height="584" fill="white" /></clipPath>
              </defs>
            </svg>
          </div>

          <div className="text-grid">
            <div className="text-column"><div className="wavelength-label level-1">Violet<br/>Waves<br/>380nm</div></div>
            <div className="text-column"><div className="wavelength-label level-2">Blue<br/>Photons<br/>450nm</div></div>
            <div className="text-column"><div className="wavelength-label level-3">Cyan<br/>Spectrum<br/>490nm</div></div>
            <div className="text-column"><div className="wavelength-label level-4">Green<br/>Energy<br/>530nm</div></div>
            <div className="text-column"><div className="wavelength-label level-5">Yellow<br/>Radiance<br/>580nm</div></div>
            <div className="text-column"><div className="wavelength-label level-4">Orange<br/>Glow<br/>620nm</div></div>
            <div className="text-column"><div className="wavelength-label level-3">Red<br/>Shift<br/>680nm</div></div>
            <div className="text-column"><div className="wavelength-label level-2">Infrared<br/>Heat<br/>750nm</div></div>
            <div className="text-column"><div className="wavelength-label level-1">Beyond<br/>Visible<br/>800nm</div></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LightFrequencies;