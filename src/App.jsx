import { useState, useEffect, useCallback, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --cream: #F5F0E8; --warm-white: #FDFAF4; --terracotta: #C4623A;
    --terracotta-dark: #A04E2C; --terracotta-light: #E8896A;
    --sand: #D4B896; --sand-light: #EAD9C4; --ink: #1C1410;
    --ink-soft: #3D2E24; --muted: #8A7060; --success: #4A7C59;
    --error: #B44040;
  }
  body { background: var(--cream); font-family: 'DM Sans', sans-serif; color: var(--ink); }
  .app { max-width: 430px; margin: 0 auto; min-height: 100vh; background: var(--warm-white); display: flex; flex-direction: column; }
  .header { background: var(--ink); color: var(--cream); padding: 18px 22px 14px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .header-title { font-family: 'Playfair Display', serif; font-size: 26px; letter-spacing: -0.5px; }
  .header-title span { color: var(--terracotta-light); font-style: italic; }
  .header-right { display: flex; align-items: center; gap: 10px; }
  .streak-badge { background: var(--terracotta); color: white; font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 20px; }
  .nav { display: flex; background: var(--ink); padding: 0 6px 8px; flex-shrink: 0; }
  .nav-btn { flex: 1; background: none; border: none; color: var(--muted); cursor: pointer; padding: 10px 4px 6px; font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 500; display: flex; flex-direction: column; align-items: center; gap: 3px; transition: color 0.2s; letter-spacing: 0.5px; text-transform: uppercase; }
  .nav-btn .nav-icon { font-size: 17px; }
  .nav-btn.active { color: var(--terracotta-light); }
  .page { padding: 18px 18px 24px; flex: 1; overflow-y: auto; animation: fadeIn 0.25s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  .section-label { font-size: 10px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  .card { background: var(--cream); border-radius: 14px; padding: 16px; margin-bottom: 12px; border: 1px solid var(--sand-light); }
  .card-sub { font-size: 12px; color: var(--muted); margin-bottom: 10px; line-height: 1.5; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 12px 18px; border-radius: 10px; border: none; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.16s; width: 100%; }
  .btn-primary { background: var(--terracotta); color: white; }
  .btn-primary:hover { background: var(--terracotta-dark); }
  .btn-primary:disabled { background: var(--sand); cursor: not-allowed; }
  .btn-secondary { background: var(--sand-light); color: var(--ink-soft); }
  .btn-ghost { background: none; border: 1.5px solid var(--sand); color: var(--ink-soft); }
  .btn-ghost:hover { border-color: var(--terracotta); color: var(--terracotta); }
  .btn-sm { padding: 7px 13px; font-size: 12px; border-radius: 8px; width: auto; }
  .chip-group { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 12px; }
  .chip { padding: 5px 13px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1.5px solid var(--sand-light); background: white; color: var(--ink-soft); transition: all 0.14s; font-family: 'DM Sans', sans-serif; }
  .chip.active { background: var(--terracotta); border-color: var(--terracotta); color: white; }
  .chip:hover:not(.active) { border-color: var(--terracotta); color: var(--terracotta); }
  .select { width: 100%; border: 1.5px solid var(--sand-light); border-radius: 10px; padding: 10px; font-size: 13px; color: var(--ink-soft); background: white; font-family: 'DM Sans', sans-serif; }
  .vocab-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 9px 0; border-bottom: 1px solid var(--sand-light); }
  .vocab-item:last-child { border-bottom: none; }
  .vocab-word { font-weight: 500; font-size: 14px; color: var(--terracotta-dark); }
  .vocab-type { font-size: 11px; color: var(--sand); font-style: italic; }
  .vocab-translation { font-size: 12px; color: var(--muted); text-align: right; max-width: 55%; }
  .grammar-rule { background: var(--ink); color: var(--cream); border-radius: 12px; padding: 13px 15px; margin-bottom: 12px; }
  .grammar-rule h4 { font-family: 'Playfair Display', serif; font-size: 14px; color: var(--terracotta-light); margin-bottom: 5px; }
  .grammar-rule p { font-size: 12px; line-height: 1.6; color: var(--sand-light); }
  .grammar-rule code { background: #2E2218; padding: 1px 5px; border-radius: 4px; font-size: 11px; color: var(--terracotta-light); }
  .prompt-box { background: linear-gradient(135deg, var(--terracotta) 0%, var(--terracotta-dark) 100%); border-radius: 14px; padding: 18px; margin-bottom: 14px; color: white; }
  .prompt-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7; margin-bottom: 7px; }
  .prompt-text { font-family: 'Playfair Display', serif; font-size: 17px; line-height: 1.5; }
  textarea { width: 100%; border: 1.5px solid var(--sand-light); border-radius: 11px; padding: 13px; font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.6; color: var(--ink); background: white; resize: vertical; min-height: 130px; transition: border-color 0.2s; outline: none; }
  textarea:focus { border-color: var(--terracotta); }
  .text-input { width: 100%; border: 1.5px solid var(--sand-light); border-radius: 10px; padding: 10px; font-size: 13px; color: var(--ink-soft); background: white; font-family: 'DM Sans', sans-serif; }
  .score-circle { width: 76px; height: 76px; border-radius: 50%; border: 3px solid var(--terracotta); display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto 14px; }
  .score-number { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--terracotta); line-height: 1; }
  .score-pct { font-size: 10px; color: var(--muted); }
  .feedback-section { margin-bottom: 12px; }
  .feedback-section h4 { font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 7px; display: flex; align-items: center; gap: 5px; }
  .feedback-item { background: white; border-radius: 9px; padding: 11px 13px; margin-bottom: 7px; font-size: 13px; line-height: 1.6; border-left: 3px solid var(--sand); }
  .feedback-item.good { border-left-color: var(--success); }
  .feedback-item.error { border-left-color: var(--error); }
  .feedback-item.tip { border-left-color: var(--terracotta); }
  .original { color: var(--error); text-decoration: line-through; font-size: 12px; }
  .corrected { color: var(--success); font-weight: 500; }
  .explanation { color: var(--muted); font-size: 12px; margin-top: 3px; }
  .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .calendar-month { font-family: 'Playfair Display', serif; font-size: 19px; }
  .cal-nav { background: none; border: none; cursor: pointer; font-size: 18px; color: var(--muted); padding: 4px 8px; }
  .cal-nav:hover { color: var(--terracotta); }
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
  .cal-day-label { text-align: center; font-size: 10px; color: var(--muted); padding: 4px 0; font-weight: 500; }
  .cal-day { aspect-ratio: 1; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; transition: all 0.13s; }
  .cal-day.empty { cursor: default; }
  .cal-day.today { font-weight: 700; color: var(--terracotta); border: 1.5px solid var(--terracotta); }
  .cal-day.has-session { background: var(--terracotta); color: white; font-weight: 500; cursor: pointer; }
  .cal-day.has-session:hover { background: var(--terracotta-dark); }
  .cal-day:not(.empty):not(.has-session):hover { background: var(--sand-light); }
  .session-card { background: var(--cream); border-radius: 12px; border: 1px solid var(--sand-light); padding: 13px 14px; margin-bottom: 9px; cursor: pointer; transition: all 0.14s; }
  .session-card:hover { border-color: var(--terracotta); transform: translateY(-1px); }
  .session-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 7px; }
  .session-card-title { font-family: 'Playfair Display', serif; font-size: 15px; color: var(--ink); flex: 1; margin-right: 10px; }
  .session-score { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--terracotta); }
  .session-meta { display: flex; gap: 6px; flex-wrap: wrap; }
  .meta-tag { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: var(--sand-light); color: var(--muted); font-weight: 500; }
  .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 13px 0; border-bottom: 1px solid var(--sand-light); }
  .settings-row:last-child { border-bottom: none; }
  .settings-label { font-size: 14px; font-weight: 500; color: var(--ink-soft); }
  .settings-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 20px; gap: 14px; }
  .spinner { width: 34px; height: 34px; border: 3px solid var(--sand-light); border-top-color: var(--terracotta); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 13px; color: var(--muted); font-style: italic; }
  .empty-state { text-align: center; padding: 50px 20px; }
  .empty-icon { font-size: 38px; margin-bottom: 10px; }
  .empty-state h3 { font-family: 'Playfair Display', serif; font-size: 18px; margin-bottom: 6px; }
  .empty-state p { font-size: 13px; color: var(--muted); line-height: 1.6; }
  .drawer-overlay { position: fixed; inset: 0; background: rgba(28,20,16,0.5); z-index: 100; animation: fadeIn 0.2s; }
  .drawer { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: var(--warm-white); border-radius: 18px 18px 0 0; padding: 18px 18px 36px; max-height: 75vh; overflow-y: auto; z-index: 101; animation: slideUp 0.22s ease; }
  @keyframes slideUp { from { transform: translateX(-50%) translateY(18px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
  .drawer-handle { width: 34px; height: 4px; background: var(--sand); border-radius: 2px; margin: 0 auto 14px; }
  .drawer-title { font-family: 'Playfair Display', serif; font-size: 17px; margin-bottom: 14px; }
  .grammar-warning { background: #FFF5F0; border: 1px solid var(--terracotta-light); border-radius: 9px; padding: 9px 13px; margin-bottom: 10px; font-size: 12px; color: var(--ink-soft); display: flex; align-items: flex-start; gap: 7px; }
  .dropzone { border: 1.5px dashed var(--sand); border-radius: 12px; background: #fff; padding: 18px; text-align: center; cursor: pointer; transition: all 0.15s; margin-bottom: 10px; }
  .dropzone:hover, .dropzone.drag { border-color: var(--terracotta); background: #FFF7F2; }
  .dropzone p { font-size: 12px; color: var(--muted); }
  .vocab-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .vocab-table th, .vocab-table td { border-bottom: 1px solid var(--sand-light); padding: 8px 6px; font-size: 12px; text-align: left; }
  .vocab-table th { color: var(--muted); font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
  .table-input { width: 100%; border: 1px solid var(--sand-light); border-radius: 7px; padding: 6px; font-size: 12px; }
  .chapter-card { background: var(--cream); border: 1px solid var(--sand-light); border-radius: 11px; padding: 12px; margin-bottom: 9px; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .chapter-name { font-weight: 500; font-size: 14px; }
  .chapter-meta { font-size: 11px; color: var(--muted); margin-top: 2px; }
`;

const CEFR_LEVELS = ["A1","A2","B1","B2","C1","C2"];
const SKILL_OPTIONS = ["Speaking","Writing","Both"];
const TIME_OPTIONS = [{ label:"5 min", value:5 },{ label:"15 min", value:15 },{ label:"30 min", value:30 }];
const DAYS = ["Mo","Tu","We","Th","Fr","Sa","Su"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STORAGE_KEY = "habla_v1";
const loadStore = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}"); } catch { return {}; } };
const saveStore = (d) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} };

async function callLLM(messages, system) {
  const res = await fetch("/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.text || "";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

async function extractVocab(imageFile) {
  const base64 = await fileToBase64(imageFile);
  const messages = [{
    role: "user",
    content: [
      { type: "image_url", image_url: { url: `data:${imageFile.type};base64,${base64}` } },
      {
        type: "text",
        text: "Extract all Spanish vocabulary pairs visible in this image. Return ONLY valid JSON: {\"vocab\":[{\"word\":\"...\",\"translation\":\"...\"}],\"detectedTitle\":\"...or null\"}"
      }
    ]
  }];
  const system = "You are a vocabulary extraction assistant. Extract Spanish–English word pairs from workbook images. Respond ONLY with valid JSON.";
  const result = await callLLM(messages, system);
  const parsed = JSON.parse(result.replace(/```json|```/g, "").trim());
  return {
    vocab: Array.isArray(parsed.vocab) ? parsed.vocab : [],
    detectedTitle: parsed.detectedTitle || "",
  };
}

export default function HablaApp() {
  const [tab, setTab] = useState("home");
  const [settings, setSettings] = useState({ level:"B1", skill:"Speaking", time:15 });
  const [sessions, setSessions] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [streak, setStreak] = useState(0);
  const [grammarWeaknesses, setGrammarWeaknesses] = useState([]);

  const [phase, setPhase] = useState("idle");
  const [brief, setBrief] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [calMonth, setCalMonth] = useState(new Date());
  const [drawerDay, setDrawerDay] = useState(null);
  const [viewSession, setViewSession] = useState(null);

  const [libraryBusy, setLibraryBusy] = useState(false);
  const [libraryError, setLibraryError] = useState("");
  const [draftChapterName, setDraftChapterName] = useState("");
  const [draftVocab, setDraftVocab] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const s = loadStore();
    if (s.sessions) setSessions(s.sessions);
    if (s.settings) setSettings(s.settings);
    if (s.grammarWeaknesses) setGrammarWeaknesses(s.grammarWeaknesses);
    if (s.chapters) setChapters(s.chapters);
  }, []);

  useEffect(() => {
    if (selectedChapterId && !chapters.some(c => c.id === selectedChapterId)) setSelectedChapterId("");
  }, [chapters, selectedChapterId]);

  useEffect(() => {
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 366; i++) {
      const key = d.toDateString();
      const has = sessions.some(s => new Date(s.date).toDateString() === key);
      if (!has && i > 0) break;
      if (has) count++;
      d.setDate(d.getDate() - 1);
    }
    setStreak(count);
  }, [sessions]);

  const persist = useCallback((newSessions, newSettings, newWeaknesses, newChapters) => {
    saveStore({ sessions: newSessions, settings: newSettings, grammarWeaknesses: newWeaknesses, chapters: newChapters });
  }, []);

  const updateSettings = (s) => { setSettings(s); persist(sessions, s, grammarWeaknesses, chapters); };

  const saveChapter = (chapter) => {
    const newChapters = [chapter, ...chapters];
    setChapters(newChapters);
    persist(sessions, settings, grammarWeaknesses, newChapters);
  };

  const deleteChapter = (id) => {
    const newChapters = chapters.filter(c => c.id !== id);
    setChapters(newChapters);
    persist(sessions, settings, grammarWeaknesses, newChapters);
    if (selectedChapterId === id) setSelectedChapterId("");
  };

  const generateBrief = async (retryTopic = null) => {
    setPhase("generating");
    setFeedback(null);
    setTranscription("");

    const selectedChapter = chapters.find(c => c.id === selectedChapterId);
    const weakCtx = grammarWeaknesses.length
      ? `The learner struggles with: ${grammarWeaknesses.slice(0,4).join(", ")}. Naturally embed practice of these in the prompt.`
      : "";
    const pastTopics = sessions.slice(0,10).map(s => s.topic).join(", ");
    const retryNote = retryTopic ? `This retries the topic "${retryTopic}" — fresh angle, same theme.` : "";

    const system = `You are a Castilian Spanish (Spain) tutor. Always use vosotros, Peninsular vocabulary, leísmo where natural. Never use Latin American variants. Respond ONLY with valid JSON, no markdown fences.`;
    const vocabCount = settings.time === 5 ? 4 : settings.time === 15 ? 7 : 10;
    const grammarCount = settings.time === 5 ? 1 : 2;

    const chapterCtx = selectedChapter
      ? `\n\nThis session is based on Chapter: "${selectedChapter.name}".\nYou MUST build the exercise using ONLY the following vocabulary. Do not introduce any words, phrases, or topics outside this list:\n\n${selectedChapter.vocab.map(v => `- ${v.word}: ${v.translation}`).join("\n")}\n\nPick a realistic scenario where these words arise naturally. The "vocab" field in your JSON response must be drawn exclusively from the list above (pick the most relevant subset for the exercise).`
      : "";

    const prompt = `Generate a ${settings.time}-min ${settings.skill.toLowerCase()} exercise for ${settings.level}.
${weakCtx} ${retryNote}
Avoid recent topics: ${pastTopics || "none"}.
Return JSON:
{
  "topic": "short title",
  "prompt": "exercise prompt in English",
  "vocab": [{"word":"","translation":"","type":""}],
  "grammar": [{"rule":"","explanation":"","example":""}]
}
${vocabCount} vocab items, ${grammarCount} grammar rule(s). Make the prompt realistic and set in Spain.${chapterCtx}`;

    try {
      const raw = await callLLM([{ role:"user", content:prompt }], system);
      const data = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setBrief({ ...data, skill:settings.skill, level:settings.level, time:settings.time, retryTopic, chapterId: selectedChapter?.id || null });
      setPhase("brief");
    } catch {
      setPhase("idle");
      alert("Could not generate session. Please try again.");
    }
  };

  const analyse = async () => {
    if (!transcription.trim()) return;
    setPhase("analysing");
    const system = `You are a strict Castilian Spanish (Spain) tutor. Evaluate using Peninsular standards only. Respond ONLY with valid JSON, no markdown.`;
    const prompt = `Analyse this ${brief.level} ${brief.skill.toLowerCase()} response.
Topic: ${brief.topic}
Prompt: ${brief.prompt}
Learner response: ${transcription}
Return JSON:
{
  "score": <0-100>,
  "correct": ["strength 1", "strength 2"],
  "errors": [{"original":"","corrected":"","explanation":""}],
  "tips": ["natural phrasing tip"],
  "grammarIssues": ["grammar concept name if error found"]
}
Use Castilian standards. Score: 90+ excellent, 75-89 good, 60-74 fair, <60 needs work.`;

    try {
      const raw = await callLLM([{ role:"user", content:prompt }], system);
      const data = JSON.parse(raw.replace(/```json|```/g,"").trim());

      const newWeaknesses = data.grammarIssues?.length
        ? [...new Set([...data.grammarIssues, ...grammarWeaknesses])].slice(0,8)
        : grammarWeaknesses;

      const newSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        topic: brief.topic,
        prompt: brief.prompt,
        transcription,
        feedback: data,
        skill: brief.skill,
        level: brief.level,
        time: brief.time,
        score: data.score,
        retryOf: brief.retryTopic || null,
        chapterId: selectedChapterId || null,
      };
      const newSessions = [newSession, ...sessions];
      setSessions(newSessions);
      setGrammarWeaknesses(newWeaknesses);
      persist(newSessions, settings, newWeaknesses, chapters);
      setFeedback(data);
      setPhase("feedback");
    } catch {
      setPhase("brief");
      alert("Analysis failed. Please try again.");
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setLibraryError("");
    setLibraryBusy(true);
    try {
      const extracted = await extractVocab(file);
      setDraftChapterName(extracted.detectedTitle || "");
      setDraftVocab(extracted.vocab.map(v => ({ word: v.word || "", translation: v.translation || "" })));
    } catch {
      setLibraryError("Could not extract vocabulary from image. Please try a clearer photo.");
    } finally {
      setLibraryBusy(false);
    }
  };

  const saveDraftChapter = () => {
    const cleanedVocab = draftVocab
      .map(v => ({ word: v.word.trim(), translation: v.translation.trim() }))
      .filter(v => v.word && v.translation);
    const finalName = draftChapterName.trim() || `Chapter ${chapters.length + 1}`;
    if (!cleanedVocab.length) {
      setLibraryError("Please provide at least one valid word + translation pair.");
      return;
    }
    saveChapter({
      id: Date.now().toString(),
      name: finalName,
      vocab: cleanedVocab,
      createdAt: new Date().toISOString(),
    });
    setDraftChapterName("");
    setDraftVocab([]);
    setLibraryError("");
  };

  const reset = () => { setPhase("idle"); setBrief(null); setFeedback(null); setTranscription(""); };

  const HomeView = () => (
    <div className="page">
      <div style={{ marginBottom:18 }}>
        <p className="section-label">Today's session</p>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:21, marginBottom:4 }}>
          {phase==="idle" ? "¿Qué vamos a aprender hoy?" : brief?.topic || "Generando…"}
        </h2>
        {grammarWeaknesses.length > 0 && phase==="idle" && (
          <div className="grammar-warning">
            <span style={{ color:"var(--terracotta)" }}>⚠</span>
            <span>Targeting: <strong>{grammarWeaknesses.slice(0,2).join(", ")}</strong></span>
          </div>
        )}
      </div>

      {phase==="idle" && (
        <>
          <div className="card">
            <p className="section-label">Skill focus</p>
            <div className="chip-group">
              {SKILL_OPTIONS.map(s => (
                <button key={s} className={`chip ${settings.skill===s?"active":""}`}
                  onClick={() => updateSettings({...settings, skill:s})}>{s}</button>
              ))}
            </div>
            <p className="section-label">Time available</p>
            <div className="chip-group">
              {TIME_OPTIONS.map(t => (
                <button key={t.value} className={`chip ${settings.time===t.value?"active":""}`}
                  onClick={() => updateSettings({...settings, time:t.value})}>{t.label}</button>
              ))}
            </div>
            {chapters.length > 0 && (
              <>
                <p className="section-label">Chapter</p>
                <select className="select" value={selectedChapterId} onChange={(e) => setSelectedChapterId(e.target.value)}>
                  <option value="">Random (no chapter)</option>
                  {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                </select>
              </>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => generateBrief()}>✦ Start Session</button>
        </>
      )}

      {phase==="generating" && (
        <div className="loading"><div className="spinner"/><p className="loading-text">Preparing your exercise…</p></div>
      )}

      {phase==="brief" && brief && (
        <>
          <div className="prompt-box">
            <p className="prompt-label">Your prompt</p>
            <p className="prompt-text">{brief.prompt}</p>
          </div>
          {brief.grammar?.map((g,i) => (
            <div className="grammar-rule" key={i}>
              <h4>📐 {g.rule}</h4>
              <p>{g.explanation} {g.example && <><br/><code>{g.example}</code></>}</p>
            </div>
          ))}
          <div className="card">
            <p className="section-label">Key vocabulary</p>
            {brief.vocab?.map((v,i) => (
              <div className="vocab-item" key={i}>
                <div><p className="vocab-word">{v.word}</p><p className="vocab-type">{v.type}</p></div>
                <p className="vocab-translation">{v.translation}</p>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{marginBottom:9}} onClick={() => setPhase("transcription")}>
            ✓ Ready — I've prepared my response
          </button>
          <button className="btn btn-ghost" onClick={reset}>← Start over</button>
        </>
      )}

      {phase==="transcription" && (
        <>
          <div className="prompt-box">
            <p className="prompt-label">Reminder</p>
            <p className="prompt-text" style={{fontSize:15}}>{brief.prompt}</p>
          </div>
          <div className="card">
            <p className="section-label">Paste your transcription</p>
            <p className="card-sub">Record in Whisper or write directly, then paste your Spanish below.</p>
            <textarea placeholder="Escribe o pega tu respuesta aquí…" value={transcription}
              onChange={e => setTranscription(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{marginBottom:9}} disabled={!transcription.trim()} onClick={analyse}>
            ✦ Analyse my Spanish
          </button>
          <button className="btn btn-ghost" onClick={() => setPhase("brief")}>← Back to brief</button>
        </>
      )}

      {phase==="analysing" && (
        <div className="loading"><div className="spinner"/><p className="loading-text">Analysing your Castilian…</p></div>
      )}

      {phase==="feedback" && feedback && (
        <>
          <div className="score-circle">
            <span className="score-number">{feedback.score}</span>
            <span className="score-pct">%</span>
          </div>
          {feedback.correct?.length > 0 && (
            <div className="feedback-section">
              <h4 style={{color:"var(--success)"}}>✓ What you got right</h4>
              {feedback.correct.map((c,i) => <div key={i} className="feedback-item good">{c}</div>)}
            </div>
          )}
          {feedback.errors?.length > 0 && (
            <div className="feedback-section">
              <h4 style={{color:"var(--error)"}}>✗ Corrections</h4>
              {feedback.errors.map((e,i) => (
                <div key={i} className="feedback-item error">
                  <p className="original">"{e.original}"</p>
                  <p className="corrected">→ "{e.corrected}"</p>
                  <p className="explanation">{e.explanation}</p>
                </div>
              ))}
            </div>
          )}
          {feedback.tips?.length > 0 && (
            <div className="feedback-section">
              <h4 style={{color:"var(--terracotta)"}}>💡 Sound more natural</h4>
              {feedback.tips.map((t,i) => <div key={i} className="feedback-item tip">{t}</div>)}
            </div>
          )}
          <button className="btn btn-primary" style={{marginBottom:9}} onClick={reset}>✦ New Session</button>
          <button className="btn btn-ghost" onClick={() => { reset(); setTab("history"); }}>View in history →</button>
        </>
      )}
    </div>
  );

  const CalendarView = () => {
    const yr = calMonth.getFullYear(), mo = calMonth.getMonth();
    const firstDow = (new Date(yr,mo,1).getDay()+6)%7;
    const daysInMo = new Date(yr,mo+1,0).getDate();
    const today = new Date();
    const byDay = {};
    sessions.forEach(s => {
      const d = new Date(s.date);
      if (d.getFullYear()===yr && d.getMonth()===mo) {
        const k = d.getDate(); if (!byDay[k]) byDay[k]=[];
        byDay[k].push(s);
      }
    });
    return (
      <div className="page">
        <div className="calendar-header">
          <button className="cal-nav" onClick={() => setCalMonth(new Date(yr,mo-1))}>‹</button>
          <h2 className="calendar-month">{MONTHS[mo]} {yr}</h2>
          <button className="cal-nav" onClick={() => setCalMonth(new Date(yr,mo+1))}>›</button>
        </div>
        <div style={{background:"var(--cream)",borderRadius:14,padding:14,marginBottom:18}}>
          <div className="cal-grid">
            {DAYS.map(d => <div key={d} className="cal-day-label">{d}</div>)}
            {Array(firstDow).fill(null).map((_,i) => <div key={`e${i}`} className="cal-day empty"/>)}
            {Array(daysInMo).fill(null).map((_,i) => {
              const day = i+1;
              const isToday = today.getDate()===day && today.getMonth()===mo && today.getFullYear()===yr;
              const ds = byDay[day];
              return (
                <div key={day} className={`cal-day ${isToday?"today":""} ${ds?"has-session":""}`}
                  onClick={() => ds && setDrawerDay({day,sessions:ds,mo,yr})}>
                  {day}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{background:"var(--terracotta)",borderRadius:8,padding:"6px 14px",color:"white",fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700}}>{streak}</div>
          <div><p style={{fontWeight:500,fontSize:14}}>day streak</p><p style={{fontSize:12,color:"var(--muted)"}}>¡Sigue así!</p></div>
        </div>
        {drawerDay && (
          <>
            <div className="drawer-overlay" onClick={() => setDrawerDay(null)}/>
            <div className="drawer">
              <div className="drawer-handle"/>
              <p className="drawer-title">{MONTHS[drawerDay.mo]} {drawerDay.day}</p>
              {drawerDay.sessions.map(s => (
                <div key={s.id} className="session-card"
                  onClick={() => { setViewSession(s); setDrawerDay(null); setTab("history"); }}>
                  <div className="session-card-header">
                    <p className="session-card-title">{s.topic}</p>
                    <p className="session-score">{s.score}%</p>
                  </div>
                  <div className="session-meta">
                    <span className="meta-tag">{s.level}</span>
                    <span className="meta-tag">{s.skill}</span>
                    <span className="meta-tag">{s.time} min</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const HistoryView = () => {
    if (viewSession) {
      const chapterName = chapters.find(c => c.id === viewSession.chapterId)?.name;
      return (
        <div className="page">
          <button className="btn btn-ghost btn-sm" style={{marginBottom:14,width:"auto"}}
            onClick={() => setViewSession(null)}>← Back</button>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,marginBottom:6}}>{viewSession.topic}</h2>
          <div className="session-meta" style={{marginBottom:14}}>
            <span className="meta-tag">{viewSession.level}</span>
            <span className="meta-tag">{viewSession.skill}</span>
            <span className="meta-tag">{viewSession.time} min</span>
            <span className="meta-tag">{new Date(viewSession.date).toLocaleDateString("en-GB")}</span>
            {chapterName && <span className="meta-tag" style={{background:"#FFF0E8",color:"var(--terracotta)"}}>{chapterName}</span>}
          </div>
          <div className="score-circle">
            <span className="score-number">{viewSession.score}</span>
            <span className="score-pct">%</span>
          </div>
          <div className="card" style={{marginTop:10}}>
            <p className="section-label">Your response</p>
            <p style={{fontSize:13,lineHeight:1.7,color:"var(--ink-soft)"}}>{viewSession.transcription}</p>
          </div>
          {viewSession.feedback?.errors?.length > 0 && (
            <div className="feedback-section">
              <h4 style={{color:"var(--error)"}}>✗ Corrections</h4>
              {viewSession.feedback.errors.map((e,i) => (
                <div key={i} className="feedback-item error">
                  <p className="original">"{e.original}"</p>
                  <p className="corrected">→ "{e.corrected}"</p>
                  <p className="explanation">{e.explanation}</p>
                </div>
              ))}
            </div>
          )}
          {viewSession.feedback?.tips?.length > 0 && (
            <div className="feedback-section">
              <h4 style={{color:"var(--terracotta)"}}>💡 Tips</h4>
              {viewSession.feedback.tips.map((t,i) => <div key={i} className="feedback-item tip">{t}</div>)}
            </div>
          )}
          <button className="btn btn-primary" style={{marginTop:6}}
            onClick={() => { setViewSession(null); generateBrief(viewSession.topic); setTab("home"); }}>
            ↺ Retry this topic
          </button>
        </div>
      );
    }

    return (
      <div className="page">
        <p className="section-label" style={{marginBottom:12}}>Past sessions</p>
        {sessions.length===0 ? (
          <div className="empty-state">
            <p className="empty-icon">📖</p>
            <h3>No sessions yet</h3>
            <p>Complete your first session and it will appear here.</p>
          </div>
        ) : sessions.map(s => {
          const chapterName = chapters.find(c => c.id === s.chapterId)?.name;
          return (
            <div key={s.id} className="session-card" onClick={() => setViewSession(s)}>
              <div className="session-card-header">
                <p className="session-card-title">{s.topic}</p>
                <p className="session-score">{s.score}%</p>
              </div>
              <div className="session-meta">
                <span className="meta-tag">{s.level}</span>
                <span className="meta-tag">{s.skill}</span>
                <span className="meta-tag">{s.time} min</span>
                <span className="meta-tag">{new Date(s.date).toLocaleDateString("en-GB")}</span>
                {s.retryOf && <span className="meta-tag" style={{background:"#FFF0E8",color:"var(--terracotta)"}}>retry</span>}
                {chapterName && <span className="meta-tag" style={{background:"#FFF0E8",color:"var(--terracotta)"}}>{chapterName}</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const LibraryView = () => (
    <div className="page">
      <p className="section-label" style={{marginBottom:6}}>Workbook upload</p>
      <div className="card">
        <div
          className={`dropzone ${isDragOver ? "drag" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleImageUpload(e.dataTransfer.files?.[0]);
          }}
        >
          <p style={{fontSize:22, marginBottom:6}}>🖼️</p>
          <p>Drop workbook photo here, or tap to upload.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{display:"none"}}
          onChange={(e) => handleImageUpload(e.target.files?.[0])}
        />

        {libraryBusy && <div className="loading" style={{padding:"20px 0"}}><div className="spinner"/><p className="loading-text">Extracting vocabulary…</p></div>}
        {libraryError && <p style={{fontSize:12, color:"var(--error)", marginBottom:8}}>{libraryError}</p>}

        {draftVocab.length > 0 && (
          <>
            <p className="section-label" style={{marginTop:6}}>Chapter name</p>
            <input className="text-input" value={draftChapterName} placeholder="Chapter 3 — El mercado" onChange={(e) => setDraftChapterName(e.target.value)} />

            <p className="section-label" style={{marginTop:10}}>Review vocabulary</p>
            <table className="vocab-table">
              <thead>
                <tr><th>Spanish</th><th>English</th><th/></tr>
              </thead>
              <tbody>
                {draftVocab.map((item, i) => (
                  <tr key={i}>
                    <td><input className="table-input" value={item.word} onChange={(e) => {
                      const next = [...draftVocab];
                      next[i] = { ...next[i], word: e.target.value };
                      setDraftVocab(next);
                    }} /></td>
                    <td><input className="table-input" value={item.translation} onChange={(e) => {
                      const next = [...draftVocab];
                      next[i] = { ...next[i], translation: e.target.value };
                      setDraftVocab(next);
                    }} /></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setDraftVocab(draftVocab.filter((_, idx) => idx !== i))}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{display:"flex", gap:8, marginTop:10}}>
              <button className="btn btn-secondary btn-sm" onClick={() => setDraftVocab([...draftVocab, { word:"", translation:"" }])}>+ Add row</button>
              <button className="btn btn-primary btn-sm" onClick={saveDraftChapter}>Save chapter</button>
            </div>
          </>
        )}
      </div>

      <p className="section-label" style={{marginBottom:6}}>Saved chapters</p>
      {chapters.length === 0 ? (
        <div className="empty-state" style={{padding:"20px 10px"}}>
          <p className="empty-icon" style={{fontSize:24}}>📚</p>
          <p>No chapter uploads yet.</p>
        </div>
      ) : chapters.map(ch => (
        <div key={ch.id} className="chapter-card">
          <div>
            <p className="chapter-name">{ch.name}</p>
            <p className="chapter-meta">{ch.vocab.length} vocabulary pairs</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => deleteChapter(ch.id)}>Delete</button>
        </div>
      ))}
    </div>
  );

  const SettingsView = () => (
    <div className="page">
      <p className="section-label" style={{marginBottom:6}}>Level</p>
      <div className="card">
        <p className="card-sub">CEFR level — affects topics, vocabulary complexity, and feedback strictness.</p>
        <div className="chip-group">
          {CEFR_LEVELS.map(l => (
            <button key={l} className={`chip ${settings.level===l?"active":""}`}
              onClick={() => updateSettings({...settings, level:l})}>{l}</button>
          ))}
        </div>
      </div>
      {grammarWeaknesses.length > 0 && (
        <>
          <p className="section-label" style={{marginBottom:6}}>Grammar targets</p>
          <div className="card">
            <p className="card-sub">Claude will naturally drill these patterns in upcoming sessions.</p>
            <div className="chip-group">
              {grammarWeaknesses.map((g,i) => <span key={i} className="chip active" style={{fontSize:11}}>{g}</span>)}
            </div>
            <button className="btn btn-ghost btn-sm" style={{marginTop:6}}
              onClick={() => { setGrammarWeaknesses([]); persist(sessions, settings, [], chapters); }}>
              Clear all
            </button>
          </div>
        </>
      )}
      <p className="section-label" style={{marginBottom:6}}>Stats</p>
      <div className="card">
        <div className="settings-row">
          <div><p className="settings-label">Dialect</p><p className="settings-sub">Castilian Spanish (Spain) 🇪🇸</p></div>
        </div>
        <div className="settings-row">
          <div><p className="settings-label">Sessions completed</p><p className="settings-sub">{sessions.length} total</p></div>
        </div>
        <div className="settings-row">
          <div><p className="settings-label">Current streak</p><p className="settings-sub">{streak} {streak===1?"day":"days"}</p></div>
        </div>
        {sessions.length > 0 && (
          <div className="settings-row">
            <div>
              <p className="settings-label">Average score</p>
              <p className="settings-sub">{Math.round(sessions.reduce((a,s)=>a+s.score,0)/sessions.length)}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <h1 className="header-title">ha<span>bla</span></h1>
          <div className="header-right">
            {streak > 0 && <div className="streak-badge">🔥 {streak}</div>}
          </div>
        </header>
        <main style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {tab==="home" && <HomeView/>}
          {tab==="calendar" && <CalendarView/>}
          {tab==="history" && <HistoryView/>}
          {tab==="library" && <LibraryView/>}
          {tab==="settings" && <SettingsView/>}
        </main>
        <nav className="nav">
          {[
            {id:"home",icon:"✦",label:"Practice"},
            {id:"calendar",icon:"◫",label:"Calendar"},
            {id:"history",icon:"◎",label:"History"},
            {id:"library",icon:"▤",label:"Library"},
            {id:"settings",icon:"⊙",label:"Settings"},
          ].map(n => (
            <button key={n.id} className={`nav-btn ${tab===n.id?"active":""}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
