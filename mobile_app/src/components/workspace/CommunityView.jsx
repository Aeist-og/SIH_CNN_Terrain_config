import React, { useEffect, useState } from 'react';
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  HandThumbUpIcon,
  ChatBubbleLeftEllipsisIcon,
  UserCircleIcon,
  SparklesIcon,
  ClockIcon,
  PlusIcon,
  XMarkIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDbCommunity, postDbCommunityComment, postDbCommunityLike, postDbCommunityArticle } from '../../services/api';

const MOCK_COMMUNITY_WORKS = [
  {
    id: 'work-1',
    title: 'Himalayan High-Altitude Ridge Traversal Assessment',
    author: 'Dr. Aris Thorne',
    designation: 'Lead Geotechnical Rover Specialist',
    terrain: 'rocky',
    readTime: '4 min read',
    date: '2026-08-04',
    likes: 24,
    safetyIndex: 74,
    roughness: '0.88 µm',
    driveMode: '4WD Low / Rock Crawl',
    summary: 'Conducted high-altitude optical classification across jagged granite cobbles. The CNN model achieved 96.2% confidence on rocky substrate. Recommending deflated tire pressure for mechanical interlock.',
    bannerColor: 'from-[#10b981]/20 via-[#0ea5e9]/10 to-transparent',
    comments: [
      { author: 'Rover Tech Team', text: 'Excellent analysis! We verified the 350 kPa bearing capacity on similar slopes in Spiti.' },
      { author: 'Clara Vance', text: 'Did the Grad-CAM heatmap target the fracture lines or the loose shale base?' }
    ]
  },
  {
    id: 'work-2',
    title: 'Thar Desert Granular Dune Traction & Shear Slip Study',
    author: 'Rover Tech Team',
    designation: 'Autonomous Navigation Group',
    terrain: 'sandy',
    readTime: '3 min read',
    date: '2026-08-02',
    likes: 18,
    safetyIndex: 81,
    roughness: '0.42 µm',
    driveMode: 'Sand Mode / Deflated Pressure',
    summary: 'Evaluated granular shear slip across shifting crest dunes. Low moisture content (8%) required torque vectoring. Classification returned 94.5% sandy confidence.',
    bannerColor: 'from-[#f59e0b]/20 via-[#10b981]/10 to-transparent',
    comments: [
      { author: 'Dr. Aris Thorne', text: 'Deflated pressure in Sand Mode is essential here to prevent dig-in on steep gradients.' }
    ]
  },
  {
    id: 'work-3',
    title: 'Spiti Valley Waterlogged Wetland & Mud Inundation Test',
    author: 'Clara Vance',
    designation: 'Autonomous Robotics Researcher',
    terrain: 'marshy',
    readTime: '5 min read',
    date: '2026-07-29',
    likes: 31,
    safetyIndex: 38,
    roughness: '0.48 µm',
    driveMode: '4WD Low / Mud & Ruts',
    summary: 'Inundated marsh ground with sub-surface roots resulted in high slipperiness (friction coefficient 0.22). Safety index dropped to 38/100. Rover speed capped at 12 km/h.',
    bannerColor: 'from-[#0ea5e9]/20 via-[#6366f1]/10 to-transparent',
    comments: [
      { author: 'Rover Tech Team', text: 'Hazard level 4 rating was correctly identified. Sinking risk is high.' }
    ]
  }
];

