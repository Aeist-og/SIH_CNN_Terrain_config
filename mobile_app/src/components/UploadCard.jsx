import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpTrayIcon, CameraIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

function ActionButton({ label, icon: Icon, onClick, variant = 'primary', disabled = false, fullWidth = false }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#79D46E]/25';
  const styles = variant === 'primary'
    ? 'border-[#79D46E]/25 bg-[#79D46E]/12 text-[#79D46E] hover:bg-[#79D46E]/20 disabled:cursor-not-allowed disabled:opacity-60'
    : 'border-white/10 bg-[#050806]/70 text-[#ECECEC]/80 hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles} ${fullWidth ? 'w-full' : ''}`}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

export default function UploadCard({
  onUpload,
  onSampleSelect,
  samples,
  selectedSampleName,
  isAnalyzing,
  isDragging,
  setIsDragging,
  previewUrl,
  onRunAnalysis,
  hasError,
  errorMessage,
}) {
  const fileInputRef = useRef(null);

  const handleFileInput = (event) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="rounded-[32px] border border-white/10 bg-[rgba(24,33,28,0.45)] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">AI analysis workspace</p>
          <h3 className="mt-2 text-xl font-semibold text-[#ECECEC] sm:text-2xl">Upload and analyze terrain imagery</h3>
          <p className="mt-2 max-w-xl text-sm text-[#ECECEC]/70">Drop a scene, browse a file, or select a verified sample to generate a mission-ready assessment.</p>
        </div>
        <div className="rounded-full border border-[#79D46E]/25 bg-[#79D46E]/10 px-3 py-1 text-sm font-medium text-[#79D46E]">
          Live inference ready
        </div>
      </div>

      <div
        className={`mt-5 overflow-hidden rounded-[28px] border bg-[#050806]/85 ${isDragging ? 'border-[#79D46E]/60' : 'border-white/10'}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer?.files?.[0];
          if (file) onUpload(file);
        }}
      >
        {isAnalyzing ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 px-6 py-10 text-center sm:min-h-[340px]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#79D46E]/25 bg-[#79D46E]/10">
              <ArrowPathIcon className="h-7 w-7 animate-spin text-[#79D46E]" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#ECECEC]">Processing image</h4>
              <p className="mt-2 text-sm text-[#ECECEC]/70">The model is classifying terrain and preparing the recommendation panel.</p>
            </div>
            <div className="grid w-full max-w-md gap-2 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 rounded-2xl border border-white/10 bg-white/5" />
              ))}
            </div>
          </div>
        ) : previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="Terrain preview" className="h-[280px] w-full object-cover sm:h-[340px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050806] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-[rgba(5,8,6,0.78)] px-4 py-3 backdrop-blur">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#B6A16E]">Preview</p>
                <p className="text-sm font-medium text-[#ECECEC]">Image ready for analysis</p>
              </div>
              <ActionButton label="Replace image" icon={ArrowUpTrayIcon} onClick={() => fileInputRef.current?.click()} variant="secondary" />
            </div>
          </div>
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[340px]">
            <div className="rounded-2xl border border-[#B6A16E]/20 bg-[#B6A16E]/10 p-4">
              <CameraIcon className="h-10 w-10 text-[#B6A16E]" />
            </div>
            <h4 className="mt-4 text-lg font-semibold text-[#ECECEC]">Drop a terrain image here</h4>
            <p className="mt-2 max-w-xl text-sm text-[#ECECEC]/70">The analysis workspace will classify the terrain, summarize its surface properties, and recommend an operating mode.</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <ActionButton label="Browse file" icon={ArrowUpTrayIcon} onClick={() => fileInputRef.current?.click()} />
              <ActionButton label="Camera unavailable" icon={CameraIcon} disabled variant="secondary" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
        <ActionButton label="Browse file" icon={ArrowUpTrayIcon} onClick={() => fileInputRef.current?.click()} />
        <motion.button
          whileHover={{ y: -1, scale: 1.005 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRunAnalysis}
          disabled={isAnalyzing || !previewUrl}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#79D46E] px-4 py-2 text-sm font-semibold text-[#050806] transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SparklesIcon className="h-4 w-4" />
          {isAnalyzing ? 'Analyzing terrain' : 'Start analysis'}
        </motion.button>
      </div>

      {hasError && errorMessage ? (
        <div className="mt-4 rounded-[20px] border border-[#C96B6B]/25 bg-[#C96B6B]/10 px-4 py-3 text-sm text-[#F1B0B0]">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">Verified sample set</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {samples.map((sample) => {
            const selected = selectedSampleName === sample.sample_name;
            return (
              <button
                key={sample.id}
                onClick={() => onSampleSelect(sample)}
                className={`rounded-[20px] border p-3 text-left transition ${selected ? 'border-[#79D46E]/35 bg-[#79D46E]/10' : 'border-white/10 bg-[#050806]/65 hover:border-white/20'}`}
              >
                <div className="text-sm font-semibold text-[#ECECEC]">{sample.name}</div>
                <div className="mt-1 text-xs text-[#ECECEC]/65">{sample.hint}</div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
