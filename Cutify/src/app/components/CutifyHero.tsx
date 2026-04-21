import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';

// ━━━ SVG PANDAS ━━━

const PandaSitting = ({ className = '', hovered = false, blink = false }: { className?: string; hovered?: boolean; blink?: boolean }) => (
  <svg viewBox="0 0 200 220" className={className} fill="none">
    <ellipse cx="100" cy="210" rx="55" ry="8" fill="rgba(0,0,0,0.07)"/>
    <ellipse cx="100" cy="155" rx="52" ry="48" fill="white" stroke="#2d2d2d" strokeWidth="1.5"/>
    <ellipse cx="100" cy="160" rx="32" ry="30" fill="#f5f5f5"/>
    <circle cx="100" cy="88" r="42" fill="white" stroke="#2d2d2d" strokeWidth="1.5"/>
    <circle cx="66" cy="55" r="17" fill="#2d2d2d"/><circle cx="134" cy="55" r="17" fill="#2d2d2d"/>
    <circle cx="66" cy="55" r="9" fill="#e88ca5"/><circle cx="134" cy="55" r="9" fill="#e88ca5"/>
    <ellipse cx="80" cy="86" rx="15" ry="13" fill="#2d2d2d" transform="rotate(-8 80 86)"/>
    <ellipse cx="120" cy="86" rx="15" ry="13" fill="#2d2d2d" transform="rotate(8 120 86)"/>
    {blink ? (
      <><path d="M73 85 Q80 80 87 85" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M113 85 Q120 80 127 85" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></>
    ) : (
      <><circle cx="80" cy="85" r="7" fill="white"/><circle cx="120" cy="85" r="7" fill="white"/>
      <circle cx="82" cy="84" r="3.5" fill="#2d2d2d"/><circle cx="122" cy="84" r="3.5" fill="#2d2d2d"/>
      <circle cx="84" cy="82" r="1.8" fill="white"/><circle cx="124" cy="82" r="1.8" fill="white"/></>
    )}
    <ellipse cx="100" cy="97" rx="5.5" ry="3.8" fill="#2d2d2d"/>
    <path d="M93 102 Q100 110 107 102" stroke="#2d2d2d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="66" cy="98" r={hovered?9:7} fill="#FFB6C1" opacity={hovered?0.8:0.5}/>
    <circle cx="134" cy="98" r={hovered?9:7} fill="#FFB6C1" opacity={hovered?0.8:0.5}/>
    <ellipse cx="56" cy="145" rx="15" ry="22" fill="#2d2d2d" transform="rotate(12 56 145)"/>
    <ellipse cx="144" cy="145" rx="15" ry="22" fill="#2d2d2d" transform="rotate(-12 144 145)"/>
    <ellipse cx="76" cy="195" rx="19" ry="11" fill="#2d2d2d"/><ellipse cx="124" cy="195" rx="19" ry="11" fill="#2d2d2d"/>
    <ellipse cx="76" cy="197" rx="9" ry="5.5" fill="#e88ca5" opacity="0.5"/><ellipse cx="124" cy="197" rx="9" ry="5.5" fill="#e88ca5" opacity="0.5"/>
    {hovered && <path d="M145 55 C145 48 155 42 160 50 C165 42 175 48 175 55 C175 68 160 75 160 75 C160 75 145 68 145 55Z" fill="#ff6b9d" opacity="0.9"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-8;0,0" dur="1.2s" repeatCount="indefinite"/></path>}
  </svg>
);

const PandaWaving = ({ className = '', hovered = false, blink = false }: { className?: string; hovered?: boolean; blink?: boolean }) => (
  <svg viewBox="0 0 220 220" className={className} fill="none">
    <ellipse cx="100" cy="210" rx="50" ry="7" fill="rgba(0,0,0,0.07)"/>
    <ellipse cx="100" cy="158" rx="50" ry="45" fill="white" stroke="#2d2d2d" strokeWidth="1.5"/>
    <ellipse cx="100" cy="162" rx="30" ry="27" fill="#f5f5f5"/>
    <circle cx="100" cy="90" r="40" fill="white" stroke="#2d2d2d" strokeWidth="1.5"/>
    <circle cx="68" cy="58" r="16" fill="#2d2d2d"/><circle cx="132" cy="58" r="16" fill="#2d2d2d"/>
    <circle cx="68" cy="58" r="8" fill="#e88ca5"/><circle cx="132" cy="58" r="8" fill="#e88ca5"/>
    <ellipse cx="82" cy="88" rx="14" ry="12" fill="#2d2d2d" transform="rotate(-8 82 88)"/>
    <ellipse cx="118" cy="88" rx="14" ry="12" fill="#2d2d2d" transform="rotate(8 118 88)"/>
    {blink ? (
      <><path d="M75 87 Q82 82 89 87" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M111 87 Q118 82 125 87" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></>
    ) : (
      <><path d="M74 86 Q82 78 90 86" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M110 86 Q118 78 126 86" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>
    )}
    <ellipse cx="100" cy="98" rx="5" ry="3.2" fill="#2d2d2d"/>
    <path d="M90 103 Q100 114 110 103" stroke="#2d2d2d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="68" cy="100" r={hovered?8:6.5} fill="#FFB6C1" opacity={hovered?0.8:0.5}/>
    <circle cx="132" cy="100" r={hovered?8:6.5} fill="#FFB6C1" opacity={hovered?0.8:0.5}/>
    <ellipse cx="56" cy="148" rx="14" ry="21" fill="#2d2d2d" transform="rotate(12 56 148)"/>
    <g><ellipse cx="162" cy="98" rx="14" ry="21" fill="#2d2d2d" transform="rotate(-45 162 98)">
      <animateTransform attributeName="transform" type="rotate" values="-45 162 98;-35 162 98;-55 162 98;-45 162 98" dur="0.8s" repeatCount="indefinite"/>
    </ellipse></g>
    <ellipse cx="78" cy="196" rx="18" ry="10" fill="#2d2d2d"/><ellipse cx="122" cy="196" rx="18" ry="10" fill="#2d2d2d"/>
    {hovered && <><path d="M148 40 C148 34 156 29 160 36 C164 29 172 34 172 40 C172 50 160 56 160 56 C160 56 148 50 148 40Z" fill="#ff6b9d" opacity="0.85"><animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite"/></path></>}
  </svg>
);

// ━━━ EFFECTS ━━━

const Sparkle = ({ x, y, size, delay, dur }: { x: number; y: number; size: number; delay: number; dur: number }) => (
  <motion.div className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}
    animate={{ scale: [0,1,0], opacity: [0,1,0], rotate: [0,180,360] }}
    transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}>
    <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="white" fillOpacity="0.9"/></svg>
  </motion.div>
);

