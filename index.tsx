import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const KAKAO_LINK = "https://open.kakao.com/o/smPIizgi";
const MASTER_PASSWORD = "7605";

/** 
 * 구글 드라이브 로고 설정 방법:
 * 1. 구글 드라이브에서 사진 우클릭 -> 링크 복사
 * 2. 링크가 https://drive.google.com/file/d/1ABC_DEFG/view?usp=sharing 형태라면
 * 3. 중앙의 '1ABC_DEFG' 부분이 파일 ID입니다. 아래 변수에 넣어주세요.
 */
const DRIVE_FILE_ID = "1dHVsMQWP1jCpKEtzjb0r1S0wW2bvaEBL"; // 사장님 폴더 ID가 아닌 파일 고유 ID를 넣으셔야 합니다.
const LOGO_URL = DRIVE_FILE_ID 
  ? `https://drive.google.com/uc?id=${DRIVE_FILE_ID}` 
  : "https://raw.githubusercontent.com/ai-gen-images/storage/main/saju_logo.png";

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sajuResult, setSajuResult] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '1995-01-01',
    time: '09:00',
    gender: 'MALE'
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const generateDeterministicSeed = () => {
    const seedString = `${formData.date}-${formData.time}-${formData.gender}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      const char = seedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const handleAnalyze = async (e?: React.FormEvent, isRetry = false) => {
    if (e) e.preventDefault();
    if (isLoading && !isRetry) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // @ts-ignore
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined" || apiKey === "") {
        throw new Error("운영진에게 문의하세요 (API_KEY 미설정)");
      }

      const seedValue = generateDeterministicSeed();
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        사용자 정보: 생년월일 ${formData.date}, 시간 ${formData.time}, 성별 ${formData.gender === 'MALE' ? '남성' : '여성'}
        2026년(병오년) 정통 명리학(만세력)을 바탕으로 분석하여 반드시 JSON 형식으로만 답변하세요.
        {
          "title": "운명의 4글자 총평",
          "essence": "성격과 타고난 기운 핵심 풀이 (2문장)",
          "wealth": "2026년 재물운과 평생 재물운 상세 분석 (3문장 이상)",
          "love": "2026년 애정운과 인연운 상세 분석 (3문장 이상)",
          "advice": "2026년 당신을 위한 최고의 개운 비책"
        }
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "당신은 30년 경력의 대한민국 최고 명리학자 '딱이만'입니다. 2026년 병오년을 기준으로 품격 있고 신뢰감 있는 어조로 답변하세요.",
          responseMimeType: "application/json",
          temperature: 0,
          seed: seedValue
        }
      });

      const responseText = result.text;
      if (!responseText) throw new Error("분석 결과가 비어있습니다.");
      setSajuResult(JSON.parse(responseText));
      setIsUnlocked(false); 
      setUnlockCode('');
    } catch (error: any) {
      console.error("API Error:", error);
      
      // 503 에러(서버 과부하) 대응
      if (error.message?.includes("503") || error.message?.includes("high demand")) {
        setErrorMsg("현재 접속자가 너무 많아 서버가 바쁩니다. 5초 뒤에 자동으로 다시 시도합니다.");
        setTimeout(() => handleAnalyze(undefined, true), 5000); // 5초 후 자동 재시도
      } else {
        setErrorMsg("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkUnlock = () => {
    if (unlockCode === MASTER_PASSWORD) {
      setIsUnlocked(true);
    } else {
      alert("올바른 코드가 아닙니다. 입금 확인 후 카톡으로 문의해주세요.");
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-md mx-auto px-6 py-12 min-h-screen flex flex-col items-center">
      {/* 헤더 섹션: 로고 중앙 배치 강화 */}
      <header className="text-center mb-16 relative w-full flex flex-col items-center no-print">
        <div className="inline-block px-4 py-1 border border-amber-500/30 rounded-full mb-10 relative z-20">
          <span className="text-[10px] text-amber-500 font-bold tracking-[0.3em]">PREMIUM FORTUNE 2026</span>
        </div>
        
        <div className="relative flex items-center justify-center w-full h-24">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
            <img 
              src={LOGO_URL} 
              alt="Brand Logo" 
              className="w-48 h-48 object-contain opacity-40 scale-125 transition-opacity duration-700"
              onLoad={(e) => (e.currentTarget.style.opacity = "0.4")}
              onError={(e) => { (e.target as any).style.display = 'none'; }}
            />
          </div>
          <h1 className="text-5xl font-serif font-black text-white tracking-widest relative z-10 drop-shadow-[0_4px_15px_rgba(0,0,0,1)]">딱이만 사주</h1>
        </div>
        
        <p className="text-zinc-500 text-[10px] font-light uppercase tracking-widest relative z-10 mt-12">Master of Destiny & Harmony</p>
      </header>

      {/* 에러 메시지 표시 바 */}
      {errorMsg && (
        <div className="w-full bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 animate-fade no-print text-center">
          <p className="text-red-400 text-xs font-bold leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {!sajuResult ? (
        <div className="glass-panel w-full p-8 rounded-[2.5rem] premium-shadow relative overflow-hidden border border-white/5 animate-fade no-print">
          <form onSubmit={handleAnalyze} className="space-y-10">
            <div className="space-y-3 w-full flex flex-col items-center">
              <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">생년월일</label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={e=>setFormData({...formData, date:e.target.value})} 
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-amber-500/50 transition-colors text-center text-lg appearance-none font-medium"
              />
            </div>
            
            <div className="space-y-10 w-full flex flex-col items-center">
              <div className="space-y-3 w-full flex flex-col items-center">
                <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">태어난 시간</label>
                <input 
                  type="time" 
                  value={formData.time} 
                  onChange={e=>setFormData({...formData, time:e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-amber-500/50 transition-colors text-center text-lg appearance-none font-medium"
                />
              </div>
              
              <div className="space-y-3 w-full flex flex-col items-center">
                <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">성별</label>
                <div className="flex gap-4 w-full">
                  <button 
                    type="button" 
                    onClick={()=>setFormData({...formData, gender:'MALE'})} 
                    className={`flex-1 py-5 rounded-2xl text-sm font-black transition-all transform active:scale-95 border ${formData.gender === 'MALE' ? 'bg-amber-500 text-black border-amber-500 shadow-[0_5px_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 text-zinc-500 border-white/10'}`}
                  >
                    남성
                  </button>
                  <button 
                    type="button" 
                    onClick={()=>setFormData({...formData, gender:'FEMALE'})} 
                    className={`flex-1 py-5 rounded-2xl text-sm font-black transition-all transform active:scale-95 border ${formData.gender === 'FEMALE' ? 'bg-amber-500 text-black border-amber-500 shadow-[0_5px_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 text-zinc-500 border-white/10'}`}
                  >
                    여성
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-amber-500 text-black font-black py-6 rounded-2xl shadow-[0_15px_35px_rgba(245,158,11,0.3)] active:scale-95 transition-all mt-6 text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-.5s]"></div>
                  <span>천기를 읽는 중...</span>
                </div>
              ) : '올해 나의 운세 / 사주 확인하기'}
            </button>
          </form>
        </div>
      ) : (
        <div className="animate-fade space-y-8 pb-24 w-full print-container">
          <div className="glass-panel rounded-[2.5rem] overflow-hidden premium-shadow border border-amber-500/20 bg-[#0a0a0b] print-bg-white">
            <div className="bg-gradient-to-b from-amber-500 to-amber-600 p-8 text-center text-black print-header">
              <span className="text-[10px] font-black tracking-widest uppercase opacity-60">2026 Destiny Report</span>
              <h2 className="text-3xl font-serif font-black mt-1 tracking-tighter leading-tight">{sajuResult.title}</h2>
              <div className="hidden print:block text-[9px] mt-4 font-bold border-t border-black/10 pt-4">명리학자 딱이만 전문 분석 리포트</div>
            </div>
            
            <div className="p-8 space-y-10">
              <div className="space-y-4">
                <h3 className="text-amber-500 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> 타고난 본질
                </h3>
                <p className="text-lg font-serif text-white print-black leading-relaxed">"{sajuResult.essence}"</p>
              </div>

              <div className="relative pt-8 border-t border-white/10 print-border-black">
                {!isUnlocked ? (
                  <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl z-20 flex flex-col items-center justify-center rounded-2xl p-8 text-center border border-white/5 no-print">
                    <div className="mb-6 w-full">
                      <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                        <span className="text-amber-500 text-2xl">🔒</span>
                      </div>
                      <p className="text-white font-bold text-sm">상세 분석 내용이 잠겨있습니다.</p>
                      <div className="mt-4 mb-6 grid grid-cols-2 gap-2 max-w-[280px] mx-auto">
                        {['💰 2026 금전운', '🏢 이직/직장운', '💖 애정/연애운', '📈 사업/성공운'].map(text => (
                          <div key={text} className="text-[9px] bg-white/5 px-2 py-2 rounded-lg text-zinc-300 border border-white/5 flex items-center justify-center font-bold">{text}</div>
                        ))}
                      </div>
                      <p className="text-zinc-500 text-[11px] leading-relaxed">상세 풀이를 위해 카톡 문의 후<br/>발급받은 상담 코드를 입력하세요.</p>
                    </div>
                    <a href={KAKAO_LINK} target="_blank" className="bg-white text-black w-full py-5 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95">카톡으로 1:1 문의 하기</a>
                    <div className="w-full pt-6 border-t border-white/10 mt-6">
                      <div className="flex flex-col gap-3">
                        <input type="text" placeholder="상담 코드를 입력하세요" value={unlockCode} onChange={(e)=>setUnlockCode(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-4 text-white text-center text-sm outline-none focus:border-amber-500 transition-all font-bold tracking-widest"/>
                        <button onClick={checkUnlock} className="w-full bg-zinc-800 text-amber-500 py-4 rounded-xl text-sm font-black border border-amber-500/30 active:scale-95 transition-transform">프리미엄 해제</button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className={`space-y-10 transition-all duration-1000 ${!isUnlocked ? 'blur-2xl select-none opacity-20' : 'blur-0 opacity-100'}`}>
                  <div>
                    <h3 className="text-amber-500 text-[10px] font-black tracking-widest uppercase mb-4 flex items-center gap-2">
                      <span className="w-1 h-3 bg-amber-500 rounded-full"></span> 2026 재물운 상세 분석
                    </h3>
                    <p className="text-[15px] text-zinc-300 print-black leading-relaxed font-light">{sajuResult.wealth}</p>
                  </div>
                  <div>
                    <h3 className="text-amber-500 text-[10px] font-black tracking-widest uppercase mb-4 flex items-center gap-2">
                      <span className="w-1 h-3 bg-amber-500 rounded-full"></span> 2026 인연운 상세 분석
                    </h3>
                    <p className="text-[15px] text-zinc-300 print-black leading-relaxed font-light">{sajuResult.love}</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 print-border-black">
                <h3 className="text-zinc-500 text-[10px] font-black tracking-widest uppercase mb-4 text-center">딱이만의 2026 개운 비책</h3>
                <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10 print-border-gray">
                  <p className="text-amber-500 print-black text-sm font-bold leading-relaxed text-center italic">“ {sajuResult.advice} ”</p>
                </div>
              </div>

              <div className="mt-8 text-center px-4 pt-6 border-t border-white/5 print-border-none">
                <p className="text-zinc-700 text-[9px] leading-relaxed uppercase tracking-tighter">
                  ※ Disclaimer: 본 리포트는 명리학적 통계를 바탕으로 한 참고 자료이며,<br/>결과에 대한 법적 책임은 지지 않습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 no-print w-full">
            {isUnlocked && (
              <button 
                onClick={handleDownloadPDF}
                className="w-full bg-zinc-800 text-white border border-white/10 py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors active:scale-95 shadow-xl"
              >
                📥 리포트 PDF 파일로 저장하기
              </button>
            )}

            {isUnlocked && (
              <div className="bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/5 space-y-6 mt-12">
                <div className="text-center space-y-2">
                  <p className="text-amber-500 text-[10px] font-black tracking-widest uppercase">Consulting</p>
                  <p className="text-white text-base font-bold">상담이 만족스러우셨나요?</p>
                </div>
                <a href={KAKAO_LINK} target="_blank" className="w-full bg-[#FEE500] text-[#191919] font-black py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all text-sm">
                  카톡으로 추가 상담 하기
                </a>
              </div>
            )}
            
            <button onClick={()=>{setSajuResult(null); setIsUnlocked(false); setUnlockCode(''); window.scrollTo(0,0);}} className="w-full text-center text-[10px] text-zinc-800 uppercase tracking-widest hover:text-white transition-colors py-12">
              새로운 사주 분석하기
            </button>
          </div>
        </div>
      )}

      <footer className="mt-auto pb-8 text-center no-print">
        <p className="text-zinc-900 text-[9px] uppercase tracking-widest font-black">© 2026 DDAGIMAN Fortune Lab.</p>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);