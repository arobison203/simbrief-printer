import {
  parseESCPOS,
  debugESCPOS,
  ParsedLine,
  TextSpan,
} from "../utils/escposParser";
import { ArrowPathIcon, PrinterIcon } from "@heroicons/react/24/outline";

interface PrintPreviewProps {
  formattedOutput: string;
  onPrint: () => void;
  isPrinting: boolean;
  onRefetch?: () => void;
  isRefetching?: boolean;
}

export const PrintPreviewDaisy = ({
  formattedOutput,
  onPrint,
  isPrinting,
  onRefetch,
  isRefetching,
}: PrintPreviewProps) => {
  /**
   * Render a text span with its styles
   */
  const renderSpan = (span: TextSpan, index: number): JSX.Element => {
    const styles: React.CSSProperties = {};

    if (span.styles.bold) styles.fontWeight = "bold";
    if (span.styles.underline) styles.textDecoration = "underline";
    if (span.styles.doubleHeight) {
      styles.fontSize = "1.8em";
      styles.lineHeight = "2";
    }
    if (span.styles.doubleWidth) styles.letterSpacing = "0.5em";
    if (span.styles.doubleSize) {
      styles.fontSize = "2em";
      styles.lineHeight = "1.2";
      styles.fontWeight = "bold";
    }

    return (
      <span key={index} style={styles}>
        {span.text}
      </span>
    );
  };

  /**
   * Render a parsed line with its spans
   */
  const renderLine = (line: ParsedLine, index: number): JSX.Element => {
    const alignmentStyle: React.CSSProperties = {
      textAlign: line.alignment as any,
      margin: 0,
      padding: 0,
      whiteSpace: "pre",
    };

    return (
      <div key={index} style={alignmentStyle}>
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
        <div
          key={index}
          style={{
            margin: 0,
            padding: 0,
            whiteSpace: "pre",
          }}
        >
          {line || "\u00A0"}
        </div>
      ));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Preview Container */}
      <div className="flex-1 p-8 bg-base-200 overflow-auto flex justify-center items-start">
        {/* Thermal Paper - white background with fixed width */}
        <div
          className="bg-white text-black shadow-xl"
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "11px",
            lineHeight: "1.4",
            padding: "2mm 3mm",
            width: "48ch",
            minHeight: "200px",
            boxSizing: "content-box",
            whiteSpace: "pre",
            overflow: "hidden",
          }}
        >
          {renderPreview(formattedOutput)}
        </div>
      </div>

      {/* Toolbar */}
      <div className="navbar bg-base-100 border-t border-base-300 px-5">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Print Preview</h2>
        </div>
        <div className="flex gap-2">
          {onRefetch && (
            <button
              onClick={onRefetch}
              className="btn btn-outline btn-sm overflow-visible"
              disabled={isRefetching}
            >
              {isRefetching ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Refreshing...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-1" />
                  Refresh
                </>
              )}
            </button>
          )}
          <button
            onClick={onPrint}
            className="btn btn-primary btn-sm"
            disabled={isPrinting}
          >
            {isPrinting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Printing...
              </>
            ) : (
              <>
                <PrinterIcon className="w-4 h-4 mr-1" />
                Print
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
