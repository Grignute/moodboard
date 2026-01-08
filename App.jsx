import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
  Twitter, 
  Instagram, 
  Linkedin, 
  ExternalLink, 
  Heart, 
  MessageCircle, 
  RefreshCw,
  Send,
  Settings,
  X,
  Save,
  Link as LinkIcon
} from 'lucide-react';

const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'moodboard-grignute';

const App = () => {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState(null);
  const [shuffledOrder, setShuffledOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  const defaultContent = {
    bio: "Bienvenue sur mon moodboard ! Je suis créateur de contenu.",
    status: "En ligne",
    profilePic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150",
    instaImg: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400",
    twitterUrl: "https://twitter.com",
    twitterPreview: "Cliquez pour voir mon dernier post sur X",
    portfolioTitle: "Mon Portfolio",
    portfolioDesc: "Découvrez mes projets.",
    likes: 0,
    links: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com"
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const contentRef = doc(db, 'artifacts', appId, 'public', 'data', 'site', 'content');
    const unsubscribe = onSnapshot(contentRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setContent(data);
        setEditForm(data);
        if (shuffledOrder.length === 0) {
          const keys = ['bio', 'insta', 'twitter', 'socials', 'status', 'link', 'photo'];
          setShuffledOrder([...keys].sort(() => Math.random() - 0.5));
        }
      } else {
        setDoc(contentRef, defaultContent);
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [user]);

  const handleLike = async () => {
    if (!user || !content) return;
    const contentRef = doc(db, 'artifacts', appId, 'public', 'data', 'site', 'content');
    await updateDoc(contentRef, { likes: (content.likes || 0) + 1 });
  };

  const saveEdits = async () => {
    if (!user) return;
    const contentRef = doc(db, 'artifacts', appId, 'public', 'data', 'site', 'content');
    await updateDoc(contentRef, editForm);
    setIsEditMode(false);
  };

  const renderBlock = (key) => {
    if (!content) return null;
    switch (key) {
      case 'bio':
        return (
          <div key="bio" className="md:col-span-2 bg-[#fff9c4] p-8 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform relative">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-zinc-700">
              <MessageCircle className="text-yellow-600" /> Bio
            </h2>
            <p className="leading-relaxed text-lg font-medium opacity-80 whitespace-pre-wrap">{content.bio}</p>
          </div>
        );
      case 'insta':
        return (
          <a key="insta" href={content.links?.instagram} target="_blank" rel="noopener noreferrer" className="bg-white p-3 pb-8 shadow-xl transform rotate-2 hover:rotate-0 transition-transform block">
            <div className="aspect-square bg-zinc-100 mb-3 overflow-hidden">
               <img src={content.instaImg} alt="Dernier Post" className="object-cover w-full h-full" />
            </div>
            <p className="text-[10px] uppercase font-bold text-zinc-400 italic">Dernier post Instagram</p>
          </a>
        );
      case 'twitter':
        return (
          <a key="twitter" href={content.twitterUrl || content.links?.twitter} target="_blank" rel="noopener noreferrer" className="bg-sky-50 p-6 rounded-3xl border border-sky-100 shadow-sm flex flex-col justify-between block hover:bg-sky-100 transition-colors">
            <Twitter className="text-sky-500 mb-4" size={24} />
            <p className="text-sm font-medium text-sky-900 mb-4 italic leading-relaxed">
              {content.twitterPreview || "Voir mon dernier post sur X"}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-sky-400 uppercase">Dernier tweet</p>
              <ExternalLink size={12} className="text-sky-400" />
            </div>
          </a>
        );
      case 'socials':
        return (
          <div key="socials" className="bg-zinc-900 text-white p-6 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-zinc-400">Réseaux</h3>
            <div className="flex flex-col gap-2">
              <a href={content.links?.instagram} target="_blank" className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 text-xs"><Instagram size={14} /> Instagram</a>
              <a href={content.links?.twitter} target="_blank" className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 text-xs"><Twitter size={14} /> X / Twitter</a>
              <a href={content.links?.linkedin} target="_blank" className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 text-xs"><Linkedin size={14} /> LinkedIn</a>
            </div>
          </div>
        );
      case 'status':
        return (
          <div key="status" className="bg-green-50 border-2 border-green-100 p-6 rounded-3xl text-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto mb-2"></div>
            <p className="font-bold text-green-900 text-sm">{content.status}</p>
          </div>
        );
      case 'link':
        return (
          <a key="link" href="#" className="bg-orange-400 p-6 rounded-3xl shadow-lg text-white block">
            <ExternalLink className="mb-4" size={20} />
            <h4 className="text-xl font-black">{content.portfolioTitle}</h4>
          </a>
        );
      case 'photo':
        return (
          <div key="photo" className="bg-white p-3 pb-10 shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform">
            <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400" alt="Mood" className="grayscale" />
          </div>
        );
      default: return null;
    }
  };

  if (loading || !content) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#f4f1ea] p-4 md:p-8 relative">
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[100] transform transition-transform ${isEditMode ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-lg">Réglages</h2>
            <button onClick={() => setIsEditMode(false)}><X /></button>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-2 tracking-wider">Dernier Post Instagram (URL Image)</label>
              <input 
                className="w-full border p-2 rounded-lg text-sm bg-zinc-50"
                value={editForm.instaImg || ''} 
                onChange={(e) => setEditForm({...editForm, instaImg: e.target.value})}
                placeholder="Lien vers l'image du post..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-2 tracking-wider">Dernier Tweet (URL du Post X)</label>
              <input 
                className="w-full border p-2 rounded-lg text-sm bg-zinc-50"
                value={editForm.twitterUrl || ''} 
                onChange={(e) => setEditForm({...editForm, twitterUrl: e.target.value})}
                placeholder="https://twitter.com/user/status/..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-2 tracking-wider">Texte de l'aperçu X</label>
              <textarea 
                className="w-full border p-2 rounded-lg text-sm resize-none bg-zinc-50"
                rows="2"
                value={editForm.twitterPreview || ''} 
                onChange={(e) => setEditForm({...editForm, twitterPreview: e.target.value})}
                placeholder="Texte qui s'affichera sur la carte..."
              />
            </div>
            <hr className="border-zinc-100" />
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-2">Photo Profil (URL)</label>
              <input className="w-full border p-2 rounded-lg text-sm bg-zinc-50" value={editForm.profilePic || ''} onChange={(e) => setEditForm({...editForm, profilePic: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-2">Bio</label>
              <textarea className="w-full border p-2 rounded-lg text-sm bg-zinc-50" value={editForm.bio || ''} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} />
            </div>
          </div>

          <button onClick={saveEdits} className="mt-4 bg-zinc-900 text-white w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
            <Save size={18}/> Enregistrer
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto">
        <header className="flex flex-col items-center mb-12">
          <div className="relative group cursor-pointer" onClick={() => setIsEditMode(true)}>
            <img src={content.profilePic} alt="Profil" className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover" />
            <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Settings className="text-white" size={20} />
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-black italic">@Grignute</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shuffledOrder.map(key => renderBlock(key))}
          <button onClick={handleLike} className="bg-white p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-red-50 transition-colors group">
            <Heart className={(content.likes || 0) > 0 ? 'fill-red-500 text-red-500' : 'text-zinc-300'} />
            <span className="font-bold text-xs">{content.likes || 0}</span>
          </button>
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <button className="bg-zinc-900 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold hover:scale-105 transition-transform">
          <Send size={16} /> Contact
        </button>
      </div>
    </div>
  );
};

export default App;
