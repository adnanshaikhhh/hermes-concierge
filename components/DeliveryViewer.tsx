"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function DeliveryViewer({ content, title }: { content: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
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
    <div className="rounded-xl border border-[#1e2d4a] bg-[#0e1420]">
      <div className="flex items-center justify-between border-b border-[#1e2d4a] px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-[#8b9dc3]">
          <span className="font-mono text-[#4a5980]">delivery.md</span>
          <span>·</span>
          <span>{content.length.toLocaleString()} chars</span>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 text-xs text-[#8b9dc3] hover:text-[#f0f4ff]"
          >
            <Copy className="mr-1 h-3 w-3" />
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 text-xs text-[#8b9dc3] hover:text-[#f0f4ff]"
          >
            <Download className="mr-1 h-3 w-3" />
            Download
          </Button>
        </div>
      </div>
      <div className="markdown-content p-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
