import { useState, useRef } from 'react';
import { Heart, Sparkles, Music, Palette, Copy, ExternalLink, Check } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { FloatingHearts } from '../components/FloatingHearts';
import type { ValentineData } from '../App';

const THEMES = [
  { id: 'sunset', name: 'Sunset', gradient: 'from-orange-400 via-pink-500 to-rose-500', color: '#FF4D6D' },
  { id: 'rose-gold', name: 'Rose Gold', gradient: 'from-rose-300 via-pink-300 to-purple-300', color: '#E8B4B8' },
  { id: 'midnight', name: 'Midnight', gradient: 'from-indigo-500 via-purple-500 to-pink-500', color: '#667eea' },
  { id: 'cherry', name: 'Cherry', gradient: 'from-red-500 via-rose-500 to-orange-400', color: '#ff0844' },
] as const;

const MUSIC_TRACKS = [
  { id: 0, name: 'Romantic Piano', emoji: '🎹' },
  { id: 1, name: 'Soft Melody', emoji: '🎵' },
  { id: 2, name: 'Lo-Fi Love', emoji: '💫' },
];

const COMPLIMENT_PLACEHOLDERS = [
  "You make ordinary moments feel like scenes from a favorite movie...",
  "I laugh at your jokes even when they're terrible—especially then...",
  "You remember the small things, and that makes me feel seen...",
];

