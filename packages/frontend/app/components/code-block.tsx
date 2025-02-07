import SyntaxHighlighter from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// props https://github.com/react-syntax-highlighter/react-syntax-highlighter?tab=readme-ov-file#props
// TODO maybe switch to Light build

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = 'typescript',
  showLineNumbers = false,
}: CodeBlockProps) {
  return (
    <div className="w-full">
      <SyntaxHighlighter language={language} style={nightOwl} showLineNumbers={showLineNumbers}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
