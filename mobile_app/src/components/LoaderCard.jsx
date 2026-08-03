export default function LoaderCard() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[rgba(22,30,25,0.45)] p-6 backdrop-blur-xl">
      <div className="animate-pulse space-y-4">
        <div className="h-3 w-24 rounded-full bg-white/10" />
        <div className="h-5 w-48 rounded-full bg-white/10" />
        <div className="h-24 rounded-[20px] bg-white/10" />
      </div>
    </div>
  );
}
