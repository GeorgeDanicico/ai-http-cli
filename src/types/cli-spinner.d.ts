declare module "cli-spinner" {
  export type SpinnerOptions = {
    text?: string;
    onTick?: (message: string) => void;
    stream?: NodeJS.WritableStream;
  };

  export class Spinner {
    constructor(options?: SpinnerOptions | string);
    static spinners: string[];
    setSpinnerDelay(delay: number): Spinner;
    setSpinnerString(spinner: number | string | string[]): Spinner;
    setSpinnerTitle(title: string): Spinner;
    start(): Spinner;
    stop(clear?: boolean): Spinner;
  }
}
