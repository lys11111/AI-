import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Upload, 
  Share2, 
  Download, 
  User, 
  Settings, 
  ChevronRight,
  Loader2,
  Check
} from 'lucide-react';
import { generateTryOn } from './services/aiService';

// Types
interface ClothingItem {
  id: string;
  name: string;
  color: string;
  image: string;
  category: string;
}

const INITIAL_CLOSET: ClothingItem[] = [
  {
    id: '1',
    name: 'SILK BLOUSE',
    color: 'Ivory White',
    image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=1000&auto=format&fit=crop',
    category: 'TOPS'
  },
  {
    id: '2',
    name: 'TAILORED TROUSERS',
    color: 'Desert Sand',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop',
    category: 'TROUSERS'
  }
];

const DEFAULT_MODEL = 'https://images.unsplash.com/photo-1539109132314-34a9c6553876?q=80&w=1000&auto=format&fit=crop';

export default function App() {
  const [closet, setCloset] = useState<ClothingItem[]>(INITIAL_CLOSET);
  const [selectedPiece, setSelectedPiece] = useState<ClothingItem | null>(null);
  const [modelImage, setModelImage] = useState<string>(DEFAULT_MODEL);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStyle, setActiveStyle] = useState('Editorial');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'clothing' | 'model') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'clothing') {
        const newItem: ClothingItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: 'NEW PIECE',
          color: 'Custom',
          image: base64,
          category: 'UNSPECIFIED'
        };
        setCloset([...closet, newItem]);
      } else {
        setModelImage(base64);
        setGeneratedImage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!selectedPiece) {
      alert("Please select a piece from your closet first.");
      return;
    }

    setIsGenerating(true);
    const result = await generateTryOn({
      clothingImageBase64: selectedPiece.image,
      modelImageBase64: modelImage,
      style: activeStyle
    });

    if (result) {
      setGeneratedImage(result);
    } else {
      alert("Failed to generate look. Please try again.");
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center bg-surface border-b border-outline-variant/5">
        <h1 className="text-2xl font-bold tracking-widest">ATELIER AI</h1>
        <nav className="hidden md:flex items-center space-x-12 text-[11px] font-medium tracking-[0.2em] uppercase text-secondary">
          <a href="#" className="hover:text-on-surface transition-colors">How it works</a>
          <a href="#" className="hover:text-on-surface transition-colors">Pricing</a>
          <a href="#" className="text-on-surface border-b border-on-surface pb-1">Sign In</a>
        </nav>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_600px]">
        {/* Left Panel: Controls */}
        <div className="p-8 lg:p-16 space-y-16 overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* Phase One: Closet */}
          <section className="space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-secondary font-semibold">Phase One</span>
              <h2 className="text-5xl font-normal">Your AI Closet</h2>
              <p className="text-sm text-secondary">1. Upload Your Pieces</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {closet.map((item) => (
                <motion.div 
                  key={item.id}
                  layoutId={item.id}
                  onClick={() => setSelectedPiece(item)}
                  className={`group relative aspect-[3/4] cursor-pointer overflow-hidden ${selectedPiece?.id === item.id ? 'ring-2 ring-primary ring-offset-4 ring-offset-surface' : ''}`}
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[10px] font-bold tracking-wider">{item.name}</p>
                    <p className="text-[10px] text-secondary">{item.color}</p>
                  </div>
                  {selectedPiece?.id === item.id && (
                    <div className="absolute top-4 right-4 bg-primary text-white p-1">
                      <Check size={12} />
                    </div>
                  )}
                </motion.div>
              ))}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] border border-dashed border-outline-variant flex flex-col items-center justify-center space-y-4 hover:bg-surface-container-low transition-colors"
              >
                <Plus size={20} className="text-secondary" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Add New Item</span>
              </button>

              <button className="aspect-[3/4] border border-dashed border-outline-variant flex flex-col items-center justify-center space-y-4 hover:bg-surface-container-low transition-colors">
                <Upload size={20} className="text-secondary" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Bulk Import</span>
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(e, 'clothing')}
            />
          </section>

          {/* Phase Two: Model */}
          <section className="space-y-8">
            <p className="text-sm text-secondary">2. Upload Your Model Photo</p>
            <div className="relative aspect-square bg-surface-container-low overflow-hidden group">
              <img 
                src={modelImage} 
                alt="Model" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-[2px] group-hover:bg-transparent transition-all duration-500">
                <button 
                  onClick={() => modelInputRef.current?.click()}
                  className="flex flex-col items-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-full border border-on-surface flex items-center justify-center bg-white">
                    <User size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest">Replace Example Model</p>
                    <p className="text-[10px] text-secondary mt-1">Preferred: Solid neutral background</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-white border border-outline-variant/10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest">Current Model</p>
                <p className="text-[10px] text-secondary">Standard Neutral Set #04</p>
              </div>
              <button className="text-[10px] font-bold uppercase tracking-widest flex items-center hover:text-primary transition-colors">
                Settings <ChevronRight size={12} className="ml-1" />
              </button>
            </div>
            <input 
              type="file" 
              ref={modelInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(e, 'model')}
            />
          </section>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="bg-white p-8 lg:p-16 flex flex-col border-l border-outline-variant/5">
          <div className="flex-1 flex flex-col space-y-8">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-secondary font-semibold">Live Preview</span>
                <h2 className="text-4xl font-normal">Instant Try-On</h2>
              </div>
              <div className="flex space-x-2">
                <button className="p-3 border border-outline-variant hover:bg-surface-container-low transition-colors">
                  <Share2 size={16} />
                </button>
                <button className="p-3 border border-outline-variant hover:bg-surface-container-low transition-colors">
                  <Download size={16} />
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-surface-container-low overflow-hidden">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-white/80 backdrop-blur-md z-10"
                  >
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <div className="text-center space-y-2">
                      <p className="text-sm font-serif italic">Crafting your bespoke look...</p>
                      <p className="text-[10px] uppercase tracking-widest text-secondary">Aligning textures and silhouettes</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <img 
                src={generatedImage || modelImage} 
                alt="Preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Editorial Overlays */}
              {!isGenerating && (
                <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-between">
                  <div className="self-start bg-white/90 backdrop-blur-sm p-4 border-l-2 border-primary">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-secondary font-bold">Outerwear</p>
                    <p className="text-xs font-serif italic">Camel Wool Overcoat</p>
                  </div>
                  <div className="self-end bg-white/90 backdrop-blur-sm p-4 border-r-2 border-primary text-right">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-secondary font-bold">Trousers</p>
                    <p className="text-xs font-serif italic">Wide-Leg Silk Twill</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !selectedPiece}
                className="w-full btn-primary uppercase tracking-[0.3em] text-xs font-bold py-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Try-On Look'}
              </button>

              <div className="grid grid-cols-3 gap-4">
                {['Minimalist', 'Editorial', 'Streetwear'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setActiveStyle(style)}
                    className={`p-4 text-center transition-all duration-500 border ${
                      activeStyle === style 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-surface-container-low border-transparent hover:border-outline-variant'
                    }`}
                  >
                    <p className="text-[8px] uppercase tracking-widest text-secondary font-bold">Look {style === 'Minimalist' ? '01' : style === 'Editorial' ? '02' : '03'}</p>
                    <p className="text-[10px] font-bold mt-1">{style}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-12 bg-surface-container-low border-t border-outline-variant/5 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        <p className="text-[10px] uppercase tracking-widest text-secondary">© 2024 ATELIER AI. ALL RIGHTS RESERVED.</p>
        <div className="flex space-x-12 text-[10px] uppercase tracking-widest text-secondary font-medium">
          <a href="#" className="hover:text-on-surface transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-on-surface transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-on-surface transition-colors">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
