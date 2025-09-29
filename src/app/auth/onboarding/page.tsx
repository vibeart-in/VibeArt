'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

type Chip = { id: string; label: string };
type Props = {
  platformName?: string;
  userName?: string;
  audioSrc?: string;
  introDurationMs?: number; // 5–10s
  allowSkip?: boolean;
  chips?: Chip[];
};

export default function CinematicOnboardingLikeMock({
  platformName = 'Arcader',
  userName = 'Arcader',
  audioSrc = '/audio/intro.mp3',
  introDurationMs = 7000,
  allowSkip = true,
  chips = [
    { id: 'social', label: 'Social media' },
    { id: 'personal', label: 'Personal projects' },
    { id: 'work', label: 'Work' },
  ],
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<'intro' | 'onboarding'>('intro');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showSoundGate, setShowSoundGate] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onboardingHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const actualIntroMs = prefersReducedMotion ? 1200 : introDurationMs;

  // Try autoplay; if blocked, show enable-sound gate
  const tryPlay = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      audioRef.current.volume = 0.9;
      await audioRef.current.play();
      setSoundEnabled(true);
    } catch {
      setShowSoundGate(true);
      setSoundEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (phase === 'intro' && !prefersReducedMotion) tryPlay();
  }, [phase, prefersReducedMotion, tryPlay]);

  // Timed transition from intro to onboarding
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => {
      handleToOnboarding();
    }, actualIntroMs);
    return () => clearTimeout(t);
  }, [phase, actualIntroMs]);

  // Keyboard: Esc/S skip, M mute
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'intro') return;
      const k = e.key.toLowerCase();
      if (k === 'escape' || k === 's') handleToOnboarding();
      if (k === 'm' && audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().then(() => setSoundEnabled(true)).catch(() => setShowSoundGate(true));
        } else {
          audioRef.current.pause();
          setSoundEnabled(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const fadeOutAudio = useCallback((ms = 1200) => {
    const el = audioRef.current;
    if (!el) return;
    const steps = 16;
    const step = el.volume / steps;
    const interval = ms / steps;
    const id = setInterval(() => {
      const v = Math.max(0, el.volume - step);
      el.volume = v;
      if (v <= 0.02) {
        el.pause();
        el.currentTime = 0;
        clearInterval(id);
      }
    }, interval);
  }, []);

  const handleToOnboarding = useCallback(() => {
    setPhase('onboarding');
    fadeOutAudio(1000);
    setTimeout(() => onboardingHeadingRef.current?.focus(), 450);
  }, [fadeOutAudio]);

  // Arc gradient animation values
  const arcY = prefersReducedMotion ? 0 : -18;
  const barsY = prefersReducedMotion ? 0 : -12;
  const vignetteOpacity = prefersReducedMotion ? 0.35 : 0.55;

  return (
    <div
      role="main"
      aria-label="Cinematic onboarding"
      style={{
        minHeight: '100svh',
        width: '100%',
        position: 'relative',
        backgroundColor: '#0a0b0f',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      <audio ref={audioRef} src={audioSrc} preload="auto" />

      {/* BACKGROUND LAYERS — animated with Framer Motion */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.6 } }}
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Soft top-to-bottom midnight gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, #07080c 0%, #0a0b10 45%, #0a0b10 100%)',
          }}
        />
        {/* Rising arc */}
        <motion.div
          aria-hidden
          initial={{ y: 24 }}
          animate={{ y: arcY, transition: { duration: 3.2, ease: [0.2, 0.8, 0.2, 1] } }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '-20%',
            height: '85%',
            background:
              'radial-gradient(60% 40% at 50% 100%, rgba(255,153,0,0.95) 0%, rgba(255,101,101,0.85) 35%, rgba(92,133,255,0.85) 70%, rgba(18,28,56,0.0) 100%)',
            filter: 'blur(24px)',
            transform: 'translateZ(0)',
          }}
        />
        {/* Vertical bars masked by arc for the “beams” feel */}
        <motion.div
          aria-hidden
          initial={{ y: 24, opacity: 0.9 }}
          animate={{
            y: barsY,
            opacity: 1,
            transition: { duration: 3.2, ease: [0.2, 0.8, 0.2, 1] },
          }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '-20%',
            height: '85%',
            background:
              'repeating-linear-gradient( to right, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.0) 2px, rgba(255,255,255,0.0) 12px )',
            maskImage:
              'radial-gradient(60% 40% at 50% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'radial-gradient(60% 40% at 50% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
            filter: 'blur(0.3px)',
            transform: 'translateZ(0)',
          }}
        />
        {/* Vignette */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(70% 60% at 50% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 60%, rgba(0,0,0,1) 100%)',
            opacity: vignetteOpacity,
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* SCENES */}
      <AnimatePresence mode="wait" initial={false}>
        {phase === 'intro' && (
          <motion.section
            key="intro"
            aria-labelledby="intro-heading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              paddingInline: 'clamp(16px, 4vw, 48px)',
              textAlign: 'center',
            }}
          >
            <motion.h1
              id="intro-heading"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] } }}
              exit={{ opacity: 0, scale: 0.98 }}
              style={{
                fontSize: 'clamp(28px, 8vw, 84px)',
                lineHeight: 1.06,
                letterSpacing: '-0.02em',
                fontWeight: 800,
                textShadow: '0 10px 40px rgba(0,0,0,0.55)',
                margin: 0,
              }}
            >
              Welcome {userName}!
            </motion.h1>

            {/* Controls */}
            <div
              style={{
                position: 'absolute',
                bottom: 'min(5vh, 24px)',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 12,
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.18)',
                padding: 10,
                borderRadius: 999,
                backdropFilter: 'blur(6px)',
              }}
            >
              {allowSkip && (
                <motion.button
                  type="button"
                  onClick={handleToOnboarding}
                  whileTap={{ scale: 0.97 }}
                  style={pillButton}
                  aria-label="Skip intro"
                >
                  Skip intro (S/Esc)
                </motion.button>
              )}
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (!audioRef.current) return;
                  if (audioRef.current.paused) {
                    audioRef.current.play().then(() => setSoundEnabled(true)).catch(() => setShowSoundGate(true));
                  } else {
                    audioRef.current.pause();
                    setSoundEnabled(false);
                  }
                }}
                style={pillButton}
                aria-label={soundEnabled ? 'Mute' : 'Unmute'}
              >
                {soundEnabled ? 'Mute (M)' : 'Sound (M)'}
              </motion.button>
            </div>

            {/* Sound gate */}
            <AnimatePresence>
              {showSoundGate && (
                <motion.div
                  key="sound-gate"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Enable sound"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(0,0,0,0.35)',
                  }}
                >
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      setShowSoundGate(false);
                      if (!audioRef.current) return;
                      try {
                        audioRef.current.currentTime = 0;
                        audioRef.current.volume = 0.9;
                        await audioRef.current.play();
                        setSoundEnabled(true);
                      } catch {
                        setSoundEnabled(false);
                      }
                    }}
                    style={gateButton}
                  >
                    Enable sound
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {phase === 'onboarding' && (
          <motion.section
            key="onboarding"
            aria-labelledby="onboarding-heading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
            exit={{ opacity: 0, y: 6 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 24,
              padding: 'clamp(16px, 4vw, 48px)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1fr',
                gap: 'clamp(16px, 4vw, 48px)',
                alignItems: 'center',
              }}
            >
              {/* Left: big welcome */}
              <div>
                <h2
                  id="onboarding-heading"
                  ref={onboardingHeadingRef}
                  tabIndex={-1}
                  style={{
                    margin: 0,
                    fontSize: 'clamp(28px, 7vw, 80px)',
                    lineHeight: 1.02,
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    textWrap: 'balance' as any,
                  }}
                >
                  Welcome,{'\n'} {userName}!
                </h2>
              </div>

              {/* Right: chips */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
                  },
                }}
                style={{
                  justifySelf: 'end',
                  width: 'min(640px, 100%)',
                }}
              >
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                  style={{ fontSize: 'clamp(16px, 2.6vw, 24px)', fontWeight: 700, marginBottom: 16 }}
                >
                  Where will you use your creations?
                </motion.div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  {chips.map((c) => (
                    <motion.button
                      key={c.id}
                      type="button"
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.04 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                      variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                      style={chipStyle}
                      aria-pressed="false"
                    >
                      {c.label}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.985 }}
                  variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                  style={{ ...chipStyle, width: '100%', marginTop: 16, justifyContent: 'center' }}
                  onClick={() => console.log('Skip')}
                  aria-label="Skip"
                >
                  Skip
                </motion.button>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

const pillButton: React.CSSProperties = {
  appearance: 'none',
  cursor: 'pointer',
  padding: '10px 14px',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.25)',
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  fontSize: 14,
  fontWeight: 600,
};

const gateButton: React.CSSProperties = {
  appearance: 'none',
  cursor: 'pointer',
  padding: '14px 18px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.25)',
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))',
  color: 'white',
  fontSize: 16,
  fontWeight: 800,
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
};

const chipStyle: React.CSSProperties = {
  appearance: 'none',
  cursor: 'pointer',
  padding: '14px 20px',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.25)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  fontSize: 16,
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};
