// components/SharedRichTextEditor.tsx
"use client";

import React, { FC } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
  () => import('react-quill-new'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-[200px] bg-[#0a0e1c]/80 rounded-lg border border-blue-500/20 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin"></div>
          <span>Loading editor...</span>
        </div>
      </div>
    )
  }
);

export interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  readOnly?: boolean;
  className?: string;
}

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

const SharedRichTextEditor: FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
  minHeight = '200px',
  maxHeight = '400px',
  readOnly = false,
  className = ''
}) => {
  // Theme styles for Quill
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ql-editor {
        color: #dbe4fb !important;
        min-height: ${minHeight} !important;
        max-height: ${maxHeight} !important;
        overflow-y: auto !important;
        background: transparent !important;
      }
      .ql-editor.ql-blank::before {
        color: #5a6a8a !important;
        font-style: italic !important;
      }
      .ql-toolbar {
        background: rgba(10, 14, 28, 0.6) !important;
        border-color: rgba(130, 160, 255, 0.2) !important;
        border-radius: 8px 8px 0 0 !important;
      }
      .ql-container {
        border-color: rgba(130, 160, 255, 0.2) !important;
        border-radius: 0 0 8px 8px !important;
        background: rgba(10, 14, 28, 0.4) !important;
      }
      .ql-toolbar button {
        color: #8ea0cc !important;
      }
      .ql-toolbar button:hover {
        color: #dbe4fb !important;
      }
      .ql-toolbar .ql-active {
        color: #6294ec !important;
      }
      .ql-toolbar .ql-picker-label {
        color: #8ea0cc !important;
      }
      .ql-toolbar .ql-picker-label:hover {
        color: #dbe4fb !important;
      }
      .ql-toolbar .ql-picker-options {
        background: #1b2138 !important;
        border-color: rgba(130, 160, 255, 0.2) !important;
      }
      .ql-toolbar .ql-picker-options .ql-picker-item:hover {
        color: #6294ec !important;
      }
      .ql-snow .ql-stroke {
        stroke: #8ea0cc !important;
      }
      .ql-snow .ql-fill {
        fill: #8ea0cc !important;
      }
      .ql-snow .ql-picker-options .ql-picker-item {
        color: #8ea0cc !important;
      }
      .ql-snow .ql-picker-options .ql-picker-item:hover {
        color: #6294ec !important;
      }
      .ql-editor a {
        color: #6294ec !important;
      }
      .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4 {
        color: #eef2ff !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [minHeight, maxHeight]);

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={quillModules}
        formats={quillFormats}
        placeholder={placeholder}
        readOnly={readOnly}
        className="custom-quill"
        style={{
          minHeight: minHeight,
        }}
      />
    </div>
  );
};

export default SharedRichTextEditor;