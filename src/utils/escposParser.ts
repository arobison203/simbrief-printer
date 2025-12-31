export interface TextSpan {
  text: string;
  styles: TextStyles;
}

export interface TextStyles {
  bold: boolean;
  underline: boolean;
  doubleHeight: boolean;
  doubleWidth: boolean;
  doubleSize: boolean;
}

export interface ParsedLine {
  spans: TextSpan[];
  alignment: "left" | "center" | "right";
}

export interface ESCPOSCommand {
  type: "ESC" | "GS" | "LF" | "TEXT";
  command?: string;
  value?: number;
  text?: string;
}

/**
 * ESC/POS Parser - Converts ESC/POS formatted strings into structured data
 * for easier rendering and debugging
 */
export class ESCPOSParser {
  private output: ParsedLine[] = [];
  private currentSpans: TextSpan[] = [];
  private currentText = "";
  private currentStyles: TextStyles = {
    bold: false,
    underline: false,
    doubleHeight: false,
    doubleWidth: false,
    doubleSize: false,
  };
  private currentAlignment: "left" | "center" | "right" = "left";

  /**
   * Parse ESC/POS string into structured lines
   */
  parse(input: string): ParsedLine[] {
    this.reset();
    const commands = this.tokenize(input);

    for (const command of commands) {
      this.processCommand(command);
    }

    // Flush any remaining content
    this.flushCurrentLine();

    return this.output;
  }

  /**
   * Reset parser state
   */
  private reset(): void {
    this.output = [];
    this.currentSpans = [];
    this.currentText = "";
    this.currentStyles = {
      bold: false,
      underline: false,
      doubleHeight: false,
      doubleWidth: false,
      doubleSize: false,
    };
    this.currentAlignment = "left";
  }

  /**
   * Tokenize ESC/POS string into commands and text
   */
  private tokenize(input: string): ESCPOSCommand[] {
    const commands: ESCPOSCommand[] = [];
    let i = 0;

    while (i < input.length) {
      const char = input[i];
      const charCode = char.charCodeAt(0);

      if (charCode === 0x1b) {
        // ESC
        const parsed = this.parseESCCommand(input, i);
        if (parsed) {
          commands.push(parsed.command);
          i = parsed.nextIndex;
        } else {
          i++;
        }
      } else if (charCode === 0x1d) {
        // GS
        const parsed = this.parseGSCommand(input, i);
        if (parsed) {
          commands.push(parsed.command);
          i = parsed.nextIndex;
        } else {
          i++;
        }
      } else if (char === "\n") {
        commands.push({ type: "LF" });
        i++;
      } else if (charCode >= 32) {
        // Printable character
        // Collect consecutive text
        let text = "";
        while (
          i < input.length &&
          input.charCodeAt(i) >= 32 &&
          input[i] !== "\n"
        ) {
          text += input[i];
          i++;
        }
        if (text) {
          commands.push({ type: "TEXT", text });
        }
      } else {
        i++; // Skip non-printable characters
      }
    }

    return commands;
  }

  /**
   * Parse ESC commands
   */
  private parseESCCommand(
    input: string,
    startIndex: number,
  ): { command: ESCPOSCommand; nextIndex: number } | null {
    if (startIndex + 1 >= input.length) return null;

    const commandChar = input[startIndex + 1];

    switch (commandChar) {
      case "@": // Initialize
        return {
          command: { type: "ESC", command: "init" },
          nextIndex: startIndex + 2,
        };

      case "E": // Bold
        if (startIndex + 2 >= input.length) return null;
        return {
          command: {
            type: "ESC",
            command: "bold",
            value: input.charCodeAt(startIndex + 2),
          },
          nextIndex: startIndex + 3,
        };

      case "-": // Underline
        if (startIndex + 2 >= input.length) return null;
        return {
          command: {
            type: "ESC",
            command: "underline",
            value: input.charCodeAt(startIndex + 2),
          },
          nextIndex: startIndex + 3,
        };

      case "a": // Alignment
        if (startIndex + 2 >= input.length) return null;
        return {
          command: {
            type: "ESC",
            command: "align",
            value: input.charCodeAt(startIndex + 2),
          },
          nextIndex: startIndex + 3,
        };

      case "d": // Feed lines
        if (startIndex + 2 >= input.length) return null;
        return {
          command: {
            type: "ESC",
            command: "feed",
            value: input.charCodeAt(startIndex + 2),
          },
          nextIndex: startIndex + 3,
        };

      default:
        return null;
    }
  }

