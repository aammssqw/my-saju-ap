import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

const KAKAO_LINK = "https://open.kakao.com/o/smPIizgi";
const MASTER_PASSWORD = "7605";

type MenuType = 'NEW_YEAR' | 'TOJEONG' | 'AUTHENTIC' | 'TODAY' | 'TOMORROW' | 'SPECIFIC' | 'COMPATIBILITY' | 'TOTAL';

const MENU_LABELS: Record<MenuType, string> = {
  TOTAL: '2026 총평 리포트',
  NEW_YEAR: '신년운세',
  TOJEONG: '토정비결',
  AUTHENTIC: '정통사주',
  TODAY: '오늘의 운세',
  TOMORROW: '내일의 운세',
  SPECIFIC: '지정일 운세',
  COMPATIBILITY: '짝궁합'
};

const DdagimanLogo = ({ className = "w-32 h-32" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2" />
    <path d="M50 5C25.147 5 5 25.147 5 50C5 74.853 25.147 95 50 95C74.853 95 95 74.853 95 50" stroke="#f59e0b" strokeWidth="0.5" />
    <text x="50" y="45" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="900" fontFamily="serif">딱이만</text>
    <text x="50" y="65" textAnchor="middle" fill="#f59e0b" fontSize="22" fontWeight="900" fontFamily="serif">命</text>
    <path d="M30 75H70" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<MenuType | null>(null);
  const [sajuResult, setSajuResult] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [showExtraInput, setShowExtraInput] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '1995-01-01',
    time: '09:00',
    gender: 'MALE',
    targetDate: new Date().toISOString().split('T')[0],
    partnerDate: '1995-05-05',
    partnerTime: '12:00',
    partnerGender: 'FEMALE'
  });

  useEffect(() => { setIsLoaded(true); }, []);

  const handleMenuClick = (menu: MenuType) => {
    setCurrentMenu(menu);
    if (menu === 'SPECIFIC' || menu === 'COMPATIBILITY') {
      setShowExtraInput(true);
    } else {
      handleAnalyze(menu);
    }
  };

  const handlePrint = () => {
    // 모바일 브라우저의 window.print() 대응을 위한 트리거
    window.print();
  };

  const handleAnalyze = async (menu: MenuType) => {
    setIsLoading(true);
    setShowExtraInput(false);
    setIsUnlocked(false); 
    setUnlockCode('');
    
    try {
      const apiKey = process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey });

      let prompt = `사용자 정보: 생년월일 ${formData.date}, 시간 ${formData.time}, 성별 ${formData.gender}. `;
      if (menu === 'COMPATIBILITY') prompt += `상대방 정보: ${formData.partnerDate}, ${formData.partnerTime}, ${formData.partnerGender}. `;
      else if (menu === 'SPECIFIC') prompt += `조회일: ${formData.targetDate}. `;

      prompt += `메뉴: ${MENU_LABELS[menu]}. 
      [지침]
      1. 사주 풀이 내용은 각 섹션당 최소 15문장 이상의 매우 상세한 장문으로 작성하십시오.
      2. 전문가용 전문 용어(용신, 희신, 격국 등)를 섞어 권위 있게 작성하십시오.
      3. 어조는 20년 경력의 딱이만 선생 어조입니다.

      반드시 JSON 응답:
      {
        "title": "...",
        "hanja": "...",
        "keywords": ["#키워드1", "#키워드2", "#키워드3"],
        "elements": {"wood": 20, "fire": 20, "earth": 20, "metal": 20, "water": 20},
        "sections": [
          {"subtitle": "총평", "content": "...초장문..."},
          {"subtitle": "재물운", "content": "...초장문..."},
          {"subtitle": "직업/명예운", "content": "...초장문..."},
          {"subtitle": "애정/인연운", "content": "...초장문..."},
          {"subtitle": "건강/심리", "content": "...초장문..."}
        ]
      }`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "당신은 대한민국 최고의 운명학 거목 '딱이만'입니다. 모든 풀이는 방대하고 깊이가 있어야 합니다.",
          responseMimeType: "application/json",
          temperature: 0.8
        }
      });

      setSajuResult(JSON.parse(result.text || "{}"));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      alert("신기가 잠시 가려졌습니다. 다시 시도해주십시오.");
    } finally {
      setIsLoading(false);
    }
  };

  const ActionButtons = () => (
    <div className="no-print flex flex-col md:flex-row gap-6 w-full max-w-4xl px-4 mt-12 mb-20">
      <a href={KAKAO_LINK} target="_blank" className="flex-1 bg-amber-500 text-black py-7 rounded-[2.5rem] font-black text-center text-sm tracking-[0.3em] shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-all">💬 카카오톡 1:1 비밀상담</a>
      <button onClick={handlePrint} className="flex-1 bg-zinc-900 text-white py-7 rounded-[2.5rem] font-black text-sm tracking-[0.3em] border border-white/10 shadow-xl hover:bg-zinc-800 transition-all">📜 리포트 저장 (PDF/출력)</button>
      <button onClick={() => setSajuResult(null)} className="flex-1 bg-white/5 text-zinc-500 py-7 rounded-[2.5rem] text-sm font-black border border-white/5 hover:bg-white/10 transition-all">↩️ 새로운 사주 분석</button>
    </div>
  );

  if (!isLoaded) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 min-h-screen flex flex-col items-center overflow-x-hidden relative">
      {/* Master Activation Badge */}
      {isUnlocked && sajuResult && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[400] bg-amber-500 text-black px-8 py-3 rounded-full font-black text-xs tracking-[0.3em] shadow-[0_0_40px_rgba(245,158,11,0.6)] animate-pulse border-2 border-black no-print">
           딱이만 마스터 천기누설 모드 활성화 
        </div>
      )}

      {/* Header */}
      <header className="text-center mb-16 w-full no-print flex flex-col items-center">
        <DdagimanLogo className="w-32 h-32 mb-8 animate-fade" />
        <h1 className="text-5xl md:text-6xl font-serif font-black text-white tracking-[0.2em] mb-4 text-center">딱이만 사주</h1>
        <p className="text-amber-500/50 text-[10px] uppercase tracking-[0.8em] font-bold text-center">The Sovereign of Destiny & Soul</p>
      </header>

      {/* Main UI - Fixed Centering */}
      {!sajuResult && !isLoading && (
        <div className="w-full space-y-12 animate-fade no-print max-w-4xl flex flex-col items-center">
          <div className="glass-panel p-8 md:p-12 rounded-[3rem] border-white/5 shadow-2xl w-full flex flex-col items-center">
            <h2 className="text-white text-xl font-bold mb-10 flex items-center gap-4 w-full justify-center md:justify-start">
              <span className="w-2.5 h-8 bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b]"></span> 기본 정보 입력
            </h2>
            <div className="flex flex-col md:grid md:grid-cols-3 gap-10 items-center w-full max-w-md md:max-w-none">
              <div className="space-y-4 w-full">
                <label className="text-[11px] text-zinc-500 font-black uppercase tracking-widest block text-center">생년월일</label>
                <input type="date" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-amber-500 transition-all text-center text-lg"/>
              </div>
              <div className="space-y-4 w-full">
                <label className="text-[11px] text-zinc-500 font-black uppercase tracking-widest block text-center">태어난 시간</label>
                <input type="time" value={formData.time} onChange={e=>setFormData({...formData, time:e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-amber-500 transition-all text-center text-lg"/>
              </div>
              <div className="space-y-4 w-full">
                <label className="text-[11px] text-zinc-500 font-black uppercase tracking-widest block text-center">성별</label>
                <div className="flex gap-4 w-full">
                  <button onClick={()=>setFormData({...formData, gender:'MALE'})} className={`flex-1 py-5 rounded-2xl text-xs font-black border transition-all ${formData.gender === 'MALE' ? 'bg-amber-500 text-black border-amber-500 shadow-lg scale-105' : 'bg-white/5 text-zinc-500 border-white/10'}`}>남성</button>
                  <button onClick={()=>setFormData({...formData, gender:'FEMALE'})} className={`flex-1 py-5 rounded-2xl text-xs font-black border transition-all ${formData.gender === 'FEMALE' ? 'bg-amber-500 text-black border-amber-500 shadow-lg scale-105' : 'bg-white/5 text-zinc-500 border-white/10'}`}>여성</button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full px-2">
            {(Object.keys(MENU_LABELS) as MenuType[]).map((key) => (
              <button key={key} onClick={() => handleMenuClick(key)} className="glass-panel p-8 md:p-10 rounded-[2.5rem] text-sm font-black text-zinc-400 hover:text-amber-500 hover:border-amber-500 transition-all flex flex-col items-center gap-6 group active:scale-95">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center group-hover:bg-amber-500/20 transition-all">
                   <span className="text-3xl">{key === 'COMPATIBILITY' ? '💑' : (key === 'TOTAL' ? '📝' : '🔮')}</span>
                </div>
                {MENU_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result Section */}
      {sajuResult && (
        <div className="w-full animate-fade space-y-12 max-w-4xl flex flex-col items-center">
          <div className="glass-panel rounded-[4rem] overflow-hidden premium-shadow border-amber-500/20 bg-black/50 w-full relative">
            {/* Header */}
            <div className="bg-gradient-to-b from-amber-600 to-amber-400 p-10 md:p-20 text-center text-black">
              <span className="text-[11px] font-black tracking-[0.7em] uppercase opacity-60 mb-6 block">{MENU_LABELS[currentMenu!]}</span>
              <h2 className="text-4xl md:text-6xl font-serif font-black leading-tight mb-8 px-4">{sajuResult.title}</h2>
              <div className="inline-block bg-black/10 px-8 md:px-14 py-6 rounded-full font-serif font-black text-3xl md:text-4xl tracking-[0.5em]">
                {sajuResult.hanja}
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-10">
                {sajuResult.keywords.map((kw: string) => (
                  <span key={kw} className="bg-black/20 px-5 py-2.5 rounded-xl text-xs font-bold tracking-tighter">{kw}</span>
                ))}
              </div>
            </div>

            {/* Elements - PC/Mobile 시각화 대폭 보강 */}
            <div className="p-10 md:p-20 border-b border-white/5 bg-white/[0.01]">
              <h3 className="text-amber-500 text-[11px] font-black tracking-[0.5em] uppercase mb-16 text-center">오행 분포 리포트 (Five Elements Analysis)</h3>
              <div className="flex justify-between items-end h-80 gap-3 md:gap-10 max-w-4xl mx-auto px-4">
                {Object.entries(sajuResult.elements).map(([el, val]: any) => {
                   const config: any = { 
                     wood: { label: '목', icon: '🌲', color: 'bg-emerald-600', sub: 'Wood' },
                     fire: { label: '화', icon: '🔥', color: 'bg-rose-600', sub: 'Fire' },
                     earth: { label: '토', icon: '⛰️', color: 'bg-amber-600', sub: 'Earth' },
                     metal: { label: '금', icon: '🪙', color: 'bg-zinc-100', sub: 'Metal' },
                     water: { label: '수', icon: '💧', color: 'bg-blue-600', sub: 'Water' }
                   };
                   const c = config[el];
                   return (
                     <div key={el} className="flex-1 flex flex-col items-center gap-6 group h-full">
                       <div className="bg-white/5 border border-white/5 p-2 md:p-4 rounded-2xl w-full h-full flex flex-col justify-end items-center relative overflow-hidden">
                         <div className={`${c.color} w-full rounded-xl transition-all duration-1000 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:brightness-125`} style={{height: `${val}%`}}></div>
                         <span className="absolute top-4 text-[10px] md:text-xs text-amber-500/80 font-black">{val}%</span>
                       </div>
                       <div className="flex flex-col items-center gap-2">
                         <span className="text-3xl md:text-5xl drop-shadow-lg">{c.icon}</span>
                         <div className="text-center">
                           <span className="text-xl md:text-2xl font-black text-white font-serif block">{c.label}</span>
                           <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{c.sub}</span>
                         </div>
                       </div>
                     </div>
                   );
                })}
              </div>
            </div>

            {/* Sections with Master/Guest conditional layout */}
            <div className="p-10 md:p-20 space-y-24 relative overflow-hidden">
              {sajuResult.sections.map((sec: any, idx: number) => {
                const isFirst = idx === 0;
                const firstSentence = sec.content.split('.')[0] + '.';
                
                return (
                  <div key={idx} className={`relative space-y-10 transition-all duration-700 ${!isUnlocked && !isFirst ? 'blur-2xl opacity-40 select-none pointer-events-none grayscale' : ''}`}>
                    <h4 className="text-amber-500 text-3xl md:text-4xl font-serif font-black tracking-[0.2em] uppercase flex items-center gap-6">
                      <span className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b]"></span> {sec.subtitle}
                    </h4>
                    
                    <div className="relative">
                      <p className="text-xl md:text-2xl text-zinc-200 leading-[2.1] font-serif font-medium whitespace-pre-wrap">
                        {!isUnlocked && isFirst ? firstSentence : sec.content}
                        {!isUnlocked && isFirst && (
                           <span className="block mt-6 text-amber-500/50 italic text-sm">... 이후 수천 자의 정밀 비책이 이어집니다.</span>
                        )}
                      </p>
                      
                      {/* Mosaic Teaser Overlay for non-first sections */}
                      {!isUnlocked && !isFirst && (
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="bg-black/40 backdrop-blur-md border border-amber-500/30 px-6 py-4 rounded-2xl flex flex-col items-center gap-2 shadow-2xl">
                             <span className="text-2xl">🔒</span>
                             <span className="text-amber-500 font-black text-[10px] tracking-widest uppercase">VIP 전용 비책</span>
                           </div>
                        </div>
                      )}
                    </div>

                    {/* Guest: Show buttons immediately after the first section summary */}
                    {!isUnlocked && isFirst && (
                      <div className="mt-12 border-t border-white/5 pt-12">
                         <p className="text-white text-center font-black text-xl md:text-2xl mb-10 font-serif">당신의 전체 운명을 확인하고 싶으신가요?</p>
                         <ActionButtons />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Master: Show buttons only at the very bottom when unlocked */}
          {isUnlocked && <ActionButtons />}
        </div>
      )}

      {/* Loading Overlay - Perfectly Centered */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[500] flex flex-col items-center justify-center no-print w-full overflow-hidden p-8">
          <DdagimanLogo className="w-48 h-48 md:w-56 md:h-56 animate-pulse mb-12" />
          <div className="text-center w-full space-y-6">
            <h2 className="text-amber-500 font-serif text-3xl md:text-5xl font-black tracking-[0.1em] leading-normal w-full">
              운명의 문을 여는 중...
            </h2>
            <p className="text-zinc-600 text-[10px] md:text-[11px] tracking-[1em] uppercase font-bold w-full">Accessing Ancient Records</p>
          </div>
        </div>
      )}

      {/* Footer / Master Admin */}
      <footer className="mt-48 w-full border-t border-white/5 pt-20 pb-32 text-center space-y-20 no-print opacity-20 hover:opacity-100 transition-opacity">
        <div className="max-w-xs mx-auto space-y-6">
           <input 
             type="password" 
             placeholder="ADMIN PASS" 
             autoComplete="new-password"
             value={unlockCode} 
             onChange={e=>setUnlockCode(e.target.value)} 
             className="w-full bg-transparent border-b border-white/10 p-4 text-center text-xs text-white outline-none focus:border-amber-500 transition-all font-mono"
           />
           <button 
             onClick={() => {
               if (unlockCode === MASTER_PASSWORD) {
                 setIsUnlocked(true);
                 alert("천기가 열렸습니다. 마스터 모드가 활성화됩니다.");
               } else {
                 alert("비밀번호가 틀렸습니다.");
                 setUnlockCode('');
               }
             }} 
             className="w-full py-4 text-[10px] text-zinc-600 font-black uppercase tracking-widest hover:text-amber-500 transition-all border border-white/10 rounded-xl bg-white/5"
           >
             Unlock Master View
           </button>
        </div>
        <div className="space-y-4 px-6">
          <p className="text-zinc-800 text-xs font-black uppercase tracking-[0.8em]">DDAGIMAN MYUNG-RI & SHAMANIC LAB</p>
          <p className="text-zinc-900 text-[9px] tracking-[0.4em] font-medium">© 2026 PRECISION DESTINY ANALYSIS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);