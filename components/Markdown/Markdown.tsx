import { MemoizedReactMarkdown } from "./MemoizedReactMarkdown";
// import rehypeMathjax from 'rehype-mathjax';
// import remarkGfm from 'remark-gfm';
// import remarkMath from 'remark-math';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import React, { memo } from 'react';

interface MarkdownProps {
    content: string;
}

const Markdown = memo(function Markdown({ content }: MarkdownProps) {
    return <MemoizedReactMarkdown
        className="prose dark:prose-invert markdown max-w-none break-words overflow-wrap-anywhere"
        // remarkPlugins={[remarkGfm, remarkMath]}
        // rehypePlugins={[rehypeMathjax]}
        linkTarget="_blank"
        components={{
            code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');

                return !inline && match ? (
                    <SyntaxHighlighter
                        key={Math.random()}
                        language={match[1]}
                        style={prism as any}
                        customStyle={{ margin: 0, maxWidth: '100%', overflowX: 'auto' }}
                        wrapLongLines={true}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                ) : (
                    <code className={`${className} break-words`} {...props}>
                        {children}
                    </code>
                );
            },
            table({ children }) {
                return (
                    <table className="border-collapse border border-black py-1 px-3 dark:border-white">
                        {children}
                    </table>
                );
            },
            th({ children }) {
                return (
                    <th className="break-words border border-black bg-gray-500 py-1 px-3 text-white dark:border-white">
                        {children}
                    </th>
                );
            },
            td({ children }) {
                return (
                    <td className="break-words border border-black py-1 px-3 dark:border-white">
                        {children}
                    </td>
                );
            },
        }}
    >
        {content}
    </MemoizedReactMarkdown>
})
export default Markdown;
