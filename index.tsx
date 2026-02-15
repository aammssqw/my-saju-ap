import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const KAKAO_LINK = "https://open.kakao.com/o/smPIizgi";
const MASTER_PASSWORD = "7605";

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sajuResult, setSajuResult] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [formData, setFormData] = useState({
    date: '1995-01-01',
    time: '09:00',
    gender: 'MALE'
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      // @ts-ignore
      const apiKey = process.env.API_KEY;
      
      if (!apiKey || apiKey === "undefined" || apiKey === "") {
        throw new Error("API_KEY가 설정되지 않았습니다.");
      }

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
          responseMimeType: "application/json"
        }
      });

      const responseText = result.text;
      if (!responseText) throw new Error("분석 결과가 비어있습니다.");
      setSajuResult(JSON.parse(responseText));
      setIsUnlocked(false); 
      setUnlockCode('');
    } catch (error: any) {
      console.error(error);
      alert(`[오류] ${error.message}`);
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

  if (!isLoaded) return null;

  return (
    <div className="max-w-md mx-auto px-6 py-12 min-h-screen flex flex-col">
      <header className="text-center mb-8">
        <div className="inline-block px-4 py-1 border border-amber-500/30 rounded-full mb-4">
          <span className="text-[10px] text-amber-500 font-bold tracking-[0.3em]">PREMIUM FORTUNE 2026</span>
        </div>
        <h1 className="text-4xl font-serif font-black text-white tracking-widest mb-2 gold-glow">딱이만 사주</h1>
        <p className="text-zinc-500 text-[10px] font-light uppercase tracking-widest">Master of Destiny & Harmony</p>
      </header>

      {!sajuResult ? (
        <div className="glass-panel p-8 rounded-[2rem] premium-shadow relative overflow-hidden border border-white/5 animate-fade">
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1 font-bold">생년월일</label>
              <input type="date" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500/50 transition-colors"/>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1 font-bold">태어난 시간</label>
                <input type="time" value={formData.time} onChange={e=>setFormData({...formData, time:e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500/50 transition-colors"/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1 font-bold">성별</label>
                <div className="flex gap-2">
                  <button type="button" onClick={()=>setFormData({...formData, gender:'MALE'})} className={`flex-1 py-4 rounded-xl text-[11px] font-black transition-all ${formData.gender === 'MALE' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'bg-white/5 text-zinc-500 border border-white/10'}`}>남성</button>
                  <button type="button" onClick={()=>setFormData({...formData, gender:'FEMALE'})} className={`flex-1 py-4 rounded-xl text-[11px] font-black transition-all ${formData.gender === 'FEMALE' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'bg-white/5 text-zinc-500 border border-white/10'}`}>여성</button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-amber-500 text-black font-black py-5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-transform mt-2 text-sm">
              {isLoading ? '2026년 천기를 읽는 중...' : '나의 2026년 운명 확인하기'}
            </button>
          </form>
        </div>
      ) : (
        <div className="animate-fade space-y-8 pb-24">
          <div className="glass-panel rounded-[2.5rem] overflow-hidden premium-shadow border border-amber-500/20">
            <div className="bg-gradient-to-b from-amber-500 to-amber-600 p-8 text-center text-black">
              <span className="text-[10px] font-black tracking-widest uppercase opacity-60">2026 Destiny Report</span>
              <h2 className="text-3xl font-serif font-black mt-1 tracking-tighter leading-tight">{sajuResult.title}</h2>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-amber-500 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> 타고난 본질
                </h3>
                <p className="text-lg font-serif text-white italic leading-relaxed">"{sajuResult.essence}"</p>
              </div>

              <div className="relative pt-8 border-t border-white/10">
                {!isUnlocked ? (
                  <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl z-20 flex flex-col items-center justify-center rounded-2xl p-8 text-center border border-white/5">
                    <div className="mb-6">
                      <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                        <span className="text-amber-500 text-2xl">🔒</span>
                      </div>
                      <p className="text-white font-bold text-sm">상세 분석 내용이 잠겨있습니다.</p>
                      <p className="text-zinc-500 text-[11px] mt-2 leading-relaxed">2026년 병오년의 상세 재물운과<br/>인연운을 보시려면 코드를 입력하세요.</p>
                    </div>
                    
                    <a href={KAKAO_LINK} target="_blank" className="bg-white text-black w-full py-4 rounded-xl font-black text-xs hover:bg-amber-400 transition-colors mb-6 shadow-xl flex items-center justify-center gap-2">
                      카톡으로 1:1 상담 코드 받기
                    </a>

                    <div className="w-full pt-6 border-t border-white/10">
                      <div className="flex flex-col gap-3">
                        <input 
                          type="text" 
                          placeholder="코드를 입력하세요" 
                          value={unlockCode}
                          onChange={(e)=>setUnlockCode(e.target.value)}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-4 text-white text-center text-sm outline-none focus:border-amber-500 transition-all font-bold tracking-widest placeholder:text-zinc-700"
                        />
                        <button onClick={checkUnlock} className="w-full bg-zinc-800 text-amber-500 py-4 rounded-xl text-sm font-black active:scale-95 transition-transform border border-amber-500/30">
                          프리미엄 해제
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className={`space-y-8 transition-all duration-1000 ${!isUnlocked ? 'blur-2xl select-none opacity-20' : 'blur-0 opacity-100'}`}>
                  <div>
                    <h3 className="text-amber-500 text-[10px] font-black tracking-widest uppercase mb-3 flex items-center gap-2">
                      <span className="w-1 h-3 bg-amber-500 rounded-full"></span> 2026 재물운 상세 분석
                    </h3>
                    <p className="text-[15px] text-zinc-300 leading-relaxed font-light">{sajuResult.wealth}</p>
                  </div>
                  <div>
                    <h3 className="text-amber-500 text-[10px] font-black tracking-widest uppercase mb-3 flex items-center gap-2">
                      <span className="w-1 h-3 bg-amber-500 rounded-full"></span> 2026 인연운/궁합
                    </h3>
                    <p className="text-[15px] text-zinc-300 leading-relaxed font-light">{sajuResult.love}</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <h3 className="text-zinc-500 text-[10px] font-black tracking-widest uppercase mb-3">딱이만의 2026 개운 비책</h3>
                <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/10">
                  <p className="text-amber-500 text-sm font-bold leading-relaxed text-center italic">“ {sajuResult.advice} ”</p>
                </div>
              </div>
            </div>
          </div>

          {/* 상담 메뉴판 - 사장님과 연결되는 핵심 구좌 */}
          {isUnlocked && (
            <div className="animate-fade space-y-8 mt-12 px-2">
              <div className="text-center">
                <div className="inline-block bg-white text-black px-3 py-1 rounded-full text-[9px] font-black mb-3 tracking-widest">2026 MASTER CONSULTING</div>
                <h4 className="text-white font-black text-2xl mb-2 tracking-tighter">아직 풀리지 않은 숙제가 있나요?</h4>
                <p className="text-zinc-500 text-xs leading-relaxed">2026년 병오년, 당신의 운명을 바꿀<br/>단 한 번의 상담이 준비되어 있습니다.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "💰", label: "2026 재물&사업", desc: "올해 큰 돈이 들어올까?", color: "amber" },
                  { icon: "💍", label: "결혼 & 인연궁합", desc: "나의 인연은 어디에?", color: "amber" },
                  { icon: "🐎", label: "병오년 신년운", desc: "2026년 도약의 흐름", color: "amber" },
                  { icon: "🔮", label: "고민해결 & 개운", desc: "막힌 운을 뚫는 비결", color: "amber" }
                ].map((item, idx) => (
                  <div key={idx} onClick={() => window.open(KAKAO_LINK)} className="glass-panel p-5 rounded-3xl border border-white/5 hover:border-amber-500/40 transition-all cursor-pointer group active:scale-95">
                    <span className="text-2xl mb-3 block">{item.icon}</span>
                    <h5 className="text-amber-500 text-[10px] font-black tracking-widest uppercase mb-1">{item.label}</h5>
                    <p className="text-white text-[11px] font-bold opacity-80 group-hover:opacity-100 leading-tight">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-amber-500 text-[10px] font-black tracking-widest uppercase">Direct Inquiry</p>
                  <p className="text-white text-base font-bold">궁금한 점을 선생님께 물어보세요</p>
                  <p className="text-zinc-500 text-[11px]">카톡 오픈채팅으로 실시간 상담이 가능합니다.</p>
                </div>
                <a href={KAKAO_LINK} target="_blank" className="w-full bg-[#FEE500] text-[#191919] font-black py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all text-sm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.477 2 10.75c0 2.76 1.84 5.19 4.6 6.51-.15.53-.55 1.93-.63 2.23-.1.38.15.38.3.28.13-.08 2.05-1.4 2.87-1.96.93.22 1.9.34 2.86.34 5.523 0 10-3.477 10-7.75S17.523 3 12 3z"/></svg>
                  지금 바로 1:1 카톡 상담하기
                </a>
              </div>
            </div>
          )}

          <button onClick={()=>{setSajuResult(null); setIsUnlocked(false); setUnlockCode(''); window.scrollTo(0,0);}} className="w-full text-center text-[10px] text-zinc-800 uppercase tracking-widest hover:text-white transition-colors py-12">
            다시 분석하기
          </button>
        </div>
      )}

      <footer className="mt-auto pb-8 text-center">
        <p className="text-zinc-900 text-[9px] uppercase tracking-widest font-black">© 2026 DDAGIMAN Fortune Lab.</p>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);