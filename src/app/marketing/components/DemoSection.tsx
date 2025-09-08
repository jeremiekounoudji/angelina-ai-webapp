"use client";

import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { fadeInUp } from "@/utils/animations";

interface DemoSectionProps {
  className?: string;
}

export default function DemoSection({ className = "" }: DemoSectionProps) {
  return (
    <section
      id="demo"
      className={`min-h-screen flex items-center justify-center py-16 ${className}`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Voir Angelina AI en
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              {" "}
              Action
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
            Découvrez comment notre assistant IA gère les scénarios réels de
            restaurant avec des réponses intelligentes et contextuelles.
          </p>
        </motion.div>

        {/* Single Video Area */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="relative"
        >
          {/* Video Container with Cool Styling */}
          <div className="relative bg-black rounded-3xl shadow-2xl border-4 border-gray-700 overflow-hidden mx-auto max-w-6xl">
            {/* Video Placeholder/Background */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              {/* Play Button Overlay */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all duration-300"
              >
                <div className="bg-green-600 hover:bg-green-500 rounded-full p-6 shadow-2xl">
                  <svg
                    className="w-16 h-16 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </motion.button>

              {/* Video Title Overlay */}
              <div className="absolute bottom-6 left-6 right-6"></div>
            </div>

            {/* Video Controls */}
            <div className="bg-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="text-white hover:text-green-400 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div className="text-white text-sm">
                  <span>0:00</span> / <span>2:30</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
