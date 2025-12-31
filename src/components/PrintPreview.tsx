import React from "react";
import {
  parseESCPOS,
  debugESCPOS,
  ParsedLine,
  TextSpan,
} from "../utils/escposParser";

interface PrintPreviewProps {
  formattedOutput: string;
  onPrint: () => void;
  isPrinting: boolean;
}

function PrintPreview({
  formattedOutput,
  onPrint,
  isPrinting,
}: PrintPreviewProps) {
  /**
   * Render a text span with its styles
   */
  const renderSpan = (span: TextSpan, index: number): JSX.Element => {
    const classNames: string[] = [];

    if (span.styles.bold) classNames.push("bold");
    if (span.styles.underline) classNames.push("underline");
    if (span.styles.doubleHeight) classNames.push("double-height");
    if (span.styles.doubleWidth) classNames.push("double-width");
    if (span.styles.doubleSize) classNames.push("double-size");

    return (
      <span key={index} className={classNames.join(" ")}>
        {span.text}
      </span>
    );
  };

  /**
   * Render a parsed line with its spans
   */
  const renderLine = (line: ParsedLine, index: number): JSX.Element => {
    const classNames = ["preview-line", `align-${line.alignment}`];

    return (
      <div key={index} className={classNames.join(" ")}>
        {line.spans.length === 0 ? (
          <>&nbsp;</>
        ) : (
          line.spans.map((span, spanIndex) => renderSpan(span, spanIndex))
        )}
      </div>
    );
  };

  /**
   * Parse and render the ESC/POS output
   */
  const renderPreview = (output: string): JSX.Element[] => {
    try {
      const parsedLines = parseESCPOS(output);

      // Debug logging in development
      if (process.env.NODE_ENV === "development") {
        debugESCPOS(output);
      }

      return parsedLines.map((line, index) => renderLine(line, index));
    } catch (error) {
      console.error("Error parsing ESC/POS output:", error);

      // Fallback to raw text display
      return output.split("\n").map((line, index) => (
        <div key={index} className="preview-line">
          {line || "\u00A0"}
        </div>
      ));
    }
  };

  return (
    <div className="print-preview-container">
      <div className="preview-paper-container">
        <div className="thermal-paper">{renderPreview(formattedOutput)}</div>
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
