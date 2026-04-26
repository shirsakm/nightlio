import { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  BlockTypeSelect,
  Separator
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

const DEFAULT_MARKDOWN = `# How was your day?

Write about your thoughts, feelings, and experiences...`;

const MyComponent = forwardRef(({ initialMarkdown, onChange }, ref) => {
  const editorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getMarkdown: () => {
      return editorRef.current?.getMarkdown() || '';
    },
    getInstance: () => ({
      setMarkdown: (newValue) => {
        editorRef.current?.setMarkdown(newValue);
      }
    })
  }));

  return (
    <div style={{ 
      border: 'none',
      borderRadius: '16px',
      overflow: 'hidden',
      background: 'var(--bg-card)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <style>
        {`
          .mdx-editor .prose {
            text-align: left !important;
            color: var(--text) !important;
          }
          .mdx-editor .prose * {
            text-align: left !important;
            color: inherit !important;
          }
          .mdx-editor [data-editor-type="root"] {
            text-align: left !important;
            color: var(--text) !important;
          }
          .mdx-editor [contenteditable] {
            text-align: left !important;
            color: var(--text) !important;
          }
          .mdx-editor a { color: var(--accent-600) !important; }
          .mdx-editor code { color: var(--text) !important; }
          .mdx-editor pre { color: var(--text) !important; }
        `}
      </style>
      <MDXEditor
        ref={editorRef}
        markdown={initialMarkdown || DEFAULT_MARKDOWN}
        onChange={onChange}
        contentEditableClassName="prose"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
          codeMirrorPlugin({ codeBlockLanguages: { txt: 'Plain Text', js: 'JavaScript', css: 'CSS' } }),
          directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
          frontmatterPlugin(),
          diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' }),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <CodeToggle />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <CreateLink />
                <InsertImage />
                <Separator />
                <ListsToggle />
                <InsertTable />
                <InsertThematicBreak />
              </>
            )
          })
        ]}
        className="mdx-editor"
      />
    </div>
  );
});

MyComponent.displayName = 'MarkdownArea';
export default MyComponent;