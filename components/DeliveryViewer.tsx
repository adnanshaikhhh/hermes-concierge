"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, Copy, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  content: string;
  title: string;
  regenerationsLeft?: number;
  onRegenerate?: () => void;
};

export function DeliveryViewer({
  content,
  title,
  regenerationsLeft,
  onRegenerate,
}: Props) {
  const [copied, setCopied] = useState(false);
  const statelessSlug = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  const handleDownload = (ext: "md" | "txt", mime: string) => () => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${statelessSlug}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-[#1f1f1f] bg-[#0a0a0a]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f1f1f] px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
          <FileText className="h-3 w-3 text-[#7c3aed]" />
          <span className="font-mono text-[#71717a]">delivery.md</span>
          <span>·</span>
          <span className="font-mono">
            {content.length.toLocaleString()} chars
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-3 text-xs text-[#a1a1aa] transition hover:bg-[#161616] hover:text-[#fafafa]"
          >
            <Copy className="mr-1 h-3 w-3" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDownload("md", "text/markdown")}
            className="h-8 px-3 text-xs text-[#a1a1aa] transition hover:bg-[#161616] hover:text-[#fafafa]"
          >
            <Download className="mr-1 h-3 w-3" />
            .md
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDownload("txt", "text/plain")}
            className="h-8 px-3 text-xs text-[#a1a1aa] transition hover:bg-[#161616] hover:text-[#fafafa]"
          >
            <Download className="mr-1 h-3 w-3" />
            .txt
          </Button>
          {onRegenerate && regenerationsLeft !== undefined && regenerationsLeft > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              className="h-8 px-3 text-xs text-[#7c3aed] transition hover:bg-[#7c3aed]/10 hover:text-[#a855f7]"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Regenerate ({regenerationsLeft})
            </Button>
          )}
        </div>
      </div>
      <div className="markdown-content p-6 lg:p-8 lg:text-base max-h-[600px] overflow-y-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
