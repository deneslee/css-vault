// src/components/SnippetCard.tsx
import React, { useState, useId } from "react";

export interface SnippetData {
  id: string;
  title: string;
  category: string;
  tags: string[];
  defaultSpeed: number;
  cssCode: string;
  htmlCode: string;
  reactCode: string;
}

export default function SnippetCard({ snippet }: { snippet: SnippetData }) {
  const [speed, setSpeed] = useState<number>(snippet.defaultSpeed);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"css" | "react" | "html">("css");
  const modalId = useId().replace(/:/g, "");

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-md hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden">
      {/* Dynamic Scoped Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #preview-${modalId} {
              --fire-duration: ${speed}s;
            }
            ${snippet.cssCode}
          `,
        }}
      />

      {/* Header Info */}
      <div className="p-4 border-b border-base-200 flex items-start justify-between">
        <div>
          <span className="badge badge-primary badge-sm font-semibold">
            {snippet.category}
          </span>
          <h3 className="text-lg font-bold mt-1 text-base-content">
            {snippet.title}
          </h3>
        </div>

        {/* DaisyUI "..." Action Menu */}
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-circle btn-sm text-base-content/70"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-200 rounded-box z-20 w-44 p-2 shadow-lg border border-base-300 text-sm"
          >
            <li>
              <button onClick={() => copyToClipboard(snippet.htmlCode, "HTML")}>
                Copy HTML
              </button>
            </li>
            <li>
              <button onClick={() => setSpeed(snippet.defaultSpeed)}>
                Reset Speed
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Showcase / Canvas Preview */}
      <div className="relative min-h-[180px] bg-base-200/50 flex items-center justify-center p-6 border-b border-base-200 group">
        <div
          id={`preview-${modalId}`}
          className="transition-transform duration-300 group-hover:scale-110"
          dangerouslySetInnerHTML={{ __html: snippet.htmlCode }}
        />
      </div>

      {/* Card Controls & Footer */}
      <div className="p-4 space-y-3">
        {/* Speed Controller Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-base-content/60 font-medium min-w-[42px]">
            Speed
          </span>
          <input
            type="range"
            min="0.2"
            max="4"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="range range-primary range-xs flex-1"
          />
          <span className="text-xs font-mono text-base-content/70 min-w-[32px] text-right">
            {speed}s
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Quick Copy Dropdown */}
          <div className="join">
            <button
              onClick={() => copyToClipboard(snippet.cssCode, "CSS")}
              className="btn btn-sm btn-outline join-item"
            >
              {copiedType === "CSS" ? "Copied CSS!" : "Copy CSS"}
            </button>
            <button
              onClick={() => copyToClipboard(snippet.reactCode, "React")}
              className="btn btn-sm btn-outline join-item"
            >
              {copiedType === "React" ? "Copied React!" : "React"}
            </button>
          </div>

          {/* Show Code Modal Trigger */}
          <button
            onClick={() => {
              const modal = document.getElementById(
                modalId
              ) as HTMLDialogElement | null;
              modal?.showModal();
            }}
            className="btn btn-sm btn-ghost text-primary"
          >
            Show Code
          </button>
        </div>
      </div>

      {/* DaisyUI Code Modal */}
      <dialog id={modalId} className="modal">
        <div className="modal-box w-11/12 max-w-2xl bg-base-100">
          <h3 className="font-bold text-lg mb-4">{snippet.title} — Code</h3>

          {/* Tab Selection */}
          <div className="tabs tabs-boxed mb-4 bg-base-200">
            <button
              className={`tab ${activeTab === "css" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("css")}
            >
              CSS
            </button>
            <button
              className={`tab ${activeTab === "react" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("react")}
            >
              React Component
            </button>
            <button
              className={`tab ${activeTab === "html" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("html")}
            >
              HTML
            </button>
          </div>

          {/* Code Viewer */}
          <div className="relative">
            <pre className="bg-neutral text-neutral-content p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-72">
              <code>
                {activeTab === "css" && snippet.cssCode}
                {activeTab === "react" && snippet.reactCode}
                {activeTab === "html" && snippet.htmlCode}
              </code>
            </pre>
            <button
              onClick={() => {
                const text =
                  activeTab === "css" ? snippet.cssCode
                  : activeTab === "react" ? snippet.reactCode
                  : snippet.htmlCode;
                copyToClipboard(text, activeTab.toUpperCase());
              }}
              className="btn btn-xs btn-primary absolute top-2 right-2"
            >
              {copiedType === activeTab.toUpperCase() ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-sm">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
