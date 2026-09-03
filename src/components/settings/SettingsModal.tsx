import React, { useState } from 'react';
import {
  X,
  Key,
  Server,
  Sliders,
  Check,
  ShieldCheck,
  Info,
  RotateCcw
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import type { VideoQuality } from '../../types/anime';

export const SettingsModal: React.FC = () => {
  const { settings, updateSettings, resetSettings, isSettingsOpen, setIsSettingsOpen } =
    useSettings();

  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey);
  const [endpointInput, setEndpointInput] = useState(settings.apiEndpoint);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    updateSettings({
      apiKey: apiKeyInput.trim(),
      apiEndpoint: endpointInput.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsSettingsOpen(false);
    }, 900);
  };

  const qualities: VideoQuality[] = ['1080p', '720p', '480p', '360p'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={() => setIsSettingsOpen(false)} />

      <div className="relative w-full max-w-lg bg-dark-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-dark-850/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pengaturan Streaming</h3>
              <p className="text-xs text-slate-400">Konfigurasi API Key & Preferensi Pemutar</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* API Key Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Key className="w-3.5 h-3.5 text-brand-cyan" />
                API Key Streaming
              </label>
              <span className="text-[11px] text-slate-400">
                {apiKeyInput ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3" /> API Aktif
                  </span>
                ) : (
                  <span className="text-brand-cyan">Default Built-in CDN</span>
                )}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Contoh: ak_live_948f20b8e7c1..."
                className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 focus:border-brand-cyan/40"
              />
            </div>
            <div className="p-3 rounded-xl bg-brand-cyan/5 border border-brand-cyan/15 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                Tersedia untuk menyambungkan penyedia streaming eksternal kamu nantinya (Gogoanime, Consumet, RapidAPI, dll).
                Jika dikosongkan, player akan otomatis menggunakan server multi-resolusi HD default kami.
              </p>
            </div>
          </div>

          {/* Custom Stream Endpoint */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Server className="w-3.5 h-3.5 text-brand-purple" />
              Custom API Base Endpoint (Opsional)
            </label>
            <input
              type="text"
              value={endpointInput}
              onChange={(e) => setEndpointInput(e.target.value)}
              placeholder="https://your-anime-api.vercel.app"
              className="w-full px-4 py-2 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>

          {/* Preferred Default Quality */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Kualitas Default Pemutar
            </label>
            <div className="grid grid-cols-4 gap-2">
              {qualities.map((q) => {
                const isSelected = settings.preferredQuality === q;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => updateSettings({ preferredQuality: q })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-brand-cyan text-dark-950 border-brand-cyan shadow-lg shadow-brand-cyan/20'
                        : 'bg-dark-950 text-slate-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {q}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Opsi Pemutaran Otomatis
            </h4>

            {/* Auto Play */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors">
              <div>
                <p className="text-sm font-medium text-white">Autoplay Video</p>
                <p className="text-xs text-slate-400">Mulai pemutaran otomatis saat membuka episode</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) => updateSettings({ autoPlay: e.target.checked })}
                className="w-5 h-5 accent-brand-cyan rounded cursor-pointer"
              />
            </label>

            {/* Auto Next */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors">
              <div>
                <p className="text-sm font-medium text-white">Otomatis Episode Berikutnya</p>
                <p className="text-xs text-slate-400">
                  Lanjut ke episode selanjutnya saat episode ini berakhir
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoNext}
                onChange={(e) => updateSettings({ autoNext: e.target.checked })}
                className="w-5 h-5 accent-brand-cyan rounded cursor-pointer"
              />
            </label>

            {/* Auto Skip Intro */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors">
              <div>
                <p className="text-sm font-medium text-white">Otomatis Lewati Intro (+85s)</p>
                <p className="text-xs text-slate-400">Lewati lagu pembuka opening anime secara otomatis</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSkipIntro}
                onChange={(e) => updateSettings({ autoSkipIntro: e.target.checked })}
                className="w-5 h-5 accent-brand-cyan rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-dark-850/80 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              resetSettings();
              setApiKeyInput('');
              setEndpointInput('https://api.consumet.org/anime/gogoanime');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Default
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-dark-950 bg-gradient-to-r from-brand-cyan to-brand-purple hover:opacity-90 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Tersimpan!
                </>
              ) : (
                'Simpan Pengaturan'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
