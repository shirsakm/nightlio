import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import { useRef, forwardRef, useImperativeHandle } from 'react';

import { Editor } from '@toast-ui/react-editor';

const MyComponent = forwardRef((props, ref) => {
  const editorRef = useRef();

  useImperativeHandle(ref, () => ({
    getMarkdown: () => {
      return editorRef.current?.getInstance().getMarkdown();
    }
  }));

  return (
    <Editor
      ref={editorRef}
      initialValue="# Enter title here

Write your thoughts here"
      previewStyle="vertical"
      height="400px"
      initialEditType="markdown"
      useCommandShortcut={true}
      usageStatistics={false}
      theme="dark"
      toolbarItems={[
        ["heading", "bold", "italic", "strike"],
        ["hr", "quote"],
        ["ul", "ol"],
        ["link"]
      ]}
      hideModeSwitch={true}
    />
  );
});

MyComponent.displayName = 'MarkdownArea';
export default MyComponent;