export default function CommunityView({ onTriggerToast, currentUser }) {
  const [works, setWorks] = useState(MOCK_COMMUNITY_WORKS);
  const [filterTerrain, setFilterTerrain] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCommentText, setNewCommentText] = useState({});
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postTerrain, setPostTerrain] = useState('rocky');
  const [postSummary, setPostSummary] = useState('');
  const [postDriveMode, setPostDriveMode] = useState('4WD Low / Rock Crawl');

  // Hydrate community posts from SQLite Database on mount
  useEffect(() => {
    async function loadCommunityDb() {
      const dbPosts = await fetchDbCommunity();
      if (dbPosts && Array.isArray(dbPosts) && dbPosts.length > 0) {
        const formatted = dbPosts.map((p) => ({
          id: p.id,
          title: p.title,
          author: p.author,
          designation: p.designation,
          terrain: p.terrain,
          readTime: '3 min read',
          date: p.date_str || '2026-08-05',
          likes: p.likes || 0,
          safetyIndex: p.safety_index || 75,
          roughness: p.roughness || '0.50 µm',
          driveMode: p.drive_mode || 'Normal / 2WD',
          summary: p.summary,
          bannerColor: 'from-[#10b981]/20 via-[#0ea5e9]/10 to-transparent',
          comments: p.comments || []
        }));
        setWorks(formatted);
      }
    }
    loadCommunityDb();
  }, []);

  const filteredWorks = works.filter((w) => {
    const matchesTerrain = filterTerrain === 'all' || (w.terrain && w.terrain.toLowerCase() === filterTerrain.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      (w.title && w.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.author && w.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.summary && w.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTerrain && matchesSearch;
  });

  const handleLike = (id) => {
    setWorks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, likes: w.likes + 1 } : w))
    );
    postDbCommunityLike(id);
    onTriggerToast?.('info', 'Liked Publication', 'Your appreciation has been recorded in database.');
  };

  const handleAddComment = (id) => {
    const text = newCommentText[id];
    if (!text || !text.trim()) return;

    const authorName = currentUser?.username || 'SIH Operator';

    setWorks((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          return {
            ...w,
            comments: [...w.comments, { author: authorName, text: text.trim() }]
          };
        }
        return w;
      })
    );

    postDbCommunityComment(id, authorName, text.trim());
    setNewCommentText((prev) => ({ ...prev, [id]: '' }));
    onTriggerToast?.('success', 'Comment Published', 'Your review comment was added to database.');
  };

  const handlePublishSubmit = (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postSummary.trim()) return;

    const newPost = {
      id: `work-${Date.now()}`,
      title: postTitle.trim(),
      author: currentUser?.username || 'SIH Operator',
      designation: currentUser?.role || 'Autonomous Specialist',
      terrain: postTerrain,
      readTime: '3 min read',
      date: new Date().toISOString().split('T')[0],
      likes: 1,
      safetyIndex: 78,
      roughness: '0.52 µm',
      driveMode: postDriveMode,
      summary: postSummary.trim(),
      bannerColor: 'from-[#10b981]/20 via-[#0ea5e9]/10 to-transparent',
      comments: []
    };

    setWorks((prev) => [newPost, ...prev]);
    postDbCommunityArticle(newPost);
    setIsPublishModalOpen(false);
    setPostTitle('');
    setPostSummary('');
    onTriggerToast?.('success', 'Published to Community', 'Your report was stored in database and published.');
  };

  return (
    <div className="page-enter space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#f9fafb]">Community Explorer</h1>
          <p className="mt-1 text-sm text-[#9ca3af]">
            Browse technical articles, model evaluations, and field reviews published by autonomous vision engineers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPublishModalOpen(true)}
          className="btn btn-primary self-start sm:self-auto shadow-lg shadow-[#10b981]/15"
        >
          <PlusIcon className="h-4 w-4" />
          Publish Model Analysis
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterTerrain('all')}
            className={`badge cursor-pointer ${filterTerrain === 'all' ? 'badge-success' : ''}`}
          >
            All Articles ({works.length})
          </button>
          {['rocky', 'sandy', 'marshy', 'grassy', 'snowy'].map((terrain) => (
            <button
              key={terrain}
              type="button"
              onClick={() => setFilterTerrain(terrain)}
              className={`badge capitalize cursor-pointer ${filterTerrain === terrain ? 'badge-success' : ''}`}
            >
              {terrain}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search articles or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
      </div>

      {/* Chrome / Medium Article Feed */}
      <div className="space-y-6">
        {filteredWorks.map((work) => (
          <div key={work.id} className="card overflow-hidden border-white/10 hover:border-white/20 transition bg-[#121820]/80">
            {/* Banner Overlay */}
            <div className={`h-3 w-full bg-gradient-to-r ${work.bannerColor}`} />

            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a222d] text-[#10b981] border border-[#10b981]/30 font-bold">
                    {work.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#f9fafb] hover:text-[#10b981] transition cursor-pointer">{work.title}</h2>
                    </div>
                    <p className="text-xs text-[#9ca3af] mt-0.5">
                      By <strong className="text-[#f9fafb]">{work.author}</strong> ({work.designation}) • {work.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="badge text-[11px] flex items-center gap-1 text-[#9ca3af]">
                    <ClockIcon className="h-3 w-3" />
                    <span>{work.readTime}</span>
                  </span>
                  <span className="badge badge-success text-[11px] capitalize">
                    {work.terrain}
                  </span>
                </div>
              </div>

              {/* Technical Abstract */}
              <p className="text-xs text-[#9ca3af] leading-relaxed">{work.summary}</p>

              {/* Physical Telemetry Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="rounded-xl border border-white/10 bg-[#1a222d] p-2.5 text-center text-xs">
                  <span className="eyebrow block">Safety Index</span>
                  <span className="font-bold text-[#10b981] mt-0.5 block">{work.safetyIndex} / 100</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#1a222d] p-2.5 text-center text-xs">
                  <span className="eyebrow block">Surface Roughness</span>
                  <span className="font-bold text-[#f9fafb] mt-0.5 block">{work.roughness}</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#1a222d] p-2.5 text-center text-xs sm:col-span-2">
                  <span className="eyebrow block">Prescribed Drive Mode</span>
                  <span className="font-bold text-[#0ea5e9] mt-0.5 block">{work.driveMode}</span>
                </div>
              </div>

              {/* LinkedIn / Instagram Engagement Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleLike(work.id)}
                  className="flex items-center gap-2 text-xs font-semibold text-[#9ca3af] hover:text-[#10b981] transition group"
                >
                  <HandThumbUpIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>{work.likes} Appreciations</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
                  <ChatBubbleLeftEllipsisIcon className="h-4 w-4 text-[#0ea5e9]" />
                  <span>{work.comments.length} Discussion Comments</span>
                </div>
              </div>

              {/* Discussion Thread */}
              <div className="rounded-xl border border-white/10 bg-[#1a222d]/80 p-4 space-y-3">
                <p className="eyebrow">Technical Discussion</p>
                <div className="space-y-2 text-xs">
                  {work.comments.map((c, idx) => (
                    <div key={idx} className="rounded-lg border border-white/5 bg-[#121820] p-2.5">
                      <span className="font-semibold text-[#10b981]">{c.author}:</span>{' '}
                      <span className="text-[#9ca3af]">{c.text}</span>
                    </div>
                  ))}
                </div>

                {/* Add Comment Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Write a technical review comment..."
                    value={newCommentText[work.id] || ''}
                    onChange={(e) =>
                      setNewCommentText((prev) => ({ ...prev, [work.id]: e.target.value }))
                    }
                    className="input text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddComment(work.id)}
                    className="btn btn-primary btn-sm shrink-0"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Article Modal */}
      <AnimatePresence>
        {isPublishModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setIsPublishModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border border-white/15 bg-[#121820] p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <DocumentArrowUpIcon className="h-5 w-5 text-[#10b981]" />
                  <h3 className="text-base font-semibold">Publish Model Evaluation Report</h3>
                </div>
                <button type="button" onClick={() => setIsPublishModalOpen(false)} className="icon-btn">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handlePublishSubmit} className="space-y-4">
                <div>
                  <label className="eyebrow block mb-1">Article / Analysis Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basalt Rock Slope Traversal Evaluation"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="eyebrow block mb-1">Terrain Category</label>
                    <select
                      value={postTerrain}
                      onChange={(e) => setPostTerrain(e.target.value)}
                      className="input capitalize"
                    >
                      <option value="rocky">Rocky</option>
                      <option value="sandy">Sandy</option>
                      <option value="marshy">Marshy</option>
                      <option value="grassy">Grassy</option>
                      <option value="snowy">Snowy</option>
                    </select>
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">Drive Mode</label>
                    <input
                      type="text"
                      value={postDriveMode}
                      onChange={(e) => setPostDriveMode(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="eyebrow block mb-1">Technical Summary / Findings</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Summarize the model evaluation, confidence metrics, and rover recommendations..."
                    value={postSummary}
                    onChange={(e) => setPostSummary(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(false)}
                    className="btn btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary text-xs font-semibold">
                    Publish to Community
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
