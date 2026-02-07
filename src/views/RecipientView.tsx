import { useEffect, useRef, useState, useCallback } from 'react';
import { track } from '@vercel/analytics';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAudio } from '../contexts/AudioContext';
import { FloatingHearts } from '../components/FloatingHearts';
import { ParticleField } from '../components/ParticleField';
import { Confetti } from '../components/Confetti';
import { Heart, Hand } from 'lucide-react';
import type { ValentineData } from '../App';

gsap.registerPlugin(ScrollTrigger);

interface RecipientViewProps {
  data: ValentineData;
}

export function RecipientView({ data }: RecipientViewProps) {
  const { play } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const phase3Ref = useRef<HTMLElement>(null);
  const phase5Ref = useRef<HTMLElement>(null);
  const [response, setResponse] = useState<'yes' | 'talk' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [complimentIndex, setComplimentIndex] = useState(-1);
  const [complimentsComplete, setComplimentsComplete] = useState(false);

  const COMPLIMENT_INTERVAL = 1800;
  const TOTAL_HOLD_TIME = data.compliments.length * COMPLIMENT_INTERVAL;

  // Theme colors
  const themeColors = {
    sunset: 'from-red-600 via-red-500 to-rose-500',
    'rose-gold': 'from-rose-400 via-pink-400 to-rose-300',
    midnight: 'from-red-700 via-red-600 to-green-600',
    cherry: 'from-rose-600 via-red-600 to-red-700',
  };

  // Track link opened
  useEffect(() => {
    track('link_opened', { theme: data.theme });
  }, [data.theme]);

  // Start music on first interaction (browsers require user gesture for audio)
  useEffect(() => {
    const handleInteraction = () => {
      play();
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [play]);

  // Handle hold to reveal compliments
  useEffect(() => {
    if (!isHolding) {
      // Don't reset if compliments are fully revealed
      if (!complimentsComplete) {
        setComplimentIndex(-1);
      }
      return;
    }

    let index = 0;
    setComplimentIndex(0);

    const interval = setInterval(() => {
      index++;
      if (index < data.compliments.length) {
        setComplimentIndex(index);
      } else {
        clearInterval(interval);
        setComplimentsComplete(true);
      }
    }, COMPLIMENT_INTERVAL);

    return () => clearInterval(interval);
  }, [isHolding, data.compliments, complimentsComplete, COMPLIMENT_INTERVAL]);

  // Auto-scroll to Phase 3 when user releases after all compliments shown
  const handleRelease = useCallback(() => {
    setIsHolding(false);
    if (complimentsComplete && phase3Ref.current) {
      // Small delay so "release" feels intentional
      setTimeout(() => {
        phase3Ref.current?.scrollIntoView({ behavior: 'smooth' });
      }, 600);
    }
  }, [complimentsComplete]);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.entrance-label',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power2.out' }
      );

      gsap.fromTo('.entrance-name',
        { opacity: 0, y: 30, rotateX: 35 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1, delay: 0.5, ease: 'power3.out' }
      );

      gsap.fromTo('.entrance-subtitle',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.9, ease: 'power2.out' }
      );

      gsap.to('.scroll-indicator', {
        y: 10,
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: 'power1.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleYes = () => {
    setResponse('yes');
    setShowConfetti(true);
    track('valentine_response', { answer: 'yes' });
    setTimeout(() => setShowConfetti(false), 4000);
    setTimeout(() => {
      phase5Ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const handleTalk = () => {
    setResponse('talk');
    track('valentine_response', { answer: 'talk' });
    setTimeout(() => {
      phase5Ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Confetti */}
      <Confetti isActive={showConfetti} />

      {/* Phase 1: Entrance */}
      <section className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20 bg-romantic-bg">
        <FloatingHearts count={8} color="rgba(220, 38, 38, 0.1)" minSize={16} maxSize={32} />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Label */}
          <div className="entrance-label opacity-0 mb-6">
            <span className="label-text text-romantic-red/70 tracking-[0.25em]">
              A MESSAGE FOR YOU
            </span>
          </div>

          {/* Name */}
          <h1
            className="entrance-name opacity-0 heading-xl font-poppins font-bold mb-6"
            style={{
              background: `linear-gradient(135deg, #DC2626 0%, #E11D48 50%, #16A34A 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {data.recipientName}
          </h1>

          {/* Subtitle */}
          <p className="entrance-subtitle opacity-0 text-xl md:text-2xl text-gray-500 font-light">
            Before I ask you something important...
          </p>

          {/* Decorative hearts */}
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-15 animate-float-slow hidden lg:block">
            <Heart className="w-24 h-24 text-romantic-red" strokeWidth={1} />
          </div>
          <div className="absolute -right-16 top-1/3 opacity-10 animate-float hidden lg:block">
            <Heart className="w-16 h-16 text-romantic-green" strokeWidth={1} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-gray-400 text-sm">Scroll down</span>
          <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-romantic-red rounded-full" />
          </div>
        </div>
      </section>

      {/* Phase 2: Compliment Reveal */}
      <section className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20 bg-white">
        <FloatingHearts count={6} color="rgba(220, 38, 38, 0.08)" minSize={12} maxSize={24} />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Hold instruction */}
          <div className="mb-12">
            <p className="text-gray-500 text-lg mb-8">
              {complimentsComplete
                ? 'Now let go...'
                : isHolding
                  ? 'Keep holding...'
                  : 'Hold to see why I\'m nervous...'}
            </p>

            {/* Hold button */}
            <button
              onMouseDown={() => { if (!complimentsComplete) setIsHolding(true); }}
              onMouseUp={handleRelease}
              onMouseLeave={handleRelease}
              onTouchStart={() => { if (!complimentsComplete) setIsHolding(true); }}
              onTouchEnd={handleRelease}
              className={`hold-button w-28 h-28 mx-auto relative ${complimentsComplete ? 'cursor-default' : ''}`}
            >
              {/* Glow effect */}
              <div
                className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                  isHolding || complimentsComplete ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 70%)',
                  transform: 'scale(1.5)',
                }}
              />

              {/* Inner circle */}
              <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                isHolding || complimentsComplete ? 'border-romantic-red bg-romantic-red/10' : 'border-gray-300'
              }`}>
                <Hand className={`w-8 h-8 transition-colors duration-300 ${
                  isHolding || complimentsComplete ? 'text-romantic-red' : 'text-gray-400'
                }`} />
              </div>

              {/* Progress ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="52"
                  fill="none"
                  stroke="rgba(220, 38, 38, 0.25)"
                  strokeWidth="2"
                  strokeDasharray="327 327"
                  className="transition-all ease-linear"
                  style={{
                    strokeDashoffset: isHolding || complimentsComplete ? 0 : 327,
                    transitionDuration: isHolding ? `${TOTAL_HOLD_TIME}ms` : '0ms',
                  }}
                />
              </svg>
            </button>
          </div>

          {/* Compliments */}
          <div className="space-y-6 min-h-[200px]">
            {data.compliments.map((compliment, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  complimentIndex >= index
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <p className="text-xl md:text-2xl text-gray-800 font-light leading-relaxed">
                  "{compliment}"
                </p>
              </div>
            ))}
          </div>

          {/* Release hint */}
          <p className={`mt-12 text-gray-400 text-sm transition-opacity duration-500 ${
            complimentsComplete && isHolding ? 'opacity-100' : 'opacity-0'
          }`}>
            Release to see how I feel
          </p>
        </div>
      </section>

      {/* Phase 3: Heart Formation */}
      <section ref={phase3Ref} className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20 overflow-hidden bg-romantic-cream">
        <ParticleField
          isFormingHeart={true}
          heartProgress={1}
          particleCount={100}
        />

        {/* Background gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${themeColors[data.theme]} opacity-10`}
        />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <Heart
            className="w-32 h-32 mx-auto mb-8 text-romantic-red animate-heart-beat"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(220, 38, 38, 0.3))',
            }}
          />
          <p className="text-2xl md:text-3xl text-gray-800 font-light leading-relaxed">
            So yeah... I don't want to stop<br />
            collecting these moments
          </p>
        </div>
      </section>

      {/* Phase 4: The Question */}
      {!response && (
        <section className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20 bg-romantic-bg">
          <FloatingHearts count={10} color="rgba(220, 38, 38, 0.12)" minSize={14} maxSize={28} />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <Heart
              className="w-16 h-16 mx-auto mb-8 text-romantic-red"
              fill="rgba(220, 38, 38, 0.15)"
            />

            <h2 className="heading-lg font-poppins font-bold text-gray-900 mb-4">
              Will you be my Valentine,
            </h2>
            <h2
              className="heading-lg font-poppins font-bold mb-12"
              style={{
                background: `linear-gradient(135deg, #DC2626 0%, #E11D48 50%, #16A34A 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {data.recipientName}?
            </h2>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleYes}
                className="btn-romantic bg-romantic-red text-white font-semibold py-5 px-10 rounded-2xl text-lg flex items-center justify-center gap-3"
              >
                <Heart className="w-6 h-6" fill="white" />
                Absolutely!
              </button>
              <button
                onClick={handleTalk}
                className="btn-romantic bg-white text-gray-700 font-semibold py-5 px-10 rounded-2xl text-lg border-2 border-gray-200 flex items-center justify-center gap-3"
              >
                Let's talk about it
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Phase 5: Response */}
      {response && (
        <section
          ref={phase5Ref}
          className={`min-h-screen flex flex-col items-center justify-center relative px-6 py-20 transition-colors duration-1000 ${
            response === 'yes' ? 'bg-romantic-yes' : 'bg-romantic-bg'
          }`}
        >
          <FloatingHearts
            count={response === 'yes' ? 20 : 8}
            color={response === 'yes' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(220, 38, 38, 0.1)'}
            minSize={12}
            maxSize={32}
          />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            {response === 'yes' ? (
              <>
                <Heart
                  className="w-24 h-24 mx-auto mb-8 text-white animate-heart-beat"
                  fill="rgba(255, 255, 255, 0.3)"
                />
                <h2 className="heading-lg font-poppins font-bold text-white mb-4">
                  Best decision you've<br />made all year.
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  {data.finalMessage || "I'm smiling like an idiot right now. Let's plan something soon!"}
                </p>
                <div className="inline-block px-6 py-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                  <p className="text-white/80 text-sm">
                    Screenshot this and send it back to me 💕
                  </p>
                </div>
              </>
            ) : (
              <>
                <Heart
                  className="w-20 h-20 mx-auto mb-8 text-gray-400"
                  strokeWidth={1}
                />
                <h2 className="heading-lg font-poppins font-bold text-gray-800 mb-4">
                  I appreciate your honesty.
                </h2>
                <p className="text-xl text-gray-500 mb-8">
                  No pressure—talk to me whenever you're ready.
                </p>
                <div className="glass inline-block px-6 py-4 rounded-2xl">
                  <p className="text-gray-400 text-sm">
                    Take your time. you know where to find me
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    i still love you tho... ;)
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className={`text-sm ${response === 'yes' ? 'text-white/50' : 'text-gray-400'}`}>
              Made with{' '}
              <Heart className={`w-4 h-4 inline ${response === 'yes' ? 'text-white fill-white' : 'text-romantic-red fill-romantic-red'}`} />{' '}
              by someone who cares
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
