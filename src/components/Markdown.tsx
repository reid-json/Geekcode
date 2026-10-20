import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';

export default function Markdown({ children }: { children: string }) {
  const source = children.replace(
    /\[\[([^\]]+)\]\]/g,
    (_, title: string) => `[${title}](#/notes?q=${encodeURIComponent(title)})`,
  );
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
