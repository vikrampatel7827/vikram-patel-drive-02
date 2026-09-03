import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ImagePreviewModalProps {
  file: { name: string; id: string; thumbnailLink?: string; webViewLink?: string } | null;
  accessToken: string | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ file, accessToken, onClose }: ImagePreviewModalProps) {
  if (!file) return null;

  // Transform Google Drive thumbnail link to get a high-resolution version (=s2048 instead of default low-res)
  const highResThumbnail = file.thumbnailLink 
    ? file.thumbnailLink.replace(/=s\d+/, '=s2048') 
    : null;

  // Direct media fallback link using access token
  const directStreamUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&access_token=${accessToken}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3 truncate">
              <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base truncate">{file.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Instant Cloud Lightbox Preview
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

          {/* Image Lightbox Container */}
          <div className="relative bg-black/80 flex-1 flex items-center justify-center p-6 min-h-[400px] overflow-auto">
            <img
              src={highResThumbnail || directStreamUrl}
              alt={file.name}
              className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800/80"
              onError={(e) => {
                // If high-res thumbnail fails, fallback directly to the authorized token media stream
                const target = e.target as HTMLImageElement;
                if (target.src !== directStreamUrl) {
                  target.src = directStreamUrl;
                }
              }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}