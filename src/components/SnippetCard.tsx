// src/components/SnippetCard.tsx
import { useState, useEffect, useRef } from "react";

interface SnippetCardProps {
  title: string;
  category: string;
  cssCode: string;
  reactCode: string;
  htmlCode?: string;
  defaultSpeed?: number;
}

function normalizeCss(css: string): string {
  return css
    .replace(/\/assets\/src\/assets\//g, "/assets/")
    .replace(/\/src\/assets\//g, "/assets/");
}

function getFallbackHtml(title: string, category: string, cssCode: string): string {
  const match = cssCode.match(/\.([a-zA-Z0-9_-]+)/);
  const className = match ? match[1] : "snippet-preview";
  if (
    category === "Buttons" ||
    className.toLowerCase().includes("btn") ||
    className.toLowerCase().includes("button")
  ) {
    return `<button class="${className}">${title}</button>`;
  }
  return `<div class="${className}"></div>`;
}

function ShadowPreviewStage({
  cssCode,
  htmlCode,
  speed,
  isPaused,
}: {
  cssCode: string;
  htmlCode: string;
  speed: number;
  isPaused: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!shadowRootRef.current) {
      shadowRootRef.current =
        containerRef.current.shadowRoot ||
        containerRef.current.attachShadow({ mode: "open" });
    }
    const root = shadowRootRef.current;
    root.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }
        *, *::before, *::after {
          box-sizing: border-box;
        }
        ${cssCode}
        .preview-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          --anim-speed: ${speed}s;
          --fire-duration: ${speed}s;
          --run-speed: ${speed}s;
          --speed: ${speed}s;
          --duration: ${speed}s;
          --anim-state: ${isPaused ? "paused" : "running"};
        }
        ${
          isPaused
            ? ".preview-wrapper, .preview-wrapper * { animation-play-state: paused !important; }"
            : ""
        }
      </style>
      <div class="preview-wrapper">
        ${htmlCode}
      </div>
    `;
  }, [cssCode, htmlCode, speed, isPaused]);

  return <div ref={containerRef} className="preview-stage" />;
}

export function SnippetCard({
  title,
  category,
  cssCode,
  reactCode,
  htmlCode,
  defaultSpeed = 0.8,
}: SnippetCardProps) {
  const [speed, setSpeed] = useState(defaultSpeed);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<"css" | "html" | "react">("css");
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const effectiveHtml = htmlCode?.trim() || getFallbackHtml(title, category, cssCode);
  const cleanCss = normalizeCss(cssCode);
  const sliderMax = Math.max(4.0, Math.ceil(defaultSpeed * 2));

  const handleCopy = async () => {
    let textToCopy = cleanCss;
    if (activeTab === "html") {
      textToCopy = effectiveHtml;
    } else if (activeTab === "react") {
      textToCopy = reactCode;
    }
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getCodeForTab = () => {
    if (activeTab === "css") return cleanCss;
    if (activeTab === "html") return effectiveHtml;
    return reactCode;
  };

  return (
    <article className="snippet-card">
      <header className="card-header">
        <div>
          <span className="category-pill">{category}</span>
          <h3 className="title">{title}</h3>
        </div>

        {/* Action Menu */}
        <div className="menu-container">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Snippet actions"
          >
            •••
          </button>
          {menuOpen && (
            <div className="menu-dropdown">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(cleanCss);
                  setMenuOpen(false);
                }}
              >
                Copy Raw CSS
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(effectiveHtml);
                  setMenuOpen(false);
                }}
              >
                Copy HTML
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(reactCode);
                  setMenuOpen(false);
                }}
              >
                Copy React / Mantine
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Animation Canvas */}
      <ShadowPreviewStage
        cssCode={cleanCss}
        htmlCode={effectiveHtml}
        speed={speed}
        isPaused={isPaused}
      />

      {/* Interactive Controls */}
      <div className="control-bar">
        <label className="slider-label">
          <span>Speed: {speed}s</span>
          <input
            type="range"
            min="0.1"
            max={sliderMax}
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            onInput={(e) => setSpeed(parseFloat((e.target as HTMLInputElement).value))}
          />
        </label>
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      {/* Code Inspector Tabs */}
      <div className="code-panel">
        <div className="tab-bar">
          <div className="tabs">
            <button
              type="button"
              className={activeTab === "css" ? "active" : ""}
              onClick={() => setActiveTab("css")}
            >
              CSS
            </button>
            <button
              type="button"
              className={activeTab === "html" ? "active" : ""}
              onClick={() => setActiveTab("html")}
            >
              HTML
            </button>
            <button
              type="button"
              className={activeTab === "react" ? "active" : ""}
              onClick={() => setActiveTab("react")}
            >
              React
            </button>
          </div>

          <div className="tab-actions">
            <button type="button" className="copy-action" onClick={handleCopy}>
              {copied ? "Copied!" : `Copy ${activeTab.toUpperCase()}`}
            </button>
            <button
              type="button"
              className="expand-action"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>

        {isExpanded && (
          <pre className="code-view">
            <code>{getCodeForTab()}</code>
          </pre>
        )}
      </div>
    </article>
  );
}
