import { useEffect, useRef, useState } from 'react';
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
  const { play, isMuted } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const [response, setResponse] = useState<'yes' | 'talk' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [complimentIndex, setComplimentIndex] = useState(-1);

  // Theme colors
  const themeColors = {
    sunset: 'from-orange-400 via-pink-500 to-rose-500',
    'rose-gold': 'from-rose-300 via-pink-300 to-purple-300',
    midnight: 'from-indigo-500 via-purple-500 to-pink-500',
    cherry: 'from-red-500 via-rose-500 to-orange-400',
  };

  // Start music on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (isMuted) {
        play();
      }
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [play, isMuted]);

  // Handle hold to reveal compliments
  useEffect(() => {
    if (!isHolding) {
      setComplimentIndex(-1);
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
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [isHolding, data.compliments]);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation
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

      // Scroll indicator
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
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const handleTalk = () => {
    setResponse('talk');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Confetti */}
      <Confetti isActive={showConfetti} />

      {/* Phase 1: Entrance */}
      <section className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20">
        <FloatingHearts count={8} color="rgba(255, 77, 109, 0.2)" minSize={16} maxSize={32} />
        
        {/* Radial vignette */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(11,11,13,0.5) 100%)',
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Label */}
          <div className="entrance-label opacity-0 mb-6">
            <span className="label-text text-romantic-pink/80 tracking-[0.25em]">
              A MESSAGE FOR YOU
            </span>
          </div>

          {/* Name */}
          <h1 
            className="entrance-name opacity-0 heading-xl font-poppins font-bold mb-6"
            style={{ 
              background: `linear-gradient(135deg, #F6F2FF 0%, #FF4D6D 50%, #C9B1FF 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {data.recipientName}
          </h1>

          {/* Subtitle */}
          <p className="entrance-subtitle opacity-0 text-xl md:text-2xl text-white/70 font-light">
            Before I ask you something important...
          </p>

          {/* Decorative hearts */}
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-20 animate-float-slow hidden lg:block">
            <Heart className="w-24 h-24 text-romantic-pink" strokeWidth={1} />
          </div>
          <div className="absolute -right-16 top-1/3 opacity-15 animate-float hidden lg:block">
            <Heart className="w-16 h-16 text-romantic-coral" strokeWidth={1} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/40 text-sm">Scroll down</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-romantic-pink rounded-full" />
          </div>
        </div>
      </section>

      {/* Phase 2: Compliment Reveal */}
      <section className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20">
        <FloatingHearts count={6} color="rgba(255, 142, 83, 0.15)" minSize={12} maxSize={24} />
        
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Hold instruction */}
          <div className="mb-12">
            <p className="text-white/60 text-lg mb-8">
              {isHolding ? 'Keep holding...' : 'Hold to see why I\'m nervous...'}
            </p>

            {/* Hold button */}
            <button
              onMouseDown={() => setIsHolding(true)}
              onMouseUp={() => setIsHolding(false)}
              onMouseLeave={() => setIsHolding(false)}
              onTouchStart={() => setIsHolding(true)}
              onTouchEnd={() => setIsHolding(false)}
              className="hold-button w-28 h-28 mx-auto relative"
            >
              {/* Glow effect */}
              <div 
                className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                  isHolding ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background: 'radial-gradient(circle, rgba(255, 77, 109, 0.3) 0%, transparent 70%)',
                  transform: 'scale(1.5)',
                }}
              />
              
              {/* Inner circle */}
              <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                isHolding ? 'border-romantic-pink bg-romantic-pink/20' : 'border-white/30'
              }`}>
                <Hand className={`w-8 h-8 transition-colors duration-300 ${
                  isHolding ? 'text-romantic-pink' : 'text-white/60'
                }`} />
              </div>

              {/* Progress ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="52"
                  fill="none"
                  stroke="rgba(255, 77, 109, 0.3)"
                  strokeWidth="2"
                  strokeDasharray={`${isHolding ? 327 : 0} 327`}
                  className="transition-all duration-[2000ms] ease-linear"
                  style={{
                    strokeDashoffset: isHolding ? 0 : 327,
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
                <p className="text-xl md:text-2xl text-white font-light leading-relaxed">
                  "{compliment}"
                </p>
              </div>
            ))}
          </div>

          {/* Release hint */}
          <p className={`mt-12 text-white/40 text-sm transition-opacity duration-500 ${
            complimentIndex >= data.compliments.length - 1 ? 'opacity-100' : 'opacity-0'
          }`}>
            Release to see how I feel
          </p>
        </div>
      </section>

      {/* Phase 3: Heart Formation */}
      <section className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20 overflow-hidden">
        <ParticleField 
          isFormingHeart={true} 
          heartProgress={1}
          particleCount={100}
        />
        
        {/* Background gradient */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${themeColors[data.theme]} opacity-20`}
        />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <Heart 
            className="w-32 h-32 mx-auto mb-8 text-romantic-pink animate-heart-beat"
            style={{ 
              filter: 'drop-shadow(0 0 40px rgba(255, 77, 109, 0.5))',
            }}
          />
          <p className="text-2xl md:text-3xl text-white font-light leading-relaxed">
            So yeah... I don't want to stop<br />
            collecting these moments
          </p>
        </div>
      </section>

      {/* Phase 4: The Question */}
      {!response && (
        <section className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20">
          <FloatingHearts count={10} color="rgba(255, 77, 109, 0.25)" minSize={14} maxSize={28} />
          
          {/* Background overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(11,11,13,0.3) 0%, rgba(11,11,13,0.6) 100%)',
            }}
          />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <Heart 
              className="w-16 h-16 mx-auto mb-8 text-romantic-pink"
              fill="rgba(255, 77, 109, 0.3)"
            />
            
            <h2 className="heading-lg font-poppins font-bold text-white mb-4">
              Will you be my Valentine,
            </h2>
            <h2 
              className="heading-lg font-poppins font-bold mb-12"
              style={{ 
                background: `linear-gradient(135deg, #FF4D6D 0%, #FF8E53 50%, #C9B1FF 100%)`,
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
                className="btn-romantic bg-romantic-pink text-white font-semibold py-5 px-10 rounded-2xl text-lg flex items-center justify-center gap-3"
              >
                <Heart className="w-6 h-6" fill="white" />
                Absolutely!
              </button>
              <button
                onClick={handleTalk}
                className="btn-romantic bg-white/10 text-white font-semibold py-5 px-10 rounded-2xl text-lg border border-white/20 flex items-center justify-center gap-3"
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
          className={`min-h-screen flex flex-col items-center justify-center relative px-6 py-20 transition-colors duration-1000 ${
            response === 'yes' ? 'bg-romantic-red' : 'bg-romantic-dark'
          }`}
        >
          <FloatingHearts 
            count={response === 'yes' ? 20 : 8} 
            color={response === 'yes' ? 'rgba(255, 200, 200, 0.3)' : 'rgba(255, 255, 255, 0.15)'} 
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
                <p className="text-xl text-white/80 mb-8">
                  {data.finalMessage || "I'm smiling like an idiot right now. Let's plan something soon!"}
                </p>
                <div className="glass-strong inline-block px-6 py-4 rounded-2xl">
                  <p className="text-white/60 text-sm">
                    Screenshot this and send it back to me 💕
                  </p>
                </div>
              </>
            ) : (
              <>
                <Heart 
                  className="w-20 h-20 mx-auto mb-8 text-white/60"
                  strokeWidth={1}
                />
                <h2 className="heading-lg font-poppins font-bold text-white mb-4">
                  I appreciate your honesty.
                </h2>
                <p className="text-xl text-white/70 mb-8">
                  No pressure—talk to me whenever you're ready.
                </p>
                <div className="glass inline-block px-6 py-4 rounded-2xl">
                  <p className="text-white/50 text-sm">
                    Take your time. I'll be here.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white/40 text-sm">
              Made with{' '}
              <Heart className="w-4 h-4 inline text-romantic-pink fill-romantic-pink" />{' '}
              by someone who cares
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
