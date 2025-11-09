"use client"

import { WORKER_URL } from "config"
import { motion } from "framer-motion"

export default function ProjectPage() {
  return (
    <div className="h-screen w-screen bg-neutral-400 text-white overflow-hidden">
      <div className="flex justify-between h-full">

       {/* LEFT CHAT SIDE */}
        <motion.div 
          className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800/95 p-6 flex flex-col justify-between border-r border-neutral-800/50 backdrop-blur-xl  w-[500px] m-10"
          initial={{ x:-50, opacity:0 }}
          animate={{ x:0, opacity:1 }}
          transition={{ duration:0.4 }}
        >
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-neutral-800/40 to-neutral-800/20 rounded-2xl border border-neutral-700/30 shadow-lg backdrop-blur-sm">
                    <p className="text-neutral-300 text-sm">conversation</p>
                </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-neutral-800/60 to-neutral-800/40 rounded-2xl border border-neutral-700/50 shadow-2xl backdrop-blur-sm hover:border-neutral-600/50 transition-all duration-300">
                <textarea
                  placeholder="Type your message..."
                  className="w-full h-16 bg-transparent resize-none outline-none text-white placeholder-neutral-500"
                />
                <div className="mt-2 flex justify-end">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-300">
                        Send
                    </button>
                </div>
            </div>
        </motion.div>

        {/* RIGHT CODE SERVER SIDE */}
        <motion.div 
          className="h-full w-full m-10"
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ duration:0.4, delay:0.2 }}
        >
          <iframe
            src={`${WORKER_URL}`}
            className="w-full h-full border-0"
          />
        </motion.div>

      </div>
    </div>
  );
}
