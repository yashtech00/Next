"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Globe, Mic, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createProject } from "@/lib/AxiosInstanxe";
import { useRouter } from "next/navigation";

// ------------------ Typewriter Hook ------------------
interface TypewriterOptions {
  words: string[];
  loop?: boolean;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

function useTypewriter({
  words,
  loop = true,
  typingSpeed = 150,
  deletingSpeed = 50,
  pauseTime = 1500,
}: TypewriterOptions) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const currentWord:any = words[wordIndex % words.length];

    if (!isDeleting) {
      // Typing
      timeout = setTimeout(() => {
        setText(currentWord.slice(0, text.length + 1));
        if (text.length + 1 === currentWord.length) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      }, typingSpeed);
    } else {
      // Deleting
      timeout = setTimeout(() => {
        setText(currentWord.slice(0, text.length - 1));
        if (text.length - 1 === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => prev + 1);
        }
      }, deletingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return text;
}

// ------------------ Motion Variants ------------------
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.36 } },
};

// ------------------ Hero Component ------------------
const Hero = () => {
  const [inputValue, setInputValue] = useState("");

  const router = useRouter();

  const handlePromptSubmit = async () => {
    try{
      console.log("----------click ------------");
      
      const res = await createProject(inputValue);
      setInputValue("");
      console.log(res,'yash res create project');
      
      router.push(`/project/${res.projectId}`);
    }catch(e){
      console.error("Error creating prompt:", e);
    }
  }

  // Typewriter placeholder
  const placeholderText = useTypewriter({
    words: [
      "Ask Lovable to create a web app that.",
      "Generate a beautiful landing page instantly.",
      "Turn your idea into reality with AI.",
    ],
    typingSpeed: 100,
    deletingSpeed: 50,
    pauseTime: 2000,
  });

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 pt-8">
      
      <motion.div
        className="max-w-4xl w-full text-center space-y-8"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Main Heading */}
        <motion.div className="text-center" variants={fadeUp}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-white tracking-tight drop-shadow-md">
            Build Beautiful Apps Effortlessly with AI
          </h1>
          <motion.p
            className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto"
            variants={fadeUp}
          >
            A single conversation can turn your idea into reality — instantly, beautifully, and effortlessly.
          </motion.p>
        </motion.div>

        {/* Input Box */}
        <motion.div className="w-full max-w-3xl mx-auto" variants={fadeUp}
          
        >
          <div className="rounded-3xl p-6 backdrop-blur-sm bg-black shadow-lg">
            <div className="flex flex-col gap-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholderText}
                className="bg-black border-none text-white placeholder:text-gray-400 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-white/10 gap-2"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="hidden sm:inline">Attach</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-white/10 gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">Public</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    className="bg-gray-600 hover:bg-gray-500 text-white rounded-full"
                    disabled={!inputValue}
                    onClick={handlePromptSubmit}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
