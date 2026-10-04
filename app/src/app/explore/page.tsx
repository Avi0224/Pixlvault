"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Download, Search } from "lucide-react";

export default function ExplorePage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const q = query(collection(db, "photos"), where("status", "==", "approved"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPhotos(fetched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  const filteredPhotos = photos.filter(photo => 
    photo.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-light uppercase tracking-widest text-sm">Loading Gallery...</div>;
  }

  return (
    <div className="min-h-screen pt-32 px-6 max-w-[1600px] mx-auto pb-24">
      <h1 className="text-4xl font-light tracking-widest mb-12 uppercase text-center">Explore</h1>
      
      <div className="max-w-md mx-auto mb-16 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Filter by keyword or title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-full py-4 pl-12 pr-6 outline-none focus:border-white/50 focus:bg-gray-800 transition-all font-light"
        />
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {filteredPhotos.map(photo => (
          <div key={photo.id} className="break-inside-avoid relative group overflow-hidden bg-gray-900 rounded-sm">
            <img src={photo.storageUrl} alt={photo.title} className="w-full object-cover" loading="lazy" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <p className="font-medium uppercase tracking-widest text-sm mb-1">{photo.title}</p>
              <Link href={`/user/${photo.userId}`} className="text-xs text-gray-300 font-light hover:text-white transition-colors">
                by {photo.userName}
              </Link>
              
              <a 
                href={photo.storageUrl} 
                download
                target="_blank"
                rel="noreferrer"
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/30 backdrop-blur-md p-2 rounded-full transition-colors text-white"
                title="Download"
              >
                <Download size={18} />
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {photos.length > 0 && filteredPhotos.length === 0 && (
        <div className="text-center text-gray-500 font-light tracking-widest uppercase mt-20">
          No photos found matching "{searchQuery}".
        </div>
      )}

      {photos.length === 0 && (
        <div className="text-center text-gray-500 font-light tracking-widest uppercase mt-32">
          No artwork has been published yet.
        </div>
      )}
    </div>
  );
}
