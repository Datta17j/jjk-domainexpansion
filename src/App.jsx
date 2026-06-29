import React, { useState, useCallback, useRef, useEffect } from 'react';
import HandTracker from './components/HandTracker';
import CursedVisualizer from './components/CursedVisualizer';
import VoiceCommand from './components/VoiceCommand';
import UI from './components/UI';
import AudioManager from './utils/AudioManager';
import './App.css';

const TECH_COLORS = {
  hollowPurple: '#a333ff',
  infiniteVoid: '#ffffff',
  red: '#ff0000',
  malevolentShrine: '#ff3300',
  blackFlash: '#ff0055',
  idleTransfiguration: '#00ffcc',
  boogieWoogie: '#ffff00',
  tenShadows: '#333333',
  disasterFlames: '#ff6600',
  cursedSpeech: '#0066ff',
  construction: '#999999',
  comedy: '#ff00ff',
  bloodManipulation: '#880000',
  ratioTechnique: '#ccff00',
  jackpot: '#00ffff',
  skyManipulation: '#aaaaff',
  neutral: '#00ffff'
};

const GESTURE_LOCK_MS = 5000;   // technique stays locked for 5s after activation
const GESTURE_DEBOUNCE_MS = 600; // gesture must be held 600ms before firing

function App() {
  const [currentTech, setCurrentTech] = useState('neutral');
  const [glowColor, setGlowColor] = useState('#00ffff');
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [lastHeard, setLastHeard] = useState('');
  const [muted, setMuted] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);

  const lockRef = useRef(null);
  const pendingGestureRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // -------------------
  // AUDIO CONTROL
  // -------------------
  useEffect(() => {
    if (!audioStarted || muted) return;
    if (currentTech === 'neutral' || currentTech === 'none') {
      AudioManager.stop();
      AudioManager.startThemeMusic();
    } else {
      AudioManager.stopThemeMusic();
      AudioManager.play(currentTech);
    }
  }, [currentTech, muted, audioStarted]);

  // -------------------
  // ACTIVATE TECHNIQUE
  // -------------------
  const activateTech = useCallback((techId) => {
    setCurrentTech(techId);
    setGlowColor(TECH_COLORS[techId] || '#00ffff');
    // Set 5-second lock so gestures can't override
    if (lockRef.current) clearTimeout(lockRef.current);
    lockRef.current = setTimeout(() => {
      lockRef.current = null;
    }, GESTURE_LOCK_MS);
  }, []);

  // -------------------
  // HAND GESTURES (with debounce + lock)
  // -------------------
  const handleGestureDetected = useCallback((techId) => {
    // Blocked during lock window
    if (lockRef.current) return;

    // Already pending same gesture
    if (pendingGestureRef.current === techId) return;

    pendingGestureRef.current = techId;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    // Neutral resets immediately, no lock needed
    if (techId === 'neutral') {
      setCurrentTech('neutral');
      setGlowColor(TECH_COLORS.neutral);
      pendingGestureRef.current = null;
      return;
    }

    // Hold gesture for 600ms before firing
    debounceTimerRef.current = setTimeout(() => {
      if (pendingGestureRef.current === techId) {
        activateTech(techId);
      }
      pendingGestureRef.current = null;
    }, GESTURE_DEBOUNCE_MS);
  }, [activateTech]);

  // -------------------
  // VOICE COMMANDS
  // -------------------
  const handleVoiceCommand = useCallback((techId, spokenText) => {
    setLastHeard(spokenText);
    if (techId === 'release' || techId === 'stop' || techId === 'return') {
      if (lockRef.current) clearTimeout(lockRef.current);
      lockRef.current = null;
      setCurrentTech('neutral');
      setGlowColor(TECH_COLORS.neutral);
      return;
    }
    if (techId && techId !== 'activate') {
      activateTech(techId);
    }
    setTimeout(() => {
      setLastHeard(prev => prev === spokenText ? '' : prev);
    }, 3000);
  }, [activateTech]);

  // -------------------
  // MENU / GESTURE GUIDE SELECT
  // -------------------
  const handleTechSelect = useCallback((techId) => {
    if (lockRef.current) clearTimeout(lockRef.current);
    lockRef.current = null;
    activateTech(techId);
  }, [activateTech]);

  // -------------------
  // UI CONTROLS
  // -------------------
  const toggleVoice = () => setVoiceActive(v => !v);
  const toggleLanguage = () => setVoiceLanguage(l => l === 'en-US' ? 'ja-JP' : 'en-US');
  const toggleMute = () => setMuted(AudioManager.toggleMute());

  // -------------------
  // UNLOCK AUDIO on first click
  // -------------------
  const unlockAudio = () => {
    if (audioStarted) return;
    if (!muted) AudioManager.startThemeMusic();
    setAudioStarted(true);
  };

  // -------------------
  // SYNC MUTE + AUTO-UNLOCK (global first interaction)
  // -------------------
  useEffect(() => {
    // initialize muted state from AudioManager if available
    if (AudioManager.getMuted) {
      setMuted(AudioManager.getMuted());
    }

    const onFirstInteraction = () => {
      if (!audioStarted) {
        // check AudioManager's muted state at interaction time
        const amMuted = AudioManager.getMuted ? AudioManager.getMuted() : false;
        if (!amMuted) AudioManager.startThemeMusic();
        setAudioStarted(true);
      }
    };

    window.addEventListener('pointerdown', onFirstInteraction, { once: true });
    window.addEventListener('keydown', onFirstInteraction, { once: true });

    return () => {
      try {
        window.removeEventListener('pointerdown', onFirstInteraction);
        window.removeEventListener('keydown', onFirstInteraction);
      } catch (e) {}
    };
  }, []);

  return (
    <div className="App" onClick={unlockAudio}>
      {!audioStarted && (
        <div id="audio-unlock" style={{position: 'fixed', bottom: 20, left: 20, zIndex: 300, background: '#000000cc', color: '#fff', padding: '8px 12px', borderRadius: 6}}>
          Click or press any key to enable audio
        </div>
      )}
      <HandTracker
        onGestureDetected={handleGestureDetected}
        glowColor={glowColor}
      />
      <CursedVisualizer technique={currentTech} />
      <VoiceCommand
        active={voiceActive}
        language={voiceLanguage}
        onCommandDetected={handleVoiceCommand}
        onListeningChange={setVoiceActive}
        onError={(err) => console.error("Voice Error:", err)}
      />
      <UI
        technique={currentTech}
        voiceActive={voiceActive}
        voiceLanguage={voiceLanguage}
        lastHeard={lastHeard}
        muted={muted}
        onToggleVoice={toggleVoice}
        onToggleLanguage={toggleLanguage}
        onToggleMute={toggleMute}
        onTechSelect={handleTechSelect}
      />
    </div>
  );
}

export default App;