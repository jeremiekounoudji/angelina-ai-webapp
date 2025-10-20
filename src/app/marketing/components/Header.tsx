'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslationNamespace } from '@/contexts/TranslationContext';
import { fadeIn, fadeInLeft, fadeInRight } from '@/utils/animations';
import { Popover, PopoverTrigger, PopoverContent, Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import ReactCountryFlag from 'react-country-flag';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { t, locale, setLocale } = useTranslationNamespace('marketing.header');
  const { user, company, loading, signOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMenuOpen(false);
  };

  const handleLanguageChange = (newLocale: 'fr' | 'en') => {
    setLocale(newLocale);
  };

  return (
    <motion.header
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-green-500/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            variants={fadeInLeft}
            className="flex-shrink-0"
          >
            <h1 className="text-2xl font-bold text-white">
              {t('logo')}
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            variants={fadeIn}
            className="hidden md:flex space-x-8"
          >
            <button 
              onClick={() => scrollToSection('#home')}
              className="text-gray-300 hover:text-green-400 transition-all duration-300 hover:scale-105"
            >
              {t('links.home')}
            </button>
            <button 
              onClick={() => scrollToSection('#features')}
              className="text-gray-300 hover:text-green-400 transition-all duration-300 hover:scale-105"
            >
              {t('links.features')}
            </button>
            <button 
              onClick={() => scrollToSection('#how-it-works')}
              className="text-gray-300 hover:text-green-400 transition-all duration-300 hover:scale-105"
            >
              {t('links.howItWorks')}
            </button>
            <button 
              onClick={() => scrollToSection('#pricing')}
              className="text-gray-300 hover:text-green-400 transition-all duration-300 hover:scale-105"
            >
              {t('links.pricing')}
            </button>
            <button 
              onClick={() => scrollToSection('#contact')}
              className="text-gray-300 hover:text-green-400 transition-all duration-300 hover:scale-105"
            >
              Contact
            </button>
          </motion.nav>

          {/* Right side actions */}
          <motion.div
            variants={fadeInRight}
            className="flex items-center space-x-4"
          >
            {/* Language selector with popover */}
            <Popover placement="bottom-end" showArrow>
              <PopoverTrigger>
                <Button
                  variant="ghost"
                  className="min-w-0 p-2 bg-transparent hover:bg-gray-800/50"
                >
                  <ReactCountryFlag
                    countryCode={locale === 'fr' ? 'FR' : 'US'}
                    svg
                    style={{
                      width: '24px',
                      height: '18px',
                    }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-gray-900 border border-gray-700">
                <div className="flex flex-col gap-2 p-2">
                  <Button
                    variant="ghost"
                    className="justify-start text-white hover:bg-gray-800"
                    onClick={() => handleLanguageChange('fr')}
                    startContent={
                      <ReactCountryFlag
                        countryCode="FR"
                        svg
                        style={{
                          width: '20px',
                          height: '15px',
                        }}
                      />
                    }
                  >
                    Français
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-white hover:bg-gray-800"
                    onClick={() => handleLanguageChange('en')}
                    startContent={
                      <ReactCountryFlag
                        countryCode="US"
                        svg
                        style={{
                          width: '20px',
                          height: '15px',
                        }}
                      />
                    }
                  >
                    English
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Login/Signup buttons or User Menu */}
            <div className="hidden md:flex items-center space-x-3">
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
                  <button
                    onClick={() => router.push("/login")}
                    className="text-gray-300 hover:text-green-400 transition-colors"
                  >
                    {t('links.login')}
                  </button>
                  <button
                    onClick={() => router.push("/register")}
                    className="bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-2 rounded-full hover:from-green-400 hover:to-green-300 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-400/40"
                  >
                    {t('cta')}
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-green-400 hover:bg-gray-800"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-green-500/30"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button 
                onClick={() => scrollToSection('#home')}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-green-400 transition-all duration-300"
              >
                {t('links.home')}
              </button>
              <button 
                onClick={() => scrollToSection('#features')}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-green-400 transition-all duration-300"
              >
                {t('links.features')}
              </button>
              <button 
                onClick={() => scrollToSection('#how-it-works')}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-green-400 transition-all duration-300"
              >
                {t('links.howItWorks')}
              </button>
              <button 
                onClick={() => scrollToSection('#pricing')}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-green-400 transition-all duration-300"
              >
                {t('links.pricing')}
              </button>
              <button 
                onClick={() => scrollToSection('#contact')}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-green-400 transition-all duration-300"
              >
                Contact
              </button>
              <div className="pt-4 space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-gray-300 text-sm">
                      {user.user_metadata?.full_name || user.email}
                    </div>
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="block w-full text-left px-3 py-2 text-gray-300 hover:text-green-400"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={signOut}
                      className="block mx-3 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-center transition-all duration-300"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push("/login")}
                      className="block w-full text-left px-3 py-2 text-gray-300 hover:text-green-400"
                    >
                      {t('links.login')}
                    </button>
                    <button
                      onClick={() => router.push("/register")}
                      className="block mx-3 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-2 rounded-full text-center hover:from-green-400 hover:to-green-300 transition-all duration-300 shadow-lg shadow-green-500/25"
                    >
                      {t('cta')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
