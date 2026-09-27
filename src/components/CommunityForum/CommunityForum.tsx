import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  PlusCircle, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Shield 
} from 'lucide-react';
import { FORUM_POSTS } from '../../data/neuroData';
import { ForumPost } from '../../types/neuro';

export const CommunityForum: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>(FORUM_POSTS);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({ 'post-1': true });
  const [newReplyText, setNewReplyText] = useState<Record<string, string>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostForm, setNewPostForm] = useState({
    title: '',
    category: 'Stroke Recovery' as ForumPost['category'],
    content: '',
    author: '',
    authorBadge: ''
  });

  const categories = ['All', 'Stroke Recovery', 'ADHD & Focus', 'Brain Fog / Long Covid', 'N-Back Strategies', 'Habit Rewiring'];

  const handleUpvote = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const alreadyUpvoted = p.userUpvoted;
        return {
          ...p,
          upvotes: alreadyUpvoted ? p.upvotes - 1 : p.upvotes + 1,
          userUpvoted: !alreadyUpvoted,
        };
      }
      return p;
    }));
  };

  const handleAddReply = (postId: string) => {
    const text = newReplyText[postId];
    if (!text || !text.trim()) return;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          repliesCount: p.repliesCount + 1,
          replies: [
            ...p.replies,
            {
              id: `rep-${Date.now()}`,
              author: 'You (Cognitive Explorer)',
              timeAgo: 'Just now',
              content: text.trim(),
            }
          ]
        };
      }
      return p;
    }));

    setNewReplyText(prev => ({ ...prev, [postId]: '' }));
    setExpandedReplies(prev => ({ ...prev, [postId]: true }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostForm.title || !newPostForm.content) return;

    const created: ForumPost = {
      id: `post-${Date.now()}`,
      author: newPostForm.author.trim() || 'Neuro_Pioneer',
      authorBadge: newPostForm.authorBadge.trim() || 'Daily Practitioner',
      timeAgo: 'Just now',
      title: newPostForm.title,
      category: newPostForm.category,
      content: newPostForm.content,
      upvotes: 1,
      repliesCount: 0,
      userUpvoted: true,
      replies: []
    };

    setPosts([created, ...posts]);
    setShowCreateModal(false);
    setNewPostForm({
      title: '',
      category: 'Stroke Recovery',
      content: '',
      author: '',
      authorBadge: ''
    });
  };

  const filteredPosts = activeFilter === 'All'
    ? posts
    : posts.filter(p => p.category === activeFilter);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Peer Support & Shared Journeys</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Supportive Community Forum</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            A welcoming, safe space where stroke survivors, caregivers, students, and everyday learners share their breakthroughs, encourage each other, and exchange practical tips for focus and well-being.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer self-start md:self-auto shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          Share Your Story or Tip
        </button>
      </div>

      {/* Category Filter Controls */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-medium ${
              activeFilter === cat
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.map(post => {
          const isRepliesOpen = !!expandedReplies[post.id];

          return (
            <div
              key={post.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-bold text-white">{post.author}</span>
                    {post.authorBadge && (
                      <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        {post.authorBadge}
                      </span>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{post.timeAgo}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-indigo-400 font-medium">{post.category}</span>
                  </div>

                  <h3 className="text-base font-bold text-white pt-1">
                    {post.title}
                  </h3>
                </div>

                {/* Upvote Button */}
                <button
                  onClick={() => handleUpvote(post.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition shrink-0 ${
                    post.userUpvoted
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{post.upvotes}</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {post.content}
              </p>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
                <button
                  onClick={() => setExpandedReplies(prev => ({ ...prev, [post.id]: !isRepliesOpen }))}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.repliesCount} Responses</span>
                </button>
                <span className="text-[11px] text-slate-500">Peer-moderated thread</span>
              </div>

              {/* Replies Section */}
              {isRepliesOpen && (
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="space-y-2">
                    {post.replies.map(reply => (
                      <div key={reply.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-200">{reply.author}</span>
                          <span>{reply.timeAgo}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{reply.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Reply Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newReplyText[post.id] || ''}
                      onChange={e => setNewReplyText({ ...newReplyText, [post.id]: e.target.value })}
                      placeholder="Contribute your observation or clinical experience..."
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddReply(post.id);
                      }}
                    />
                    <button
                      onClick={() => handleAddReply(post.id)}
                      className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                    >
                      <Send className="w-3.5 h-3.5" /> Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Share a Plasticity Milestone or Question</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Your Handle / Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya_FocusLab"
                    value={newPostForm.author}
                    onChange={e => setNewPostForm({ ...newPostForm, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Badge / Role (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Stroke Survivor, Student"
                    value={newPostForm.authorBadge}
                    onChange={e => setNewPostForm({ ...newPostForm, authorBadge: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={newPostForm.category}
                  onChange={e => setNewPostForm({ ...newPostForm, category: e.target.value as ForumPost['category'] })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Stroke Recovery">Stroke Recovery</option>
                  <option value="ADHD & Focus">ADHD & Focus</option>
                  <option value="Brain Fog / Long Covid">Brain Fog / Long Covid</option>
                  <option value="N-Back Strategies">N-Back Strategies</option>
                  <option value="Habit Rewiring">Habit Rewiring</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 60-day update on my Stroop interference and working memory"
                  value={newPostForm.title}
                  onChange={e => setNewPostForm({ ...newPostForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Your Story, Data, or Protocol</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail your challenges, reaction time changes, audio tools used, and key tips..."
                  value={newPostForm.content}
                  onChange={e => setNewPostForm({ ...newPostForm, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer transition shadow-md"
                >
                  Publish to Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
