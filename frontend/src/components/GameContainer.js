import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Skull, Zap } from 'lucide-react';

const GameContainer = ({ level, onButtonClick, onMiss, onLevelUp, deviceType }) => {
  const [buttonPosition, setButtonPosition] = useState({ x: 50, y: 50 });
  const [isEscaping, setIsEscaping] = useState(false);
  const [tauntMessage, setTauntMessage] = useState('Try to catch me! 😈');
  const [nearMisses, setNearMisses] = useState(0);
  const [timeAlive, setTimeAlive] = useState(0);
  
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const lastPositionRef = useRef({ x: 50, y: 50 });
  const escapeTimeoutRef = useRef(null);
  const levelUpTimeoutRef = useRef(null);
  const timeAliveIntervalRef = useRef(null);

  // Difficulty scaling based on level
  const getDifficultySettings = useCallback(() => {
    const baseEscapeRadius = 150;
    const baseSpeed = 300;
    const baseEscapeDistance = 200;
    
    return {
      escapeRadius: Math.max(50, baseEscapeRadius - (level * 10)),
      escapeSpeed: Math.max(150, baseSpeed - (level * 20)),
      escapeDistance: Math.min(400, baseEscapeDistance + (level * 30)),
      tauntFrequency: Math.max(2000, 5000 - (level * 500))
    };
  }, [level]);

  // Taunt messages
  const getTauntMessage = useCallback(() => {
    const taunts = [
      'Too slow! 🐌',
      'Nice try! 😏',
      'You\'ll never catch me! 😈',
      'Is that your best? 🤔',
      'Getting warmer... 🔥',
      'Almost... not! 😂',
      'Give up yet? 🏳️',
      'I\'m everywhere! 👻',
      'Catch me if you can! 🏃‍♂️',
      'Level ' + level + ' and still trying? 🎯'
    ];
    return taunts[Math.floor(Math.random() * taunts.length)];
  }, [level]);

  // Calculate distance between two points
  const getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Get random position within container bounds
  const getRandomPosition = useCallback((currentX, currentY, minDistance) => {
    if (!containerRef.current) return { x: 50, y: 50 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const buttonWidth = 120;
    const buttonHeight = 60;
    
    let newX, newY, attempts = 0;
    const maxAttempts = 50;
    
    do {
      newX = Math.random() * (rect.width - buttonWidth);
      newY = Math.random() * (rect.height - buttonHeight);
      attempts++;
      
      if (attempts > maxAttempts) break;
    } while (
      getDistance(currentX, currentY, newX, newY) < minDistance &&
      attempts < maxAttempts
    );
    
    return { x: newX, y: newY };
  }, []);

  // Handle cursor/touch position
  const handleCursorMovement = useCallback((clientX, clientY) => {
    if (!containerRef.current || !buttonRef.current || isEscaping) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const buttonRect = buttonRef.current.getBoundingClientRect();
    
    // Calculate cursor position relative to container
    const cursorX = clientX - containerRect.left;
    const cursorY = clientY - containerRect.top;
    
    // Calculate button center position
    const buttonCenterX = buttonRect.left + buttonRect.width / 2 - containerRect.left;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2 - containerRect.top;
    
    const { escapeRadius } = getDifficultySettings();
    const distance = getDistance(cursorX, cursorY, buttonCenterX, buttonCenterY);
    
    // Check if cursor is too close to button
    if (distance < escapeRadius) {
      setIsEscaping(true);
      onMiss();
      
      const { escapeDistance } = getDifficultySettings();
      const newPosition = getRandomPosition(buttonCenterX, buttonCenterY, escapeDistance);
      
      // Calculate escape direction for animation
      const escapeX = newPosition.x - buttonCenterX;
      const escapeY = newPosition.y - buttonCenterY;
      
      // Set CSS variables for escape animation
      if (buttonRef.current) {
        buttonRef.current.style.setProperty('--escape-x', `${escapeX}px`);
        buttonRef.current.style.setProperty('--escape-y', `${escapeY}px`);
      }
      
      setButtonPosition(newPosition);
      lastPositionRef.current = newPosition;
      
      // Check for near miss
      if (distance < escapeRadius * 0.5) {
        setNearMisses(prev => {
          const newCount = prev + 1;
          if (newCount % 5 === 0) {
            onLevelUp();
          }
          return newCount;
        });
      }
      
      // Clear escape animation after animation completes
      if (escapeTimeoutRef.current) {
        clearTimeout(escapeTimeoutRef.current);
      }
      escapeTimeoutRef.current = setTimeout(() => {
        setIsEscaping(false);
      }, 300);
    }
  }, [isEscaping, getDifficultySettings, getRandomPosition, onMiss, onLevelUp]);

  // Mouse movement handler
  const handleMouseMove = useCallback((e) => {
    if (deviceType === 'desktop') {
      handleCursorMovement(e.clientX, e.clientY);
    }
  }, [deviceType, handleCursorMovement]);

  // Touch movement handler
  const handleTouchMove = useCallback((e) => {
    if (deviceType === 'mobile' || deviceType === 'tablet') {
      e.preventDefault();
      const touch = e.touches[0];
      handleCursorMovement(touch.clientX, touch.clientY);
    }
  }, [deviceType, handleCursorMovement]);

  // Button click handler
  const handleButtonClick = useCallback((e) => {
    e.stopPropagation();
    onButtonClick();
  }, [onButtonClick]);

  // Initialize button position
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const initialPosition = getRandomPosition(rect.width / 2, rect.height / 2, 0);
      setButtonPosition(initialPosition);
      lastPositionRef.current = initialPosition;
    }
  }, [getRandomPosition]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMouseMove, handleTouchMove]);

  // Taunt message rotation
  useEffect(() => {
    const { tauntFrequency } = getDifficultySettings();
    
    const tauntInterval = setInterval(() => {
      setTauntMessage(getTauntMessage());
    }, tauntFrequency);

    return () => clearInterval(tauntInterval);
  }, [getDifficultySettings, getTauntMessage]);

  // Time alive tracker
  useEffect(() => {
    timeAliveIntervalRef.current = setInterval(() => {
      setTimeAlive(prev => prev + 1);
    }, 1000);

    return () => {
      if (timeAliveIntervalRef.current) {
        clearInterval(timeAliveIntervalRef.current);
      }
    };
  }, []);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (escapeTimeoutRef.current) {
        clearTimeout(escapeTimeoutRef.current);
      }
      if (levelUpTimeoutRef.current) {
        clearTimeout(levelUpTimeoutRef.current);
      }
      if (timeAliveIntervalRef.current) {
        clearInterval(timeAliveIntervalRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20"
    >
      {/* Taunt Message */}
      <motion.div
        key={tauntMessage}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="taunt-message"
      >
        <Skull className="inline w-5 h-5 mr-2" />
        {tauntMessage}
      </motion.div>

      {/* Difficulty Indicator */}
      <div className="absolute bottom-4 left-4 bg-game-dark/80 backdrop-blur-sm rounded-lg p-3">
        <div className="flex items-center space-x-2 text-sm">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="font-bold">Level {level}</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300">Near Misses: {nearMisses}</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300">Time: {timeAlive}s</span>
        </div>
      </div>

      {/* Moving Button */}
      <motion.button
        ref={buttonRef}
        className={`moving-button ${isEscaping ? 'escaping' : ''} glow`}
        style={{
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
          position: 'absolute'
        }}
        onClick={handleButtonClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          x: 0,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: isEscaping ? 0.3 : 2
        }}
      >
        Click Me! 😈
      </motion.button>

      {/* Visual escape radius indicator (debug mode - can be removed) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="absolute border-2 border-yellow-400/30 rounded-full pointer-events-none"
          style={{
            left: `${buttonPosition.x + 60 - getDifficultySettings().escapeRadius}px`,
            top: `${buttonPosition.y + 30 - getDifficultySettings().escapeRadius}px`,
            width: `${getDifficultySettings().escapeRadius * 2}px`,
            height: `${getDifficultySettings().escapeRadius * 2}px`,
          }}
        />
      )}
    </div>
  );
};

export default GameContainer;
