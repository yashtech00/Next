"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, PinOff, Search, Loader } from "lucide-react";
import { fetchProjects } from "@/lib/AxiosInstanxe";

// Professional Sidebar component
// - Hover-to-open + top-right pin/unpin button
// - Dark gray gradient theme
// - Smooth framer-motion transitions
// - Projects list with loading skeleton + search/filter
// - Click on project -> router.push(`/project/${id}`)
// - Stores pinned state in localStorage so user preference persists

export default function Sidebar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string; title?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // motion variants
  const panelVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 280, damping: 28 } },
    exit: { x: "-100%", opacity: 0, transition: { type: "spring", stiffness: 260, damping: 30 } },
  } as const;

  useEffect(() => {
    // load pinned preference
    try {
      const stored = localStorage.getItem("sidebarPinned");
      setPinned(stored === "true");
    } catch (e) {
      // ignore in SSR or private modes
    }
  }, []);

  useEffect(() => {
    // fetch projects
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchProjects();
        // expecting array of { id, title }
        setProjects(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Sidebar: failed to load projects", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // open on pointer enter (unless already pinned)
  const handleEnter = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(true);
  };

  // close on pointer leave only when not pinned
  const handleLeave = () => {
    if (pinned) return;
    timerRef.current = window.setTimeout(() => setOpen(false), 180);
  };

  const togglePin = () => {
    const next = !pinned;
    setPinned(next);
    try {
      localStorage.setItem("sidebarPinned", String(next));
    } catch (e) {
      // noop
    }
    // if pinned, ensure it's open
    if (next) setOpen(true);
  };

  const filtered = projects.filter((p) => {
    if (!query) return true;
    const t = (p.title || "").toLowerCase();
    return t.includes(query.trim().toLowerCase());
  });

  return (
    <>
      {/* Hover zone: small interactive area on left edge */}
      <div
        aria-hidden
        onPointerEnter={handleEnter}
        className="fixed left-0 top-0 bottom-0 w-4 z-20"
      />

      {/* AnimatePresence for mount/unmount animations */}
      <AnimatePresence>
        {(open || pinned) && (
          <motion.aside
            ref={containerRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            onPointerEnter={handleEnter}
            onPointerLeave={handleLeave}
            className="fixed left-0 top-0 bottom-0 w-72 z-[9999] p-4 bg-gradient-to-b from-gray-900/90 via-gray-800/75 to-gray-850/80 backdrop-blur-md border-r border-gray-800 shadow-2xl flex flex-col"
            aria-label="Main sidebar"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-gray-100">Next AI</h3>
                <p className="text-xs text-gray-400">Your projects & conversations</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  aria-pressed={pinned}
                  onClick={togglePin}
                  title={pinned ? "Unpin sidebar" : "Pin sidebar"}
                  className="p-2 rounded-md hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                >
                  {pinned ? <Pin className="w-4 h-4 text-indigo-300" /> : <PinOff className="w-4 h-4 text-gray-300" />}
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-3">
              <label className="sr-only">Search projects</label>
              <div className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search projects or chats"
                  className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Projects list */}
            <div className="flex-1 overflow-y-auto -mx-4 px-4 py-2">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-9 rounded-md bg-gradient-to-r from-gray-800 to-gray-750 animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-xs text-gray-400">No projects found — create one to get started.</div>
              ) : (
                <ul className="space-y-2">
                  {filtered.map((project) => (
                    <li key={project.id}>
                      <button
                        onClick={() => router.push(`/project/${project.id}`)}
                        className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-md hover:bg-white/6 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-600 to-pink-600 flex items-center justify-center text-xs font-semibold text-white">
                            {project.title?.slice(0, 2).toUpperCase() || "P"}
                          </div>
                          <div className="flex flex-col text-sm">
                            <span className="text-gray-100">{project.title || "Untitled Project"}</span>
                            <span className="text-xs text-gray-500">{/* optional subtitle */}</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400">›</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
