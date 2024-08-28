declare global {
    interface Window {
      process: {
        env: Record<string, string>;
      };
      Buffer: typeof Buffer;
    }
  }
  
  export {};