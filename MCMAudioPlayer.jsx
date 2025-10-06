import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MCMAudioPlayer() {
  // Audio nodes
  const [audioContext, setAudioContext] = useState(null);
  const [gainNode, setGainNode] = useState(null);
  const [bassNode, setBassNode] = useState(null);
  const [trebleNode, setTrebleNode] = useState(null);
  const [analyser, setAnalyser] = useState(null);
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

  const canvasRef = useRef(null);
  const audioRef = useRef(new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'));

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
    const analyserNode = ctx.createAnalyser();

    src.connect(bass);
    bass.connect(treble);
    treble.connect(gain);
    gain.connect(analyserNode);
    analyserNode.connect(ctx.destination);

    setAudioContext(ctx);
    setGainNode(gain);
    setBassNode(bass);
    setTrebleNode(treble);
    setAnalyser(analyserNode);
  }, []);

  const applyPreset = (type) => {
    let newSettings = { ...settings };
    if (type === 'Bass Boost') newSettings = { gain: 1.1, bass: 8, treble: -2 };
    else if (type === 'Volume Extender') newSettings = { gain: 1.4, bass: 3, treble: 2 };
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

  const saveCustomPreset = () => {
    localStorage.setItem('mcm_custom_preset', JSON.stringify(settings));
    setCustomPreset(settings);
    alert('Custom preset saved!');
  };

  const togglePlay = () => {
    if (!audioContext) return;
    if (audioContext.state