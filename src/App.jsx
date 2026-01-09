import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  Twitter, Instagram, Linkedin, ExternalLink, 
  MessageCircle, RefreshCw, Send, 
  Settings, X, Save
} from 'lucide-react';

// --- REMPLISSEZ VOS CLÉS ICI ---
const firebaseConfig = {
  apiKey: "AIzaSyBQCAOTglJWYYt5XkW-uUO-9tRTI1NsTNE",
  authDomain: "moodboard-80500.firebaseapp.com",
  projectId: "moodboard-80500",
  storageBucket: "moodboard-80500.firebasestorage.app",
  messagingSenderId: "1043462303426",
  appId: "1:1043462303426:web:e73e61b5c6eb368141d55b",
  measurementId: "G-6RZEFL0RYP"
};

// Initialisation
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function App() {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState(null);
  const [shuffledOrder, setShuffledOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Auth Error:", err));
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Chemin simplifié pour votre projet personnel
    const contentRef = doc(db, 'siteData', 'mainContent');
    
    const unsubscribe = onSnapshot(contentRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setContent(data);
          setEditForm(data);
          if (shuffledOrder.length === 0) {
            const keys = ['bio', 'insta', 'twitter', 'socials', 'status', 'link', 'photo'];
            setShuffledOrder([...keys].sort(() => Math.random() - 0.5));
          }
        } else {
          // Création initiale si la base est vide
          const defaultData = {
            bio: "Bienvenue sur mon moodboard ! Cliquez sur ma photo pour modifier ce texte.",
            status: "En ligne et prêt",
            profilePic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150",
            instaImg: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400",
            twitterUrl: "https://twitter.com",
            twitterPreview: "Ceci est un aperçu de mon dernier post.",
            portfolioTitle: "Mon Portfolio",
            links: { instagram: "#", twitter: "#", linkedin: "#" }
          };
          setDoc(contentRef, defaultData);
        }
        setLoading(false);
      }, 
      (err) => {
        console.error("Firestore Error:", err);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [user, shuffledOrder.length]);

  const saveEdits = async () => {
    if (!user) return;
    const contentRef = doc(db, 'siteData', 'mainContent');
    try {
      await updateDoc(contentRef, editForm);
      setIsEditMode(false);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const renderBlock = (key) => {
    if (!content) return null;
    switch (key) {
      case 'bio':
        return (
          <div key="bio" className="md:col-span-2 bg-[#fff9c4] p-8 shadow-lg transform -rotate-1 relative transition-transform hover:rotate-0">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-zinc-700"><MessageCircle className="text-yellow-600" /> Bio</h2>
            <p className="leading-relaxed text-lg font-medium opacity-80">{content.bio}</p>
          </div>
        );
      case 'insta':
        return (
          <a key="insta" href={content.links?.instagram} target="_blank" className="bg-white p-3 pb-8 shadow-xl transform rotate-2 block transition-transform hover:rotate-0">
            <img src={content.instaImg} alt="Instagram" className="aspect-square object-cover w-full mb-3" />
            <p className="text-[10px] uppercase font-bold text-zinc-400 italic text-center">Instagram</p>
          </a>
        );
      case 'twitter':
        return (
          <a key="twitter" href={content.twitterUrl} target="_blank" className="bg-sky-50 p-6 rounded-3xl border border-sky-100 shadow-sm flex flex-col justify-between block hover:bg-sky-100 transition-colors">
            <Twitter className="text-sky-500 mb-4" size={24} />
            <p className="text-sm font-medium text-sky-900 mb-4 italic leading-relaxed">"{content.twitterPreview}"</p>
            <div className="flex justify-between items-center text-sky-400 font-bold text-[10px] uppercase"><span>Dernier tweet</span><ExternalLink size={12} /></div>
          </a>
        );
      case 'socials':
        return (
          <div key="socials" className="bg-zinc-900 text-white p-6 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-zinc-400 text-center uppercase tracking-tighter">Réseaux</h3>
            <div className="flex flex-col gap-2">
              <a href={content.links?.instagram} target="_blank" className="bg-white/10 p-2 rounded-xl flex items-center gap-2 text-xs hover:bg-white/20 transition-colors"><Instagram size={14} /> Instagram</a>
              <a href={content.links?.twitter} target="_blank" className="bg-white/10 p-2 rounded-xl flex items-center gap-2 text-xs hover:bg-white/20 transition-colors"><Twitter size={14} /> X</a>
              <a href={content.links?.linkedin} target="_blank" className="bg-white/10 p-2 rounded-xl flex items-center gap-2 text-xs hover:bg-white/20 transition-colors"><Linkedin size={14} /> LinkedIn</a>
            </div>
          </div>
        );
      case 'status':
        return (
          <div key="status" className="bg-green-50 border-2 border-green-100 p-6 rounded-3xl text-center shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto mb-2"></div>
            <p className="font-bold text-green-900 text-sm">{content.status}</p>
          </div>
        );
      case 'link':
        return (
          <a key="link" href="#" className="bg-orange-400 p-6 rounded-3xl shadow-lg text-white block hover:bg-orange-500 transition-colors">
            <ExternalLink className="mb-4" size={20} />
            <h4 className="text-xl font-black">{content.portfolioTitle}</h4>
          </a>
        );
      case 'photo':
        return (
          <div key="photo" className="bg-white p-3 pb-10 shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform">
            <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400" alt="Mood" className="grayscale contrast-125 w-full h-auto" />
          </div>
        );
      default: return null;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f4f1ea]"><RefreshCw className="animate-spin text-zinc-400" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#f4f1ea] p-4 md:p-8 relative font-sans text-zinc-800">
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[100] transform transition-transform duration-300 ${isEditMode ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6"><h2 className="font-black text-xl uppercase tracking-tighter">Édition</h2><button onClick={() => setIsEditMode(false)} className="p-2 hover:bg-zinc-100 rounded-full"><X size={20}/></button></div>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            <div><label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Bio</label><textarea rows="3" className="w-full border-2 border-zinc-100 p-2 rounded-lg text-sm bg-zinc-50 outline-none focus:border-zinc-300" value={editForm.bio || ''} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} /></div>
            <div><label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Image Instagram (URL)</label><input className="w-full border-2 border-zinc-100 p-2 rounded-lg text-sm bg-zinc-50 outline-none focus:border-zinc-300" value={editForm.instaImg || ''} onChange={(e) => setEditForm({...editForm, instaImg: e.target.value})} /></div>
            <div><label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Photo Profil (URL)</label><input className="w-full border-2 border-zinc-100 p-2 rounded-lg text-sm bg-zinc-50 outline-none focus:border-zinc-300" value={editForm.profilePic || ''} onChange={(e) => setEditForm({...editForm, profilePic: e.target.value})} /></div>
          </div>
          <button onClick={saveEdits} className="mt-6 bg-zinc-900 text-white w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg"><Save size={18}/> Enregistrer</button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto">
        <header className="flex flex-col items-center mb-16 pt-8">
          <div className="relative group cursor-pointer" onClick={() => setIsEditMode(true)}>
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden"><img src={content?.profilePic} alt="Profil" className="w-full h-full object-cover" /></div>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Settings className="text-white" size={24} /></div>
          </div>
          <h1 className="mt-6 text-3xl font-black italic tracking-tighter uppercase">@Grignute</h1>
          <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-white rounded-full shadow-sm text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <div className={`w-1.5 h-1.5 rounded-full ${content ? 'bg-green-500' : 'bg-amber-400'}`} />
            {content ? 'Synchronisé' : 'Local'}
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pb-24">
          {shuffledOrder.map(key => renderBlock(key))}
        </div>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button className="bg-zinc-900 text-white px-10 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold hover:scale-105 active:scale-95 transition-all group">
          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Me contacter
        </button>
      </div>
    </div>
  );
}
