import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircleIcon, 
  UsersIcon, 
  TrophyIcon, 
  ShieldIcon,
  SwordIcon,
  CrownIcon,
  PlayIcon,
  StarIcon,
  LockIcon,
  SmartphoneIcon,
  ZapIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TargetIcon
} from "lucide-react";

function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  const features = [
    {
      icon: <ShieldCheckIcon className="w-10 h-10" />,
      title: "Military-Grade Encryption",
      description: "End-to-end encrypted chats that even we can't read",
      color: "from-emerald-400 to-cyan-500",
      bgColor: "from-emerald-500/10 to-cyan-500/10",
      borderColor: "border-emerald-400/30",
      logo: "🔒"
    },
    {
      icon: <UsersIcon className="w-10 h-10" />,
      title: "Elite Squads",
      description: "Create warrior squads and coordinate with your team",
      color: "from-blue-400 to-indigo-500",
      bgColor: "from-blue-500/10 to-indigo-500/10",
      borderColor: "border-blue-400/30",
      logo: "⚔️"
    },
    {
      icon: <ZapIcon className="w-10 h-10" />,
      title: "Lightning Fast",
      description: "Instant message delivery with zero delays",
      color: "from-amber-300 to-orange-400",
      bgColor: "from-amber-500/10 to-orange-500/10",
      borderColor: "border-amber-400/30",
      logo: "⚡"
    },
    {
      icon: <CrownIcon className="w-10 h-10" />,
      title: "Premium Features",
      description: "All features unlocked for every warrior",
      color: "from-purple-400 to-pink-500",
      bgColor: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-400/30",
      logo: "👑"
    }
  ];

  const stats = [
    { number: "50+", label: "ACTIVE WARRIORS", icon: <SwordIcon className="w-4 h-4" /> },
    { number: "100%", label: "SECURE", icon: <LockIcon className="w-4 h-4" /> },
    { number: "24/7", label: "OPERATIONAL", icon: <TargetIcon className="w-4 h-4" /> },
    { number: "∞", label: "FREE", icon: <TrophyIcon className="w-4 h-4" /> }
  ];

  useEffect(() => {
    setIsVisible(true);
    
    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3500);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(featureInterval);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Parallax effect for background elements
  const parallaxStyle = {
    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
  };

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="w-full min-h-mobile-screen safe-area bg-gradient-to-br from-slate-900 via-slate-800/30 to-slate-900 overflow-auto relative">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic gradient orbs */}
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-amber-500/15 to-orange-500/15 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"
        />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
            className="absolute w-2 h-2 bg-slate-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Animated grid */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"
          style={parallaxStyle}
        />
      </div>

      <div className="relative z-10 w-full min-h-full flex flex-col">
        {/* Enhanced Header */}
        <motion.header 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex justify-between items-center p-4 sm:p-6 sticky top-0 bg-slate-900/90 backdrop-blur-xl z-50 border-b border-amber-500/20"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-75"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-amber-300/50 shadow-2xl">
                <SwordIcon className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                THUG SLAYERS
              </h1>
              <p className="text-amber-400 text-xs font-mono">SECURE MESSENGER</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/40 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <TrophyIcon className="w-4 h-4 text-amber-400" />
            </motion.div>
            <span className="text-amber-300 text-sm font-semibold">Free Forever</span>
          </motion.div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Hero Section */}
          <section ref={heroRef} className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center py-12 sm:py-20">
            {/* Animated Badge with Guild Members */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 1.5
              }}
              className="relative mb-8 sm:mb-12"
            >
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              
              {/* Main Badge Container */}
              <motion.div
                animate={floatingAnimation}
                className="relative w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-amber-300/50 shadow-2xl overflow-hidden"
              >
                {/* Guild Members Background */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 8, repeat: Infinity }}
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'url("/guild-members-squad1.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                
                {/* Badge Icon */}
                <motion.div
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative z-10"
                >
                  <img 
                    src="/thug-slayers-badge.png" 
                    alt="Thug Slayers Badge"
                    className="w-16 h-16 sm:w-24 sm:h-24 object-contain drop-shadow-2xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <SwordIcon className="w-16 h-16 sm:w-24 sm:h-24 text-white hidden drop-shadow-2xl" />
                </motion.div>

                {/* Animated Rings */}
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-6 border-2 border-amber-400/20 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-8 border-2 border-orange-400/15 rounded-full"
                />
              </motion.div>

              {/* Floating Elements Around Badge */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className={`absolute w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r ${features[i].color} rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg text-white`}
                  style={{
                    left: `${50 + 60 * Math.cos((i * Math.PI) / 2)}%`,
                    top: `${50 + 60 * Math.sin((i * Math.PI) / 2)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {features[i].icon}
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-8 sm:mb-12"
            >
              <motion.h1
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%'] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="text-5xl sm:text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                THUG SLAYERS
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xl sm:text-2xl text-slate-300 mb-3 font-light"
              >
                The Ultimate Secure Messenger
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-amber-400 text-lg sm:text-xl font-semibold flex items-center justify-center gap-2"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <SparklesIcon className="w-5 h-5" />
                </motion.span>
                For Warriors Who Value Privacy
              </motion.p>
            </motion.div>

            {/* Enhanced Animated Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="max-w-2xl w-full mx-auto mb-8 sm:mb-12 min-h-[100px]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 1.05 }}
                  transition={{ duration: 0.7, type: "spring" }}
                  className={`p-6 rounded-2xl backdrop-blur-lg border-2 bg-gradient-to-br ${features[currentFeature].bgColor} ${features[currentFeature].borderColor} shadow-2xl relative overflow-hidden`}
                >
                  {/* Side Logo/Emoji */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -left-4 -top-4 text-4xl opacity-20"
                  >
                    {features[currentFeature].logo}
                  </motion.div>
                  
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`p-3 rounded-xl bg-gradient-to-br ${features[currentFeature].color} bg-opacity-20 backdrop-blur-sm z-10`}
                    >
                      <div className="text-white">
                        {features[currentFeature].icon}
                      </div>
                    </motion.div>
                    <div className="text-left flex-1 z-10">
                      <h3 className={`font-bold text-lg sm:text-xl mb-2 bg-gradient-to-br ${features[currentFeature].color} bg-clip-text text-transparent`}>
                        {features[currentFeature].title}
                      </h3>
                      <p className="text-slate-300 text-sm sm:text-base">
                        {features[currentFeature].description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Enhanced Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
            >
              <Link to="/login" className="flex-1">
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    background: "linear-gradient(45deg, #f59e0b, #ea580c, #f59e0b)",
                    backgroundSize: "200% 200%"
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    backgroundPosition: ['0%', '100%', '0%']
                  }}
                  transition={{
                    backgroundPosition: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl hover:shadow-amber-500/30 text-base sm:text-lg relative overflow-hidden"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute -left-8 w-16 h-16 bg-white/20 rounded-full"
                  />
                  <PlayIcon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">JOIN THE BATTLE</span>
                </motion.button>
              </Link>
              
              <Link to="/signup" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-slate-800/50 backdrop-blur-sm text-amber-400 py-4 rounded-2xl font-bold border-2 border-amber-500/40 hover:border-amber-500/60 transition-all text-base sm:text-lg relative overflow-hidden"
                >
                  <span className="relative z-10">CREATE ACCOUNT</span>
                  <motion.div
                    animate={{ x: [-100, 100] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent"
                  />
                </motion.button>
              </Link>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-8 sm:mt-12 w-full max-w-2xl"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2 + index * 0.2 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-4 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-amber-500/20"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="text-amber-400">
                      {stat.icon}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-amber-400">
                      {stat.number}
                    </div>
                  </div>
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Enhanced Features Section */}
          <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-800/30 to-slate-900/50">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12 sm:mb-16"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-amber-400 mb-4">
                  Warrior-Grade Features
                </h2>
                <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto">
                  Built for those who demand the best in security and performance
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ 
                      scale: 1.02,
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                    className={`p-6 sm:p-8 rounded-3xl backdrop-blur-lg border-2 bg-gradient-to-br ${feature.bgColor} ${feature.borderColor} shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden`}
                  >
                    {/* Side Logo/Emoji */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="absolute -right-6 -bottom-6 text-6xl opacity-15"
                    >
                      {feature.logo}
                    </motion.div>

                    <div className="flex items-start gap-4 sm:gap-6">
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${feature.color} bg-opacity-20 backdrop-blur-sm z-10`}
                      >
                        <div className="text-white">
                          {feature.icon}
                        </div>
                      </motion.div>
                      <div className="flex-1 z-10">
                        <h3 className={`font-bold text-xl sm:text-2xl mb-3 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`}>
                          {feature.title}
                        </h3>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Enhanced CTA Section */}
          <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center relative z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                viewport={{ once: true }}
                className="inline-block mb-6"
              >
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider">
                  Join the Elite
                </div>
              </motion.div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-amber-400 mb-6">
                Ready to Command Your Communications?
              </h2>
              <p className="text-slate-300 text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of elite warriors who trust Thug Slayers for mission-critical secure messaging
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 sm:px-12 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-amber-500/30 transition-all text-lg relative overflow-hidden group"
                  >
                    <span className="relative z-10">START YOUR JOURNEY</span>
                    <motion.div
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                  </motion.button>
                </Link>
                
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-slate-800/50 backdrop-blur-sm text-amber-400 px-8 sm:px-12 py-4 rounded-2xl font-bold border-2 border-amber-500/40 hover:border-amber-500/60 hover:bg-amber-500/10 transition-all text-lg"
                  >
                    I'M A VETERAN
                  </motion.button>
                </Link>
              </div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 mt-8 text-slate-400"
              >
                <div className="flex items-center gap-2">
                  <ShieldIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">100% Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">No Hidden Fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm">Instant Setup</span>
                </div>
              </motion.div>
            </motion.div>
          </section>
        </div>

        {/* Enhanced Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="p-6 sm:p-8 text-center border-t border-amber-500/10 bg-slate-900/90 backdrop-blur-xl"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center"
                >
                  <SwordIcon className="w-4 h-4 text-white" />
                </motion.div>
                <span className="text-slate-400 text-lg">Developed & Maintained By:</span>
              </div>
              <motion.span
                whileHover={{ 
                  scale: 1.05, 
                  color: "#fbbf24",
                  textShadow: "0 0 20px rgba(251, 191, 36, 0.5)"
                }}
                className="text-amber-400 font-bold text-lg cursor-pointer"
              >
                Mohammed Ali
              </motion.span>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed"
            >
              Secure messaging crafted for the Thug Slayers community and warriors worldwide. 
              Your privacy is our battle cry.
            </motion.p>
            
            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.2 }}
              className="flex justify-center items-center gap-4 mt-4 text-slate-600"
            >
              <motion.div
                whileHover={{ scale: 1.1, color: "#f59e0b" }}
                className="cursor-pointer"
              >
                <StarIcon className="w-4 h-4" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, color: "#f59e0b" }}
                className="cursor-pointer"
              >
                <StarIcon className="w-4 h-4" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, color: "#f59e0b" }}
                className="cursor-pointer"
              >
                <StarIcon className="w-4 h-4" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, color: "#f59e0b" }}
                className="cursor-pointer"
              >
                <StarIcon className="w-4 h-4" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, color: "#f59e0b" }}
                className="cursor-pointer"
              >
                <StarIcon className="w-4 h-4" />
              </motion.div>
              <span className="text-slate-500 text-sm ml-2">Rated by 50+ Warriors</span>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default LandingPage;