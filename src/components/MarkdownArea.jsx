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

const MyComponent = forwardRef((props, ref) => {
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
      background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
    }}>
      <style>
        {`
          .mdx-editor .prose {
            text-align: left !important;
          }
          .mdx-editor .prose * {
            text-align: left !important;
          }
          .mdx-editor [data-editor-type="root"] {
            text-align: left !important;
          }
          .mdx-editor [contenteditable] {
            text-align: left !important;
          }
        `}
      </style>
      <MDXEditor
        ref={editorRef}
        markdown={`# How was your day?

Write about your thoughts, feelings, and experiences...`}
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