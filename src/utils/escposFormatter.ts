// ESC/POS Commands
const ESC = "\x1B";
const GS = "\x1D";

const ESCPOS = {
  INIT: `${ESC}@`,
  BOLD_ON: `${ESC}E\x01`,
  BOLD_OFF: `${ESC}E\x00`,
  UNDERLINE_ON: `${ESC}-\x01`,
  UNDERLINE_OFF: `${ESC}-\x00`,
  DOUBLE_HEIGHT_ON: `${GS}!\x01`,
  DOUBLE_WIDTH_ON: `${GS}!\x10`,
  DOUBLE_SIZE_ON: `${GS}!\x11`,
  NORMAL_SIZE: `${GS}!\x00`,
  ALIGN_LEFT: `${ESC}a\x00`,
  ALIGN_CENTER: `${ESC}a\x01`,
  ALIGN_RIGHT: `${ESC}a\x02`,
  LINE_FEED: "\n",
  CUT_FULL: `${GS}V\x00`,
};

export class ReceiptBuilder {
  private output: string = "";
  private maxWidth: number;

  constructor(maxWidth: number = 48) {
    this.maxWidth = maxWidth;
    this.output += ESCPOS.INIT;
  }

  text(str: string): this {
    this.output += str;
    return this;
  }

  line(str: string = ""): this {
    this.output += str + "\n";
    return this;
  }

  bold(fn: () => this): this {
    this.output += ESCPOS.BOLD_ON;
    fn.call(this);
    this.output += ESCPOS.BOLD_OFF;
    return this;
  }

  boldText(str: string): this {
    this.output += ESCPOS.BOLD_ON + str + ESCPOS.BOLD_OFF + "\n";
    return this;
  }

  centered(fn: () => this): this {
    this.output += ESCPOS.ALIGN_CENTER;
    fn.call(this);
    this.output += ESCPOS.ALIGN_LEFT;
    return this;
  }

  centerText(str: string): this {
    this.output += ESCPOS.ALIGN_CENTER + str + ESCPOS.ALIGN_LEFT;
    return this;
  }

  doubleSize(fn: () => this): this {
    this.output += ESCPOS.DOUBLE_SIZE_ON;
    fn.call(this);
    this.output += ESCPOS.NORMAL_SIZE;
    return this;
  }

  doubleSizeText(str: string): this {
    this.output += ESCPOS.DOUBLE_SIZE_ON + str + ESCPOS.NORMAL_SIZE + "\n";
    return this;
  }

  separator(): this {
    this.output += "-".repeat(this.maxWidth) + "\n";
    return this;
  }

  doubleSeparator(): this {
    this.output += "=".repeat(this.maxWidth) + "\n";
    return this;
  }

  underscore(): this {
    this.output += "_".repeat(this.maxWidth) + "\n";
    return this;
  }

  blankLines(count: number): this {
    this.output += "\n".repeat(count);
    return this;
  }

  blank(): this {
    this.output += "\n";
    return this;
  }

  blanks(count: number): this {
    for (let i = 0; i < count; i++) {
      this.output += "\n";
    }
    return this;
  }

  section(title: string): this {
    this.separator();
    this.centered(() => this.doubleSizeText(title));
    return this;
  }

  header(title: string): this {
    this.boldText(title).line();
    return this;
  }

  field(label: string, value: string, forceWrap: boolean = false): this {
    const labelText = label;
    const spacing = this.maxWidth - labelText.length - value.length;

    if (spacing > 0 && !forceWrap) {
      this.output += ESCPOS.BOLD_ON + labelText + ESCPOS.BOLD_OFF;
      this.output += " ".repeat(spacing) + value + "\n";
    } else {
      this.output += ESCPOS.BOLD_ON + labelText + ESCPOS.BOLD_OFF + "\n";
      this.wrapValue(value);
    }
    return this;
  }

  private wrapValue(value: string): void {
    const indent = "  ";
    const availableWidth = this.maxWidth - indent.length;
    let remaining = value;

    while (remaining.length > 0) {
      if (remaining.length <= availableWidth) {
        this.output += indent + remaining + "\n";
        break;
      } else {
        let splitPos = availableWidth;
        const lastSpace = remaining.lastIndexOf(" ", availableWidth);
        if (lastSpace > 0) {
          splitPos = lastSpace;
        }
        this.output += indent + remaining.substring(0, splitPos).trim() + "\n";
        remaining = remaining.substring(splitPos).trim();
      }
    }
  }

  wrap(text: string): this {
    const words = text.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= this.maxWidth) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        if (currentLine) this.output += currentLine + "\n";
        currentLine = word;
      }
    }
    if (currentLine) this.output += currentLine + "\n";
    return this;
  }

  cut(blankLines: number = 0): this {
    this.output += "\n".repeat(blankLines);
    this.output += ESCPOS.CUT_FULL;
    return this;
  }

  build(): string {
    return this.output;
  }
}