const Petal = ({ x, delay, dur, size, rot, color, id }: { x: number; delay: number; dur: number; size: number; rot: number; color: string; id: number }) => (
  <motion.div className="absolute pointer-events-none will-change-transform" style={{ left: `${x}%` }}
    initial={{ y: -40, opacity: 0, rotate: 0, x: 0 }}
    animate={{ y: '110vh', opacity: [0,0.85,0.85,0.5,0], rotate: rot, x: [0,25,-15,35,0] }}
    transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear' }}>
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs><radialGradient id={`pg${id}`} cx="40%" cy="30%"><stop offset="0%" stopColor="white" stopOpacity="0.6"/><stop offset="100%" stopColor={color} stopOpacity="0.85"/></radialGradient></defs>
      <ellipse cx="12" cy="12" rx="6" ry="10" fill={`url(#pg${id})`} transform="rotate(25 12 12)"/>
    </svg>
  </motion.div>
);

const Cloud = ({ x, y, s, d, sp }: { x: number; y: number; s: number; d: number; sp: number }) => (
  <motion.div className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%`, scale: s }}
    initial={{ opacity: 0, x: -80 }} animate={{ opacity: 0.55, x: [0,40,0] }}
    transition={{ opacity: { delay: d, duration: 2 }, x: { duration: sp, repeat: Infinity, ease: 'easeInOut' } }}>
    <svg width="200" height="80" viewBox="0 0 200 80" fill="none">
      <ellipse cx="100" cy="50" rx="80" ry="28" fill="white" opacity="0.7"/>
      <ellipse cx="65" cy="42" rx="50" ry="22" fill="white" opacity="0.8"/>
      <ellipse cx="140" cy="45" rx="45" ry="20" fill="white" opacity="0.75"/>
      <ellipse cx="100" cy="38" rx="55" ry="24" fill="white" opacity="0.9"/>
    </svg>
  </motion.div>
);

const SunBeams = () => (
  <motion.div className="absolute inset-0 pointer-events-none overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ delay: 1, duration: 2 }}>
    {[15,35,55,75].map((p,i) => (
      <motion.div key={i} className="absolute top-0 origin-top" style={{ left: `${p}%`, width: 3, height: '100%', background: 'linear-gradient(180deg,rgba(255,223,100,0.4) 0%,transparent 70%)', transform: `rotate(${-15+i*8}deg)` }}
        animate={{ opacity: [0.1,0.3,0.1] }} transition={{ duration: 4+i, repeat: Infinity, ease: 'easeInOut', delay: i*0.5 }}/>
    ))}
  </motion.div>
);

const Branch = ({ side }: { side: 'left'|'right' }) => (
  <div className={`absolute top-0 ${side==='left'?'left-0 -scale-x-100':'right-0'} w-52 md:w-80 pointer-events-none`}>
    <motion.div initial={{ opacity: 0, x: side==='left'?-60:60 }} animate={{ opacity: 0.7, x: 0 }} transition={{ duration: 2, delay: 0.5 }}>
      <svg viewBox="0 0 300 280" fill="none">
        <path d="M300 0 Q240 70 190 90 Q150 110 130 145 Q110 175 80 190" stroke="#94735a" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M190 90 Q165 65 148 78" stroke="#94735a" strokeWidth="2.5" fill="none"/><path d="M155 115 Q132 88 118 100" stroke="#94735a" strokeWidth="2" fill="none"/>
        {[{cx:190,cy:85},{cx:150,cy:72},{cx:162,cy:108},{cx:130,cy:140},{cx:120,cy:95},{cx:100,cy:170},{cx:85,cy:188}].map((p,i) => (
          <g key={i}><circle cx={p.cx} cy={p.cy} r="11" fill="#FFB6C1" opacity="0.75"/>
          <circle cx={p.cx-9} cy={p.cy-4} r="9" fill="#FFC0CB" opacity="0.65"/>
          <circle cx={p.cx+9} cy={p.cy-4} r="9" fill="#FFD1DC" opacity="0.65"/>
          <circle cx={p.cx} cy={p.cy} r="4.5" fill="#FFD700" opacity="0.75"/></g>
        ))}
      </svg>
    </motion.div>
  </div>
);

// ━━━ MAIN COMPONENT ━━━

const DAY_BG = 'linear-gradient(160deg,#fce4ec 0%,#f3e5f5 15%,#e8eaf6 30%,#e0f7fa 50%,#fff9c4 70%,#fce4ec 100%)';
const PETAL_COLORS = ['#FFB6C1','#FFC0CB','#FFD1DC','#E8B4CB','#F4C2D7','#FADADD','#f8bbd0'];

export const CutifyHero: React.FC = () => {
  const [hover, setHover] = useState<number|null>(null);
  const [blink, setBlink] = useState(false);

  const sparkles = useMemo(() => Array.from({ length: 18 }, (_, i) => ({ id: i, x: Math.random()*100, y: Math.random()*100, size: 8+Math.random()*16, delay: Math.random()*5, dur: 2+Math.random()*3 })), []);
  const petals = useMemo(() => Array.from({ length: 20 }, (_, i) => ({ id: i, x: Math.random()*100, delay: Math.random()*10, dur: 12+Math.random()*14, size: 14+Math.random()*18, rot: Math.random()*720-360, color: PETAL_COLORS[i%7] })), []);
  const clouds = useMemo(() => [{ x:-5,y:5,s:1.2,d:0.3,sp:25 },{ x:60,y:8,s:0.9,d:0.5,sp:30 },{ x:20,y:18,s:0.7,d:0.8,sp:22 }], []);

  // Blink
  useEffect(() => {
    const i = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 200); }, 3000+Math.random()*2000);
    return () => clearInterval(i);
  }, []);

  return (
    <motion.section className="relative w-full min-h-[90vh] md:min-h-[95vh] rounded-3xl overflow-hidden shadow-2xl"
      style={{ background: DAY_BG }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>

      {/* Animated BG shimmer */}
      <motion.div className="absolute inset-0" style={{ background: 'linear-gradient(45deg,rgba(248,187,208,0.25),rgba(225,190,231,0.15),rgba(187,222,251,0.25))', backgroundSize: '400% 400%' }}
        animate={{ backgroundPosition: ['0% 50%','100% 50%','0% 50%'] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}/>

      {/* Decorations */}
      {clouds.map((c,i) => <Cloud key={i} {...c}/>)}
      {petals.map(p => <Petal key={p.id} {...p}/>)}
      {sparkles.map(s => <Sparkle key={s.id} {...s}/>)}
      <Branch side="left"/><Branch side="right"/>
      <SunBeams/>

      {/* Daisies */}
      {[{x:'10%',y:'75%',sz:32,d:.3},{x:'22%',y:'82%',sz:24,d:.5},{x:'78%',y:'78%',sz:28,d:.4},{x:'88%',y:'72%',sz:22,d:.7},{x:'45%',y:'88%',sz:20,d:.9},{x:'58%',y:'83%',sz:26,d:.6}].map((f,i) => (
        <motion.div key={`dy${i}`} className="absolute pointer-events-none" style={{ left: f.x, top: f.y }}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.85 }} transition={{ delay: f.d+0.5, duration: 0.7, ease: [0.34,1.56,0.64,1] }}>
          <motion.div animate={{ rotate: [0,8,-8,0], scale: [1,1.08,1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: i*0.4 }}>
            <svg width={f.sz} height={f.sz} viewBox="0 0 30 30">{[0,45,90,135,180,225,270,315].map(a => <ellipse key={a} cx="15" cy="15" rx="4.5" ry="9" fill="white" opacity="0.9" transform={`rotate(${a} 15 15)`}/>)}<circle cx="15" cy="15" r="4.5" fill="#FFD700"/></svg>
          </motion.div>
        </motion.div>
      ))}

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[10%] pointer-events-none" style={{ background: 'linear-gradient(180deg,transparent,rgba(200,230,200,0.35))' }}/>

      {/* ━━━ BANNER CONTENT ━━━ */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] md:min-h-[95vh] px-6 text-center">
        <motion.h2 className="font-pacifico text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6"
          style={{ background: 'linear-gradient(135deg,#d94f8a,#b05cc5,#6fa8dc,#d94f8a)',
            backgroundSize: '300% 300%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(217,79,138,0.5))' }}
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0, backgroundPosition: ['0% 50%','100% 50%','0% 50%'] }}
          transition={{ opacity: { duration: 1, delay: 0.4 }, y: { duration: 1, delay: 0.4 }, backgroundPosition: { duration: 6, repeat: Infinity, ease: 'linear' } }}>
          Welcome to Cutify
        </motion.h2>

        <motion.p className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed text-[#6b5a6e] font-medium"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1 }}>
          Discover the most adorable collection of kawaii accessories, gifts & decor.
          <br/><span className="text-[#d94f8a] font-semibold">Everything cute, all in one place 🎀</span>
        </motion.p>

        <motion.button className="px-12 py-4 rounded-full text-white font-semibold text-lg shadow-xl cursor-pointer border-0"
          style={{ background: 'linear-gradient(135deg,#f48fb1,#ce93d8,#90caf9)', backgroundSize: '200% 200%' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, backgroundPosition: ['0% 50%','100% 50%','0% 50%'] }}
          transition={{ opacity: { delay: 1.2, duration: 0.8 }, y: { delay: 1.2, duration: 0.8 }, backgroundPosition: { duration: 4, repeat: Infinity, ease: 'linear' } }}
          whileHover={{ scale: 1.08, boxShadow: '0 20px 50px rgba(244,143,177,0.45)' }} whileTap={{ scale: 0.96 }}>
          Shop Now ✨
        </motion.button>

        <motion.div className="mt-12 flex gap-6 md:gap-10 flex-wrap justify-center"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 1 }}>
          {[{ icon: '🧸', label: 'Cute Toys', count: '200+' },{ icon: '🎀', label: 'Accessories', count: '150+' },{ icon: '🌸', label: 'Kawaii Decor', count: '100+' }].map((item, i) => (
            <motion.div key={i} className="px-6 py-4 rounded-2xl text-center cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 8px 32px rgba(244,143,177,0.15)' }}
              whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.98 }}>
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-semibold text-sm text-[#4a3f4e]">{item.label}</div>
              <div className="text-xs mt-1 text-[#d94f8a] font-medium">{item.count}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ━━━ 3 PANDAS ━━━ */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-between items-end px-4 md:px-14 pointer-events-none z-20">
        {/* Left panda */}
        <motion.div className="w-24 md:w-32 pointer-events-auto cursor-pointer"
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1, ease: [0.34,1.56,0.64,1] }}
          onMouseEnter={() => setHover(0)} onMouseLeave={() => setHover(null)}>
          <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <PandaSitting className="w-full drop-shadow-lg" hovered={hover===0} blink={blink}/>
          </motion.div>
        </motion.div>

        {/* Center panda */}
        <motion.div className="w-20 md:w-28 pointer-events-auto cursor-pointer"
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1, ease: [0.34,1.56,0.64,1] }}
          onMouseEnter={() => setHover(1)} onMouseLeave={() => setHover(null)}>
          <motion.div animate={{ y: [0,-10,0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
            <PandaSitting className="w-full drop-shadow-lg" hovered={hover===1} blink={blink}/>
          </motion.div>
        </motion.div>

        {/* Right panda */}
        <motion.div className="w-24 md:w-32 pointer-events-auto cursor-pointer"
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 1, ease: [0.34,1.56,0.64,1] }}
          onMouseEnter={() => setHover(2)} onMouseLeave={() => setHover(null)}>
          <motion.div animate={{ y: [0,-6,0], rotate: [0,2,-2,0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
            <PandaWaving className="w-full drop-shadow-lg" hovered={hover===2} blink={blink}/>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};
