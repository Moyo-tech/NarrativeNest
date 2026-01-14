"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit3,
  FiSettings,
  FiMenu,
  FiX,
  FiChevronRight,
  // FiHome,  // Disabled - home redirects to editor
  // FiFilm,  // Disabled - visualize page on standby
} from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import { useDistractionFree } from "@/context/DistractionFreeContext";
import {
  spring,
  fadeIn,
  slideRight,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import Image from "next/image";

interface ShellProps {
  children: ReactNode;
}

const navigation = [
  { name: "Editor", href: "/editor", icon: FiEdit3 },
  { name: "Settings", href: "/settings", icon: FiSettings },
  // Temporarily disabled - to be worked on later:
  // { name: 'Visualize', href: '/newvisualise', icon: FiFilm },
];

// Animation variants
const sidebarVariants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      ...spring.gentle,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const navItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

export default function Shell({ children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const { isDistractionFree } = useDistractionFree();
  const prefersReducedMotion = useReducedMotion();

  // Determine if sidebar should be visible
  const showSidebar = !isDistractionFree && (!isMobile || sidebarOpen);

  return (
    <div className="min-h-screen bg-primary-950">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            variants={prefersReducedMotion ? {} : backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {showSidebar && (
          <motion.aside
            variants={
              prefersReducedMotion ? {} : isMobile ? sidebarVariants : undefined
            }
            initial={isMobile ? "hidden" : false}
            animate="visible"
            exit={isMobile ? "exit" : undefined}
            className={`
              fixed top-0 left-0 h-screen w-64 glass-panel border-r border-primary-700/30 z-50
              ${!isMobile && "lg:translate-x-0"}
            `}
          >
            <div className="flex flex-col h-full p-4">
              {/* Logo */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ...spring.snappy }}
                className="flex items-center justify-between mb-8"
              >
                <Link href="/" className="flex items-center group">
                  <Image
                    src="/favicon-white.png"
                    alt="Logo"
                    width={70}
                    height={70}
                  />
                  <div>
                    <h1 className="text-xl font-bold text-white group-hover:text-accent-300 transition-colors">
                      NarrativeNest
                    </h1>
                    <p className="text-xs text-neutral-400">
                      Nollywood Stories
                    </p>
                  </div>
                </Link>
                {isMobile && (
                  <motion.button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-primary-800 lg:hidden transition-colors duration-200"
                    whileHover={
                      prefersReducedMotion ? {} : { scale: 1.1, rotate: 90 }
                    }
                    whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                    transition={spring.snappy}
                  >
                    <FiX className="h-5 w-5" />
                  </motion.button>
                )}
              </motion.div>

              {/* Navigation */}
              <motion.nav
                className="flex-1 space-y-2"
                variants={prefersReducedMotion ? {} : staggerContainer}
                initial="initial"
                animate="animate"
              >
                {navigation.map((item, index) => {
                  const isActive =
                    pathname === item.href ||
                    pathname?.startsWith(item.href + "/");
                  return (
                    <motion.div
                      key={item.name}
                      variants={prefersReducedMotion ? {} : navItemVariants}
                      custom={index}
                    >
                      <Link
                        href={item.href}
                        onClick={() => isMobile && setSidebarOpen(false)}
                      >
                        <motion.div
                          className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors ${
                            isActive
                              ? "bg-gradient-to-r from-accent-700/20 to-accent-600/10 text-white border border-accent-600/30"
                              : "text-neutral-300 hover:bg-primary-800 hover:text-white"
                          }`}
                          whileHover={
                            prefersReducedMotion ? {} : { x: 4, scale: 1.01 }
                          }
                          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                          transition={spring.snappy}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={spring.snappy}
                                className="ml-auto"
                              >
                                <FiChevronRight className="h-4 w-4" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.nav>

              {/* Footer */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-4 border-t border-primary-700/30"
              >
                <div className="text-xs text-neutral-500 text-center">
                  Made for Nollywood
                </div>
              </motion.div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div
        className={`flex flex-col h-screen overflow-hidden ${
          !isDistractionFree && "lg:pl-64"
        }`}
      >
        {/* Top header */}
        <motion.header
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...spring.gentle }}
          className="sticky top-0 z-30 glass-panel border-b border-primary-700/30 px-4 lg:px-6 py-4 flex-shrink-0"
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-primary-800 lg:hidden transition-colors duration-200"
              whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              transition={spring.snappy}
            >
              <FiMenu className="h-6 w-6" />
            </motion.button>

            {/* Breadcrumb placeholder */}
            <div className="flex-1">
              {/* Pages can add breadcrumbs here via context if needed */}
            </div>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