  /**
   * Parse GS commands
   */
  private parseGSCommand(
    input: string,
    startIndex: number,
  ): { command: ESCPOSCommand; nextIndex: number } | null {
    if (startIndex + 1 >= input.length) return null;

    const commandChar = input[startIndex + 1];

    switch (commandChar) {
      case "!": // Text size
        if (startIndex + 2 >= input.length) return null;
        return {
          command: {
            type: "GS",
            command: "textSize",
            value: input.charCodeAt(startIndex + 2),
          },
          nextIndex: startIndex + 3,
        };

      case "V": // Paper cut
        if (startIndex + 2 >= input.length) return null;
        return {
          command: {
            type: "GS",
            command: "cut",
            value: input.charCodeAt(startIndex + 2),
          },
          nextIndex: startIndex + 3,
        };

      default:
        return null;
    }
  }

  /**
   * Process a parsed command
   */
  private processCommand(command: ESCPOSCommand): void {
    switch (command.type) {
      case "TEXT":
        if (command.text) {
          this.currentText += command.text;
        }
        break;

      case "LF":
        this.flushCurrentLine();
        break;

      case "ESC":
        this.processESCCommand(command);
        break;

      case "GS":
        this.processGSCommand(command);
        break;
    }
  }

  /**
   * Process ESC command
   */
  private processESCCommand(command: ESCPOSCommand): void {
    switch (command.command) {
      case "init":
        this.flushCurrentLine();
        this.resetStyles();
        this.currentAlignment = "left";
        break;

      case "bold":
        this.flushCurrentSpan();
        this.currentStyles.bold = command.value === 1;
        break;

      case "underline":
        this.flushCurrentSpan();
        this.currentStyles.underline = command.value === 1;
        break;

      case "align":
        this.currentAlignment = this.mapAlignment(command.value || 0);
        break;

      case "feed":
        this.flushCurrentLine();
        // Add empty lines for feed
        for (let i = 0; i < (command.value || 0); i++) {
          this.output.push({ spans: [], alignment: this.currentAlignment });
        }
        break;
    }
  }

  /**
   * Process GS command
   */
  private processGSCommand(command: ESCPOSCommand): void {
    switch (command.command) {
      case "textSize":
        this.flushCurrentSpan();
        this.applyTextSize(command.value || 0);
        break;

      case "cut":
        // Paper cut command - just ignore it for preview purposes
        // The actual printer will handle the cut
        break;
    }
  }

  /**
   * Map alignment value to string
   */
  private mapAlignment(value: number): "left" | "center" | "right" {
    switch (value) {
      case 1:
        return "center";
      case 2:
        return "right";
      default:
        return "left";
    }
  }

  /**
   * Apply text size based on value
   */
  private applyTextSize(value: number): void {
    this.currentStyles.doubleHeight = false;
    this.currentStyles.doubleWidth = false;
    this.currentStyles.doubleSize = false;

    switch (value) {
      case 0x01:
        this.currentStyles.doubleHeight = true;
        break;
      case 0x10:
        this.currentStyles.doubleWidth = true;
        break;
      case 0x11:
        this.currentStyles.doubleSize = true;
        break;
    }
  }

  /**
   * Reset all styles to defaults
   */
  private resetStyles(): void {
    this.currentStyles = {
      bold: false,
      underline: false,
      doubleHeight: false,
      doubleWidth: false,
      doubleSize: false,
    };
  }

  /**
   * Flush current text span with its styles
   */
  private flushCurrentSpan(): void {
    if (this.currentText) {
      this.currentSpans.push({
        text: this.currentText,
        styles: { ...this.currentStyles },
      });
      this.currentText = "";
    }
  }

  /**
   * Flush current line with all its spans
   */
  private flushCurrentLine(): void {
    this.flushCurrentSpan();

    // Always add a line, even if empty
    this.output.push({
      spans: [...this.currentSpans],
      alignment: this.currentAlignment,
    });

    this.currentSpans = [];
  }
}

/**
 * Convenience function to parse ESC/POS string
 */
export function parseESCPOS(input: string): ParsedLine[] {
  const parser = new ESCPOSParser();
  return parser.parse(input);
}

/**
 * Debug helper to log parsed commands for troubleshooting
 */
export function debugESCPOS(input: string): void {
  console.group("ESC/POS Debug");

  const parser = new ESCPOSParser();
  const lines = parser.parse(input);

  lines.forEach((line, lineIndex) => {
    console.log(`Line ${lineIndex} (${line.alignment}):`);
    if (line.spans.length === 0) {
      console.log("  [empty line]");
    } else {
      line.spans.forEach((span, spanIndex) => {
        const styles =
          Object.entries(span.styles)
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(", ") || "none";
        console.log(`  Span ${spanIndex}: "${span.text}" (${styles})`);
      });
    }
  });

  console.groupEnd();
}
