import { useEffect, useRef, useState } from 'react';
import Editor, { loader, type OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TypeScriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { useStore } from '../core/store';
import type { Language } from '../content/schema';

self.MonacoEnvironment = {
  getWorker: (_moduleId, label) =>
    label === 'typescript' || label === 'javascript' ? new TypeScriptWorker() : new EditorWorker(),
};
loader.config({ monaco });

export default function CodeEditor({
  code,
  language,
  onChange,
}: {
  code: string;
  language: Language;
  onChange: (code: string) => void;
}) {
  const settings = useStore((s) => s.progress.settings);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const onMount: OnMount = (editor) => {
    editorRef.current = editor;
    setMounted(true);
  };
  useEffect(() => {
    let disposed = false;
    let vim: { dispose: () => void } | undefined;
    if (settings.keybindings === 'vim') {
      void import('monaco-vim')
        .then(({ initVimMode }) => {
          if (!disposed && editorRef.current && statusRef.current)
            vim = initVimMode(editorRef.current, statusRef.current);
        })
        .catch((error: unknown) =>
          useStore.getState().notify(`Vim could not load: ${String(error)}`),
        );
    }
    return () => {
      disposed = true;
      vim?.dispose();
    };
  }, [settings.keybindings, mounted]);
  return (
    <div className="monaco-shell">
      <Editor
        height="100%"
        language={language === 'text' ? 'plaintext' : language}
        value={code}
        onChange={(value) => onChange(value ?? '')}
        onMount={onMount}
        theme={settings.theme === 'dark' ? 'vs-dark' : 'light'}
        loading={<div className="loading">Loading local editor…</div>}
        options={{
          fontSize: settings.fontSize,
          fontFamily: "'Cascadia Code', 'Consolas', monospace",
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 2,
          padding: { top: 18 },
          wordWrap: 'on',
          ariaLabel: 'Solution editor',
          fixedOverflowWidgets: true,
        }}
      />
      <div ref={statusRef} className="vim-status" />
    </div>
  );
}
