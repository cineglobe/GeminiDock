import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  isVisible: boolean;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ isVisible }) => {
  const [loadingText, setLoadingText] = useState('Generating');
  
  // Update the loading text with dots animation
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setLoadingText(prev => {
        if (prev === 'Generating...') return 'Generating';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Bouncing circle */}
      <motion.div
        className="w-4 h-4 bg-blue-500 rounded-full mb-6"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Text lines */}
      <div className="flex flex-col items-center space-y-2 w-full max-w-md">
        <motion.div 
          className="h-2 bg-gray-700 rounded-full w-full"
          initial={{ width: '70%' }}
          animate={{ width: ['70%', '90%', '60%', '85%'] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        />
        <motion.div 
          className="h-2 bg-gray-700 rounded-full"
          initial={{ width: '50%' }}
          animate={{ width: ['50%', '80%', '40%', '75%'] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            repeatType: "reverse",
            delay: 0.2
          }}
        />
        <motion.div 
          className="h-2 bg-gray-700 rounded-full"
          initial={{ width: '30%' }}
          animate={{ width: ['30%', '60%', '45%', '70%'] }}
          transition={{ 
            duration: 2.2, 
            repeat: Infinity, 
            repeatType: "reverse",
            delay: 0.4
          }}
        />
      </div>
      
      {/* Loading text */}
      <div className="mt-4 text-gray-400 font-medium">
        {loadingText}
      </div>
    </div>
  );
}; 