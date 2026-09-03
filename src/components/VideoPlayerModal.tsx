import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface VideoPlayerModalProps {
  file: { name: string; id: string; webViewLink?: string } | null;
  accessToken: string | null;
  onClose: () => void;
}

export default function VideoPlayerModal({ file, accessToken, onClose }: VideoPlayerModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (!file) return null;

  // Direct zero-delay Google Drive streaming preview URL
  const embedUrl = `https://drive.google.com/file/d/${file.id}/preview`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3 truncate">
              <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base truncate">{file.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Zero-Buffer CDN Stream with Quality & Speed Controls
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Player Container */}
          <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10 gap-3">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                <p className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" /> Initializing instant cinematic stream...
                </p>
              </div>
            )}
            
            <iframe
              src={embedUrl}
              title={file.name}
              className="w-full h-full border-0 relative z-20"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}