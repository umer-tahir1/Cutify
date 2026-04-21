import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Flower {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  emoji: string;
}

export const FloatingFlowers: React.FC = () => {
  const [flowers, setFlowers] = useState<Flower[]>([]);

  const flowerEmojis = ['🌸', '🌺', '🌼', '🌻', '💐', '🌷', '🦋', '✨'];

  useEffect(() => {
    const newFlowers: Flower[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
      size: 20 + Math.random() * 25,
      rotation: Math.random() * 360,
      emoji: flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)],
    }));
    setFlowers(newFlowers);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {flowers.map((flower) => (
        <motion.div
          key={flower.id}
          className="absolute"
          style={{
            left: `${flower.x}%`,
            fontSize: `${flower.size}px`,
          }}
          initial={{ y: '100vh', opacity: 0, rotate: 0 }}
          animate={{
            y: '-10vh',
            opacity: [0, 0.6, 0.6, 0],
            rotate: flower.rotation,
          }}
          transition={{
            duration: flower.duration,
            delay: flower.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {flower.emoji}
        </motion.div>
      ))}
    </div>
  );
};
