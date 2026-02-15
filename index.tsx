import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

const KAKAO_LINK = "https://open.kakao.com/o/smPIizgi";
const MASTER_PASSWORD = "7605";

// 메뉴 타입 정의
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

// 직접 제작한 딱이만 사주 로고 컴포넌트
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
  const [currentMenu, setCurrentMenu] = useState<MenuType>('TOTAL');
  const [sajuResult, setSajuResult] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: '1995-01-01',
    time: '09:00',
    gender: 'MALE',
    targetDate: '2026-01-01', // 지정일 운세용
    partnerDate: '1995-05-05', // 궁합용
    partnerGender: 'FEMALE' // 궁합용
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const generateDeterministicSeed = () => {
    const seedString = `${formData.date}-${formData.time}-${formData.gender}-${currentMenu}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const handleAnalyze = async (menu: MenuType) => {
    setIsLoading(true);
    setErrorMsg(null);
    setCurrentMenu(menu);

    try {
      // @ts-ignore
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API_KEY 미설정");

      const ai = new GoogleGenAI({ apiKey });
      const seedValue = generateDeterministicSeed();

      let prompt = `사용자 정보: 생년월일 ${formData.date}, 시간 ${formData.time}, 성별 ${formData.gender}. `;
      
      if (menu === 'COMPATIBILITY') {
        prompt += `상대방 정보: 생년월일 ${formData.partnerDate}, 성별 ${formData.partnerGender}. `;
      } else if (menu === 'SPECIFIC') {
        prompt += `확인하고 싶은 날짜: ${formData.targetDate}. `;
      }

      prompt += `요청 메뉴: ${MENU_LABELS[menu]}. 2026년(병오년) 기준으로 정통 명리학 분석을 수행하고 반드시 JSON 형식으로 답변하세요.
      {
        "title": "분석 제목",
        "sections": [
          {"subtitle": "항목1", "content": "내용..."},
          {"subtitle": "항목2", "content": "내용..."},
          {"subtitle": "항목3", "content": "내용..."}
        ],
        "advice": "오늘의 조언 또는 개운법"
      }`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "당신은 30년 경력의 대한민국 최고 명리학자 '딱이만'입니다. 각 메뉴의 성격에 맞는 깊이 있고 품격 있는 분석을 제공하세요.",
          responseMimeType: "application/json",
          temperature: 0,
          seed: seedValue
        }
      });

      const responseText = result.text;
      if (!responseText) throw new Error("결과가 비어있습니다.");
      setSajuResult(JSON.parse(responseText));
      window.scrollTo(0, 0);
    } catch (error: any) {
      setErrorMsg("서버가 혼잡합니다. 잠시 후 다시 시도해주세요.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUnlock = () => {
    if (unlockCode === MASTER_PASSWORD) {
      setIsUnlocked(true);
      setErrorMsg(null);
    } else {
      alert("올바른 코드가 아닙니다.");
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen flex flex-col items-center">
      {/* 헤더 섹션 */}
      <header className="text-center mb-10 w-full no-print">
        <div className="flex justify-center mb-6">
          <DdagimanLogo className="w-24 h-24" />
        </div>
        <h1 className="text-4xl font-serif font-black text-white tracking-widest mb-2">딱이만 사주</h1>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em]">Master of Destiny & Harmony</p>
      </header>

      {/* 대시보드 (해제 후) */}
      {isUnlocked && !sajuResult && !isLoading && (
        <div className="w-full space-y-8 animate-fade no-print">
          <div className="glass-panel p-6 rounded-[2rem] border-amber-500/20">
            <h2 className="text-amber-500 text-xs font-black tracking-widest uppercase mb-6 text-center">Master Consulting Dashboard</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(MENU_LABELS) as MenuType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleAnalyze(key)}
                  className="bg-white/5 border border-white/10 p-4 rounded-2xl text-[11px] font-bold text-zinc-300 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all active:scale-95"
                >
                  {MENU_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
          
          <div className="glass-panel p-8 rounded-[2rem] space-y-6">
            <h3 className="text-white text-sm font-bold border-b border-white/10 pb-4">고객 기본 정보 설정</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase font-bold">생년월일 및 시간</label>
                <div className="flex gap-2">
                  <input type="date" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} className="flex-[2] bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none text-sm"/>
                  <input type="time" value={formData.time} onChange={e=>setFormData({...formData, time:e.target.value})} className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none text-sm"/>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase font-bold">궁합/지정일 정보 (필요시)</label>
                <input type="date" value={formData.partnerDate} onChange={e=>setFormData({...formData, partnerDate:e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none text-sm mb-2"/>
                <div className="flex gap-2">
                  <button onClick={()=>setFormData({...formData, partnerGender:'MALE'})} className={`flex-1 py-3 rounded-xl text-xs font-bold border ${formData.partnerGender === 'MALE' ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-zinc-500 border-white/10'}`}>상대 남성</button>
                  <button onClick={()=>setFormData({...formData, partnerGender:'FEMALE'})} className={`flex-1 py-3 rounded-xl text-xs font-bold border ${formData.partnerGender === 'FEMALE' ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-zinc-500 border-white/10'}`}>상대 여성</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 분석 결과 화면 */}
      {sajuResult && (
        <div className="w-full animate-fade print-container space-y-6">
          <div className="glass-panel rounded-[2.5rem] overflow-hidden premium-shadow border-amber-500/30 bg-[#0a0a0b] print-bg-white">
            <div className="bg-gradient-to-b from-amber-500 to-amber-600 p-8 text-center text-black print-header">
              <span className="text-[10px] font-black tracking-widest uppercase opacity-60">{MENU_LABELS[currentMenu]}</span>
              <h2 className="text-3xl font-serif font-black mt-2 leading-tight">{sajuResult.title}</h2>
              <p className="mt-2 text-[10px] font-bold opacity-80 no-print">{formData.date} / {formData.gender === 'MALE' ? '남' : '여'}</p>
            </div>
            
            <div className="p-8 space-y-12">
              {sajuResult.sections.map((sec: any, idx: number) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-amber-500 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> {sec.subtitle}
                  </h3>
                  <p className="text-base text-zinc-200 print-black leading-relaxed font-serif">{sec.content}</p>
                </div>
              ))}

              <div className="pt-8 border-t border-white/10 print-border-black">
                <h3 className="text-zinc-500 text-[10px] font-black tracking-widest uppercase mb-4 text-center">딱이만의 비책</h3>
                <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10 print-border-gray">
                  <p className="text-amber-500 print-black text-sm font-bold text-center italic leading-relaxed">“ {sajuResult.advice} ”</p>
                </div>
              </div>
            </div>
          </div>

          <div className="no-print space-y-4">
            <button onClick={handleDownloadPDF} className="w-full bg-zinc-800 text-white py-5 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95">📥 이 리포트 PDF 저장 / 출력하기</button>
            <button onClick={() => setSajuResult(null)} className="w-full bg-white/5 text-zinc-500 py-4 rounded-2xl text-xs font-bold border border-white/5 active:scale-95">메뉴로 돌아가기</button>
          </div>
        </div>
      )}

      {/* 로딩 화면 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center no-print">
          <DdagimanLogo className="w-32 h-32 animate-pulse mb-8" />
          <p className="text-amber-500 font-serif text-xl animate-bounce">천기를 읽고 있습니다...</p>
          <p className="text-zinc-500 text-xs mt-4">잠시만 기다려 주십시오.</p>
        </div>
      )}

      {/* 초기 해제 화면 (입구) */}
      {!isUnlocked && !sajuResult && (
        <div className="w-full space-y-8 animate-fade no-print">
          <div className="glass-panel p-8 rounded-[2.5rem] text-center space-y-8 border-amber-500/10">
            <div className="space-y-2">
              <h2 className="text-white text-xl font-bold">전문 상담 모드</h2>
              <p className="text-zinc-500 text-xs leading-relaxed">상담용 마스터 대시보드에 접속하려면<br/>비밀번호를 입력하세요.</p>
            </div>
            
            <div className="space-y-4">
              <input 
                type="password" 
                placeholder="마스터 비밀번호" 
                value={unlockCode}
                onChange={e=>setUnlockCode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-center tracking-widest outline-none focus:border-amber-500 transition-colors"
              />
              <button 
                onClick={checkUnlock}
                className="w-full bg-amber-500 text-black font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all"
              >
                마스터 접속하기
              </button>
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <a href={KAKAO_LINK} target="_blank" className="text-zinc-500 text-[10px] hover:text-white underline">상담 코드 및 기술 문의 (카카오톡)</a>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto py-10 text-center no-print opacity-30">
        <p className="text-zinc-500 text-[9px] uppercase tracking-widest">© 2026 DDAGIMAN Fortune Lab. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);