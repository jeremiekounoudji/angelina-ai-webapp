# Angelina AI - WhatsApp Restaurant Management Agent

![Angelina AI](https://img.shields.io/badge/Angelina%20AI-WhatsApp%20Agent-green?style=for-the-badge&logo=whatsapp)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 Overview

Angelina AI is a revolutionary WhatsApp-based AI agent designed specifically for restaurant management. It automates key restaurant operations including ordering, inventory management, and complaint handling, helping restaurants streamline their operations and provide exceptional customer service.

## ✨ Features

### 🤖 Core AI Capabilities
- **Automated Ordering**: Takes customer orders via WhatsApp with intelligent menu presentation
- **Smart Inventory Management**: Real-time stock monitoring and automatic updates
- **Complaint Handling**: Intelligent complaint analysis with automatic resolution suggestions
- **Delivery Coordination**: Optimized delivery scheduling based on location and urgency

### 🎨 Modern Web Interface
- **Responsive Design**: Mobile-first approach with beautiful animations
- **Multi-language Support**: French and English localization
- **Interactive Animations**: Framer Motion powered smooth transitions
- **Typing Animation**: Dynamic text animation showcasing core features
- **Modern UI Components**: Built with HeroUI and Tailwind CSS

### 📱 WhatsApp Integration
- **Seamless Communication**: Direct WhatsApp integration for customer interactions
- **QR Code Generation**: Easy sharing with customers via QR codes
- **Marketplace Mode**: Network of restaurant agents for broader reach

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: HeroUI
- **Animations**: Framer Motion
- **Icons**: Custom SVG icons and React Country Flag
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jeremiekounoudji/angelina-ai-webapp.git
   cd angelina-ai-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) (or the port shown in terminal)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── marketing/         # Marketing landing page
│   │   └── components/    # Marketing page components
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects to marketing)
├── components/            # Reusable components
│   └── icons/            # Custom icon components
├── data/                 # Static data and content
├── hooks/                # Custom React hooks
│   ├── useTranslation.ts # i18n hook
│   └── useTypingAnimation.ts # Typing animation hook
├── interfaces/           # TypeScript interfaces
├── locales/             # Translation files
├── types/               # Type definitions
└── utils/               # Utility functions
    ├── animations.ts    # Framer Motion variants
    └── constants.ts     # App constants
```

## 🌍 Internationalization

The app supports multiple languages:
- **French** (default)
- **English**

Language switching is available in the header component.

## 🎨 Key Components

### Hero Section
- Dynamic typing animation showcasing core features
- Responsive design with smooth animations
- Call-to-action buttons

### Features Section
- Interactive feature cards
- Hover animations and effects
- Detailed feature descriptions

### Testimonials
- Customer testimonials with ratings
- Responsive grid layout
- Smooth reveal animations

### FAQ Section
- Expandable FAQ items
- Smooth accordion animations
- Comprehensive Q&A

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Manual Deployment
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@angelina-ai.com or join our WhatsApp community.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [Coming Soon]
- **API Reference**: [Coming Soon]

---

Made with ❤️ by the Angelina AI Team