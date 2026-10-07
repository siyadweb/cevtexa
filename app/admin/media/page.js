"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase";

const BUCKETS = [
  {
    id: "site-media",
    label: "Site Media",
    public: true,
  },
  {
    id: "blog",
    label: "Blog",
    public: true,
  },
  {
    id: "projects",
    label: "Projects",
    public: true,
  },
  {
    id: "team",
    label: "Team",
    public: true,
  },
  {
    id: "careers",
    label: "Careers",
    public: false,
  },
];

function formatBytes(bytes) {
  if (!bytes || Number(bytes) === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(
    index === 0 ? 0 : 1
  )} ${units[index]}`;
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isImage(fileType) {
  return String(fileType || "").startsWith("image/");
}

function getExtension(fileName) {
  if (!fileName) return "";

  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function safeFileName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getFilePathWithoutBucket(filePath) {
  if (!filePath) return "";

  const firstSlash = filePath.indexOf("/");

  if (firstSlash === -1) {
    return filePath;
  }

  return filePath.slice(firstSlash + 1);
}

function getBucketFromStoredPath(filePath) {
  if (!filePath) return "site-media";

  const firstSlash = filePath.indexOf("/");

  if (firstSlash === -1) {
    return "site-media";
  }

  const bucket = filePath.slice(0, firstSlash);

  return BUCKETS.some((item) => item.id === bucket)
    ? bucket
    : "site-media";
}

export default function MediaAdminPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [supabase, setSupabase] = useState(null);

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [bucketFilter, setBucketFilter] = useState("all");

  const [selectedBucket, setSelectedBucket] = useState("site-media");
  const [selectedFile, setSelectedFile] = useState(null);
  const [altText, setAltText] = useState("");

  const [previewItem, setPreviewItem] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadMedia = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    setError("");

    try {
      const { data, error: mediaError } = await supabase
        .from("media")
        .select(
          "id,file_name,file_path,file_type,file_size,alt_text,uploaded_by,created_at"
        )
        .order("created_at", { ascending: false });

      if (mediaError) {
        throw mediaError;
      }

      setMedia(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load media library.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const client = getSupabaseClient();

        const {
          data: { session },
        } = await client.auth.getSession();

        if (!mounted) return;

        if (!session) {
          router.replace("/admin/login");
          return;
        }

        setSupabase(client);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to initialize admin.");
        setLoading(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (supabase) {
      loadMedia();
    }
  }, [supabase, loadMedia]);

  const filteredMedia = useMemo(() => {
    const query = search.trim().toLowerCase();

    return media.filter((item) => {
      const bucket = getBucketFromStoredPath(item.file_path);

      const matchesSearch =
        !query ||
        [
          item.file_name,
          item.file_type,
          item.alt_text,
          item.file_path,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "images" && isImage(item.file_type)) ||
        (typeFilter === "documents" &&
          !isImage(item.file_type) &&
          String(item.file_type || "").includes("pdf")) ||
        (typeFilter === "other" &&
          !isImage(item.file_type) &&
          !String(item.file_type || "").includes("pdf"));

      const matchesBucket =
        bucketFilter === "all" || bucket === bucketFilter;

      return matchesSearch && matchesType && matchesBucket;
    });
  }, [media, search, typeFilter, bucketFilter]);

  const stats = useMemo(() => {
    const images = media.filter((item) => isImage(item.file_type)).length;

    const documents = media.filter((item) =>
      String(item.file_type || "").includes("pdf")
    ).length;

    const totalSize = media.reduce(
      (total, item) => total + Number(item.file_size || 0),
      0
    );

    return {
      total: media.length,
      images,
      documents,
      totalSize,
    };
  }, [media]);

  function handleFileSelect(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    setError("");
    setNotice("");

    const maxSize = 20 * 1024 * 1024;

    if (file.size > maxSize) {
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError("File is too large. Maximum allowed size is 20 MB.");
      return;
    }

    setSelectedFile(file);

    if (isImage(file.type)) {
      setAltText(file.name.replace(/\.[^/.]+$/, ""));
    } else {
      setAltText("");
    }
  }

  function resetUploadForm() {
    setSelectedFile(null);
    setAltText("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function uploadFile() {
    if (!supabase || !selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError("");
    setNotice("");

    try {
      const bucket = selectedBucket;

      const extension = getExtension(selectedFile.name);

      const originalName = selectedFile.name
        .replace(/\.[^/.]+$/, "")
        .slice(0, 80);

      const cleanName = safeFileName(originalName) || "file";

      const uniquePart = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      const finalName = extension
        ? `${cleanName}-${uniquePart}.${extension}`
        : `${cleanName}-${uniquePart}`;

      const filePath = `${new Date()
        .toISOString()
        .slice(0, 10)}/${finalName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: selectedFile.type || undefined,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const storedPath = `${bucket}/${filePath}`;

      const { error: insertError } = await supabase.from("media").insert({
        file_name: selectedFile.name,
        file_path: storedPath,
        file_type: selectedFile.type || "application/octet-stream",
        file_size: selectedFile.size,
        alt_text: altText.trim() || null,
        uploaded_by: user?.id || null,
      });

      if (insertError) {
        await supabase.storage.from(bucket).remove([filePath]);
        throw insertError;
      }

      setNotice("File uploaded successfully.");

      resetUploadForm();

      await loadMedia();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to upload file.");
    } finally {
      setUploading(false);
    }
  }

  function getPublicUrl(item) {
    const bucket = getBucketFromStoredPath(item.file_path);

    if (bucket === "careers") {
      return null;
    }

    const path = getFilePathWithoutBucket(item.file_path);

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data?.publicUrl || null;
  }

  async function getMediaUrl(item) {
    if (!supabase) return null;

    const bucket = getBucketFromStoredPath(item.file_path);
    const path = getFilePathWithoutBucket(item.file_path);

    if (bucket !== "careers") {
      return getPublicUrl(item);
    }

    const { data, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60);

    if (signedError) {
      console.error(signedError);
      setError(signedError.message);
      return null;
    }

    return data?.signedUrl || null;
  }

  async function openMedia(item) {
    setError("");

    const url = await getMediaUrl(item);

    if (!url) {
      setError(
        "This file does not have a usable public URL. The Careers bucket is private."
      );
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyMediaUrl(item) {
    setError("");
    setNotice("");

    try {
      const url = await getMediaUrl(item);

      if (!url) {
        throw new Error("Unable to generate a URL for this file.");
      }

      await navigator.clipboard.writeText(url);

      setNotice("Media URL copied to clipboard.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to copy media URL.");
    }
  }

  async function deleteMedia(item) {
    if (!supabase) return;

    const confirmed = window.confirm(
      `Delete "${item.file_name}"?\n\nThis removes the file from Supabase Storage and the media library.`
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setError("");
    setNotice("");

    try {
      const bucket = getBucketFromStoredPath(item.file_path);
      const path = getFilePathWithoutBucket(item.file_path);

      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (storageError) {
        throw storageError;
      }

      const { error: databaseError } = await supabase
        .from("media")
        .delete()
        .eq("id", item.id);

      if (databaseError) {
        throw databaseError;
      }

      setNotice("Media deleted successfully.");

      if (previewItem?.id === item.id) {
        setPreviewItem(null);
      }

      await loadMedia();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete media.");
    } finally {
      setDeletingId(null);
    }
  }

  function clearMessages() {
    setError("");
    setNotice("");
  }

  return (
    <main className="media-admin">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #02070d;
          color: #ecf3fb;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .media-admin {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 85% 0%,
              rgba(47, 127, 255, 0.13),
              transparent 35%
            ),
            radial-gradient(
              circle at 20% 20%,
              rgba(41, 224, 255, 0.055),
              transparent 28%
            ),
            #02070d;
          padding: 58px 60px 100px;
        }

        .media-shell {
          max-width: 1480px;
          margin: 0 auto;
        }

        .topline {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
          margin-bottom: 52px;
        }

        .eyebrow {
          color: #29e0ff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.25em;
          margin-bottom: 15px;
        }

        .title {
          margin: 0;
          font-size: clamp(64px, 7vw, 112px);
          line-height: 0.9;
          letter-spacing: -0.065em;
          font-weight: 850;
        }

        .subtitle {
          max-width: 800px;
          color: #8fa9c4;
          font-size: 18px;
          line-height: 1.65;
          margin: 25px 0 0;
        }

        .top-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .button {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(5, 16, 29, 0.75);
          color: #edf6ff;
          min-height: 52px;
          padding: 0 21px;
          border-radius: 14px;
          font-weight: 750;
          transition: 0.2s ease;
        }

        .button:hover {
          transform: translateY(-1px);
          border-color: rgba(41, 224, 255, 0.5);
        }

        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .button.primary {
          border: none;
          color: #03101b;
          background: linear-gradient(135deg, #2f7fff, #29e0ff);
        }

        .button.danger {
          color: #ffb4b4;
          border-color: rgba(255, 90, 90, 0.2);
        }

        .button.small {
          min-height: 38px;
          padding: 0 12px;
          border-radius: 9px;
          font-size: 12px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card {
          min-height: 160px;
          padding: 27px;
          border: 1px solid rgba(140, 180, 220, 0.14);
          border-radius: 22px;
          background: rgba(4, 15, 27, 0.75);
          box-shadow: inset 0 1px rgba(255, 255, 255, 0.025);
        }

        .stat-label {
          color: #5d8bb9;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .stat-value {
          margin-top: 20px;
          font-size: 44px;
          font-weight: 800;
          letter-spacing: -0.05em;
        }

        .stat-help {
          margin-top: 6px;
          color: #557797;
          font-size: 13px;
        }

        .workspace {
          border: 1px solid rgba(140, 180, 220, 0.14);
          border-radius: 24px;
          background: rgba(2, 11, 20, 0.78);
          overflow: hidden;
        }

        .upload-area {
          padding: 24px;
          border-bottom: 1px solid rgba(140, 180, 220, 0.1);
        }

        .upload-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 18px;
        }

        .upload-box {
          min-height: 180px;
          border: 1px dashed rgba(41, 224, 255, 0.3);
          border-radius: 18px;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(41, 224, 255, 0.06),
              transparent 50%
            ),
            rgba(4, 16, 28, 0.75);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 25px;
        }

        .upload-icon {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          color: #29e0ff;
          background: rgba(41, 224, 255, 0.08);
          border: 1px solid rgba(41, 224, 255, 0.15);
          font-size: 25px;
          margin-bottom: 14px;
        }

        .upload-title {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .upload-help {
          color: #5f7f99;
          font-size: 12px;
          line-height: 1.5;
          margin-bottom: 17px;
        }

        .upload-controls {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .field label {
          display: block;
          color: #7799b5;
          font-size: 11px;
          font-weight: 750;
          margin-bottom: 7px;
        }

        .input,
        .select {
          width: 100%;
          height: 48px;
          border: 1px solid rgba(140, 180, 220, 0.15);
          background: #061522;
          color: #eaf5ff;
          border-radius: 11px;
          padding: 0 14px;
          outline: none;
        }

        .input:focus,
        .select:focus {
          border-color: rgba(41, 224, 255, 0.55);
        }

        .file-name {
          padding: 12px 14px;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(140, 180, 220, 0.08);
          color: #9bb4ca;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1fr 190px 190px auto;
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid rgba(140, 180, 220, 0.1);
        }

        .library-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 22px 25px;
          border-bottom: 1px solid rgba(140, 180, 220, 0.1);
        }

        .section-title {
          font-size: 15px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .section-count {
          color: #557b9d;
          margin-left: 7px;
          font-weight: 500;
          text-transform: none;
          letter-spacing: normal;
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          padding: 20px;
        }

        .media-card {
          min-width: 0;
          border: 1px solid rgba(140, 180, 220, 0.12);
          border-radius: 17px;
          overflow: hidden;
          background: #04101b;
          transition: 0.2s ease;
        }

        .media-card:hover {
          transform: translateY(-2px);
          border-color: rgba(41, 224, 255, 0.28);
        }

        .preview {
          position: relative;
          aspect-ratio: 16 / 10;
          background:
            linear-gradient(
              135deg,
              rgba(47, 127, 255, 0.08),
              rgba(41, 224, 255, 0.025)
            ),
            #071522;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .file-symbol {
          width: 60px;
          height: 60px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          background: rgba(41, 224, 255, 0.08);
          border: 1px solid rgba(41, 224, 255, 0.13);
          color: #29e0ff;
          font-weight: 900;
          font-size: 12px;
          text-transform: uppercase;
        }

        .bucket-chip {
          position: absolute;
          left: 9px;
          top: 9px;
          padding: 5px 8px;
          border-radius: 7px;
          color: #c2d9eb;
          background: rgba(0, 5, 10, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          backdrop-filter: blur(8px);
        }

        .media-body {
          padding: 14px;
        }

        .media-name {
          color: #eaf5ff;
          font-size: 13px;
          font-weight: 750;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .media-meta {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 7px;
          color: #5e7d97;
          font-size: 10px;
        }

        .media-alt {
          color: #6d8ba4;
          margin-top: 9px;
          min-height: 30px;
          font-size: 10px;
          line-height: 1.45;
        }

        .card-actions {
          display: flex;
          gap: 6px;
          margin-top: 12px;
        }

        .card-actions .button {
          flex: 1;
        }

        .empty {
          padding: 80px 30px;
          text-align: center;
          color: #58758e;
        }

        .empty strong {
          display: block;
          color: #9cb6cd;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .alert {
          margin-bottom: 20px;
          border-radius: 14px;
          padding: 14px 17px;
          font-size: 14px;
        }

        .alert.error {
          color: #ffb8b8;
          border: 1px solid rgba(255, 80, 80, 0.2);
          background: rgba(255, 60, 60, 0.06);
        }

        .alert.success {
          color: #8ff2c1;
          border: 1px solid rgba(80, 230, 160, 0.18);
          background: rgba(80, 230, 160, 0.055);
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          padding: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 3, 8, 0.8);
          backdrop-filter: blur(12px);
        }

        .modal {
          width: min(900px, 100%);
          max-height: calc(100vh - 50px);
          overflow: auto;
          border: 1px solid rgba(140, 180, 220, 0.17);
          border-radius: 24px;
          background: #04101b;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.55);
        }

        .modal-head {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 25px;
          border-bottom: 1px solid rgba(140, 180, 220, 0.1);
        }

        .modal-title {
          margin: 0;
          font-size: 25px;
        }

        .close {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: #9cb5ca;
          font-size: 20px;
        }

        .preview-large {
          padding: 25px;
        }

        .preview-large img {
          display: block;
          max-width: 100%;
          max-height: 65vh;
          margin: 0 auto;
          border-radius: 14px;
          object-fit: contain;
          background: #02070d;
        }

        .preview-info {
          padding: 0 25px 25px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .info-box {
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(140, 180, 220, 0.08);
          background: rgba(255, 255, 255, 0.025);
        }

        .info-label {
          color: #587993;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .info-value {
          color: #cfe0ed;
          font-size: 13px;
          word-break: break-word;
        }

        @media (max-width: 1200px) {
          .media-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .toolbar {
            grid-template-columns: 1fr 180px;
          }
        }

        @media (max-width: 950px) {
          .media-admin {
            padding: 40px 24px 70px;
          }

          .topline {
            flex-direction: column;
          }

          .top-actions {
            justify-content: flex-start;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .upload-grid {
            grid-template-columns: 1fr;
          }

          .media-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .toolbar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .media-admin {
            padding: 30px 15px 60px;
          }

          .title {
            font-size: 58px;
          }

          .media-grid {
            grid-template-columns: 1fr;
          }

          .preview-info {
            grid-template-columns: 1fr;
          }

          .top-actions {
            width: 100%;
          }

          .top-actions .button {
            flex: 1;
          }
        }
      `}</style>

      <div className="media-shell">
        <header className="topline">
          <div>
            <div className="eyebrow">CONTENT / MEDIA</div>

            <h1 className="title">Media</h1>

            <p className="subtitle">
              Upload, organize and manage the visual assets used throughout
              the CEVTEXA website.
            </p>
          </div>

          <div className="top-actions">
            <button
              className="button"
              onClick={() => router.push("/admin")}
            >
              ← Dashboard
            </button>

            <button
              className="button primary"
              onClick={() => fileInputRef.current?.click()}
            >
              + Upload media
            </button>
          </div>
        </header>

        {(error || notice) && (
          <div
            className={`alert ${error ? "error" : "success"}`}
            onClick={clearMessages}
          >
            {error || notice}
          </div>
        )}

        <section className="stats">
          <div className="stat-card">
            <div className="stat-label">Total Media</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-help">
              Files currently in the CMS library
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Images</div>
            <div className="stat-value">{stats.images}</div>
            <div className="stat-help">
              Photos, graphics and visual assets
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Storage Size</div>
            <div className="stat-value">{formatBytes(stats.totalSize)}</div>
            <div className="stat-help">
              Total files recorded in the media library
            </div>
          </div>
        </section>

        <section className="workspace">
          <div className="upload-area">
            <div className="upload-grid">
              <div className="upload-box">
                <div className="upload-icon">↑</div>

                <div className="upload-title">
                  {selectedFile
                    ? "Ready to upload"
                    : "Choose a media file"}
                </div>

                <div className="upload-help">
                  Images, PDF and other website assets. Maximum file size:
                  20 MB.
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                />

                <button
                  className="button primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? "Choose another file" : "Choose file"}
                </button>
              </div>

              <div className="upload-controls">
                <div className="field">
                  <label>Storage bucket</label>

                  <select
                    className="select"
                    value={selectedBucket}
                    onChange={(event) =>
                      setSelectedBucket(event.target.value)
                    }
                  >
                    {BUCKETS.map((bucket) => (
                      <option key={bucket.id} value={bucket.id}>
                        {bucket.label}
                        {bucket.public ? " · Public" : " · Private"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Alt text</label>

                  <input
                    className="input"
                    value={altText}
                    onChange={(event) => setAltText(event.target.value)}
                    placeholder="Describe the image for accessibility"
                  />
                </div>

                <div className="field">
                  <label>Selected file</label>

                  <div className="file-name">
                    {selectedFile
                      ? `${selectedFile.name} · ${formatBytes(
                          selectedFile.size
                        )}`
                      : "No file selected"}
                  </div>
                </div>

                <button
                  className="button primary"
                  onClick={uploadFile}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? "Uploading..." : "Upload to library"}
                </button>
              </div>
            </div>
          </div>

          <div className="toolbar">
            <input
              className="input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search filename, type, alt text..."
            />

            <select
              className="select"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">All file types</option>
              <option value="images">Images</option>
              <option value="documents">PDF documents</option>
              <option value="other">Other files</option>
            </select>

            <select
              className="select"
              value={bucketFilter}
              onChange={(event) => setBucketFilter(event.target.value)}
            >
              <option value="all">All buckets</option>

              {BUCKETS.map((bucket) => (
                <option key={bucket.id} value={bucket.id}>
                  {bucket.label}
                </option>
              ))}
            </select>

            <button
              className="button"
              onClick={loadMedia}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="library-head">
            <div className="section-title">
              MEDIA LIBRARY
              <span className="section-count">
                {filteredMedia.length} files
              </span>
            </div>
          </div>

          {loading ? (
            <div className="empty">
              <strong>Loading media library...</strong>
              Please wait.
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="empty">
              <strong>No media files found</strong>
              Upload your first website asset above.
            </div>
          ) : (
            <div className="media-grid">
              {filteredMedia.map((item) => {
                const bucket = getBucketFromStoredPath(item.file_path);
                const publicUrl =
                  bucket !== "careers" ? getPublicUrl(item) : null;

                return (
                  <article className="media-card" key={item.id}>
                    <div className="preview">
                      <div className="bucket-chip">{bucket}</div>

                      {isImage(item.file_type) && publicUrl ? (
                        <img
                          src={publicUrl}
                          alt={item.alt_text || item.file_name}
                        />
                      ) : (
                        <div className="file-symbol">
                          {getExtension(item.file_name) || "FILE"}
                        </div>
                      )}
                    </div>

                    <div className="media-body">
                      <div
                        className="media-name"
                        title={item.file_name}
                      >
                        {item.file_name}
                      </div>

                      <div className="media-meta">
                        <span>{formatBytes(item.file_size)}</span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>

                      <div className="media-alt">
                        {item.alt_text || "No alt text"}
                      </div>

                      <div className="card-actions">
                        <button
                          className="button small"
                          onClick={() => setPreviewItem(item)}
                        >
                          Details
                        </button>

                        <button
                          className="button small"
                          onClick={() => openMedia(item)}
                        >
                          Open
                        </button>

                        <button
                          className="button small danger"
                          disabled={deletingId === item.id}
                          onClick={() => deleteMedia(item)}
                        >
                          {deletingId === item.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {previewItem && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setPreviewItem(null)}
        >
          <div
            className="modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <div className="eyebrow">MEDIA / DETAILS</div>

                <h2 className="modal-title">
                  {previewItem.file_name}
                </h2>
              </div>

              <button
                className="close"
                onClick={() => setPreviewItem(null)}
              >
                ×
              </button>
            </div>

            {isImage(previewItem.file_type) &&
              getBucketFromStoredPath(previewItem.file_path) !==
                "careers" && (
                <div className="preview-large">
                  <img
                    src={getPublicUrl(previewItem)}
                    alt={
                      previewItem.alt_text || previewItem.file_name
                    }
                  />
                </div>
              )}

            <div className="preview-info">
              <div className="info-box">
                <div className="info-label">File name</div>

                <div className="info-value">
                  {previewItem.file_name}
                </div>
              </div>

              <div className="info-box">
                <div className="info-label">File type</div>

                <div className="info-value">
                  {previewItem.file_type || "Unknown"}
                </div>
              </div>

              <div className="info-box">
                <div className="info-label">File size</div>

                <div className="info-value">
                  {formatBytes(previewItem.file_size)}
                </div>
              </div>

              <div className="info-box">
                <div className="info-label">Bucket</div>

                <div className="info-value">
                  {getBucketFromStoredPath(previewItem.file_path)}
                </div>
              </div>

              <div className="info-box">
                <div className="info-label">Uploaded</div>

                <div className="info-value">
                  {formatDate(previewItem.created_at)}
                </div>
              </div>

              <div className="info-box">
                <div className="info-label">Alt text</div>

                <div className="info-value">
                  {previewItem.alt_text || "No alt text"}
                </div>
              </div>

              <div className="info-box" style={{ gridColumn: "1 / -1" }}>
                <div className="info-label">Storage path</div>

                <div className="info-value">
                  {previewItem.file_path}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                padding: "0 25px 25px",
              }}
            >
              <button
                className="button"
                onClick={() => copyMediaUrl(previewItem)}
              >
                Copy URL
              </button>

              <button
                className="button primary"
                onClick={() => openMedia(previewItem)}
              >
                Open file
              </button>

              <button
                className="button"
                onClick={() => setPreviewItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}