// app/drafts/page.tsx
"use client";

import React, { useState, useEffect, FC, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Search, 
  Edit, 
  Eye, 
  Save, 
  Calendar, 
  Send, 
  X,
  FileText,
  Clock,
  Tag,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PenTool
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import ApiService from "../lib/service";
import ApiConfig from "../lib/apiConfig";

// Dynamic import with no SSR using react-quill-new
const ReactQuill = dynamic(
  () => import('react-quill-new'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-[300px] bg-[#0a0e1c]/80 rounded-lg border border-blue-500/20 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin"></div>
          <span>Loading editor...</span>
        </div>
      </div>
    )
  }
);

interface Blog {
  _id: string;
  integrationId: string;
  topic: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  heroImagePrompt: string;
  estimatedReadingTime: string;
  keywords: string[];
  content: string;
  status: string;
  isScheduled: boolean;
  createdAt: string;
  updatedAt: string;
  publishError?: string;
  publishStatus?: string;
  publishedAt?: string;
  shopifyArticleId?: string;
  shopifyBlogId?: string;
  shopifyHandle?: string;
  shopifyUrl?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const DraftsPage: FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  
  // Filters
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  
  // Edit modal
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [showSchedulePicker, setShowSchedulePicker] = useState<boolean>(false);

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'check',
    'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  // Fetch draft blogs (status: COMPLETED)
  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { 
        page, 
        limit,
        status: 'COMPLETED' // Default filter for drafts
      };
      if (search) params.search = search;
      
      const response = await ApiService.get(ApiConfig.ALLBLOGS, params);
      setBlogs(response.data || []);
      setPagination(response.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } catch (error) {
      console.error("Failed to fetch drafts:", error);
      toast.error("Failed to load drafts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Handle save as draft
  const handleSaveAsDraft = async (blogId: string) => {
    if (!editContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }
    
    setIsSaving(true);
    try {
      await ApiService.post(ApiConfig.saveBlogDraft(blogId), {
        blogId,
        title: editTitle.trim() || editingBlog?.title,
        content: editContent,
      });
      toast.success("Blog saved as draft!");
      await fetchDrafts();
      setShowEditModal(false);
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save as draft");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle publish
  const handlePublish = async (blogId: string) => {
    if (!editContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }
    
    setIsSaving(true);
    try {
      await ApiService.post(ApiConfig.PUBLISH_BLOG(blogId), {
        blogId,
        title: editTitle.trim() || editingBlog?.title,
        content: editContent,
      });
      toast.success("Blog published successfully! 🎉");
      await fetchDrafts();
      setShowEditModal(false);
    } catch (error) {
      console.error("Failed to publish:", error);
      toast.error("Failed to publish blog");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle schedule
  const handleSchedule = async (blogId: string) => {
    if (!scheduleDate) {
      toast.error("Please select a date and time");
      return;
    }
    
    if (!editContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }
    
    setIsSaving(true);
    try {
      await ApiService.post(ApiConfig.SCHEDULE_BLOG?.(blogId) || `/blogs/${blogId}/schedule`, {
        blogId,
        title: editTitle.trim() || editingBlog?.title,
        content: editContent,
        scheduledAt: new Date(scheduleDate).toISOString(),
      });
      toast.success("Blog scheduled successfully! 📅");
      await fetchDrafts();
      setShowEditModal(false);
      setShowSchedulePicker(false);
    } catch (error) {
      console.error("Failed to schedule:", error);
      toast.error("Failed to schedule blog");
    } finally {
      setIsSaving(false);
    }
  };

  // Open edit modal
  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setEditTitle(blog.title);
    setEditContent(blog.content);
    setShowEditModal(true);
    setShowSchedulePicker(false);
    setScheduleDate("");
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = () => {
    return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  };

  // Pagination controls
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;
    const delta = 2;
    const range = [];
    const rangeWithDots: any[] = [];
    let l:any;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1b2138',
            color: '#eef2ff',
            border: '1px solid rgba(130, 160, 255, 0.2)',
            borderRadius: '12px',
          },
        }}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <PenTool size={28} className="text-yellow-400" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
              Draft Blogs
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Manage your draft blogs - edit, publish, schedule, or continue writing
          </p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search draft blogs by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1b2138]/80 border border-blue-500/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-4 py-2.5 rounded-xl bg-[#1b2138]/80 border border-blue-500/20 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      {/* Draft List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
          <div className="w-10 h-10 border-3 border-blue-500/15 border-t-blue-400 rounded-full animate-spin mb-4"></div>
          <p>Loading drafts...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-[#1b2138]/50 rounded-xl border border-blue-500/10">
          <FileText size={48} className="mx-auto mb-4 text-slate-500" />
          <h3 className="text-white text-xl mb-2">No drafts found</h3>
          <p>All your draft blogs will appear here. Start writing!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {blogs.map((blog) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-b from-[#1b2138]/95 to-[#0f1321]/95 border border-yellow-500/20 rounded-xl p-4 sm:p-6 hover:border-yellow-500/40 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge()}`}>
                          Draft
                        </span>
                        {blog.isScheduled && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            Scheduled
                          </span>
                        )}
                        {blog.updatedAt && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={12} />
                            Updated: {formatDate(blog.updatedAt)}
                          </span>
                        )}
                      </div>
                      
                      <h2 className="text-lg sm:text-xl font-semibold text-white mb-1 line-clamp-2">
                        {blog.title}
                      </h2>
                      
                      <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                        {blog.excerpt || blog.topic}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Created: {formatDate(blog.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {blog.estimatedReadingTime || 'N/A'}
                        </span>
                        {blog.keywords && blog.keywords.length > 0 && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <Tag size={12} />
                            {blog.keywords.slice(0, 3).join(', ')}
                            {blog.keywords.length > 3 && ` +${blog.keywords.length - 3}`}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(blog)}
                        className="px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors text-sm inline-flex items-center gap-1.5"
                      >
                        <Edit size={15} />
                        Edit Draft
                      </button>
                      {blog.shopifyUrl && (
                        <a
                          href={blog.shopifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors text-sm inline-flex items-center gap-1.5"
                        >
                          <Eye size={15} />
                          View
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Enhanced Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-[#1b2138]/50 rounded-xl border border-yellow-500/10">
              <div className="text-sm text-slate-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} drafts
              </div>
              
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {/* First Page */}
                <button
                  onClick={() => goToPage(1)}
                  disabled={!pagination.hasPrev}
                  className="p-2 rounded-lg bg-[#1b2138]/80 border border-yellow-500/20 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1b2138] transition-colors"
                  title="First page"
                >
                  <ChevronsLeft size={16} />
                </button>
                
                {/* Previous */}
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="p-2 rounded-lg bg-[#1b2138]/80 border border-yellow-500/20 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1b2138] transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((item, index) => (
                    <button
                      key={index}
                      onClick={() => typeof item === 'number' && goToPage(item)}
                      className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${
                        item === pagination.page
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : item === '...'
                          ? 'text-slate-500 cursor-default'
                          : 'bg-[#1b2138]/80 text-white hover:bg-[#1b2138] border border-yellow-500/10'
                      }`}
                      disabled={item === '...'}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {/* Next */}
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="p-2 rounded-lg bg-[#1b2138]/80 border border-yellow-500/20 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1b2138] transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => goToPage(pagination.totalPages)}
                  disabled={!pagination.hasNext}
                  className="p-2 rounded-lg bg-[#1b2138]/80 border border-yellow-500/20 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1b2138] transition-colors"
                  title="Last page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-[#1b2138] to-[#0f1321] border border-yellow-500/20 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-yellow-500/10">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Edit size={20} className="text-yellow-400" />
                Edit Draft
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setShowSchedulePicker(false);
                }}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-500/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0a0e1c]/80 border border-yellow-500/20 text-white focus:outline-none focus:border-yellow-500/50 transition-colors placeholder-slate-500"
                  placeholder="Blog title..."
                />
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Content (Rich Text)
                </label>
                <div className="bg-[#0a0e1c]/80 rounded-lg border border-yellow-500/20 overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={editContent}
                    onChange={setEditContent}
                    modules={quillModules}
                    formats={quillFormats}
                    className="text-white min-h-[300px] [&_.ql-editor]:min-h-[300px] [&_.ql-editor]:text-white [&_.ql-toolbar]:bg-[#1b2138] [&_.ql-toolbar]:border-yellow-500/20 [&_.ql-container]:border-yellow-500/20 [&_.ql-editor]:bg-[#0a0e1c]"
                    placeholder="Write your blog content here..."
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Use the toolbar to format your content with headings, lists, images, and more
                </p>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={editingBlog.topic}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0e1c]/50 border border-yellow-500/10 text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Status
                  </label>
                  <input
                    type="text"
                    value="Draft"
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0e1c]/50 border border-yellow-500/10 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {editingBlog.publishError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {editingBlog.publishError}
                </div>
              )}

              {/* Schedule Picker */}
              {showSchedulePicker && (
                <div className="p-4 rounded-lg bg-[#0a0e1c]/80 border border-purple-500/20">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0e1c]/80 border border-yellow-500/20 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleSchedule(editingBlog._id)}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/20 transition-colors text-sm disabled:opacity-50"
                    >
                      {isSaving ? 'Scheduling...' : 'Confirm Schedule'}
                    </button>
                    <button
                      onClick={() => setShowSchedulePicker(false)}
                      className="px-4 py-2 rounded-lg bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border border-slate-500/20 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-end gap-2 p-4 border-t border-yellow-500/10">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setShowSchedulePicker(false);
                }}
                className="px-4 py-2 rounded-lg bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border border-slate-500/20 transition-colors text-sm inline-flex items-center gap-1.5"
              >
                <X size={15} />
                Cancel
              </button>
              
              <button
                onClick={() => handleSaveAsDraft(editingBlog._id)}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors text-sm inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save size={15} />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              
              <button
                onClick={() => setShowSchedulePicker(!showSchedulePicker)}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors text-sm inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Calendar size={15} />
                Schedule
              </button>
              
              <button
                onClick={() => handlePublish(editingBlog._id)}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors text-sm inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send size={15} />
                {isSaving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftsPage;