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
  Camera,
  Upload
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
    bio: "Bienvenue sur mon moodboard !\nJe suis créateur de contenu.\n\nN'hésitez pas à me suivre !",
    status: "Disponible",
    profilePic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150",
    instaPostImg: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400",
    twitterUrl: "https://twitter.com",
    twitterPreview: "Nouveau projet en cours...",
    portfolioTitle: "Mes Projets",
    likes: 0,
    email: "votre@email.com",
    links: {
      instagram: "https://instagram.com/votre_compte",
      twitter: "https://twitter.com/votre_compte",
      linkedin: "https://linkedin.com/in/votre_nom"
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

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

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
          <div key="bio" className="md:col-span-2 bg-[#fff9c4] p-8 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform relative border border-yellow-100">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-zinc-700 uppercase tracking-tighter">
              <MessageCircle className="text-yellow-600" /> Bio
            </h2>
            <p className="leading-relaxed text-lg font-medium opacity-80 whitespace-pre-wrap">{content.bio}</p>
          </div>
        );
      case 'insta':
        return (
          <a key="insta" href={content.links?.instagram} target="_blank" rel="noopener noreferrer" className="bg-white p-3 pb-8 shadow-xl transform rotate-2 hover:rotate-0 transition-transform block group">
            <div className="aspect-square bg-zinc-100 mb-3 overflow-hidden">
               <img src={content.instaPostImg} alt="Dernier Post" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex justify-between items-center px-1">
              <p className="text-[9px] uppercase font-black text-zinc-400">Instagram Feed</p>
              <Instagram size={12} className="text-zinc-300" />
            </div>
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
              <p className="text-[10px] font-bold text-sky-400 uppercase">Dernière pensée</p>
              <ExternalLink size={12} className="text-sky-400" />
            </div>
          </a>
        );
      case 'socials':
        return (
          <div key="socials" className="bg-zinc-900 text-white p-6 rounded-3xl shadow-xl">
            <h3 className="text-xs font-black mb-4 text-zinc-500 uppercase tracking-[0.2em]">Réseaux Sociaux</h3>
            <div className="flex flex-col gap-3">
              <a href={content.links?.instagram} target="_blank" className="bg-white/5 p-3 rounded-2xl hover:bg-white/10 transition-colors flex items-center justify-between group text-sm">
                <span className="flex items-center gap-3"><Instagram size={16} /> Instagram</span>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
              </a>
              <a href={content.links?.twitter} target="_blank" className="bg-white/5 p-3 rounded-2xl hover:bg-white/10 transition-colors flex items-center justify-between group text-sm">
                <span className="flex items-center gap-3"><Twitter size={16} /> X / Twitter</span>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
              </a>
              <a href={content.links?.linkedin} target="_blank" className="bg-white/5 p-3 rounded-2xl hover:bg-white/10 transition-colors flex items-center justify-between group text-sm">
                <span className="flex items-center gap-3"><Linkedin size={16} /> LinkedIn</span>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
              </a>
            </div>
          </div>
        );
      case 'status':
        return (
          <div key="status" className="bg-green-50 border-2 border-green-100 p-6 rounded-3xl text-center shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto mb-2"></div>
            <span className="text-[9px] font-black uppercase text-green-700/50 block mb-1">Status actuel</span>
            <p className="font-bold text-green-900 text-sm">{content.status}</p>
          </div>
        );
      case 'link':
        return (
          <a key="link" href={content.links?.linkedin} className="bg-orange-400 p-8 rounded-[2.5rem] shadow-lg text-white block hover:bg-orange-500 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform"><Camera size={40} /></div>
            <ExternalLink className="mb-4" size={24} />
            <h4 className="text-2xl font-black italic uppercase leading-none tracking-tighter">{content.portfolioTitle}</h4>
          </a>
        );
      case 'photo':
        return (
          <div key="photo" className="bg-white p-3 pb-12 shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform">
            <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400" alt="Inspiration" className="grayscale contrast-125" />
            <p className="mt-4 text-center font-black italic text-zinc-300 uppercase text-[10px]">Inspiration</p>
          </div>
        );
      default: return null;
    }
  };

  if (loading || !content) return <div className="min-h-screen flex items-center justify-center bg-[#f4f1ea]"><RefreshCw className="animate-spin text-zinc-400" /></div>;

  return (
    <div className="min-h-screen bg-[#f4f1ea] p-4 md:p-12 relative font-sans text-zinc-900">
      {/* Panneau latéral des réglages */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[100] transform transition-transform duration-500 ease-in-out ${isEditMode ? 'translate-x-0' : 'translate-x-full'} border-l border-zinc-100`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-black text-2xl italic uppercase tracking-tighter">Réglages</h2>
            <button onClick={() => setIsEditMode(false)} className="hover:bg-zinc-100 p-2 rounded-full"><X size={20} /></button>
          </div>

          <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {/* Profil */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Profil</label>
              <div className="flex items-center gap-4">
                <img src={editForm.profilePic} className="w-12 h-12 rounded-full object-cover border" alt="Aperçu" />
                <label className="flex-1 cursor-pointer bg-zinc-50 border-2 border-dashed border-zinc-200 p-2 rounded-xl text-center hover:bg-zinc-100 transition-colors">
                  <span className="text-[10px] font-bold text-zinc-500 flex items-center justify-center gap-2"><Upload size={12}/> Télécharger</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profilePic')} />
                </label>
              </div>
              <input className="w-full border-b-2 border-zinc-100 p-2 text-sm focus:border-zinc-900 outline-none" value={editForm.status || ''} onChange={(e) => setEditForm({...editForm, status: e.target.value})} placeholder="Statut (ex: Disponible)" />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Ma Bio</label>
              <textarea className="w-full border-2 border-zinc-50 p-3 rounded-xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none min-h-[100px]" value={editForm.bio || ''} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} />
            </div>

            {/* Instagram */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Instagram</label>
              <label className="flex-1 cursor-pointer bg-zinc-50 border-2 border-dashed border-zinc-200 p-3 rounded-xl text-center block hover:bg-zinc-100">
                <span className="text-[10px] font-bold text-zinc-500">Photo dernier Post</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'instaPostImg')} />
              </label>
              <input className="w-full border-b-2 border-zinc-100 p-2 text-sm focus:border-zinc-900 outline-none" value={editForm.links?.instagram || ''} onChange={(e) => setEditForm({...editForm, links: {...editForm.links, instagram: e.target.value}})} placeholder="Lien vers votre profil Instagram" />
            </div>

            {/* X / Twitter */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">X (Twitter)</label>
              <input className="w-full border-b-2 border-zinc-100 p-2 text-sm focus:border-zinc-900 outline-none" value={editForm.twitterUrl || ''} onChange={(e) => setEditForm({...editForm, twitterUrl: e.target.value})} placeholder="Lien vers le tweet" />
              <textarea className="w-full border-2 border-zinc-50 p-3 rounded-xl text-sm bg-zinc-50 outline-none" rows="2" value={editForm.twitterPreview || ''} onChange={(e) => setEditForm({...editForm, twitterPreview: e.target.value})} placeholder="Texte d'aperçu..." />
              <input className="w-full border-b-2 border-zinc-100 p-2 text-sm focus:border-zinc-900 outline-none" value={editForm.links?.twitter || ''} onChange={(e) => setEditForm({...editForm, links: {...editForm.links, twitter: e.target.value}})} placeholder="Lien vers profil X" />
            </div>

            {/* Autres Réseaux */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Contact & Autres</label>
              <input className="w-full border-b-2 border-zinc-100 p-2 text-sm focus:border-zinc-900 outline-none" value={editForm.links?.linkedin || ''} onChange={(e) => setEditForm({...editForm, links: {...editForm.links, linkedin: e.target.value}})} placeholder="Lien LinkedIn" />
              <input className="w-full border-b-2 border-zinc-100 p-2 text-sm focus:border-zinc-900 outline-none" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} placeholder="Email de contact" />
            </div>
          </div>

          <button onClick={saveEdits} className="mt-8 bg-zinc-900 text-white w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl">
            <Save size={18}/> Enregistrer
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto">
        <header className="flex flex-col items-center mb-20 pt-8">
          <div className="relative group cursor-pointer" onClick={() => setIsEditMode(true)}>
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden transform transition group-hover:scale-105">
              <img src={content.profilePic} alt="Profil" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Settings className="text-white" size={24} />
            </div>
          </div>
          <h1 className="mt-6 text-4xl font-black italic tracking-tighter uppercase leading-none">@Grignute</h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">Digital Creator</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-32">
          {shuffledOrder.map(key => renderBlock(key))}
          
          {/* Bloc Like */}
          <button onClick={handleLike} className="bg-white p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center gap-3 hover:bg-red-50 transition-all group border border-zinc-50">
            <Heart className={`transition-all duration-300 ${content.likes > 0 ? 'fill-red-500 text-red-500 scale-110' : 'text-zinc-200 group-hover:text-red-200'}`} size={32} />
            <div className="flex flex-col items-center">
              <span className="font-black text-xl leading-none">{content.likes || 0}</span>
              <span className="text-[9px] font-black uppercase text-zinc-300 tracking-widest mt-1">Soutiens</span>
            </div>
          </button>
        </div>
      </main>

      {/* FAB Bouton Contact */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <a 
          href={`mailto:${content.email || 'votre@email.com'}`}
          className="bg-zinc-900 text-white px-10 py-5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 font-black uppercase tracking-[0.15em] text-xs hover:scale-105 active:scale-95 transition-all group"
        >
          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
          Me contacter
        </a>
      </div>
    </div>
  );
};

export default App;
