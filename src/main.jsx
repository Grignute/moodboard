import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  setDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Twitter, Instagram, RefreshCw, Send, 
  Settings, X, Save, Camera, Sparkles 
} from 'lucide-react';

// --- VOTRE CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBQCAOTglJWYYt5XkW-uUO-9tRTI1NsTNE",
  authDomain: "moodboard-80500.firebaseapp.com",
  projectId: "moodboard-80500",
  storageBucket: "moodboard-80500.firebasestorage.app",
  messagingSenderId: "1043462303426",
  appId: "1:1043462303426:web:e73e61b5c6eb368141d55b",
  measurementId: "G-6RZEFL0RYP"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DEFAULT_DATA = {
  bio: "Bienvenue sur mon espace créatif. Ici, je compile mes inspirations quotidiennes et mes projets en cours.",
  status: "Disponible pour collaborations",
  profilePic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300",
  instaImg: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600",
  twitterPreview: "Nouveau projet en préparation ! 🎨✨",
  portfolioTitle: "Portfolio 2024",
  links: { instagram: "#", twitter: "#", linkedin: "#" }
};

function App() {
  const [content, setContent] = useState(DEFAULT_DATA);
  const [isEditMode, setIsEditMode] = useState(false);
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('local'); // 'local', 'syncing', 'synced', 'error'

  // 1. Authentification anonyme
  useEffect(() => {
    signInAnonymously(auth).catch((err) => {
      console.error("Erreur Auth:", err);
      setSyncStatus('local');
    });
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Synchronisation en temps réel avec Firestore
  useEffect(() => {
    if (!user) return;

    // On utilise une collection 'content' et un document 'main'
    const docRef = doc(db, 'content', 'main');
    
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setContent(snap.data());
        setSyncStatus('synced');
      } else {
        // Si le document n'existe pas encore, on le crée avec les données par défaut
        setDoc(docRef, DEFAULT_DATA).catch(console.error);
      }
    }, (err) => {
      console.warn("Firestore bloqué ou règles de sécurité non configurées:", err);
      setSyncStatus('local');
    });
    
    return () => unsubscribe();
  }, [user]);

  // 3. Sauvegarde des modifications
  const handleSave = async (newData) => {
    setContent(newData);
    setIsEditMode(false);
    
    if (!user) return;
    
    setSyncStatus('syncing');
    try {
      const docRef = doc(db, 'content', 'main');
      await setDoc(docRef, newData, { merge: true });
      setSyncStatus('synced');
    } catch (err) {
      console.error("Erreur de sauvegarde:", err);
      setSyncStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 font-sans selection:bg-amber-200">
      {/* Indicateur de synchronisation */}
      <div className="fixed top-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-zinc-100 z-[100] text-[10px] font-bold uppercase tracking-widest">
        {syncStatus === 'synced' && <><div className="w-2 h-2 bg-green-500 rounded-full" /> Synchronisé</>}
        {syncStatus === 'local' && <><div className="w-2 h-2 bg-amber-400 rounded-full" /> Mode Local</>}
        {syncStatus === 'syncing' && <><RefreshCw className="animate-spin" size={12} /> Mise à jour...</>}
        {syncStatus === 'error' && <><div className="w-2 h-2 bg-red-500 rounded-full" /> Erreur Cloud</>}
      </div>

      <header className="max-w-6xl mx-auto pt-20 pb-12 flex flex-col items-center">
        <div className="relative cursor-pointer group" onClick={() => setIsEditMode(true)}>
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden transform transition group-hover:scale-105">
            <img src={content.profilePic} alt="Profil" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-zinc-900 text-white p-2 rounded-full shadow-lg">
            <Settings size={16} />
          </div>
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter uppercase mt-6 leading-none">@Grignute</h1>
        <p className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-[9px] mt-2">Design & Inspiration</p>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 pb-32">
        {/* Manifeste / Bio */}
        <div className="md:col-span-2 bg-white p-8 shadow-xl rounded-2xl border border-zinc-100">
          <Sparkles className="text-amber-500 mb-4" size={24} />
          <p className="text-xl font-medium leading-relaxed text-zinc-700">{content.bio}</p>
        </div>

        {/* Status */}
        <div className="bg-zinc-900 text-white p-8 rounded-2xl flex flex-col justify-center items-center text-center shadow-xl">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mb-3" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Actuellement</span>
          <p className="font-bold">{content.status}</p>
        </div>

        {/* Photo Inspiration */}
        <div className="bg-white p-3 pb-10 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform">
          <img src={content.instaImg} alt="Mood" className="aspect-square object-cover w-full mb-3" />
          <div className="flex justify-center"><Instagram size={14} className="text-zinc-200" /></div>
        </div>

        {/* Twitter Card */}
        <div className="bg-sky-500 p-8 rounded-2xl text-white shadow-lg">
          <Twitter size={24} className="mb-4" />
          <p className="font-bold text-lg leading-tight">"{content.twitterPreview}"</p>
        </div>

        {/* Portfolio Link */}
        <a href="#" className="bg-amber-400 p-8 rounded-2xl shadow-lg flex flex-col justify-between hover:bg-amber-500 transition-colors">
          <Camera size={24} />
          <h3 className="text-2xl font-black uppercase italic mt-4">{content.portfolioTitle}</h3>
        </a>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <button className="bg-zinc-900 text-white px-10 py-4 rounded-full shadow-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-transform">
          <Send size={18} /> Contact
        </button>
      </div>

      {/* Modal d'édition */}
      {isEditMode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase italic">Modifier</h2>
              <button onClick={() => setIsEditMode(false)}><X /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSave({
                ...content,
                bio: formData.get('bio'),
                status: formData.get('status'),
                profilePic: formData.get('profilePic'),
                twitterPreview: formData.get('twitter')
              });
            }} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400">Biographie</label>
                <textarea name="bio" defaultValue={content.bio} className="w-full border-2 border-zinc-100 p-3 rounded-xl outline-none focus:border-zinc-900" rows="3" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400">Statut</label>
                <input name="status" defaultValue={content.status} className="w-full border-2 border-zinc-100 p-3 rounded-xl outline-none focus:border-zinc-900" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400">URL Photo de profil</label>
                <input name="profilePic" defaultValue={content.profilePic} className="w-full border-2 border-zinc-100 p-3 rounded-xl outline-none focus:border-zinc-900" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400">Dernier Tweet</label>
                <input name="twitter" defaultValue={content.twitterPreview} className="w-full border-2 border-zinc-100 p-3 rounded-xl outline-none focus:border-zinc-900" />
              </div>
              <button type="submit" className="w-full bg-zinc-900 text-white py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-colors">
                <Save size={18} /> Enregistrer sur le Cloud
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
