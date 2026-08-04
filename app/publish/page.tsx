// app/published/page.tsx
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
  CheckCircle,
  Globe,
  ExternalLink
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

const PublishedPage: FC = () => {
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
  
  // Edit modal (for updating published blogs)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

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

  // Fetch published blogs (status: PUBLISHED)
  const fetchPublished = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { 
        page, 
        limit,
        status: 'PUBLISHED' // Default filter for published blogs
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
      console.error("Failed to fetch published blogs:", error);
      toast.error("Failed to load published blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchPublished();
  }, [fetchPublished]);

  // Handle update published blog


  // Open edit modal
  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setEditTitle(blog.title);
    setEditContent(blog.content);
    setShowEditModal(true);
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
    return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
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
            <CheckCircle size={28} className="text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
              Published Blogs
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            View and manage all your published blog posts
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#1b2138]/80 rounded-xl p-4 border border-emerald-500/10">
          <div className="text-2xl font-bold text-emerald-400">{pagination.total}</div>
          <div className="text-xs text-slate-400">Total Published</div>
        </div>
        <div className="bg-[#1b2138]/80 rounded-xl p-4 border border-blue-500/10">
          <div className="text-2xl font-bold text-blue-400">{blogs.length}</div>
          <div className="text-xs text-slate-400">Current Page</div>
        </div>
        <div className="bg-[#1b2138]/80 rounded-xl p-4 border border-purple-500/10">
          <div className="text-2xl font-bold text-purple-400">
            {blogs.filter(b => b.isScheduled).length}
          </div>
          <div className="text-xs text-slate-400">Scheduled</div>
        </div>
        <div className="bg-[#1b2138]/80 rounded-xl p-4 border border-slate-500/10">
          <div className="text-2xl font-bold text-slate-400">
            {blogs.filter(b => b.shopifyUrl).length}
          </div>
          <div className="text-xs text-slate-400">Live on Shopify</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search published blogs by title or topic..."
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

      {/* Published List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
          <div className="w-10 h-10 border-3 border-blue-500/15 border-t-blue-400 rounded-full animate-spin mb-4"></div>
          <p>Loading published blogs...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-[#1b2138]/50 rounded-xl border border-blue-500/10">
          <Globe size={48} className="mx-auto mb-4 text-slate-500" />
          <h3 className="text-white text-xl mb-2">No published blogs found</h3>
          <p>Publish your drafts to see them here</p>
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
                  className="bg-gradient-to-b from-[#1b2138]/95 to-[#0f1321]/95 border border-emerald-500/20 rounded-xl p-4 sm:p-6 hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge()}`}>
                          <span className="flex items-center gap-1">
                            <CheckCircle size={12} />
                            Published
                          </span>
                        </span>
                        {blog.publishedAt && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={12} />
                            Published: {formatDate(blog.publishedAt)}
                          </span>
                        )}
                        {blog.isScheduled && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            Scheduled
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
                      {blog.shopifyUrl && (
                        <a
                          href={blog.shopifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors text-sm inline-flex items-center gap-1.5"
                        >
                          <ExternalLink size={15} />
                          View Live
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-[#1b2138]/50 rounded-xl border border-emerald-500/10">
              <div className="text-sm text-slate-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} published blogs
              </div>
              
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {/* First Page */}
                <button
                  onClick={() => goToPage(1)}
                  disabled={!pagination.hasPrev}
                  className="p-2 rounded-lg bg-[#1b2138]/80 border border-emerald-500/20 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1b2138] transition-colors"
                  title="First page"
                >
                  <ChevronsLeft size={16} />
                </button>
                
                {/* Previous */}
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="p-2 rounded-lg bg-[#1b2138]/80 border border-emerald-500/20 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1b2138] transition-colors"
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
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : item === '...'
                          ? 'text-slate-500 cursor-default'
                          : 'bg-[#1b2138]/80 text-white hover:bg-[#1b2138] border border-emerald-500/10'
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
                  className="p-2 rounded-lg bg-[#1b2138]/80 border border-emerald-500/20 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1b2138] transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => goToPage(pagination.totalPages)}
                  disabled={!pagination.hasNext}
                  className="p-2 rounded-lg bg-[#1b2138]/80 border border-emerald-500/20 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1b2138] transition-colors"
                  title="Last page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PublishedPage;