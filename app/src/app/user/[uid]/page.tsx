"use client";
import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import { Download } from "lucide-react";

export default function UserProfile({ params }: { params: Promise<{ uid: string }> }) {
  const resolvedParams = use(params);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserPhotos = async () => {
      try {
        const q = query(
          collection(db, "photos"), 
          where("userId", "==", resolvedParams.uid),
          where("status", "==", "approved"), 
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setPhotos(fetched);
        
        if (fetched.length > 0) {
          setUserName(fetched[0].userName);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserPhotos();
  }, [resolvedParams.uid]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-light uppercase tracking-widest text-sm">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen pt-32 px-6 max-w-[1600px] mx-auto pb-24">
      <div className="text-center mb-24">
        <h1 className="text-5xl font-light tracking-widest mb-4 uppercase">{userName || 'Photographer'}</h1>
        <p className="text-gray-400 font-light tracking-widest uppercase text-sm">Portfolio Archive</p>
      </div>
      
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
        {photos.map(photo => (
          <div key={photo.id} className="break-inside-avoid relative group overflow-hidden bg-gray-900 rounded-sm">
            <img src={photo.storageUrl} alt={photo.title} className="w-full object-cover" loading="lazy" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <p className="font-medium uppercase tracking-widest text-sm">{photo.title}</p>
              
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

      {photos.length === 0 && (
        <div className="text-center text-gray-500 font-light tracking-widest uppercase mt-32">
          This user hasn't published any artwork yet.
        </div>
      )}
    </div>
  );
}
