import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  strengths: string[];
  weaknesses: string[];
}

export function StrengthsWeaknesses({ strengths, weaknesses }: Props) {
  const containerVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      
      {/* Strengths Column */}
      <div className="flex flex-col">
        <h4 className="flex items-center text-accent-secondary font-display text-sm font-semibold mb-4 tracking-wide uppercase">
          <ChevronUp className="w-4 h-4 mr-1.5" />
          Key Strengths
        </h4>
        <motion.ul 
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {strengths.map((strength, idx) => (
            <motion.li 
              key={`strength-${idx}`}
              variants={itemVariants}
              className="pl-3.5 py-1.5 border-l-2 border-accent-secondary bg-white/[0.02] rounded-r-lg"
            >
              <p className="font-body text-[13px] leading-relaxed text-text-primary/95">
                {strength}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* Weaknesses Column */}
      <div className="flex flex-col">
        <h4 className="flex items-center text-accent-danger font-display text-sm font-semibold mb-4 tracking-wide uppercase">
          <ChevronDown className="w-4 h-4 mr-1.5" />
          Critical Weaknesses
        </h4>
        <motion.ul 
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {weaknesses.map((weakness, idx) => (
            <motion.li 
              key={`weak-${idx}`}
              variants={itemVariants}
              className="pl-3.5 py-1.5 border-l-2 border-accent-danger bg-white/[0.02] rounded-r-lg"
            >
              <p className="font-body text-[13px] leading-relaxed text-text-primary/95">
                {weakness}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>

    </div>
  );
}
