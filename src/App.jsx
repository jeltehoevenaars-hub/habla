import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

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
const TIME_OPTIONS = [{ label:"5 min", value:5 },{ label:"15 min", value:15 },{ label:"30 min", value:30 }];
const DAYS = ["Mo","Tu","We","Th","Fr","Sa","Su"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DEFAULT_SETTINGS = { level:"B1", skill:"Schrijven", time:15 };

const STORAGE_KEY = "habla_v1";
const CLOUD_TABLE = "user_state";
const SYNC_INTERVAL_MS = 30 * 60 * 1000;
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
    reader.onerror = () => reject(new Error("Afbeeldingsbestand kon niet worden gelezen."));
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
        text: "Extraheer alle Spaanse woordparen die zichtbaar zijn op deze afbeelding. Het gaat om Spaans-Nederlands. Geef ALLEEN geldige JSON terug: {\"vocab\":[{\"word\":\"...\",\"translation\":\"...\"}],\"detectedTitle\":\"...of null\"}"
      }
    ]
  }];
  const system = "Je bent een assistent voor woordenschatextractie. Extraheer Spaans-Nederlandse woordparen uit werkboekafbeeldingen. Antwoord ALLEEN met geldige JSON.";
  const result = await callLLM(messages, system);
  const parsed = JSON.parse(result.replace(/```json|```/g, "").trim());
  return {
    vocab: Array.isArray(parsed.vocab) ? parsed.vocab : [],
    detectedTitle: parsed.detectedTitle || "",
  };
}

const toCleanVocabPairs = (pairs = []) => pairs
  .map((v) => ({ word: String(v.word || "").trim(), translation: String(v.translation || "").trim() }))
  .filter((v) => v.word && v.translation);

