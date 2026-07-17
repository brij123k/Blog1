"use client";

import React, { useState, useRef, FC } from "react";
import ApiService from "../app/lib/service";
import ApiConfig from "../app/lib/apiConfig";

// Types (can be imported from a shared types file)
interface Blog {
  id: string;
  topic: string;
  title: string;
  html: string;
  status?: "none" | "draft" | "sched" | "pub";
  heroImageUrl?: string;
  heroImagePrompt?: string;
}

type BlogStatus = "none" | "draft" | "sched" | "pub";

interface BlogEditorModalProps {
  blogs: Blog[];
  generating: boolean;
  onClose: () => void;
  toast: (msg: string) => void;
}

const BLOG_STATUS_MAP: Record<BlogStatus, { cls: string; label: string }> = {
  none: { cls: "b-none", label: "Unsaved" },
  draft: { cls: "b-draft", label: "Draft" },
  sched: { cls: "b-sched", label: "Scheduled" },
  pub: { cls: "b-pub", label: "Published ✓" },
};

// ============================================================================
// THEME — dark navy pedal look, same tokens as the dashboard:
//   panels:  linear-gradient(180deg, #1b2136, #10141f)
//   cards:   rgba(10,14,28,.55)
//   borders: rgba(130,160,255,.15–.22)
//   text:    #eef2ff (headings) / #dbe4fb (body) / #8ea0cc (muted)
// ============================================================================
const T = {
  panelBg: "linear-gradient(180deg, #1b2136 0%, #10141f 100%)",
  panelBorder: "1px solid rgba(130,160,255,.22)",
  panelShadow:
    "0 0 0 1px rgba(130,160,255,.10), 0 0 60px rgba(61,147,255,.15), 0 30px 90px rgba(0,0,0,.7)",
  headBg: "rgba(10,14,28,.6)",
  headBorder: "1px solid rgba(130,160,255,.18)",
  cardBg: "rgba(10,14,28,.55)",
  cardBorder: "1px solid rgba(130,160,255,.18)",
  cardShadow: "0 1px 1px rgba(160,195,255,.05) inset, 0 8px 20px rgba(0,0,0,.3)",
  divider: "1px solid rgba(130,160,255,.15)",
  actionsBg: "rgba(8,12,26,.55)",
  heading: "#eef2ff",
  body: "#dbe4fb",
  muted: "#8ea0cc",
};

const Toolbar: FC<{ editorRef: React.RefObject<HTMLDivElement | null> }> = ({ editorRef }) => {
  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        padding: "8px 0",
        borderBottom: T.divider,
        marginBottom: "8px",
      }}
    >
      <button className="abtn" onClick={() => exec("bold")}><b>B</b></button>
      <button className="abtn" onClick={() => exec("italic")}><i>I</i></button>
      <button className="abtn" onClick={() => exec("underline")}><u>U</u></button>
      <button className="abtn" onClick={() => exec("formatBlock", "<h1>")}>H1</button>
      <button className="abtn" onClick={() => exec("formatBlock", "<h2>")}>H2</button>
      <button className="abtn" onClick={() => exec("formatBlock", "<h3>")}>H3</button>
      <button className="abtn" onClick={() => exec("formatBlock", "<p>")}>¶</button>
    </div>
  );
};

