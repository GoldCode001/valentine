import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { decompressFromEncodedURIComponent } from 'lz-string';
import { CreatorView } from './views/CreatorView';
import { RecipientView } from './views/RecipientView';
import { AudioProvider } from './contexts/AudioContext';
import { AudioToggle } from './components/AudioToggle';
import { ToastProvider } from './contexts/ToastContext';
import './App.css';

export interface ValentineData {
  recipientName: string;
  compliments: string[];
  finalMessage: string;
  theme: 'sunset' | 'rose-gold' | 'midnight' | 'cherry';
  musicTrack: number;
}

function App() {
  const [view, setView] = useState<'creator' | 'recipient'>('creator');
  const [valentineData, setValentineData] = useState<ValentineData | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const compressed = params.get('d');

    if (compressed) {
      // New compressed format
      try {
        const json = decompressFromEncodedURIComponent(compressed);
        if (json) {
          const data = JSON.parse(json);
          setValentineData({
            recipientName: data.t,
            compliments: data.c,
            finalMessage: data.m || '',
            theme: data.h || 'sunset',
            musicTrack: data.u ?? 0,
          });
          setView('recipient');
        }
      } catch {
        // Invalid data, show creator
      }
    } else {
      // Legacy uncompressed format (old links still work)
      const to = params.get('to');
      const c1 = params.get('c1');
      const c2 = params.get('c2');
      const c3 = params.get('c3');
      const m = params.get('m');
      const theme = params.get('theme') as ValentineData['theme'] | null;
      const music = params.get('music');

      if (to && c1 && c2 && c3) {
        setValentineData({
          recipientName: to,
          compliments: [c1, c2, c3],
          finalMessage: m || '',
          theme: theme || 'sunset',
          musicTrack: music ? parseInt(music) : 0,
        });
        setView('recipient');
      }
    }
  }, []);

  return (
    <ToastProvider>
      <AudioProvider>
        <div className="relative min-h-screen bg-romantic-bg">
          
          {/* Main content */}
          {view === 'creator' ? (
            <CreatorView />
          ) : (
            valentineData && <RecipientView data={valentineData} />
          )}
          
          {/* Audio toggle (only show in recipient view) */}
          {view === 'recipient' && <AudioToggle />}

          <Analytics />
        </div>
      </AudioProvider>
    </ToastProvider>
  );
}

export default App;