const mergeUniqueVocab = (current = [], incoming = []) => {
  const seen = new Set();
  const merged = [];
  [...current, ...incoming].forEach((item) => {
    const word = String(item.word || "").trim();
    const translation = String(item.translation || "").trim();
    if (!word || !translation) return;
    const key = `${word.toLowerCase()}::${translation.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push({ word, translation });
  });
  return merged;
};

const normalizeSettings = (raw) => ({
  level: CEFR_LEVELS.includes(raw?.level) ? raw.level : DEFAULT_SETTINGS.level,
  skill: "Schrijven",
  time: TIME_OPTIONS.some((t) => t.value === raw?.time) ? raw.time : DEFAULT_SETTINGS.time,
});

const normalizeChapters = (raw = []) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((chapter) => ({
      id: String(chapter?.id || "").trim(),
      name: String(chapter?.name || "").trim(),
      vocab: Array.isArray(chapter?.vocab) ? chapter.vocab : [],
      filesUploaded: Number(chapter?.filesUploaded || 0),
    }))
    .filter((chapter) => chapter.id && chapter.name);
};

const normalizeSessions = (raw = []) => {
  if (!Array.isArray(raw)) return [];
  return raw.map((session) => {
    const chapterIds = Array.isArray(session.chapterIds)
      ? session.chapterIds
      : (session.chapterId ? [session.chapterId] : []);
    return {
      ...session,
      skill: "Schrijven",
      chapterIds,
      chapterId: chapterIds[0] || null,
    };
  });
};

export default function HablaApp() {
  const [tab, setTab] = useState("home");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState([]);
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
  const [librarySelectedChapterId, setLibrarySelectedChapterId] = useState("");
  const [homeChapterPickerId, setHomeChapterPickerId] = useState("");
  const [draftVocab, setDraftVocab] = useState([]);
  const [draftFileCount, setDraftFileCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [lastSyncAt, setLastSyncAt] = useState("");
  const [showNewChapterInput, setShowNewChapterInput] = useState(false);
  const [newChapterName, setNewChapterName] = useState("");
  const [renamingChapterId, setRenamingChapterId] = useState(null);
  const [renameName, setRenameName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const fileInputRef = useRef(null);
  const hasHydrated = useRef(false);

  const buildPayload = useCallback((newSessions, newSettings, newWeaknesses, newChapters) => ({
    sessions: newSessions,
    settings: newSettings,
    grammarWeaknesses: newWeaknesses,
    chapters: newChapters,
    updatedAt: new Date().toISOString(),
  }), []);

  const pullCloudState = useCallback(async (uid) => {
    if (!supabase || !uid) return;
    const { data, error } = await supabase
      .from(CLOUD_TABLE)
      .select("payload")
      .eq("user_id", uid)
      .maybeSingle();
    if (error) throw error;
    if (!data?.payload) return;
    const cloud = data.payload;
    if (cloud.sessions) setSessions(normalizeSessions(cloud.sessions));
    if (cloud.settings) setSettings(normalizeSettings(cloud.settings));
    if (cloud.grammarWeaknesses) setGrammarWeaknesses(cloud.grammarWeaknesses);
    setChapters(normalizeChapters(cloud.chapters));
    saveStore({
      ...cloud,
      sessions: normalizeSessions(cloud.sessions),
      settings: normalizeSettings(cloud.settings),
      chapters: normalizeChapters(cloud.chapters),
    });
    setLastSyncAt(new Date().toISOString());
  }, []);

  const persist = useCallback(async (newSessions, newSettings, newWeaknesses, newChapters, options = {}) => {
    const payload = buildPayload(newSessions, newSettings, newWeaknesses, newChapters);
    saveStore(payload);
    if (!supabase || !user || options.localOnly) return;
    if (options.silent !== true) setSyncBusy(true);
    setSyncError("");
    const { error } = await supabase.from(CLOUD_TABLE).upsert({
      user_id: user.id,
      payload,
      updated_at: new Date().toISOString(),
    });
    if (options.silent !== true) setSyncBusy(false);
    if (error) {
      setSyncError(error.message || "Cloud synchronisatie mislukt.");
      return;
    }
    setLastSyncAt(new Date().toISOString());
  }, [buildPayload, user]);

  useEffect(() => {
    const s = loadStore();
    if (s.sessions) setSessions(normalizeSessions(s.sessions));
    if (s.settings) setSettings(normalizeSettings(s.settings));
    if (s.grammarWeaknesses) setGrammarWeaknesses(s.grammarWeaknesses);
    setChapters(normalizeChapters(s.chapters));
    hasHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthError("");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    pullCloudState(user.id).catch((err) => setSyncError(err.message || "Cloudgegevens ophalen mislukt."));
  }, [user, pullCloudState]);

  useEffect(() => {
    const valid = new Set(chapters.map((c) => c.id));
    setSelectedChapterIds((prev) => prev.filter((id) => valid.has(id)));
    if (librarySelectedChapterId && !valid.has(librarySelectedChapterId)) {
      setLibrarySelectedChapterId("");
      setDraftVocab([]);
      setDraftFileCount(0);
    }
  }, [chapters, librarySelectedChapterId]);

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

  useEffect(() => {
    if (!user || !hasHydrated.current) return;
    const id = window.setInterval(() => {
      persist(sessions, settings, grammarWeaknesses, chapters, { silent: true });
    }, SYNC_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [chapters, grammarWeaknesses, persist, sessions, settings, user]);

  const updateSettings = (s) => {
    const normalized = normalizeSettings(s);
    setSettings(normalized);
    persist(sessions, normalized, grammarWeaknesses, chapters);
  };

  const saveDraftToChapter = () => {
    if (!librarySelectedChapterId) {
      setLibraryError("Kies eerst een hoofdstuk.");
      return;
    }
    const cleanedVocab = toCleanVocabPairs(draftVocab);
    if (!cleanedVocab.length) {
      setLibraryError("Voeg minimaal één geldig woord + vertaling toe.");
      return;
    }
    const newChapters = chapters.map((chapter) => {
      if (chapter.id !== librarySelectedChapterId) return chapter;
      return {
        ...chapter,
        vocab: mergeUniqueVocab(chapter.vocab, cleanedVocab),
        filesUploaded: chapter.filesUploaded + Math.max(draftFileCount, 1),
      };
    });
    setChapters(newChapters);
    persist(sessions, settings, grammarWeaknesses, newChapters);
    setDraftVocab([]);
    setDraftFileCount(0);
    setLibraryError("");
  };

  const addChapter = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString();
    const newChapters = [...chapters, { id, name: trimmed, vocab: [], filesUploaded: 0 }];
    setChapters(newChapters);
    persist(sessions, settings, grammarWeaknesses, newChapters);
  };

  const deleteChapter = (id) => {
    const newChapters = chapters.filter((c) => c.id !== id);
    setChapters(newChapters);
    persist(sessions, settings, grammarWeaknesses, newChapters);
    if (librarySelectedChapterId === id) {
      setLibrarySelectedChapterId("");
      setDraftVocab([]);
      setDraftFileCount(0);
    }
  };

  const renameChapter = (id, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const newChapters = chapters.map((c) => c.id === id ? { ...c, name: trimmed } : c);
    setChapters(newChapters);
    persist(sessions, settings, grammarWeaknesses, newChapters);
  };

  const generateBrief = async (retryTopic = null, forcedChapterIds = null) => {
    setPhase("generating");
    setFeedback(null);
    setTranscription("");

    const activeChapterIds = Array.isArray(forcedChapterIds) ? forcedChapterIds : selectedChapterIds;
    const selectedChapters = chapters.filter((c) => activeChapterIds.includes(c.id) && c.vocab.length > 0);
    const weakCtx = grammarWeaknesses.length
      ? `De leerling heeft moeite met: ${grammarWeaknesses.slice(0,4).join(", ")}. Verwerk oefening hiervan op natuurlijke wijze in de opdracht.`
      : "";
    const pastTopics = sessions.slice(0,10).map(s => s.topic).join(", ");
    const retryNote = retryTopic ? `Dit is een herhaling van het onderwerp "${retryTopic}" — nieuwe invalshoek, zelfde thema.` : "";

    const system = `Je bent een Castiliaans-Spaanse docent (Spanje). Gebruik altijd vosotros, Peninsulaire woordenschat en leísmo waar natuurlijk. Gebruik nooit Latijns-Amerikaanse varianten. Antwoord ALLEEN met geldige JSON, zonder markdown.`;
    const vocabCount = settings.time === 5 ? 4 : settings.time === 15 ? 7 : 10;
    const grammarCount = settings.time === 5 ? 1 : 2;
    const chapterWordSet = new Set(
      selectedChapters.flatMap((chapter) => chapter.vocab.map((item) => String(item.word || "").trim().toLowerCase()))
    );

    const chapterCtx = selectedChapters.length
      ? `\n\nDeze sessie moet de volgende werkboekhoofdstukken gebruiken: ${selectedChapters.map((c) => `"${c.name}"`).join(", ")}.\nGebruik deze woordenschat als basis:\n\n${selectedChapters.flatMap((chapter) => chapter.vocab.map((v) => `- ${v.word}: ${v.translation}`)).join("\n")}\n\nMaak een splitsing in je JSON-antwoord:\n- "requiredVocab": exact 5 woorden uit bovenstaande lijst die verplicht in de tekst gebruikt moeten worden.\n- "supportVocab": exact 5 extra woorden die nuttig zijn voor dit onderwerp, maar NIET in bovenstaande lijst staan.\nGebruik in "type" respectievelijk "verplicht" en "handig".`
      : "";

    const prompt = `Genereer een ${settings.time}-minuten ${settings.skill.toLowerCase()}-oefening voor ${settings.level}.
${weakCtx} ${retryNote}
Vermijd recente onderwerpen: ${pastTopics || "geen"}.
Geef JSON terug:
{
  "topic": "short title",
  "prompt": "oefenopdracht in het Nederlands",
  "requiredVocab": [{"word":"","translation":"","type":"verplicht"}],
  "supportVocab": [{"word":"","translation":"","type":"handig"}],
  "grammar": [{"rule":"","explanation":"","example":""}]
}
${selectedChapters.length ? "Gebruik exact 5 requiredVocab-items en exact 5 supportVocab-items." : `${vocabCount} vocab-items verdeeld over requiredVocab en supportVocab.`} ${grammarCount} grammaticaregel(s). Maak de opdracht realistisch en gesitueerd in een Spaans-sprekend land.${chapterCtx}`;

    try {
      const raw = await callLLM([{ role:"user", content:prompt }], system);
      const data = JSON.parse(raw.replace(/```json|```/g,"").trim());
      const requiredVocab = Array.isArray(data.requiredVocab) ? data.requiredVocab : [];
      const supportVocabRaw = Array.isArray(data.supportVocab) ? data.supportVocab : [];
      const fallbackVocab = Array.isArray(data.vocab) ? data.vocab : [];
      const supportVocab = selectedChapters.length
        ? supportVocabRaw.filter((item) => !chapterWordSet.has(String(item?.word || "").trim().toLowerCase()))
        : supportVocabRaw;
      setBrief({
        ...data,
        requiredVocab: requiredVocab.length ? requiredVocab : fallbackVocab.slice(0, selectedChapters.length ? 5 : vocabCount),
        supportVocab: supportVocab.length ? supportVocab : fallbackVocab.slice(selectedChapters.length ? 5 : Math.ceil(vocabCount / 2)),
        skill: settings.skill,
        level: settings.level,
        time: settings.time,
        retryTopic,
        chapterIds: activeChapterIds,
      });
      setPhase("brief");
    } catch {
      setPhase("idle");
      alert("Sessie genereren mislukt. Probeer het opnieuw.");
    }
  };

  const analyse = async () => {
    if (!transcription.trim()) return;
    setPhase("analysing");
    const system = `Je bent een strenge Castiliaans-Spaanse docent (Spanje). Beoordeel alleen op Peninsulaire standaarden. Antwoord ALLEEN met geldige JSON, zonder markdown.`;
    const prompt = `Analyseer deze ${brief.level} ${brief.skill.toLowerCase()}-reactie.
Onderwerp: ${brief.topic}
Opdracht: ${brief.prompt}
Reactie van de leerling: ${transcription}
Geef JSON terug:
{
  "score": <0-100>,
  "correct": ["sterk punt 1", "sterk punt 2"],
  "errors": [{"original":"","corrected":"","explanation":""}],
  "tips": ["tip voor natuurlijkere formulering"],
  "grammarIssues": ["naam van grammatica-onderwerp als er een fout is"]
}
Gebruik Castiliaanse standaarden. Score: 90+ uitstekend, 75-89 goed, 60-74 redelijk, <60 moet beter.`;

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
        chapterIds: brief.chapterIds || selectedChapterIds,
        chapterId: (brief.chapterIds || selectedChapterIds)[0] || null,
      };
      const newSessions = [newSession, ...sessions];
      setSessions(newSessions);
      setGrammarWeaknesses(newWeaknesses);
      persist(newSessions, settings, newWeaknesses, chapters);
      setFeedback(data);
      setPhase("feedback");
    } catch {
      setPhase("brief");
      alert("Analyse mislukt. Probeer het opnieuw.");
    }
  };

  const handleImageUploadBatch = async (fileList) => {
    const files = Array.from(fileList || []).filter((file) => file?.type?.startsWith("image/"));
    if (!files.length) return;
    if (!librarySelectedChapterId) {
      setLibraryError("Selecteer een hoofdstuk voordat je bestanden uploadt.");
      return;
    }
    setLibraryError("");
    setLibraryBusy(true);
    try {
      const extractedRows = [];
      let failed = 0;
      for (const file of files) {
        try {
          const extracted = await extractVocab(file);
          extractedRows.push(...toCleanVocabPairs(extracted.vocab));
        } catch {
          failed += 1;
        }
      }
      if (extractedRows.length > 0) {
        setDraftVocab((prev) => mergeUniqueVocab(prev, extractedRows));
        setDraftFileCount((prev) => prev + (files.length - failed));
      }
      if (extractedRows.length === 0) {
        setLibraryError("Kon geen woordenschat uit de geselecteerde afbeeldingen halen. Probeer duidelijkere foto's.");
      } else if (failed > 0) {
        setLibraryError(`Processed ${files.length - failed} file(s). ${failed} file(s) failed.`);
      }
    } catch {
      setLibraryError("Kon geen woordenschat uit de afbeelding halen. Probeer een duidelijkere foto.");
    } finally {
      setLibraryBusy(false);
    }
  };

  const handleAuth = async (mode) => {
    if (!supabase) return;
    setAuthBusy(true);
    setAuthError("");
    const email = authEmail.trim();
    if (!email || !authPassword) {
      setAuthBusy(false);
      setAuthError("Vul zowel e-mailadres als wachtwoord in.");
      return;
    }
    const { error } = mode === "signup"
      ? await supabase.auth.signUp({ email, password: authPassword })
      : await supabase.auth.signInWithPassword({ email, password: authPassword });
    setAuthBusy(false);
    if (error) {
      setAuthError(error.message || "Authenticatie mislukt.");
      return;
    }
    setAuthPassword("");
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  const manualSync = async () => {
    await persist(sessions, settings, grammarWeaknesses, chapters);
  };

  const reset = () => { setPhase("idle"); setBrief(null); setFeedback(null); setTranscription(""); };
  const getChapterNamesForSession = (session) => {
    const ids = Array.isArray(session.chapterIds)
      ? session.chapterIds
      : (session.chapterId ? [session.chapterId] : []);
    return ids
      .map((id) => chapters.find((chapter) => chapter.id === id)?.name)
      .filter(Boolean);
  };

  const HomeView = () => (
    <div className="page">
      <div style={{ marginBottom:18 }}>
        <p className="section-label">Sessie van vandaag</p>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:21, marginBottom:4 }}>
          {phase==="idle" ? "Wat gaan we vandaag leren?" : brief?.topic || "Bezig met genereren…"}
        </h2>
        {grammarWeaknesses.length > 0 && phase==="idle" && (
          <div className="grammar-warning">
            <span style={{ color:"var(--terracotta)" }}>⚠</span>
            <span>Focus op: <strong>{grammarWeaknesses.slice(0,2).join(", ")}</strong></span>
          </div>
        )}
      </div>

      {phase==="idle" && (
        <>
          <div className="card">
            <p className="section-label">Vaardigheid</p>
            <div className="chip-group"><span className="chip active">Schrijven</span></div>
            <p className="section-label">Beschikbare tijd</p>
            <div className="chip-group">
              {TIME_OPTIONS.map(t => (
                <button key={t.value} className={`chip ${settings.time===t.value?"active":""}`}
                  onClick={() => updateSettings({...settings, time:t.value})}>{t.label}</button>
              ))}
            </div>
            <p className="section-label">Hoofdstukken (kies één of meer)</p>
            <div style={{display:"grid", gap:8}}>
              <select className="select" value={homeChapterPickerId} onChange={(e) => setHomeChapterPickerId(e.target.value)}>
                <option value="">Kies een hoofdstuk</option>
                {[...chapters].sort((a, b) => a.name.localeCompare(b.name)).map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                ))}
              </select>
              <button
                className="btn btn-secondary btn-sm"
                disabled={!homeChapterPickerId}
                onClick={() => {
                  setSelectedChapterIds((prev) => (
                    homeChapterPickerId && !prev.includes(homeChapterPickerId)
                      ? [...prev, homeChapterPickerId]
                      : prev
                  ));
                  setHomeChapterPickerId("");
                }}
              >
                + Hoofdstuk toevoegen
              </button>
            </div>
            <div className="chip-group" style={{marginTop:8}}>
              {selectedChapterIds.length === 0 && <span className="chip">Geen hoofdstuk geselecteerd</span>}
              {selectedChapterIds.map((id) => {
                const chapter = chapters.find((item) => item.id === id);
                if (!chapter) return null;
                return (
                  <button
                    key={chapter.id}
                    className="chip active"
                    onClick={() => setSelectedChapterIds((prev) => prev.filter((chapterId) => chapterId !== chapter.id))}
                  >
                    {chapter.name} ×
                  </button>
                );
              })}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => generateBrief()}>✦ Start sessie</button>
        </>
      )}

      {phase==="generating" && (
        <div className="loading"><div className="spinner"/><p className="loading-text">Je oefening wordt voorbereid…</p></div>
      )}

      {phase==="brief" && brief && (
        <>
          <div className="prompt-box">
            <p className="prompt-label">Jouw opdracht</p>
            <p className="prompt-text">{brief.prompt}</p>
          </div>
          {brief.grammar?.map((g,i) => (
            <div className="grammar-rule" key={i}>
              <h4>📐 {g.rule}</h4>
              <p>{g.explanation} {g.example && <><br/><code>{g.example}</code></>}</p>
            </div>
          ))}
          <div className="card">
            <p className="section-label">Verplichte woorden (uit woordenlijst)</p>
            {brief.requiredVocab?.map((v,i) => (
              <div className="vocab-item" key={i}>
                <div><p className="vocab-word">{v.word}</p><p className="vocab-type">{v.type}</p></div>
                <p className="vocab-translation">{v.translation}</p>
              </div>
            ))}
          </div>
          <div className="card">
            <p className="section-label">Handige extra woorden (niet in woordenlijst)</p>
            {brief.supportVocab?.map((v,i) => (
              <div className="vocab-item" key={i}>
                <div><p className="vocab-word">{v.word}</p><p className="vocab-type">{v.type}</p></div>
                <p className="vocab-translation">{v.translation}</p>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{marginBottom:9}} onClick={() => setPhase("transcription")}>
            ✓ Klaar — ik heb mijn antwoord voorbereid
          </button>
          <button className="btn btn-ghost" onClick={reset}>← Opnieuw beginnen</button>
        </>
      )}

      {phase==="transcription" && (
        <>
          <div className="prompt-box">
            <p className="prompt-label">Herinnering</p>
            <p className="prompt-text" style={{fontSize:15}}>{brief.prompt}</p>
          </div>
          <div className="card">
            <p className="section-label">Plak je transcriptie</p>
            <p className="card-sub">Neem op in Whisper of schrijf direct, en plak daarna je Spaanse tekst hieronder.</p>
            <textarea placeholder="Schrijf of plak je antwoord hier…" value={transcription}
              onChange={e => setTranscription(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{marginBottom:9}} disabled={!transcription.trim()} onClick={analyse}>
            ✦ Analyseer mijn Spaans
          </button>
          <button className="btn btn-ghost" onClick={() => setPhase("brief")}>← Terug naar opdracht</button>
        </>
      )}

      {phase==="analysing" && (
        <div className="loading"><div className="spinner"/><p className="loading-text">Je Castiliaans wordt geanalyseerd…</p></div>
      )}

      {phase==="feedback" && feedback && (
        <>
          <div className="score-circle">
            <span className="score-number">{feedback.score}</span>
            <span className="score-pct">%</span>
          </div>
          {feedback.correct?.length > 0 && (
            <div className="feedback-section">
              <h4 style={{color:"var(--success)"}}>✓ Wat je goed deed</h4>
              {feedback.correct.map((c,i) => <div key={i} className="feedback-item good">{c}</div>)}
            </div>
          )}
          {feedback.errors?.length > 0 && (
            <div className="feedback-section">
              <h4 style={{color:"var(--error)"}}>✗ Correcties</h4>
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
              <h4 style={{color:"var(--terracotta)"}}>💡 Natuurlijker formuleren</h4>
              {feedback.tips.map((t,i) => <div key={i} className="feedback-item tip">{t}</div>)}
            </div>
          )}
          <button className="btn btn-primary" style={{marginBottom:9}} onClick={reset}>✦ Nieuwe sessie</button>
          <button className="btn btn-ghost" onClick={() => { reset(); setTab("history"); }}>Bekijk in geschiedenis →</button>
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
          <div><p style={{fontWeight:500,fontSize:14}}>dagenreeks</p><p style={{fontSize:12,color:"var(--muted)"}}>Ga zo door!</p></div>
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
                    {getChapterNamesForSession(s).map((name) => (
                      <span key={`${s.id}-${name}`} className="meta-tag" style={{background:"#FFF0E8",color:"var(--terracotta)"}}>{name}</span>
                    ))}
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
      const chapterNames = getChapterNamesForSession(viewSession);
      return (
        <div className="page">
          <button className="btn btn-ghost btn-sm" style={{marginBottom:14,width:"auto"}}
            onClick={() => setViewSession(null)}>← Terug</button>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,marginBottom:6}}>{viewSession.topic}</h2>
          <div className="session-meta" style={{marginBottom:14}}>
            <span className="meta-tag">{viewSession.level}</span>
            <span className="meta-tag">{viewSession.skill}</span>
            <span className="meta-tag">{viewSession.time} min</span>
            <span className="meta-tag">{new Date(viewSession.date).toLocaleDateString("nl-NL")}</span>
            {chapterNames.map((name) => (
              <span key={name} className="meta-tag" style={{background:"#FFF0E8",color:"var(--terracotta)"}}>{name}</span>
            ))}
          </div>
          <div className="score-circle">
            <span className="score-number">{viewSession.score}</span>
            <span className="score-pct">%</span>
          </div>
          <div className="card" style={{marginTop:10}}>
            <p className="section-label">Jouw antwoord</p>
            <p style={{fontSize:13,lineHeight:1.7,color:"var(--ink-soft)"}}>{viewSession.transcription}</p>
          </div>
          {viewSession.feedback?.errors?.length > 0 && (
            <div className="feedback-section">
              <h4 style={{color:"var(--error)"}}>✗ Correcties</h4>
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
            onClick={() => {
              const chapterIds = Array.isArray(viewSession.chapterIds)
                ? viewSession.chapterIds
                : (viewSession.chapterId ? [viewSession.chapterId] : []);
              setSelectedChapterIds(chapterIds);
              setViewSession(null);
              generateBrief(viewSession.topic, chapterIds);
              setTab("home");
            }}>
            ↺ Opnieuw met dit onderwerp
          </button>
        </div>
      );
    }

    return (
      <div className="page">
        <p className="section-label" style={{marginBottom:12}}>Eerdere sessies</p>
        {sessions.length===0 ? (
          <div className="empty-state">
            <p className="empty-icon">📖</p>
            <h3>Nog geen sessies</h3>
            <p>Voltooi je eerste sessie en die verschijnt hier.</p>
          </div>
        ) : sessions.map(s => {
          const chapterNames = getChapterNamesForSession(s);
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
                <span className="meta-tag">{new Date(s.date).toLocaleDateString("nl-NL")}</span>
                {s.retryOf && <span className="meta-tag" style={{background:"#FFF0E8",color:"var(--terracotta)"}}>opnieuw</span>}
                {chapterNames.map((name) => (
                  <span key={`${s.id}-${name}`} className="meta-tag" style={{background:"#FFF0E8",color:"var(--terracotta)"}}>{name}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const LibraryView = () => {
    const sortedChapters = [...chapters].sort((a, b) => a.name.localeCompare(b.name));
    const activeChapter = chapters.find((chapter) => chapter.id === librarySelectedChapterId);

    if (activeChapter) {
      const isRenamingDetail = renamingChapterId === activeChapter.id;
      const isConfirmingDeleteDetail = confirmDeleteId === activeChapter.id;

      return (
        <div className="page">
          <button className="btn btn-ghost btn-sm" style={{marginBottom:10, width:"auto"}} onClick={() => {
            setLibrarySelectedChapterId("");
            setDraftVocab([]);
            setDraftFileCount(0);
            setLibraryError("");
            setRenamingChapterId(null);
            setConfirmDeleteId(null);
          }}>
            ← Terug naar hoofdstukken
          </button>

          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10}}>
            <div style={{flex:1, marginRight:10}}>
              {isRenamingDetail ? (
                <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
                  <input
                    className="text-input"
                    style={{flex:1, minWidth:0}}
                    value={renameName}
                    onChange={(e) => setRenameName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { renameChapter(activeChapter.id, renameName); setRenamingChapterId(null); }
                      else if (e.key === "Escape") setRenamingChapterId(null);
                    }}
                    autoFocus
                  />
                  <button className="btn btn-primary btn-sm" onClick={() => { renameChapter(activeChapter.id, renameName); setRenamingChapterId(null); }}>Opslaan</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setRenamingChapterId(null)}>Annuleer</button>
                </div>
              ) : (
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:18}}>{activeChapter.name}</h2>
                  <button style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:14,padding:"2px 4px"}} title="Naam wijzigen" onClick={() => { setRenamingChapterId(activeChapter.id); setRenameName(activeChapter.name); }}>✏</button>
                </div>
              )}
              <p className="card-sub" style={{marginTop:4}}>{activeChapter.vocab.length} woordparen · {activeChapter.filesUploaded} bestand(en) geüpload</p>
            </div>
            {isConfirmingDeleteDetail ? (
              <div style={{display:"flex", gap:6, alignItems:"center", flexShrink:0}}>
                <span style={{fontSize:12, color:"var(--muted)"}}>Zeker weten?</span>
                <button className="btn btn-ghost btn-sm" style={{color:"var(--error)", borderColor:"var(--error)"}} onClick={() => { deleteChapter(activeChapter.id); setConfirmDeleteId(null); }}>Ja</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDeleteId(null)}>Nee</button>
              </div>
            ) : (
              <button className="btn btn-ghost btn-sm" style={{flexShrink:0, color:"var(--error)", borderColor:"var(--error)"}} onClick={() => setConfirmDeleteId(activeChapter.id)}>Verwijder</button>
            )}
          </div>

          <div className="card">
            <p className="section-label" style={{marginBottom:6}}>Bestanden uploaden</p>
            <div
              className={`dropzone ${isDragOver ? "drag" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleImageUploadBatch(e.dataTransfer.files); }}
            >
              <p style={{fontSize:22, marginBottom:6}}>🖼️</p>
              <p>Sleep één of meerdere werkboekfoto's hierheen, of tik om te uploaden.</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={(e) => handleImageUploadBatch(e.target.files)} />

            {libraryBusy && <div className="loading" style={{padding:"20px 0"}}><div className="spinner"/><p className="loading-text">Woordenschat wordt geëxtraheerd…</p></div>}
            {libraryError && <p style={{fontSize:12, color:"var(--error)", marginBottom:8}}>{libraryError}</p>}

            {draftVocab.length > 0 && (
              <>
                <p className="section-label" style={{marginTop:10}}>Nieuwe woordenschat uit upload</p>
                <table className="vocab-table">
                  <thead><tr><th>Spaans</th><th>Nederlands</th><th/></tr></thead>
                  <tbody>
                    {draftVocab.map((item, i) => (
                      <tr key={i}>
                        <td><input className="table-input" value={item.word} onChange={(e) => { const next = [...draftVocab]; next[i] = { ...next[i], word: e.target.value }; setDraftVocab(next); }} /></td>
                        <td><input className="table-input" value={item.translation} onChange={(e) => { const next = [...draftVocab]; next[i] = { ...next[i], translation: e.target.value }; setDraftVocab(next); }} /></td>
                        <td><button className="btn btn-ghost btn-sm" style={{padding:"5px 8px"}} onClick={() => setDraftVocab(draftVocab.filter((_, idx) => idx !== i))}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{display:"flex", gap:8, marginTop:10}}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setDraftVocab([...draftVocab, { word:"", translation:"" }])}>+ Rij toevoegen</button>
                  <button className="btn btn-primary btn-sm" onClick={saveDraftToChapter}>Opslaan in hoofdstuk</button>
                </div>
              </>
            )}
          </div>

          <div className="card">
            <p className="section-label" style={{marginBottom:6}}>Woordenschat</p>
            {activeChapter.vocab.length === 0 ? (
              <p className="card-sub" style={{marginBottom:8}}>Nog geen woordenschat opgeslagen voor dit hoofdstuk.</p>
            ) : (
              <table className="vocab-table">
                <thead><tr><th>Spaans</th><th>Nederlands</th><th/></tr></thead>
                <tbody>
                  {activeChapter.vocab.map((item, rowIdx) => (
                    <tr key={rowIdx}>
                      <td>
                        <input
                          className="table-input"
                          value={item.word}
                          onChange={(e) => {
                            const newVocab = activeChapter.vocab.map((v, i) => i === rowIdx ? { ...v, word: e.target.value } : v);
                            const newChapters = chapters.map((c) => c.id === activeChapter.id ? { ...c, vocab: newVocab } : c);
                            setChapters(newChapters);
                            persist(sessions, settings, grammarWeaknesses, newChapters, { localOnly: true });
                          }}
                        />
                      </td>
                      <td>
                        <input
                          className="table-input"
                          value={item.translation}
                          onChange={(e) => {
                            const newVocab = activeChapter.vocab.map((v, i) => i === rowIdx ? { ...v, translation: e.target.value } : v);
                            const newChapters = chapters.map((c) => c.id === activeChapter.id ? { ...c, vocab: newVocab } : c);
                            setChapters(newChapters);
                            persist(sessions, settings, grammarWeaknesses, newChapters, { localOnly: true });
                          }}
                        />
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" style={{padding:"5px 8px"}} onClick={() => {
                          const newVocab = activeChapter.vocab.filter((_, i) => i !== rowIdx);
                          const newChapters = chapters.map((c) => c.id === activeChapter.id ? { ...c, vocab: newVocab } : c);
                          setChapters(newChapters);
                          persist(sessions, settings, grammarWeaknesses, newChapters);
                        }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="btn btn-secondary btn-sm" style={{marginTop:8}} onClick={() => {
              const newVocab = [...activeChapter.vocab, { word: "", translation: "" }];
              const newChapters = chapters.map((c) => c.id === activeChapter.id ? { ...c, vocab: newVocab } : c);
              setChapters(newChapters);
              persist(sessions, settings, grammarWeaknesses, newChapters);
            }}>+ Rij toevoegen</button>
          </div>
        </div>
      );
    }

    return (
      <div className="page">
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
          <p className="section-label" style={{marginBottom:0}}>Bibliotheek</p>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowNewChapterInput(true); setNewChapterName(""); }}>+ Nieuw hoofdstuk</button>
        </div>

        {showNewChapterInput && (
          <div className="card" style={{marginBottom:10}}>
            <p className="section-label" style={{marginBottom:6}}>Naam van het nieuwe hoofdstuk</p>
            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              <input
                className="text-input"
                style={{flex:1, minWidth:0}}
                placeholder="Bijv. Vacances en Espagne"
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newChapterName.trim()) { addChapter(newChapterName); setShowNewChapterInput(false); setNewChapterName(""); }
                  else if (e.key === "Escape") setShowNewChapterInput(false);
                }}
                autoFocus
              />
              <button className="btn btn-primary btn-sm" disabled={!newChapterName.trim()} onClick={() => { addChapter(newChapterName); setShowNewChapterInput(false); setNewChapterName(""); }}>Aanmaken</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNewChapterInput(false)}>Annuleer</button>
            </div>
          </div>
        )}

        {sortedChapters.length === 0 && !showNewChapterInput && (
          <div className="empty-state">
            <p className="empty-icon">📚</p>
            <h3>Geen hoofdstukken</h3>
            <p>Maak een nieuw hoofdstuk aan om woordenschat op te slaan.</p>
          </div>
        )}

        {sortedChapters.map((ch) => {
          const isRenamingThis = renamingChapterId === ch.id;
          const isConfirmingDeleteThis = confirmDeleteId === ch.id;
          return (
            <div key={ch.id} className="chapter-card">
              <div style={{flex:1, minWidth:0}}>
                {isRenamingThis ? (
                  <div style={{display:"flex", gap:6, alignItems:"center"}}>
                    <input
                      className="table-input"
                      style={{flex:1, minWidth:0}}
                      value={renameName}
                      onChange={(e) => setRenameName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && renameName.trim()) { renameChapter(ch.id, renameName); setRenamingChapterId(null); }
                        else if (e.key === "Escape") setRenamingChapterId(null);
                      }}
                      autoFocus
                    />
                    <button className="btn btn-primary btn-sm" style={{padding:"5px 8px"}} onClick={() => { renameChapter(ch.id, renameName); setRenamingChapterId(null); }}>✓</button>
                    <button className="btn btn-ghost btn-sm" style={{padding:"5px 8px"}} onClick={() => setRenamingChapterId(null)}>✗</button>
                  </div>
                ) : (
                  <p className="chapter-name">{ch.name}</p>
                )}
                <p className="chapter-meta">{ch.vocab.length} woordparen · {ch.filesUploaded} bestand(en)</p>
              </div>
              <div style={{display:"flex", gap:6, alignItems:"center", flexShrink:0}}>
                {isConfirmingDeleteThis ? (
                  <>
                    <span style={{fontSize:11, color:"var(--muted)"}}>Zeker?</span>
                    <button className="btn btn-ghost btn-sm" style={{color:"var(--error)", borderColor:"var(--error)"}} onClick={() => { deleteChapter(ch.id); setConfirmDeleteId(null); }}>Ja</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDeleteId(null)}>Nee</button>
                  </>
                ) : (
                  <>
                    {!isRenamingThis && (
                      <button className="btn btn-ghost btn-sm" style={{padding:"7px 9px"}} title="Naam wijzigen" onClick={() => { setRenamingChapterId(ch.id); setRenameName(ch.name); }}>✏</button>
                    )}
                    <button className="btn btn-ghost btn-sm" style={{padding:"7px 9px", color:"var(--error)", borderColor:"var(--error)"}} title="Verwijder hoofdstuk" onClick={() => setConfirmDeleteId(ch.id)}>🗑</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setLibrarySelectedChapterId(ch.id); setDraftVocab([]); setDraftFileCount(0); setLibraryError(""); setRenamingChapterId(null); setConfirmDeleteId(null); }}>Openen</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const SettingsView = () => (
    <div className="page">
      <p className="section-label" style={{marginBottom:6}}>Niveau</p>
      <div className="card">
        <p className="card-sub">CEFR-niveau — bepaalt onderwerpen, complexiteit van woordenschat en strengheid van feedback.</p>
        <div className="chip-group">
          {CEFR_LEVELS.map(l => (
            <button key={l} className={`chip ${settings.level===l?"active":""}`}
              onClick={() => updateSettings({...settings, level:l})}>{l}</button>
          ))}
        </div>
      </div>
      {grammarWeaknesses.length > 0 && (
        <>
          <p className="section-label" style={{marginBottom:6}}>Grammaticafocus</p>
          <div className="card">
            <p className="card-sub">Deze patronen worden in komende sessies vanzelf geoefend.</p>
            <div className="chip-group">
              {grammarWeaknesses.map((g,i) => <span key={i} className="chip active" style={{fontSize:11}}>{g}</span>)}
            </div>
            <button className="btn btn-ghost btn-sm" style={{marginTop:6}}
              onClick={() => { setGrammarWeaknesses([]); persist(sessions, settings, [], chapters); }}>
              Alles wissen
            </button>
          </div>
        </>
      )}
      <p className="section-label" style={{marginBottom:6}}>Cloudsynchronisatie</p>
      <div className="card">
        {!isSupabaseConfigured ? (
          <p className="card-sub">Stel <code>VITE_SUPABASE_URL</code> en <code>VITE_SUPABASE_ANON_KEY</code> in om e-mail login + synchronisatie tussen apparaten te gebruiken.</p>
        ) : user ? (
          <>
            <p className="card-sub">Ingelogd als <strong>{user.email}</strong>.</p>
            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              <button className="btn btn-secondary btn-sm" disabled={syncBusy} onClick={manualSync}>{syncBusy ? "Synchroniseren…" : "Nu synchroniseren"}</button>
              <button className="btn btn-ghost btn-sm" onClick={signOut}>Uitloggen</button>
            </div>
            <p className="settings-sub" style={{marginTop:8}}>
              Laatste sync: {lastSyncAt ? new Date(lastSyncAt).toLocaleString("nl-NL") : "Nog niet"}
            </p>
            {syncError && <p style={{fontSize:12, color:"var(--error)", marginTop:8}}>{syncError}</p>}
          </>
        ) : (
          <>
            <p className="card-sub">Log in (of maak een account) om elke 30 minuten tussen je apparaten te synchroniseren.</p>
            <div style={{display:"grid", gap:8}}>
              <input className="text-input" type="email" placeholder="jij@voorbeeld.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
              <input className="text-input" type="password" placeholder="Wachtwoord" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
            </div>
            <div style={{display:"flex", gap:8, marginTop:10}}>
              <button className="btn btn-primary btn-sm" disabled={authBusy} onClick={() => handleAuth("signin")}>{authBusy ? "Even geduld…" : "Inloggen"}</button>
              <button className="btn btn-ghost btn-sm" disabled={authBusy} onClick={() => handleAuth("signup")}>Account maken</button>
            </div>
            {authError && <p style={{fontSize:12, color:"var(--error)", marginTop:8}}>{authError}</p>}
          </>
        )}
      </div>
      <p className="section-label" style={{marginBottom:6}}>Statistieken</p>
      <div className="card">
        <div className="settings-row">
          <div><p className="settings-label">Dialect</p><p className="settings-sub">Castiliaans Spaans (Spanje) 🇪🇸</p></div>
        </div>
        <div className="settings-row">
          <div><p className="settings-label">Afgeronde sessies</p><p className="settings-sub">{sessions.length} totaal</p></div>
        </div>
        <div className="settings-row">
          <div><p className="settings-label">Huidige reeks</p><p className="settings-sub">{streak} {streak===1?"dag":"dagen"}</p></div>
        </div>
        {sessions.length > 0 && (
          <div className="settings-row">
            <div>
              <p className="settings-label">Gemiddelde score</p>
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
          {tab==="home" && HomeView()}
          {tab==="calendar" && CalendarView()}
          {tab==="history" && HistoryView()}
          {tab==="library" && LibraryView()}
          {tab==="settings" && SettingsView()}
        </main>
        <nav className="nav">
          {[
            {id:"home",icon:"✦",label:"Oefenen"},
            {id:"calendar",icon:"◫",label:"Kalender"},
            {id:"history",icon:"◎",label:"Historie"},
            {id:"library",icon:"▤",label:"Bibliotheek"},
            {id:"settings",icon:"⊙",label:"Instellingen"},
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