export function CreatorView() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<ValentineData>({
    recipientName: '',
    compliments: ['', '', ''],
    finalMessage: '',
    theme: 'sunset',
    musicTrack: 0,
  });
  const [generatedLink, setGeneratedLink] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const handleComplimentChange = (index: number, value: string) => {
    const newCompliments = [...formData.compliments];
    newCompliments[index] = value.slice(0, 150); // Character limit
    setFormData({ ...formData, compliments: newCompliments });
  };

  const generateLink = () => {
    if (!formData.recipientName.trim() || formData.compliments.some(c => !c.trim())) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    // Use URL constructor for reliable URL building
    const currentUrl = new URL(window.location.href);
    currentUrl.search = ''; // Clear existing query params
    
    const params = new URLSearchParams({
      to: formData.recipientName.trim(),
      c1: formData.compliments[0].trim(),
      c2: formData.compliments[1].trim(),
      c3: formData.compliments[2].trim(),
      m: formData.finalMessage.trim(),
      theme: formData.theme,
      music: formData.musicTrack.toString(),
    });

    currentUrl.search = params.toString();
    const link = currentUrl.toString();
    setGeneratedLink(link);
    showToast('Link generated successfully!');
  };

  const copyLink = () => {
    if (linkInputRef.current) {
      linkInputRef.current.select();
      navigator.clipboard.writeText(generatedLink);
      showToast('Link copied to clipboard!');
    }
  };

  const openPreview = () => {
    if (!formData.recipientName.trim() || formData.compliments.some(c => !c.trim())) {
      showToast('Please fill in all fields first', 'error');
      return;
    }
    setIsPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-romantic-dark relative overflow-hidden">
      {/* Floating hearts background */}
      <FloatingHearts count={12} color="rgba(255, 77, 109, 0.15)" minSize={12} maxSize={28} />
      
      {/* Radial gradient vignette */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(11,11,13,0.4) 100%)',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-romantic-pink fill-romantic-pink/30" />
            <span className="label-text text-romantic-pink/80">Valentine Message Creator</span>
            <Heart className="w-5 h-5 text-romantic-pink fill-romantic-pink/30" />
          </div>
          <h1 className="heading-xl font-poppins font-bold text-white mb-4">
            Create a tiny page.<br />
            <span className="text-gradient">Ask something big.</span>
          </h1>
          <p className="body-text text-white/60 max-w-md mx-auto">
            Write a few lines, pick a vibe, and share a link they'll actually remember.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-2xl glass rounded-3xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {/* Recipient Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Their name
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              placeholder="e.g., Alex"
              className="input-romantic w-full"
              maxLength={30}
            />
          </div>

          {/* Compliments */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-romantic-pink" />
              Three things that make them special
            </label>
            <div className="space-y-3">
              {formData.compliments.map((compliment, index) => (
                <div key={index} className="relative">
                  <textarea
                    value={compliment}
                    onChange={(e) => handleComplimentChange(index, e.target.value)}
                    placeholder={COMPLIMENT_PLACEHOLDERS[index]}
                    className="input-romantic w-full resize-none"
                    rows={2}
                    maxLength={150}
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-white/30">
                    {compliment.length}/150
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Final Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Final message (after they say yes)
            </label>
            <textarea
              value={formData.finalMessage}
              onChange={(e) => setFormData({ ...formData, finalMessage: e.target.value })}
              placeholder="e.g., Best decision you've made all year! Let's plan something special..."
              className="input-romantic w-full resize-none"
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Theme Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-romantic-pink" />
              Choose a theme
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setFormData({ ...formData, theme: theme.id as typeof formData.theme })}
                  className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${
                    formData.theme === theme.id
                      ? 'border-romantic-pink bg-romantic-pink/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${theme.gradient} mb-2`} />
                  <span className="text-xs text-white/80">{theme.name}</span>
                  {formData.theme === theme.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-romantic-pink rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Music Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Music className="w-4 h-4 text-romantic-pink" />
              Background music
            </label>
            <div className="flex flex-wrap gap-3">
              {MUSIC_TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setFormData({ ...formData, musicTrack: track.id })}
                  className={`px-4 py-2 rounded-xl border-2 transition-all duration-300 flex items-center gap-2 ${
                    formData.musicTrack === track.id
                      ? 'border-romantic-pink bg-romantic-pink/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <span>{track.emoji}</span>
                  <span className="text-sm text-white/80">{track.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateLink}
              className="flex-1 btn-romantic bg-romantic-pink text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Create my link
            </button>
            <button
              onClick={openPreview}
              className="sm:w-auto btn-romantic bg-white/10 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 border border-white/20"
            >
              <ExternalLink className="w-5 h-5" />
              Preview
            </button>
          </div>

          {/* Generated Link */}
          {generatedLink && (
            <div className="mt-6 p-4 bg-romantic-pink/10 rounded-2xl border border-romantic-pink/30 animate-fade-in-up">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Your shareable link
              </label>
              <div className="flex gap-2">
                <input
                  ref={linkInputRef}
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 input-romantic text-sm"
                />
                <button
                  onClick={copyLink}
                  className="btn-romantic bg-romantic-pink text-white px-4 rounded-xl flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-white/40 text-sm">
          Made with <Heart className="w-4 h-4 inline text-romantic-pink fill-romantic-pink" /> for Valentine's Day
        </p>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div 
            className="glass-strong rounded-3xl p-8 max-w-md w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Heart className="w-16 h-16 text-romantic-pink mx-auto mb-4 animate-heart-beat" />
            <h3 className="text-2xl font-poppins font-bold text-white mb-2">
              Preview Mode
            </h3>
            <p className="text-white/60 mb-6">
              This is how your Valentine will see the message. Close this to continue editing.
            </p>
            <button
              onClick={() => {
                setIsPreviewOpen(false);
                // Open preview in new tab with current form data
                const previewUrl = new URL(window.location.href);
                previewUrl.search = '';
                const params = new URLSearchParams({
                  to: formData.recipientName.trim() || 'Preview',
                  c1: formData.compliments[0].trim() || 'Your first compliment...',
                  c2: formData.compliments[1].trim() || 'Your second compliment...',
                  c3: formData.compliments[2].trim() || 'Your third compliment...',
                  m: formData.finalMessage.trim(),
                  theme: formData.theme,
                  music: formData.musicTrack.toString(),
                });
                previewUrl.search = params.toString();
                window.open(previewUrl.toString(), '_blank');
              }}
              className="btn-romantic bg-romantic-pink text-white font-semibold py-3 px-8 rounded-2xl"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
