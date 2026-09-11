import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { fetchDriveFiles, uploadToGoogleDrive } from '../lib/gdrive';
import { formatBytes } from '../lib/utils';
import { Film, FileText, Image as ImageIcon, Music, Archive, MoreVertical, UploadCloud, Cloud, Play, Download, Trash, Eye, Plus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import VideoPlayerModal from '../components/VideoPlayerModal';
import ImagePreviewModal from '../components/ImagePreviewModal';
import MusicPlayerBar from '../components/MusicPlayerBar';
import axios from 'axios';

const getFileIcon = (mimeType: string) => {
  if (!mimeType) return <FileText className="w-10 h-10 text-slate-400" />;
  if (mimeType.includes('video')) return <Film className="w-10 h-10 text-purple-400" />;
  if (mimeType.includes('image')) return <ImageIcon className="w-10 h-10 text-brand-400" />;
  if (mimeType.includes('audio')) return <Music className="w-10 h-10 text-yellow-400" />;
  if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="w-10 h-10 text-red-400" />;
  return <FileText className="w-10 h-10 text-slate-400" />;
};

export default function Drive() {
  const { accessToken } = useAuthStore();
  const [files, setFiles] = useState<any[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  // Modal States for in-app media rendering
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<any | null>(null);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    console.log("🟡 1. loadFiles triggered. Token is:", accessToken ? "Present" : "Missing");
    
    if (!accessToken) {
      console.log("🔴 2. No token found! Stopping spinner immediately.");
      setLoading(false);
      return;
    }
    
    try {
      console.log("🔵 3. Token found. Attempting to fetch files from Google...");
      const data = await fetchDriveFiles(accessToken);
      console.log("🟢 4. Files fetched successfully!", data);
      setFiles(data || []);
    } catch (error) {
      console.error("❌ 5. Fetch failed:", error);
      toast.error('Failed to sync cloud files');
    } finally {
      console.log("🏁 6. Finally block reached. Stopping spinner.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [accessToken]);

  const handleUploadProcess = async (acceptedFiles: File[]) => {
    if (!accessToken) return;

    for (const file of acceptedFiles) {
      const uploadId = `${file.name}-${Date.now()}`;
      setUploadingFiles((prev) => ({ ...prev, [uploadId]: 0 }));

      try {
        await uploadToGoogleDrive(file, accessToken, (percent) => {
          setUploadingFiles((prev) => ({ ...prev, [uploadId]: percent }));
        });
        toast.success(`Successfully secured ${file.name}`);
        loadFiles();
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploadingFiles((prev) => {
          const newObj = { ...prev };
          delete newObj[uploadId];
          return newObj;
        });
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleUploadProcess(acceptedFiles);
  }, [accessToken]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  const handleFileClick = (file: any) => {
    const mime = file.mimeType || '';
    if (mime.includes('video')) {
      setSelectedVideo(file);
    } else if (mime.includes('image')) {
      setSelectedImage(file); 
    } else if (mime.includes('audio')) {
      setSelectedAudio(file); 
    } else {
      window.open(file.webViewLink, '_blank');
    }
  };

  const handleDeleteFile = async (e: React.MouseEvent, fileId: string, fileName: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (!accessToken) return;

    try {
      await axios.patch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        { trashed: true },
        { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
      );
      toast.success(`Moved ${fileName} to trash`);
      loadFiles();
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  const handleDownloadFile = (e: React.MouseEvent, file: any) => {
    e.stopPropagation();
    setActiveMenuId(null);
    const downloadUrl = file.webContentLink || `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&access_token=${accessToken}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div {...getRootProps()} className="h-full flex flex-col relative outline-none p-8 text-slate-100 bg-slate-950 overflow-y-auto">
      <input {...getInputProps()} />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && handleUploadProcess(Array.from(e.target.files))} 
        className="hidden" 
        multiple 
      />

      <VideoPlayerModal 
        file={selectedVideo} 
        accessToken={accessToken} 
        onClose={() => setSelectedVideo(null)} 
      />
      <ImagePreviewModal 
        file={selectedImage} 
        accessToken={accessToken} 
        onClose={() => setSelectedImage(null)} 
      />
      <MusicPlayerBar 
        file={selectedAudio} 
        accessToken={accessToken} 
        onClose={() => setSelectedAudio(null)} 
      />

      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-brand-600/20 backdrop-blur-md border-2 border-brand-500 rounded-3xl flex flex-col items-center justify-center m-4 shadow-2xl"
          >
            <UploadCloud className="w-24 h-24 text-brand-400 mb-4 animate-bounce" />
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Drop your cinematic universe here</h2>
            <p className="text-slate-300 mt-2 font-medium">Encrypting and uploading straight to Google Drive CDN.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            My Drive <Sparkles className="w-6 h-6 text-brand-400" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">High-performance secure personal cloud storage</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-2xl shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-300">{files.length} Secure Assets Stored</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-28 h-28 bg-gradient-to-tr from-brand-600/20 to-purple-600/20 border border-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <Cloud className="w-14 h-14 text-brand-400 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-white">Your Cloud is Pristine</h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">Drag and drop your movies, raw photography, or music tracks anywhere on this dashboard to initialize secure high-speed storage.</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-brand-500/25 transition-all transform hover:scale-105 active:scale-95"
          >
            Upload Files Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 auto-rows-max pb-24">
          {files.map((file) => {
            const isVideo = file.mimeType && file.mimeType.includes('video');
            const isAudio = file.mimeType && file.mimeType.includes('audio');
            const isMenuOpen = activeMenuId === file.id;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={file.id}
                onClick={() => handleFileClick(file)}
                className="group bg-slate-900/90 border border-slate-800/80 rounded-3xl p-4 hover:border-brand-500/50 hover:bg-slate-900 hover:shadow-2xl hover:shadow-brand-500/10 transition-all cursor-pointer relative overflow-visible flex flex-col justify-between"
              >
                {isVideo && (
                  <div className="absolute top-4 left-4 z-20 bg-brand-500 text-white p-2 rounded-xl shadow-lg shadow-brand-500/30">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                )}
                {isAudio && (
                  <div className="absolute top-4 left-4 z-20 bg-yellow-500 text-white p-2 rounded-xl shadow-lg shadow-yellow-500/30">
                    <Music className="w-4 h-4" />
                  </div>
                )}
                
                <div className="absolute top-4 right-4 z-30">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(isMenuOpen ? null : file.id);
                    }}
                    className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl backdrop-blur-md transition-colors shadow-md"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -5 }}
                        className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-40 py-1.5"
                      >
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleFileClick(file); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-brand-500 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Preview / Play
                        </button>
                        <button 
                          onClick={(e) => handleDownloadFile(e, file)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-brand-500 hover:text-white transition-colors"
                        >
                          <Download className="w-4 h-4" /> Download File
                        </button>
                        <div className="h-px bg-slate-800 my-1"></div>
                        <button 
                          onClick={(e) => handleDeleteFile(e, file.id, file.name)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash className="w-4 h-4" /> Move to Trash
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-36 flex items-center justify-center mb-4 bg-slate-950/60 rounded-2xl overflow-hidden relative border border-slate-800/40">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getFileIcon(file.mimeType)}
                  </div>
                  {file.thumbnailLink && (
                    <img 
                      src={file.thumbnailLink} 
                      alt={file.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 relative z-10" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-sm truncate text-slate-100 group-hover:text-brand-400 transition-colors" title={file.name}>{file.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{formatBytes(file.size)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {Object.keys(uploadingFiles).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-8 right-8 bg-slate-900/95 backdrop-blur-xl text-white p-6 rounded-3xl shadow-2xl w-96 border border-slate-700/80 z-50"
          >
            <h4 className="font-bold mb-4 flex items-center gap-3 text-sm">
              <UploadCloud className="w-5 h-5 text-brand-400 animate-pulse" />
              Uploading {Object.keys(uploadingFiles).length} Assets
            </h4>
            <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
              {Object.entries(uploadingFiles).map(([id, progress]) => (
                <div key={id} className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300 font-medium">
                    <span className="truncate max-w-[220px]">{id.split('-')[0]}</span>
                    <span className="text-brand-400 font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 w-0.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50 w-full">
                    <motion.div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}