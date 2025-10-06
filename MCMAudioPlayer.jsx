import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MCMAudioPlayer() {
  const [audioContext, setAudioContext] = useState(null);
  const [gainNode, setGainNode] = useState(null);
  const [bassNode, setBassNode] = useState(null);
  const [trebleNode, setTrebleNode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [preset, setPreset] = useState('Flat');
  const [customPreset, setCustomPreset] = useState(() => {
    const saved = localStorage.getItem('mcm_custom_preset');
    return saved ? JSON.parse(saved) : { gain: 1, bass: 0, treble: 0 };
  });
  const [settings, setSettings] = useState({ gain: 1, bass: 0, treble: 0 });
  const [showBoot, setShowBoot] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const audioRef = useRef(new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'));

  useEffect(() => {
    const timer = setTimeout(() => setShowBoot(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaElementSource(audioRef.current);
    const gain = ctx.createGain();
    const bass = ctx.createBiquadFilter();
    bass.type = 'lowshelf';
    bass.frequency.value = 200;
    const treble = ctx.createBiquadFilter();
    treble.type = 'highshelf';
    treble.frequency.value = 3000;

    src.connect(bass);
    bass.connect(treble);
    treble.connect(gain);
    gain.connect(ctx.destination);

    setAudioContext(ctx);
    setGainNode(gain);
    setBassNode(bass);
    setTrebleNode(treble);
  }, []);

  const applyPreset = (type) => {
    let newSettings = { ...settings };
    if (type === 'Bass Boost') newSettings = { gain: 1.2, bass: 8, treble: -2 };
    else if (type === 'Volume Extender') newSettings = { gain: 1.5, bass: 3, treble: 2 };
    else if (type === 'Custom') newSettings = customPreset;
    else newSettings = { gain: 1, bass: 0, treble: 0 };
    setSettings(newSettings);
    setPreset(type);
  };

  useEffect(() => {
    if (gainNode && bassNode && trebleNode) {
      gainNode.gain.value = settings.gain;
      bassNode.gain.value = settings.bass;
      trebleNode.gain.value = settings.treble;
    }
  }, [settings, gainNode, bassNode, trebleNode]);

  const togglePlay = async () => {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') await audioContext.resume();

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const saveCustomPreset = () => {
    localStorage.setItem('mcm_custom_preset', JSON.stringify(settings));
    setCustomPreset(settings);
    alert('Custom preset saved!');
  };

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 4000);
    });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  if (showBoot) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <motion.h1
          className="text-6xl text-green-400 font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          MCM Audio Player
        </motion.h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-green-400 p-4">
      <h1 className="text-4xl font-bold mb-4">MCM Audio Player</h1>
      <p className="mb-4">Dark Green Theme • Bass Boost • Volume Extender</p>

      <div className="flex space-x-2 mb-4">
        {['Flat','Bass Boost','Volume Extender','Custom'].map(p => (
          <button key={p} onClick={()=>applyPreset(p)}
            className={`px-4 py-2 rounded ${preset===p ? 'bg-green-500 text-black' : 'bg-green-900 text-green-400'}`}>
            {p}
          </button>
        ))}
      </div>

      <div className="flex space-x-4 mb-4">
        <button onClick={togglePlay} className="px-6 py-2 bg-green-500 text-black rounded">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={saveCustomPreset} className="px-4 py-2 bg-green-700 rounded">Save Custom</button>
      </div>

      {!isInstalled && deferredPrompt && (
        <button onClick={handleInstallClick} className="mt-4 px-6 py-2 bg-green-500 rounded">
          📲 Install MCM Audio Player
        </button>
      )}

      <AnimatePresence>
        {showThankYou && (
          <motion.div
            className="absolute bottom-10 bg-green-500 text-black px-6 py-3 rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5 }}
          >
            🎉 Thank you for installing MCM Audio Player!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}