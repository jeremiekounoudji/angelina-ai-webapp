'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslationNamespace } from '@/contexts/TranslationContext';
import { staggerContainer, staggerItem } from '@/utils/animations';

// Instagram SVG
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

// Facebook SVG
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

// TikTok SVG
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
    </svg>
  );
}

export default function Footer() {
  const { t } = useTranslationNamespace('marketing.footer');
  const router = useRouter();

  const scrollOrNavigate = (href: string) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Not on the right page — go to marketing-status with hash
        router.push(`/marketing-status${href}`);
      }
    } else {
      router.push(href);
    }
  };

  const quickLinks = [
    { label: t('links.home') as string,     href: '#home' },
    { label: t('links.features') as string, href: '#features' },
    { label: t('links.pricing') as string,  href: '#pricing' },
    { label: t('links.howItWorks') as string, href: '#how-it-works' },
  ];

  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/aangelina_ai?igsh=MXNoeDE2Y3pudmM5Mw==',
      icon: InstagramIcon,
      hoverColor: 'hover:bg-pink-600',
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/profile.php?id=61578489441997',
      icon: FacebookIcon,
      hoverColor: 'hover:bg-blue-600',
    },
    {
      label: 'TikTok',
      href: 'https://www.tiktok.com/@aangelina.ai?_r=1&_t=ZS-94izzbACMce',
      icon: TikTokIcon,
      hoverColor: 'hover:bg-gray-600',
    },
  ];

  return (
    <footer className="text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
          >
            {/* Company info */}
            <div className="md:col-span-2">
              <Image
                src="/angelina-logo-full.png"
                alt="Aangelina AI"
                width={200}
                height={100}
                className="object-contain mb-4"
              />
              <p className="text-gray-400 mb-6 max-w-md">
                {t('tagline') as string}
              </p>

              {/* Social links */}
              <div className="flex space-x-3">
                {socialLinks.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center transition-colors ${s.hoverColor}`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('links.quickLinks') as string}</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <button
                      onClick={() => scrollOrNavigate(link.href)}
                      className="text-gray-400 hover:text-white transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('links.legal') as string}</h4>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">{t('links.privacy') as string}</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">{t('links.terms') as string}</a></li>
              </ul>
            </div>
          </motion.div>

          {/* Bottom */}
          <motion.div
            variants={staggerItem}
            className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div className="text-gray-400 text-sm">{t('copyright') as string}</div>
            <div className="flex space-x-6 text-sm">
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">{t('links.terms') as string}</a>
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">{t('links.privacy') as string}</a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}

