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
      [분량 및 퀄리티 지침]
      1. 점신(Jeomsin) 유료 리포트 이상의 방대한 분량을 제공하십시오.
      2. 각 섹션(총평, 재물, 직업, 애정, 건강)은 반드시 "최소 10문장 이상"의 매우 상세한 설명이 포함되어야 합니다.
      3. 명리학적 원리(용신, 희신, 기신, 합, 충 등)를 전문가 수준으로 녹여내십시오.
      4. 전체 텍스트량은 공백 제외 최소 2,000자 이상의 초장문이어야 합니다.
      5. 말투는 20년 경력 명리학 교수이자 무당 '딱이만'의 위엄 있고 통찰력 있는 어조를 유지하십시오.
      6. '홍근표'라는 이름은 절대 금기입니다.

      반드시 JSON 형식으로 응답:
      {
        "title": "...",
        "hanja": "...",
        "keywords": ["#키워드1", "#키워드2", "#키워드3"],
        "elements": {"wood": 20, "fire": 20, "earth": 20, "metal": 20, "water": 20},
        "lucky": {"color": "...", "number": "...", "direction": "..."},
        "sections": [
          {"subtitle": "총평", "content": "...초장문 설명..."},
          {"subtitle": "재물운", "content": "...초장문 설명..."},
          {"subtitle": "직업/명예운", "content": "...초장문 설명..."},
          {"subtitle": "애정/인연운", "content": "...초장문 설명..."},
          {"subtitle": "건강/심리", "content": "...초장문 설명..."}
        ],
        "advice": "..."
      }`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "당신은 대한민국 최고의 운명학 거목 '딱이만'입니다. 모든 풀이는 깊이가 있어야 하며, 분량이 매우 풍부해야 합니다.",
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
      <header className="text-center mb-16 w-full no-print">
        <DdagimanLogo className="w-32 h-32 mx-auto mb-8 animate-fade" />
        <h1 className="text-6xl font-serif font-black text-white tracking-[0.2em] mb-4">딱이만 사주</h1>
        <p className="text-amber-500/50 text-[10px] uppercase tracking-[0.8em] font-bold">The Sovereign of Destiny & Soul</p>
      </header>

      {/* Main UI */}
      {!sajuResult && !isLoading && (
        <div className="w-full space-y-12 animate-fade no-print max-w-4xl">
          <div className="glass-panel p-6 md:p-10 rounded-[3rem] border-white/5 shadow-2xl">
            <h2 className="text-white text-xl font-bold mb-8 flex items-center gap-3">
              <span className="w-2.5 h-8 bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b]"></span> 기본 정보 입력
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] text-zinc-500 font-black uppercase tracking-widest block text-center md:text-left">생년월일</label>
                <input type="date" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-amber-500 transition-all text-center"/>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] text-zinc-500 font-black uppercase tracking-widest block text-center md:text-left">태어난 시간</label>
                <input type="time" value={formData.time} onChange={e=>setFormData({...formData, time:e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-amber-500 transition-all text-center"/>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] text-zinc-500 font-black uppercase tracking-widest block text-center md:text-left">성별</label>
                <div className="flex gap-3">
                  <button onClick={()=>setFormData({...formData, gender:'MALE'})} className={`flex-1 py-5 rounded-2xl text-xs font-black border transition-all ${formData.gender === 'MALE' ? 'bg-amber-500 text-black border-amber-500 shadow-lg' : 'bg-white/5 text-zinc-500 border-white/10'}`}>남성</button>
                  <button onClick={()=>setFormData({...formData, gender:'FEMALE'})} className={`flex-1 py-5 rounded-2xl text-xs font-black border transition-all ${formData.gender === 'FEMALE' ? 'bg-amber-500 text-black border-amber-500 shadow-lg' : 'bg-white/5 text-zinc-500 border-white/10'}`}>여성</button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(Object.keys(MENU_LABELS) as MenuType[]).map((key) => (
              <button key={key} onClick={() => handleMenuClick(key)} className="glass-panel p-10 rounded-[2.5rem] text-sm font-black text-zinc-400 hover:text-amber-500 hover:border-amber-500 transition-all flex flex-col items-center gap-6 group active:scale-95">
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
        <div className="w-full animate-fade space-y-12 max-w-4xl">
          <div className="glass-panel rounded-[4rem] overflow-hidden premium-shadow border-amber-500/20 bg-black/50">
            {/* Result Header */}
            <div className="bg-gradient-to-b from-amber-600 to-amber-400 p-10 md:p-16 text-center text-black">
              <span className="text-[11px] font-black tracking-[0.7em] uppercase opacity-60 mb-6 block">{MENU_LABELS[currentMenu!]}</span>
              <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight mb-8 px-4">{sajuResult.title}</h2>
              <div className="inline-block bg-black/10 px-8 md:px-12 py-5 rounded-full font-serif font-black text-2xl md:text-3xl tracking-[0.4em]">
                {sajuResult.hanja}
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {sajuResult.keywords.map((kw: string) => (
                  <span key={kw} className="bg-black/20 px-4 py-2 rounded-lg text-xs font-bold tracking-tighter">{kw}</span>
                ))}
              </div>
            </div>

            {/* Elements & Lucky */}
            <div className="p-10 md:p-16 border-b border-white/5">
              <h3 className="text-amber-500 text-[11px] font-black tracking-[0.5em] uppercase mb-12 text-center">오행 분포 리포트</h3>
              <div className="flex justify-between items-end h-48 gap-4 md:gap-6 max-w-2xl mx-auto px-4">
                {Object.entries(sajuResult.elements).map(([el, val]: any) => {
                   const labels: any = { wood: '목', fire: '화', earth: '토', metal: '금', water: '수' };
                   const colors: any = { wood: 'bg-emerald-600', fire: 'bg-rose-600', earth: 'bg-amber-600', metal: 'bg-zinc-100', water: 'bg-blue-600' };
                   return (
                     <div key={el} className="flex-1 flex flex-col items-center gap-4">
                       <span className="text-[10px] text-zinc-500 font-black">{val}%</span>
                       <div className={`${colors[el]} w-full rounded-t-2xl transition-all duration-1000 shadow-xl`} style={{height: `${val}%`}}></div>
                       <span className="text-sm font-black text-zinc-300 font-serif">{labels[el]}</span>
                     </div>
                   );
                })}
              </div>
            </div>

            {/* Sections */}
            <div className="p-10 md:p-16 space-y-24 relative">
              {sajuResult.sections.map((sec: any, idx: number) => (
                <div key={idx} className={`space-y-10 transition-all duration-1000 ${!isUnlocked && idx > 0 ? 'filter blur-[40px] opacity-5 select-none pointer-events-none' : ''}`}>
                  <h4 className="text-amber-500 text-3xl md:text-4xl font-serif font-black tracking-[0.2em] uppercase flex items-center gap-6">
                    <span className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b]"></span> {sec.subtitle}
                  </h4>
                  <p className="text-xl md:text-2xl text-zinc-200 leading-[2.1] font-serif font-medium whitespace-pre-wrap">
                    {!isUnlocked && idx === 0 ? sec.content.split('.')[0] + '.' : sec.content}
                  </p>
                </div>
              ))}

              {!isUnlocked && (
                <div className="absolute inset-x-0 bottom-40 flex flex-col items-center justify-center p-8 md:p-16 text-center z-10 bg-gradient-to-t from-[#050506] via-[#050506]/98 to-transparent">
                  <div className="p-10 md:p-14 rounded-[4rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl space-y-10 max-w-xl shadow-2xl">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                      <span className="text-4xl">🔒</span>
                    </div>
                    <div className="space-y-4 px-4">
                      <p className="text-white text-2xl md:text-3xl font-serif font-black">상세 리포트가 잠겨 있습니다</p>
                      <p className="text-zinc-500 text-sm md:text-base leading-relaxed">20년 경력의 딱이만 선생이 제공하는<br/>초정밀 운세 비책을 모두 확인하십시오.</p>
                    </div>
                    <a href={KAKAO_LINK} target="_blank" className="block w-full bg-amber-500 text-black py-7 rounded-3xl font-black text-xl hover:bg-amber-400 transition-all active:scale-95 shadow-xl tracking-widest">카카오톡 상담 후 전체 해제</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="no-print flex flex-col md:flex-row gap-6 w-full max-w-4xl">
            <button onClick={() => window.print()} className="flex-1 bg-zinc-900 text-white py-7 rounded-[2.5rem] font-black text-sm tracking-[0.3em] border border-white/5 shadow-xl">📜 리포트 저장</button>
            <button onClick={() => setSajuResult(null)} className="flex-1 bg-white/5 text-zinc-500 py-7 rounded-[2.5rem] text-sm font-black border border-white/5">↩️ 새로운 분석</button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[500] flex items-center justify-center no-print w-full">
          <div className="w-full flex flex-col items-center justify-center space-y-16 px-6">
            <DdagimanLogo className="w-48 h-48 animate-pulse" />
            <div className="text-center w-full">
              <h2 className="text-amber-500 font-serif text-4xl md:text-5xl font-black animate-bounce tracking-[0.2em] w-full text-center">운명의 문을 여는 중...</h2>
              <p className="text-zinc-600 text-[11px] mt-8 tracking-[1em] uppercase font-bold text-center w-full">Accessing Ancient Wisdom</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Unlock Footer */}
      <footer className="mt-48 w-full border-t border-white/5 pt-20 text-center space-y-20 no-print opacity-20 hover:opacity-100 transition-opacity">
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
             className="w-full py-4 text-[10px] text-zinc-600 font-black uppercase tracking-widest hover:text-amber-500 transition-all border border-white/5 rounded-xl bg-white/5"
           >
             Unlock All Content
           </button>
        </div>
        <div className="space-y-4">
          <p className="text-zinc-800 text-xs font-black uppercase tracking-[0.8em]">DDAGIMAN MYUNG-RI & SHAMANIC LAB</p>
          <p className="text-zinc-900 text-[9px] tracking-[0.4em] font-medium">© 2026 PRECISION DESTINY ANALYSIS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);