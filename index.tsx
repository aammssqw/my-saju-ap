
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const KAKAO_LINK = "https://open.kakao.com/o/smPIizgi";

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sajuResult, setSajuResult] = useState<any>(null);
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
      // Vercel에서 설정한 API_KEY를 가져옵니다.
      const apiKey = (process.env as any).API_KEY;
      
      if (!apiKey || apiKey === "undefined" || apiKey === "") {
        throw new Error("Vercel Settings -> Environment Variables에 API_KEY를 등록해주세요.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        사용자 정보: 생년월일 ${formData.date}, 시간 ${formData.time}, 성별 ${formData.gender === 'MALE' ? '남성' : '여성'}
        정통 명리학(만세력)을 바탕으로 분석하여 반드시 JSON 형식으로만 답변하세요:
        {
          "title": "운명의 4글자 총평",
          "essence": "성격과 타고난 기운 핵심 풀이 (2문장)",
          "wealth": "재물운 요약",
          "love": "애정운 요약",
          "advice": "오늘 당신을 위한 한마디 비책"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "당신은 30년 경력의 대한민국 최고 명리학자 '딱이만'입니다. 품격 있고 신뢰감 있는 무거운 어조로 답변하세요.",
          responseMimeType: "application/json"
        }
      });

      if (!response.text) throw new Error("분석 결과가 비어있습니다.");
      setSajuResult(JSON.parse(response.text));
    } catch (error: any) {
      console.error(error);
      alert(`[오류] ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-md mx-auto px-6 py-12 min-h-screen flex flex-col justify-center">
      <header className="text-center mb-12 animate-fade">
        <div className="inline-block px-4 py-1 border border-amber-500/30 rounded-full mb-4">
          <span className="text-[10px] text-amber-500 font-bold tracking-[0.3em]">PREMIUM FORTUNE</span>
        </div>
        <h1 className="text-4xl font-serif font-black text-white tracking-widest mb-2 gold-glow">딱이만 사주</h1>
        <p className="text-zinc-500 text-sm font-light">당신의 운명, 오행의 조화로 풀어냅니다.</p>
      </header>

      {!sajuResult ? (
        <div className="glass-panel p-8 rounded-3xl premium-shadow animate-fade relative overflow-hidden">
          <form onSubmit={handleAnalyze} className="space-y-6 relative z-10">
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
                <select value={formData.gender} onChange={e=>setFormData({...formData, gender:e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500/50 transition-colors appearance-none">
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-amber-500 text-black font-black py-5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-transform mt-4">
              {isLoading ? '천기를 분석하는 중...' : '나의 운명 확인하기'}
            </button>
          </form>
        </div>
      ) : (
        <div className="animate-fade">
          <div className="glass-panel rounded-[2.5rem] overflow-hidden premium-shadow border border-amber-500/20">
            <div className="bg-amber-500 p-8 text-center text-black">
              <span className="text-[10px] font-black tracking-widest uppercase opacity-60">Destiny Report</span>
              <h2 className="text-3xl font-serif font-black mt-1 tracking-tighter">{sajuResult.title}</h2>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-amber-500 text-[10px] font-black tracking-widest uppercase">핵심 기운</h3>
                <p className="text-lg font-serif text-white italic leading-relaxed">"{sajuResult.essence}"</p>
              </div>

              <div className="relative pt-8 border-t border-white/5">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xl z-10 flex flex-col items-center justify-center rounded-2xl p-6 text-center border border-white/10">
                  <p className="text-white font-bold text-sm mb-4">상세 재물/애정운 잠금 해제</p>
                  <a href={KAKAO_LINK} target="_blank" className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs hover:bg-amber-500 transition-colors">
                    상담 예약하고 결과 보기 ⚡
                  </a>
                </div>
                <div className="opacity-10 blur-sm select-none pointer-events-none space-y-2">
                  <div className="h-4 bg-white/20 rounded w-full"></div>
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <h3 className="text-zinc-500 text-[10px] font-black tracking-widest uppercase mb-2">오늘의 비책</h3>
                <p className="text-amber-500/90 text-sm font-medium leading-relaxed">{sajuResult.advice}</p>
              </div>
            </div>
          </div>
          <button onClick={()=>setSajuResult(null)} className="mt-8 text-zinc-600 w-full text-center text-[10px] uppercase tracking-widest hover:text-white transition-colors">다시 입력하기</button>
        </div>
      )}

      <footer className="mt-16 text-center">
        <p className="text-zinc-700 text-[9px] uppercase tracking-widest">© 2025 DDAGIMAN Fortune Lab.</p>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
