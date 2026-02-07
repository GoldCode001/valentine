import { useState, useRef } from 'react';
import { track } from '@vercel/analytics';
import { Heart, Sparkles, Music, Palette, Copy, ExternalLink, Check } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { FloatingHearts } from '../components/FloatingHearts';
import type { ValentineData } from '../App';

const THEMES = [
  { id: 'sunset', name: 'Classic Red', gradient: 'from-red-600 via-red-500 to-rose-500', color: '#DC2626' },
  { id: 'rose-gold', name: 'Rose', gradient: 'from-rose-400 via-pink-400 to-rose-300', color: '#FB7185' },
  { id: 'midnight', name: 'Red & Green', gradient: 'from-red-700 via-red-600 to-green-600', color: '#B91C1C' },
  { id: 'cherry', name: 'Cherry', gradient: 'from-rose-600 via-red-600 to-red-700', color: '#E11D48' },
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
    newCompliments[index] = value.slice(0, 150);
    setFormData({ ...formData, compliments: newCompliments });
  };

  const generateLink = () => {
    if (!formData.recipientName.trim() || formData.compliments.some(c => !c.trim())) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.search = '';

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
    track('link_created', { theme: formData.theme });
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
    <div className="min-h-screen bg-romantic-bg relative overflow-hidden">
      {/* Floating hearts background */}
      <FloatingHearts count={12} color="rgba(220, 38, 38, 0.12)" minSize={12} maxSize={28} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-romantic-red fill-romantic-red/20" />
            <span className="label-text text-romantic-red/70">Valentine Message Creator</span>
            <Heart className="w-5 h-5 text-romantic-red fill-romantic-red/20" />
          </div>
          <h1 className="heading-xl font-poppins font-bold text-gray-900 mb-4">
            Create a tiny page.<br />
            <span className="text-gradient">Ask something big.</span>
          </h1>
          <p className="body-text text-gray-500 max-w-md mx-auto">
            Write a few lines, pick a vibe, and share a link they'll actually remember.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-2xl glass rounded-3xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {/* Recipient Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-romantic-red" />
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
                  <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                    {compliment.length}/150
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Final Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-romantic-red" />
              Choose a theme
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setFormData({ ...formData, theme: theme.id as typeof formData.theme })}
                  className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${
                    formData.theme === theme.id
                      ? 'border-romantic-red bg-romantic-red-light'
                      : 'border-gray-200 bg-white hover:border-red-200'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${theme.gradient} mb-2`} />
                  <span className="text-xs text-gray-600">{theme.name}</span>
                  {formData.theme === theme.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-romantic-red rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Music Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Music className="w-4 h-4 text-romantic-red" />
              Background music
            </label>
            <div className="flex flex-wrap gap-3">
              {MUSIC_TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setFormData({ ...formData, musicTrack: track.id })}
                  className={`px-4 py-2 rounded-xl border-2 transition-all duration-300 flex items-center gap-2 ${
                    formData.musicTrack === track.id
                      ? 'border-romantic-red bg-romantic-red-light'
                      : 'border-gray-200 bg-white hover:border-red-200'
                  }`}
                >
                  <span>{track.emoji}</span>
                  <span className="text-sm text-gray-600">{track.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateLink}
              className="flex-1 btn-romantic bg-romantic-red text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Create my link
            </button>
            <button
              onClick={openPreview}
              className="sm:w-auto btn-romantic bg-white text-romantic-red font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 border-2 border-romantic-red/20"
            >
              <ExternalLink className="w-5 h-5" />
              Preview
            </button>
          </div>

          {/* Generated Link */}
          {generatedLink && (
            <div className="mt-6 p-4 bg-romantic-red-light rounded-2xl border border-romantic-red/20 animate-fade-in-up">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="btn-romantic bg-romantic-red text-white px-4 rounded-xl flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-gray-400 text-sm">
          Made with <Heart className="w-4 h-4 inline text-romantic-red fill-romantic-red" /> for Valentine's Day
        </p>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="glass-strong rounded-3xl p-8 max-w-md w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Heart className="w-16 h-16 text-romantic-red mx-auto mb-4 animate-heart-beat" />
            <h3 className="text-2xl font-poppins font-bold text-gray-900 mb-2">
              Preview Mode
            </h3>
            <p className="text-gray-500 mb-6">
              This is how your Valentine will see the message. Close this to continue editing.
            </p>
            <button
              onClick={() => {
                setIsPreviewOpen(false);
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
              className="btn-romantic bg-romantic-red text-white font-semibold py-3 px-8 rounded-2xl"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