const BlogEditorCard: FC<{
  blog: Blog;
  toast: (msg: string) => void;
  onStatusChange?: (id: string, status: BlogStatus) => void;
}> = ({ blog, toast, onStatusChange }) => {
  const edRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(blog.title);
  const [status, setStatus] = useState<BlogStatus>(blog.status ?? "none");
  const [sched, setSched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [when, setWhen] = useState(
    () => new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16)
  );

  const badge = BLOG_STATUS_MAP[status];
  const getHTML = (): string => edRef.current?.innerHTML ?? blog.html;

  const updateStatus = (newStatus: BlogStatus) => {
    setStatus(newStatus);
    onStatusChange?.(blog.id, newStatus);
  };

  const onAct = async (action: "copy" | "dl" | "draft" | "pub" | "sched") => {
    const html = getHTML();
    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(html);
      } catch {}
      toast("Copied HTML");
      return;
    }
    if (action === "dl") {
      const blob = new Blob([`<!doctype html><meta charset=utf-8><title>${title}</title>\n<h1>${title}</h1>\n${html}`], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (title || "blog").replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".html";
      a.click();
      URL.revokeObjectURL(url);
      toast("Downloaded");
      return;
    }
    if (action === "sched") {
      setSched(true);
      return;
    }

    setBusy(true);
    try {
      const endpoint = action === "draft"
        ? ApiConfig.saveBlogDraft(blog.id)
        : ApiConfig.PUBLISH_BLOG(blog.id);
      await ApiService.post(endpoint, { blogId: blog.id, title, html });
      updateStatus(action === "draft" ? "draft" : "pub");
      toast(action === "draft" ? "Saved to draft" : "Published");
    } catch (err) {
      console.error(`Failed to ${action} blog:`, err);
      toast(action === "draft" ? "Failed to save draft" : "Failed to publish");
    } finally {
      setBusy(false);
    }
  };

  const confirmSched = async () => {
    if (!when) {
      toast("Pick a time");
      return;
    }
    setBusy(true);
    try {
      await ApiService.post(ApiConfig.SCHEDULE_BLOG(blog.id), {
        scheduledFor: new Date(when).toISOString(),
      });
      updateStatus("sched");
      setSched(false);
      toast("Scheduled for " + new Date(when).toLocaleString());
    } catch (err) {
      console.error("Failed to schedule blog:", err);
      toast("Failed to schedule");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      background: T.cardBg,
      borderRadius: "14px",
      border: T.cardBorder,
      marginBottom: "24px",
      overflow: "hidden",
      boxShadow: T.cardShadow,
    }}>
      {/* Hero image */}
      {blog.heroImageUrl && (
        <img
          src={blog.heroImageUrl}
          alt={blog.title}
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "cover",
            borderBottom: T.divider,
          }}
        />
      )}

      {/* Title & status bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderBottom: T.divider }}>
        <input
          className="bc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            flex: 1,
            fontSize: "18px",
            fontWeight: 600,
            border: "none",
            outline: "none",
            background: "transparent",
            color: T.heading,
          }}
        />
        <span className={`badge ${badge.cls}`} style={{ flexShrink: 0 }}>{badge.label}</span>
      </div>

      {/* Rich text toolbar */}
      <div style={{ padding: "0 20px" }}>
        <Toolbar editorRef={edRef} />
      </div>

      {/* Editor */}
      <div
        ref={edRef}
        className="editor"
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: blog.html }}
        style={{
          minHeight: "200px",
          maxHeight: "600px",
          overflowY: "auto",
          padding: "0 20px 20px",
          fontSize: "15px",
          lineHeight: 1.7,
          color: T.body,
          background: "transparent",
          outline: "none",
        }}
      />

      {/* Action buttons */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        padding: "12px 20px",
        borderTop: T.divider,
        background: T.actionsBg,
      }}>
        <button className="abtn" onClick={() => onAct("copy")}>Copy</button>
        <button className="abtn" onClick={() => onAct("dl")}>Download HTML</button>
        {/* <button className="abtn" disabled={busy} onClick={() => onAct("draft")}>Save draft</button> */}
        <button className="abtn sch" disabled={busy} onClick={() => onAct("sched")}>Schedule</button>
        <button className="abtn pub" disabled={busy} onClick={() => onAct("pub")}>Publish</button>
        {sched && (
          <div className="schbox" style={{ width: "100%" }}>
            <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            <button className="abtn sch" disabled={busy} onClick={confirmSched}>Set</button>
            <button className="abtn" disabled={busy} onClick={() => setSched(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

const BlogEditorModal: FC<BlogEditorModalProps> = ({ blogs, generating, onClose, toast }) => {
  const [localBlogs, setLocalBlogs] = useState(blogs);

  // sync with parent when new blogs are generated
  React.useEffect(() => {
    setLocalBlogs(blogs);
  }, [blogs]);

  const bulkAction = async (action: "draft" | "pub") => {
    for (const blog of localBlogs) {
      try {
        const endpoint = action === "draft"
          ? ApiConfig.saveBlogDraft(blog.id)
          : ApiConfig.PUBLISH_BLOG(blog.id);
        await ApiService.post(endpoint, { blogId: blog.id, title: blog.title, html: blog.html });
      } catch (err) {
        console.error(`Failed to ${action} blog ${blog.id}:`, err);
      }
    }
    toast(`All blogs ${action === "draft" ? "saved as draft" : "published"}`);
  };

  return (
    <div className="ov open" style={{ alignItems: "flex-start", paddingTop: "20px" }}>
      <div className="ov-bd" onClick={onClose} />
      <div
        style={{
          position: "relative",
          zIndex: 1001,
          width: "min(100%, 1200px)",
          height: "calc(100vh - 40px)",
          background: T.panelBg,
          border: T.panelBorder,
          borderRadius: "18px",
          display: "flex",
          flexDirection: "column",
          boxShadow: T.panelShadow,
          animation: "pop .3s ease",
          color: T.body,
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: T.headBg,
          borderBottom: T.headBorder,
          borderRadius: "18px 18px 0 0",
        }}>
          <h2 style={{
            fontSize: "20px",
            fontWeight: 600,
            color: T.heading,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 40% 35%, #eaf2ff, #6294ec 46%, #21478e 100%)",
                boxShadow: "0 0 12px rgba(98,148,236,.9)",
                flexShrink: 0,
              }}
            />
            {generating ? "Generating…" : "Blogs"}
          </h2>
          <button className="abtn" onClick={onClose}>Close</button>
        </div>

        {/* Scrollable body */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
        }}>
          {localBlogs.length === 0 && !generating && (
            <div style={{
              textAlign: "center",
              padding: "2rem",
              color: T.muted,
              border: "1px dashed rgba(130,160,255,.25)",
              borderRadius: "12px",
            }}>
              No blogs yet. Generate from the wizard.
            </div>
          )}
          {localBlogs.map((b) => (
            <BlogEditorCard key={b.id} blog={b} toast={toast} />
          ))}
          {generating && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "14px",
              color: "#cfe0ff",
              background: "rgba(110,162,255,.08)",
              border: "1px solid rgba(130,160,255,.3)",
              borderRadius: "12px",
            }}>
              <span className="spin" /> Generating next blog…
            </div>
          )}
        </div>

        {/* Bottom bar for bulk actions */}
        {localBlogs.length > 0 && (
          <div style={{
            padding: "12px 24px",
            background: T.headBg,
            borderTop: T.headBorder,
            borderRadius: "0 0 18px 18px",
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
          }}>
            {/* <button className="abtn" onClick={() => bulkAction("draft")}>Save all as draft</button> */}
            <button className="abtn pub" onClick={() => bulkAction("pub")}>Publish all</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditorModal;