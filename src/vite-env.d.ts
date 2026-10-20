/// <reference types="vite/client" />
declare module 'monaco-vim' {
  import type { editor } from 'monaco-editor';
  export function initVimMode(
    editor: editor.IStandaloneCodeEditor,
    element: HTMLElement,
  ): { dispose: () => void };
}
