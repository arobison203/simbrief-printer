import { useState } from "react";
import { ESCPOS } from "../utils/escposFormatter";

interface PrintPreviewProps {
  formattedOutput: string;
  onPrint: () => void;
  isPrinting: boolean;
}

interface TextSpan {
  text: string;
  bold: boolean;
  underline: boolean;
  doubleHeight: boolean;
  doubleWidth: boolean;
  doubleSize: boolean;
}

function PrintPreview({
  formattedOutput,
  onPrint,
  isPrinting,
}: PrintPreviewProps) {
  const [showRaw, setShowRaw] = useState(false);

  // Parse ESC/POS commands and render with visual indicators
  const renderPreview = (output: string) => {
    const lines: JSX.Element[] = [];
    let currentSpans: TextSpan[] = [];
    let currentText = "";
    let currentStyles = {
      bold: false,
      underline: false,
      doubleHeight: false,
      doubleWidth: false,
      doubleSize: false,
    };
    let currentAlign = "left";
    let lineKey = 0;

    const flushSpan = () => {
      if (currentText) {
        currentSpans.push({
          text: currentText,
          bold: currentStyles.bold,
          underline: currentStyles.underline,
          doubleHeight: currentStyles.doubleHeight,
          doubleWidth: currentStyles.doubleWidth,
          doubleSize: currentStyles.doubleSize,
        });
        currentText = "";
      }
    };

    const flushLine = () => {
      flushSpan();

      if (currentSpans.length === 0) {
        // Empty line
        lines.push(
          <div key={lineKey++} className={`preview-line align-${currentAlign}`}>
            &nbsp;
          </div>,
        );
      } else {
        const classNames = ["preview-line", `align-${currentAlign}`];

        lines.push(
          <div key={lineKey++} className={classNames.join(" ")}>
            {currentSpans.map((span, idx) => {
              const spanClasses: string[] = [];
              if (span.bold) spanClasses.push("bold");
              if (span.underline) spanClasses.push("underline");
              if (span.doubleHeight) spanClasses.push("double-height");
              if (span.doubleWidth) spanClasses.push("double-width");
              if (span.doubleSize) spanClasses.push("double-size");

              return (
                <span key={idx} className={spanClasses.join(" ")}>
                  {span.text}
                </span>
              );
            })}
          </div>,
        );
      }

      currentSpans = [];
    };

    const addCommand = (text: string, type: string = "default") => {
      flushSpan();
      if (currentSpans.length > 0) {
        flushLine();
      }
      lines.push(
        <div key={lineKey++} className={`command ${type}`}>
          {text}
        </div>,
      );
    };

    let i = 0;
    while (i < output.length) {
      const char = output[i];
      const nextChar = output[i + 1];

      // Check for ESC/POS commands
      if (char === "\x1B") {
        // ESC commands
        if (nextChar === "@") {
          // Initialize - reset everything
          flushLine();
          currentStyles = {
            bold: false,
            underline: false,
            doubleHeight: false,
            doubleWidth: false,
            doubleSize: false,
          };
          currentAlign = "left";
          addCommand("[INIT]");
          i += 2;
          continue;
        } else if (nextChar === "E") {
          // Bold
          flushSpan();
          const boldVal = output.charCodeAt(i + 2);
          currentStyles.bold = boldVal === 1;
          i += 3;
          continue;
        } else if (nextChar === "-") {
          // Underline
          flushSpan();
          const underlineVal = output.charCodeAt(i + 2);
          currentStyles.underline = underlineVal === 1;
          i += 3;
          continue;
        } else if (nextChar === "a") {
          // Alignment
          const alignVal = output.charCodeAt(i + 2);
          currentAlign =
            alignVal === 1 ? "center" : alignVal === 2 ? "right" : "left";
          i += 3;
          continue;
        } else if (nextChar === "d") {
          // Feed lines
          const feedCount = output.charCodeAt(i + 2);
          flushLine();
          for (let j = 0; j < feedCount; j++) {
            lines.push(
              <div key={lineKey++} className="preview-line">
                &nbsp;
              </div>,
            );
          }
          i += 3;
          continue;
        } else if (nextChar === "i") {
          // Cut command
          flushLine();
          addCommand("[PAPER CUT ✂️]", "cut");
          i += 2;
          continue;
        }
      } else if (char === "\x1D") {
        // GS commands
        if (nextChar === "!") {
          // Text size
          flushSpan();
          const sizeVal = output.charCodeAt(i + 2);
          currentStyles.doubleHeight = false;
          currentStyles.doubleWidth = false;
          currentStyles.doubleSize = false;

          if (sizeVal === 0x01) currentStyles.doubleHeight = true;
          else if (sizeVal === 0x10) currentStyles.doubleWidth = true;
          else if (sizeVal === 0x11) currentStyles.doubleSize = true;
          i += 3;
          continue;
        } else if (nextChar === "V") {
          // Cut command
          flushLine();
          const cutType = output.charCodeAt(i + 2) === 0 ? "FULL" : "PARTIAL";
          addCommand(`[PAPER CUT ✂️ - ${cutType}]`, "cut");
          i += 3;
          continue;
        }
      }

      // Regular characters
      if (char === "\n") {
        flushLine();
      } else if (char.charCodeAt(0) >= 32) {
        // Printable character
        currentText += char;
      }

      i++;
    }

    // Add final line if any
    if (currentText || currentSpans.length > 0) {
      flushLine();
    }

    return lines;
  };

  const downloadAsText = () => {
    const blob = new Blob([formattedOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ofp-preview-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedOutput);
    alert("Copied to clipboard!");
  };

  return (
    <div className="print-preview-container">
      <div className="preview-toolbar">
        <div className="toolbar-left">
          <button onClick={copyToClipboard} className="toolbar-btn">
            📋 Copy Raw
          </button>
          <button onClick={downloadAsText} className="toolbar-btn">
            💾 Download
          </button>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="toolbar-btn"
            style={{ backgroundColor: showRaw ? "#2196f3" : "#666" }}
          >
            {showRaw ? "👁️ Visual" : "🔍 Raw"}
          </button>
          <div className="preview-info">{formattedOutput.length} bytes</div>
        </div>
      </div>

      <div className="preview-paper-container">
        <div className="thermal-paper">
          {showRaw ? (
            <div style={{ fontSize: "10px", fontFamily: "monospace" }}>
              {formattedOutput.split("\n").map((line, idx) => (
                <div
                  key={idx}
                  style={{
                    borderBottom: "1px dashed #ccc",
                    padding: "2px 0",
                    marginBottom: "2px",
                  }}
                >
                  <div style={{ color: "#999", fontSize: "9px" }}>
                    Line {idx + 1} ({line.length} chars)
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {line.split("").map((char, charIdx) => {
                      const code = char.charCodeAt(0);
                      if (code < 32) {
                        return (
                          <span
                            key={charIdx}
                            style={{ color: "red", fontWeight: "bold" }}
                          >
                            [{code.toString(16).toUpperCase().padStart(2, "0")}]
                          </span>
                        );
                      }
                      return char;
                    })}
                    {line.length === 0 && (
                      <span style={{ color: "#ccc" }}>[empty]</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            renderPreview(formattedOutput)
          )}
        </div>
      </div>

      <div className="preview-footer">
        <div className="preview-actions">
          <button onClick={onPrint} className="print-btn" disabled={isPrinting}>
            {isPrinting ? "Printing..." : "Print"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrintPreview;
