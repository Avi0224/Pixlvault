"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, updateDoc, doc, deleteDoc, orderBy } from "firebase/firestore";
import { Check, X, Star, Trash2 } from "lucide-react";

interface Photo {
  id: string;
  userId: string;
  userName: string;
  title: string;
  status: string;
  storageUrl: string;
  featured: boolean;
  createdAt?: any;
}

export default function AdminPage() {
  const { isAdmin } = useStore();
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchPhotos();
    }
  }, [isAdmin]);

  const fetchPhotos = async () => {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
    setPhotos(fetched);
  };

  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, "photos", id), { status: "approved" });
    fetchPhotos();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this photo?")) {
      await deleteDoc(doc(db, "photos", id));
      fetchPhotos();
    }
  };

  const handleBulkApprove = async (userId: string, photoIds: string[]) => {
    if (confirm(`Are you sure you want to approve all ${photoIds.length} photos?`)) {
      await Promise.all(photoIds.map(id => updateDoc(doc(db, "photos", id), { status: "approved" })));
      fetchPhotos();
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "photos", id), { featured: !currentStatus });
    fetchPhotos();
  };

  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 tracking-widest uppercase">Access Denied</div>;
  }

  const pendingPhotos = photos.filter(p => p.status === "pending");
  const approvedPhotos = photos.filter(p => p.status === "approved");

  const pendingByUser = pendingPhotos.reduce((acc, photo) => {
    if (!acc[photo.userId]) {
      acc[photo.userId] = {
        userName: photo.userName,
        photos: []
      };
    }
    acc[photo.userId].photos.push(photo);
    return acc;
  }, {} as Record<string, { userName: string, photos: Photo[] }>);

  return (
    <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-light tracking-widest mb-16 uppercase">Admin Dashboard</h1>

      <section className="mb-20">
        <h2 className="text-2xl font-light tracking-wider mb-8 flex items-center gap-4">
          Pending Approval <span className="bg-red-500/20 text-red-500 text-sm px-3 py-1 rounded-full">{pendingPhotos.length}</span>
        </h2>
        <div className="space-y-12">
          {Object.entries(pendingByUser).map(([userId, data]) => (
            <div key={userId} className="border border-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <h3 className="text-xl font-light tracking-wider uppercase">
                  {data.userName} <span className="text-gray-500 text-sm normal-case tracking-normal">({data.photos.length} photos)</span>
                </h3>
                <button 
                  onClick={() => handleBulkApprove(userId, data.photos.map(p => p.id))}
                  className="bg-green-500/10 text-green-500 px-6 py-2 rounded-full text-xs uppercase tracking-widest hover:bg-green-500/20 transition-colors flex items-center gap-2"
                >
                  <Check size={16} /> Bulk Approve All
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {data.photos.map(photo => (
                  <div key={photo.id} className="bg-gray-900 rounded-lg overflow-hidden group">
                    <img src={photo.storageUrl} alt={photo.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <p className="font-medium tracking-wide uppercase text-sm truncate">{photo.title}</p>
                      
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => handleApprove(photo.id)} className="flex-1 bg-green-500/10 text-green-500 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-green-500/20 transition-colors" title="Approve">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleDelete(photo.id)} className="flex-1 bg-red-500/10 text-red-500 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors" title="Reject">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {pendingPhotos.length === 0 && <p className="text-gray-500 font-light italic">No pending photos.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-light tracking-wider mb-8">Approved Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {approvedPhotos.map(photo => (
            <div key={photo.id} className="relative group overflow-hidden rounded-lg aspect-square">
              <img src={photo.storageUrl} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                <p className="font-medium uppercase tracking-widest text-sm mb-1">{photo.title}</p>
                <p className="text-xs text-gray-300 font-light mb-4">by {photo.userName}</p>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => toggleFeatured(photo.id, photo.featured)}
                    className={`px-4 py-2 rounded-full text-xs tracking-widest uppercase flex items-center justify-center gap-2 border ${photo.featured ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/30 hover:bg-white/10 text-white'}`}
                  >
                    <Star size={14} fill={photo.featured ? "black" : "none"} />
                    {photo.featured ? "Featured" : "Feature"}
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(photo.id)}
                    className="px-4 py-2 rounded-full text-xs tracking-widest uppercase flex items-center justify-center gap-2 border border-red-500/50 text-red-500 hover:bg-red-500/20 transition-colors mt-2"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
