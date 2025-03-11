import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextEditorMenuBar from "./TextEditorMenu";
import { EditorView } from "@tiptap/pm/view";

type TextEditorProps = {
  onChange: (content: string) => void;
  initialContent?: string;
};

export default function RichTextEditor({
  onChange,
  initialContent,
}: TextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "cursor-text rounded-md border-2 shadow p-5 ring-offset-background focus-within:outline-none min-h-[50vh] sm:min-h-[70vh]",
      },
      handleKeyDown: (view:EditorView, event:KeyboardEvent) => {
        if (event.key === 'Tab') {
          event.preventDefault();

          const { state } = view;
          const { selection } = state;
          const { from, to } = selection;
          const spaces = '  ';
          const transaction = state.tr.insertText(spaces, from, to);

          view.dispatch(transaction);
          return true; 
        }
        return false; 
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className="h-full">
      <TextEditorMenuBar editor={editor} />
      <EditorContent editor={editor} className="h-full" />
    </div>
  );
}
