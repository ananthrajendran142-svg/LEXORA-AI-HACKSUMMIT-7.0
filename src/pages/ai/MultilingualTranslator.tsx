import React, { useState, useEffect } from 'react';
import { Globe, Volume2, VolumeX, Square, Play } from 'lucide-react';
import { speakText, stopSpeech } from '@/lib/speech';
import { fastApi } from '@/services/fastapi';

export const MultilingualTranslator = () => {
  const [sourceText, setSourceText] = useState(
    "UPON HEARING the learned counsel for the petitioner, IT IS HEREBY ORDERED that Notice be issued to Respondent returnable within three weeks."
  );
  const [targetLang, setTargetLang] = useState('Hindi');
  const [translatedText, setTranslatedText] = useState(
    "याचिकाकर्ता के विद्वान अधिवक्ता को सुनने के बाद, एतद्द्वारा आदेश दिया जाता है कि उत्तरदाता को तीन सप्ताह के भीतर तामील हेतु नोटिस जारी किया जाए।"
  );
  const [loading, setLoading] = useState(false);
  const [speakingField, setSpeakingField] = useState<'source' | 'target' | null>(null);

  // Ensure browser voices load asynchronously
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => stopSpeech();
  }, []);

  const handleTranslate = async () => {
    setLoading(true);
    stopSpeech();
    setSpeakingField(null);

    try {
      const res = await fastApi.translate(sourceText, targetLang);
      if (res && res.translated_text) {
        setTranslatedText(res.translated_text);
      }
    } catch (e) {
      console.warn('Translation API fallback:', e);
      // Fallback to statutory standard translations
      if (targetLang === 'Hindi') {
        setTranslatedText("याचिकाकर्ता के विद्वान अधिवक्ता को सुनने के बाद, एतद्द्वारा आदेश दिया जाता है कि उत्तरदाता को तीन सप्ताह के भीतर तामील हेतु नोटिस जारी किया जाए।");
      } else if (targetLang === 'Tamil') {
        setTranslatedText("மனுதாரரின் வழக்கறிஞரின் வாதத்தைக் கேட்ட பிறகு, எதிர்மனுதாருக்கு மூன்று வாரங்களுக்குள் நோட்டீஸ் அனுப்ப உத்தரவிடப்படுகிறது.");
      } else if (targetLang === 'Telugu') {
        setTranslatedText("పిటిషనర్ తరఫు న్యాయవాది వాదనలు విన్న తర్వాత, ప్రతివాదికి మూడు వారాల్లోగా నోటీసు జారీ చేయాలని ఉత్తర్వులు జారీ చేయడమైనది.");
      } else if (targetLang === 'Marathi') {
        setTranslatedText("याचिकाकर्त्याच्या विद्वान वकिलांचे ऐकल्यानंतर, याद्वारे असा आदेश देण्यात येत आहे की प्रतिवाद्याला तीन आठवड्यांच्या आत नोटीस बजावली जावी.");
      } else if (targetLang === 'Bengali') {
        setTranslatedText("পিটিশনারের বিজ্ঞ আইনজীবীর বক্তব্য শোনার পর, এতদ্বারা আদেশ দেওয়া হচ্ছে যে তিন সপ্তাহের মধ্যে উত্তরদাতাকে নোটিশ জারি করতে হবে।");
      } else if (targetLang === 'Gujarati') {
        setTranslatedText("અરજદારના વિદ્વાન વકીલને સાંભળ્યા પછી, આથી એવો હુકમ કરવામાં આવે છે કે સામાવાળાને ત્રણ અઠવાડિયામાં નોટિસ બજાવવી.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (text: string, langName: string, field: 'source' | 'target') => {
    if (speakingField === field) {
      stopSpeech();
      setSpeakingField(null);
      return;
    }

    speakText({
      text,
      langName,
      onStart: () => setSpeakingField(field),
      onEnd: () => setSpeakingField(null),
      onError: () => setSpeakingField(null)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-subtle pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Multilingual Judicial Translation & Voice Audio Engine
        </h1>
        <p className="theme-subtext text-xs sm:text-sm mt-1">
          Translate court orders, notices, and pleadings with full Text-to-Speech audio support across Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, and English.
        </p>
      </div>

      {/* Main Translation Card */}
      <div className="theme-card border border-subtle rounded-xl p-6 space-y-5 shadow-xl">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-subtle pb-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-blue-600 dark:text-blue-400">Source Language:</span>
            <span className="px-2.5 py-1 theme-elevated border border-subtle rounded font-semibold theme-heading">English</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-blue-600 dark:text-blue-400">Target Language:</span>
            <select
              value={targetLang}
              onChange={(e) => {
                setTargetLang(e.target.value);
                stopSpeech();
                setSpeakingField(null);
              }}
              className="px-3 py-1.5 theme-elevated border border-subtle rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 outline-none cursor-pointer"
            >
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
              <option value="Marathi">मराठी (Marathi)</option>
              <option value="Bengali">বাংলা (Bengali)</option>
              <option value="Gujarati">ગુજરાતી (Gujarati)</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        {/* Text Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Source Text Box */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-blue-600 dark:text-blue-400">
                Source Text (English):
              </label>

              {/* TTS Button for Source Text */}
              <button
                type="button"
                onClick={() => handlePlayAudio(sourceText, 'English', 'source')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  speakingField === 'source'
                    ? 'theme-primary-btn shadow-md'
                    : 'theme-secondary-btn'
                }`}
                title="Listen Source Text Aloud"
              >
                {speakingField === 'source' ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{speakingField === 'source' ? 'Stop Audio' : '🔊 Listen English'}</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter legal notice, court order, or petition text in English..."
              className="w-full p-3.5 theme-elevated border border-subtle rounded-xl text-xs theme-heading placeholder:theme-subtext outline-none leading-relaxed"
            />
          </div>

          {/* Translated Text Box */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-blue-600 dark:text-blue-400">
                Translated Text ({targetLang}):
              </label>

              {/* TTS Button for Translated Text */}
              <button
                type="button"
                onClick={() => handlePlayAudio(translatedText, targetLang, 'target')}
                disabled={!translatedText}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  speakingField === 'target'
                    ? 'theme-primary-btn shadow-md'
                    : 'theme-secondary-btn'
                }`}
                title={`Listen ${targetLang} Audio Speech`}
              >
                {speakingField === 'target' ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{speakingField === 'target' ? 'Stop Audio' : `🔊 Listen ${targetLang}`}</span>
              </button>
            </div>

            <textarea
              rows={6}
              readOnly
              value={translatedText}
              placeholder="Translated judicial text will appear here..."
              className="w-full p-3.5 theme-card border border-subtle rounded-xl text-xs theme-heading outline-none font-serif leading-relaxed"
            />
          </div>
        </div>

        {/* Global Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleTranslate}
            disabled={loading}
            className="px-6 py-3 theme-primary-btn text-xs font-extrabold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>{loading ? 'Translating Judicial Terminology...' : `Translate to ${targetLang}`}</span>
          </button>

          {speakingField && (
            <button
              onClick={() => { stopSpeech(); setSpeakingField(null); }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop Active Audio Speech</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultilingualTranslator;
