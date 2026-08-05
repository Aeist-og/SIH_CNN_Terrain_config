import React, { useState } from 'react';
import { PhotoIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, DocumentTextIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { downloadPdfReport, exportDatabaseSpreadsheet } from '../../services/api';

export default function History({ history = [], onQuickAnalyze, onTriggerToast }) {
  const [filterClass, setFilterClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = history.filter((item) => {
    const matchesClass = filterClass === 'all' || item.terrain === filterClass;
    const matchesQuery =
      !searchQuery ||
      item.terrain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.timestamp && item.timestamp.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesClass && matchesQuery;
  });

  const terrainClasses = [...new Set(history.map((item) => item.terrain))];

  const handleExportJson = (item) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(item, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `telemetry-${item.terrain}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onTriggerToast?.('info', 'JSON Exported', 'Telemetry JSON payload downloaded.');
  };

  const handleExportPdf = async (item) => {
    const res = await downloadPdfReport({
      result: {
        predicted_terrain: item.terrain,
        confidence: item.confidence,
        unsupported_image: item.unsupported_image || false,
        timestamp: item.timestamp,
        implicit_quantities: item.implicit
      }
    });
    if (res.success) {
      onTriggerToast?.('success', 'PDF Downloaded', `Report for ${item.terrain} exported.`);
    } else {
      onTriggerToast?.('error', 'Export Failed', res.error || 'Failed to download report.');
    }
  };

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#f9fafb]">Analysis History Workspace</h1>
          <p className="mt-1 text-sm text-[#9ca3af]">Search, filter, inspect, and export prior classification telemetry runs.</p>
        </div>

        <button
          type="button"
          onClick={async () => {
            const res = await exportDatabaseSpreadsheet();
            if (res.success) {
              onTriggerToast?.('success', 'Spreadsheet Downloaded', 'Exported SQLite database records to CSV file.');
            } else {
              onTriggerToast?.('error', 'Export Failed', res.error || 'Failed to export spreadsheet.');
            }
          }}
          className="btn btn-secondary self-start sm:self-auto text-xs"
        >
          <TableCellsIcon className="h-4 w-4 text-[#10b981]" />
          <span>Export Database (.csv)</span>
        </button>
      </div>

      {history.length > 0 ? (
        <>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterClass('all')}
                className={`badge cursor-pointer ${filterClass === 'all' ? 'badge-success' : ''}`}
              >
                All ({history.length})
              </button>
              {terrainClasses.map((terrain) => (
                <button
                  key={terrain}
                  type="button"
                  onClick={() => setFilterClass(terrain)}
                  className={`badge font-mono-code capitalize cursor-pointer ${filterClass === terrain ? 'badge-success' : ''}`}
                >
                  {terrain}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="text"
                placeholder="Search history by terrain or time..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9"
              />
            </div>
          </div>

          {/* History Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                    <th className="px-5 py-3.5">Imagery</th>
                    <th className="px-5 py-3.5">Terrain Class</th>
                    <th className="px-5 py-3.5">Confidence</th>
                    <th className="px-5 py-3.5">Telemetry (Ra / Drive)</th>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((item, index) => (
                    <tr key={`${item.timestamp}-${index}`} className="transition hover:bg-white/5">
                      <td className="px-5 py-3">
                        {item.imageUri ? (
                          <img src={item.imageUri} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a222d] text-[#6b7280]">
                            <PhotoIcon className="h-4 w-4" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono-code font-bold capitalize text-[#f9fafb]">
                        {item.terrain}
                      </td>
                      <td className="px-5 py-3">
                        <span className="badge badge-success font-mono-code">
                          {Math.round((item.confidence || 0) * 100)}%
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono-code text-xs text-[#9ca3af]">
                        {item.implicit?.roughness?.value_ra ? `${item.implicit.roughness.value_ra} µm` : '0.25 µm'} • {item.implicit?.perception_telemetry?.recommended_drive_mode || 'Normal'}
                      </td>
                      <td className="px-5 py-3 text-xs text-[#9ca3af]">{item.timestamp}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onQuickAnalyze(item)}
                            className="btn btn-ghost btn-sm"
                            title="Inspect scan"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportJson(item)}
                            className="btn btn-ghost btn-sm text-[#0ea5e9]"
                            title="Export JSON"
                          >
                            JSON
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportPdf(item)}
                            className="btn btn-ghost btn-sm text-[#10b981]"
                            title="Download PDF"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card flex flex-col items-center justify-center p-12 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a222d] text-[#6b7280]">
            <PhotoIcon className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-[#f9fafb]">No history logged yet</h2>
          <p className="max-w-sm text-xs text-[#9ca3af]">
            Perform image classifications on the Analyze workspace to record history runs here.
          </p>
        </div>
      )}
    </div>
  );
}
