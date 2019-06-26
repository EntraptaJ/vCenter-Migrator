declare interface ProcessEnv {
  USER: string;
  PASS: string;
  URL: string;
  [key: string]: string | undefined;
}
