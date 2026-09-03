import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Music, Volume2, Loader2 } from 'lucide-react';
import axios from 'axios';

interface MusicPlayerBarProps {
  file: { name: string; id: string } | null;
  accessToken: string | null;
  onClose: () => void;
}

export default function MusicPlayerBar({ file, accessToken, onClose }: MusicPlayerBarProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    async function fetchAudioStream() {
      if (!file || !accessToken) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            responseType: 'blob',
          }
        );
        objectUrl = URL.createObjectURL(response.data);
        setAudioUrl(objectUrl);
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to buffer audio track', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAudioStream();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setAudioUrl(null);
    };
  }, [file, accessToken]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!file) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
      >
        <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-12 h-12 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="truncate">
              <h4 className="font-bold text-sm truncate text-white">{file.name}</h4>
              <p className="text-xs text-yellow-400 font-medium">Vikram Cloud Audio Stream</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
            ) : (
              <>
                <button
                  onClick={togglePlay}
                  className="w-11 h-11 bg-white text-slate-950 rounded-full flex items-center justify-center hover:bg-slate-200 transition-transform transform active:scale-95 shadow-lg"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    autoPlay
                    onEnded={() => setIsPlaying(false)}
                  />
                )}
              </>
            )}

            <div className="h-6 w-px bg-slate-800 mx-1"></div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}