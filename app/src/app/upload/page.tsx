"use client";
import { useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import imageCompression from "browser-image-compression";
import { Upload as UploadIcon, Loader2, Image as ImageIcon, X as XIcon, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadPage() {
  const { user } = useStore();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-light tracking-widest uppercase">Please log in to upload.</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter(file => file.type.startsWith("image/"));
    if (selected.length > 0) {
      setFiles(prev => [...prev, ...selected]);
      const newPreviews = selected.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0 || !title) return;
    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 1. Compress
        const compressedFile = await imageCompression(file, options);

        // 2. Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        const cloudinaryData = await res.json();
        if (!res.ok) throw new Error(cloudinaryData.error?.message || "Upload failed");

        const imageUrl = cloudinaryData.secure_url;

        // 3. Save to Firestore
        await addDoc(collection(db, "photos"), {
          userId: user.uid,
          userName: user.displayName,
          storageUrl: imageUrl,
          status: "pending",
          featured: false,
          title, 
          createdAt: serverTimestamp(),
        });
        
        setUploadProgress(prev => ({ ...prev, current: i + 1 }));
      }

      // Success
      setFiles([]);
      previews.forEach(p => URL.revokeObjectURL(p));
      setPreviews([]);
      setTitle("");
      setUploadProgress({ current: 0, total: 0 });
      setShowSuccess(true);
      
      // Auto-hide success overlay after 4 seconds
      setTimeout(() => setShowSuccess(false), 4000);

    } catch (error) {
      console.error(error);
      alert("Error uploading images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 px-6 flex flex-col items-center pb-24 relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <div className="bg-gray-950 border border-white/10 p-6 md:p-12 max-w-lg w-full flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
              <button 
                onClick={() => setShowSuccess(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <XIcon size={24} strokeWidth={1} />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, stiffness: 200, damping: 20 }}
              >
                <CheckCircle2 size={64} className="text-white mb-6" strokeWidth={1} />
              </motion.div>
              
              <h2 className="text-2xl font-light tracking-widest uppercase mb-4 text-white">Upload Complete</h2>
              <p className="text-gray-400 font-light mb-8 text-sm leading-relaxed">
                Your artwork has been submitted securely and is now pending admin review for the Hall of Fame.
              </p>
              
              <button 
                onClick={() => setShowSuccess(false)}
                className="px-8 py-3 bg-white text-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                Upload More
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`w-full max-w-4xl space-y-12 transition-all duration-700 ${showSuccess ? 'opacity-30 blur-sm pointer-events-none' : 'opacity-100 blur-0'}`}>
        <div>
          <h1 className="text-4xl font-light tracking-widest mb-4 uppercase">Submit Work</h1>
          <p className="text-gray-400 font-light">Upload your best photography. Submissions will be reviewed before appearing in the gallery.</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm uppercase tracking-widest text-gray-400 mb-2">Collection Name / Keyword</label>
            <p className="text-xs text-gray-500 font-light mb-2">This name will be applied to all photos in this batch to help people filter them.</p>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kyoto 2024"
              className="w-full bg-transparent border-b border-gray-600 focus:border-white outline-none py-2 text-xl font-light transition-colors"
            />
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-800 hover:border-gray-500 transition-colors h-64 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
          >
            <div className="flex flex-col items-center text-gray-500">
              <ImageIcon size={48} className="mb-4" strokeWidth={1} />
              <span className="tracking-widest uppercase text-sm font-light">Select one or multiple images</span>
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            multiple
            className="hidden" 
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previews.map((preview, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={i} 
                  className="relative aspect-square overflow-hidden group"
                >
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 p-1.5 transition-colors"
                  >
                    <XIcon size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <button 
            onClick={handleUpload}
            disabled={files.length === 0 || !title || isUploading}
            className="w-full py-4 bg-white text-black font-light tracking-widest uppercase hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Uploading {uploadProgress.current} of {uploadProgress.total}...
              </>
            ) : (
              <>
                <UploadIcon size={20} />
                Submit {files.length > 0 ? `${files.length} Photo${files.length > 1 ? 's' : ''}` : 'Photos'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
