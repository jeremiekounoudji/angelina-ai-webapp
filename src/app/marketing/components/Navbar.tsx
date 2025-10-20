"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, company, loading, signOut } = useAuth();
  const { t } = useTranslationNamespace('marketing.header');

  const navItems = [
    { label: t('links.home'), href: "#home" },
    { label: t('links.features'), href: "#features" },
    { label: t('links.howItWorks'), href: "#how-it-works" },
    { label: t('links.pricing'), href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800 ${className}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <motion.div
              className="text-2xl font-bold text-white"
              whileHover={{ scale: 1.05 }}
            >
              {t('logo')}
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-600 rounded-full"></div>
            ) : user ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform"
                    name={user.user_metadata?.full_name || user.email || 'User'}
                    size="sm"
                    src={company?.avatar_url}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold">{user.email}</p>
                  </DropdownItem>
                  <DropdownItem key="dashboard" onPress={() => router.push("/dashboard")}>
                    Dashboard
                  </DropdownItem>
                  <DropdownItem key="settings" onPress={() => router.push("/dashboard/company")}>
                    Settings
                  </DropdownItem>
                  <DropdownItem key="logout" color="danger" onPress={signOut}>
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <>
                <Button
                  className="text-gray-300 hover:text-white bg-transparent border border-gray-600 hover:border-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                  onPress={() => router.push("/login")}
                >
                  {t('links.login')}
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
                  onPress={() => router.push("/register")}
                >
                  {t('cta')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/95 rounded-lg mt-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium w-full text-left transition-colors duration-200"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-gray-300 text-sm">
                      {user.user_metadata?.full_name || user.email}
                    </div>
                    <Button
                      className="text-gray-300 hover:text-white bg-transparent border border-gray-600 hover:border-white font-medium px-4 py-2 rounded-lg w-full transition-colors duration-200"
                      onPress={() => router.push("/dashboard")}
                    >
                      Dashboard
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg w-full transition-colors duration-200"
                      onPress={signOut}
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="text-gray-300 hover:text-white bg-transparent border border-gray-600 hover:border-white font-medium px-4 py-2 rounded-lg w-full transition-colors duration-200"
                      onPress={() => router.push("/login")}
                    >
                      {t('links.login')}
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg w-full transition-colors duration-200"
                      onPress={() => router.push("/register")}
                    >
                      {t('cta')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
