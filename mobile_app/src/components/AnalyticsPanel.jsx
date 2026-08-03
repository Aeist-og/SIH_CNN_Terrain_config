import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import AnalyticsCard from './AnalyticsCard';
import AnalyticsChartCard from './AnalyticsChartCard';

function formatConfidence(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'No Data Available';
  return `${Math.round(value * 100)}%`;
}

function getStatusLabel(item) {
  if (!item) return 'No Data Available';
  return item.success ? 'Completed' : 'Pending';
}

export default function AnalyticsPanel({ history, isServerOnline, modelStatus }) {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const sortedHistory = useMemo(() => {
    const copy = [...history];
    copy.sort((a, b) => {
      const aTime = a.timestamp || '';
      const bTime = b.timestamp || '';
      return aTime > bTime ? -1 : aTime < bTime ? 1 : 0;
    });
    return copy;
  }, [history]);

  const displayHistory = useMemo(() => {
    if (sortOrder === 'oldest') return [...sortedHistory].reverse();
    return sortedHistory;
  }, [sortOrder, sortedHistory]);

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return displayHistory;
    return displayHistory.filter((item) => {
      const terrain = (item.terrain || '').toLowerCase();
      const mission = (item.missionName || '').toLowerCase();
      const timestamp = (item.timestamp || '').toLowerCase();
      const confidence = formatConfidence(item.confidence).toLowerCase();
      return terrain.includes(query) || mission.includes(query) || timestamp.includes(query) || confidence.includes(query);
    });
  }, [search, displayHistory]);

  const successfulPredictions = history.filter((item) => item.success !== false).length;
  const averageConfidence = history.length > 0
    ? history.reduce((sum, item) => sum + (item.confidence || 0), 0) / history.length
    : null;

  const confidenceSeries = history.length > 0
    ? history.map((item) => ({ name: item.timestamp || 'Unknown', confidence: Math.round((item.confidence || 0) * 100) }))
    : [];

  const terrainSeries = history.length > 0
    ? Object.entries(history.reduce((acc, item) => {
        const terrain = item.terrain || 'Unknown';
        acc[terrain] = (acc[terrain] || 0) + 1;
        return acc;
      }, {})).map(([name, value]) => ({ name, value }))
    : [];

  const recentActivity = history.slice(0, 5).map((item) => ({
    id: `${item.timestamp}-${item.terrain}`,
    label: `Prediction completed for ${item.terrain || 'unknown terrain'}`,
    time: item.timestamp || 'Pending',
  }));

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="rounded-[32px] border border-white/10 bg-[rgba(24,33,28,0.45)] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">Mission intelligence</p>
            <h3 className="mt-2 text-xl font-semibold text-[#ECECEC] sm:text-2xl">Executive summary</h3>
            <p className="mt-2 text-sm text-[#ECECEC]/70">Review the current session with connection state and the latest prediction activity.</p>
          </div>
          <div className="rounded-full border border-[#79D46E]/25 bg-[#79D46E]/10 px-3 py-1 text-sm font-medium text-[#79D46E]">
            {history.length > 0 ? `${history.length} analyses tracked` : 'No Data Available'}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <AnalyticsCard title="Total analyses" value={history.length > 0 ? history.length : 'No Data Available'} caption="Recorded session entries" />
          <AnalyticsCard title="Successful predictions" value={history.length > 0 ? successfulPredictions : 'No Data Available'} caption="Completed inference runs" />
          <AnalyticsCard title="Average confidence" value={averageConfidence === null ? 'No Data Available' : formatConfidence(averageConfidence)} caption="Across available history" />
          <AnalyticsCard title="Model status" value={modelStatus || 'No Data Available'} caption="Current inference pipeline" />
          <AnalyticsCard title="Backend status" value={isServerOnline ? 'Connected' : 'Disconnected'} caption="API availability" tone={isServerOnline ? 'success' : 'muted'} />
        </div>
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <AnalyticsChartCard title="Prediction history" subtitle="Recent predictions and confidence" emptyState={history.length === 0 ? <div className="rounded-[24px] border border-dashed border-white/10 p-6 text-sm text-[#ECECEC]/70">No analysis history yet. Start a new inference to populate this view.</div> : null}>
          {history.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 rounded-full border border-white/10 bg-[#050806]/70 px-3 py-2 text-sm text-[#ECECEC]/70">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records" className="w-32 bg-transparent outline-none sm:w-48" />
                </label>
                <button type="button" onClick={() => setSortOrder((value) => value === 'newest' ? 'oldest' : 'newest')} className="rounded-full border border-white/10 bg-[#050806]/70 px-3 py-2 text-sm text-[#ECECEC]/70">
                  Sort: {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
                </button>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-white/10">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[#050806]/80 text-[#B6A16E]">
                    <tr>
                      <th className="px-3 py-3 font-medium">Mission</th>
                      <th className="px-3 py-3 font-medium">Prediction</th>
                      <th className="px-3 py-3 font-medium">Confidence</th>
                      <th className="px-3 py-3 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length > 0 ? filteredHistory.map((item, index) => (
                      <tr key={`${item.timestamp}-${index}`} className="border-t border-white/10 bg-white/5">
                        <td className="px-3 py-3 text-[#ECECEC]">{item.missionName || 'Operation Sentinel'}</td>
                        <td className="px-3 py-3 text-[#ECECEC]">{item.terrain || 'Unknown'}</td>
                        <td className="px-3 py-3 text-[#ECECEC]">{formatConfidence(item.confidence)}</td>
                        <td className="px-3 py-3 text-[#ECECEC]">{item.timestamp || 'Pending'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-3 py-6 text-center text-[#ECECEC]/70">No records match the current search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Recent activity" subtitle="Feed of recorded actions" emptyState={recentActivity.length === 0 ? <div className="rounded-[24px] border border-dashed border-white/10 p-6 text-sm text-[#ECECEC]/70">No recent activity to display yet.</div> : null}>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between gap-3 rounded-[20px] border border-white/10 bg-[#050806]/70 px-3 py-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 rounded-full border border-[#79D46E]/20 bg-[#79D46E]/10 p-2 text-[#79D46E]">
                      <ClockIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#ECECEC]">{activity.label}</p>
                      <p className="mt-1 text-xs text-[#ECECEC]/60">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </AnalyticsChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <AnalyticsChartCard title="Confidence distribution" subtitle="Historical confidence values" emptyState={confidenceSeries.length === 0 ? <div className="rounded-[24px] border border-dashed border-white/10 p-6 text-sm text-[#ECECEC]/70">No analysis history yet. Confidence distribution will appear once predictions are recorded.</div> : null}>
          {confidenceSeries.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceSeries}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#ECECEC', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#ECECEC', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="confidence" fill="#79D46E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Terrain distribution" subtitle="Terrain class mix" emptyState={terrainSeries.length === 0 ? <div className="rounded-[24px] border border-dashed border-white/10 p-6 text-sm text-[#ECECEC]/70">No terrain distribution available yet.</div> : null}>
          {terrainSeries.length > 0 ? (
            <div className="flex h-72 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={terrainSeries} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
                    {terrainSeries.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={['#79D46E', '#B6A16E', '#7DD3FC', '#C084FC', '#F59E0B'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </AnalyticsChartCard>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="rounded-[32px] border border-white/10 bg-[rgba(24,33,28,0.45)] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">Model health</p>
            <h3 className="mt-2 text-lg font-semibold text-[#ECECEC]">Operational health panel</h3>
          </div>
          <div className="rounded-full border border-[#79D46E]/25 bg-[#79D46E]/10 px-3 py-1 text-sm font-medium text-[#79D46E]">
            {isServerOnline ? 'Backend connected' : 'Backend disconnected'}
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AnalyticsCard title="Backend connected" value={isServerOnline ? 'Yes' : 'No'} caption="Current connection state" />
          <AnalyticsCard title="Model loaded" value={modelStatus ? 'Yes' : 'No'} caption="Inference availability" />
          <AnalyticsCard title="API response status" value={isServerOnline ? 'Ready' : 'Unavailable'} caption="Current service state" />
          <AnalyticsCard title="Last prediction time" value={history[0]?.timestamp || 'No Data Available'} caption="Most recent record" />
        </div>
      </motion.div>
    </div>
  );
}
