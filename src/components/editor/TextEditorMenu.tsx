import {
    RiBold,
    RiItalic,
    RiStrikethrough,
    RiCodeSSlashLine,
  } from "react-icons/ri";
  import { type Editor } from "@tiptap/react";
  import { AiOutlineRedo, AiOutlineUndo } from "react-icons/ai";
  import { BsTypeUnderline } from "react-icons/bs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";


  const Button = ({
    onClick,
    isActive,
    disabled,
    children,
  }: {
    onClick: () => void;
    isActive: boolean;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 ${isActive ? "bg-violet-500 text-white rounded-md" : ""}`}
    >
      {children}
    </button>
  );

  export default function TextEditorMenuBar({
    editor,
  }: {
    editor: Editor | null;
  }) {
    if (!editor) return null;
  
    const buttons = [
      {
        icon: <RiBold className="size-5" />,
        onClick: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive("bold"),
        tooltip: "Bold"
      },
      {
        icon: <BsTypeUnderline className="size-5" />,
        onClick: () => editor.chain().focus().toggleUnderline().run(),
        isActive: editor.isActive("underline"),
        tooltip: "Underline"
      },
      {
        icon: <RiItalic className="size-5" />,
        onClick: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive("italic"),
        disabled: !editor.can().chain().focus().toggleItalic().run(),
        tooltip: "Italic"
      },
      {
        icon: <RiStrikethrough className="size-5" />,
        onClick: () => editor.chain().focus().toggleStrike().run(),
        isActive: editor.isActive("strike"),
        disabled: !editor.can().chain().focus().toggleStrike().run(),
        tooltip: "Strikethrough"
      },
      {
        icon: <RiCodeSSlashLine className="size-5" />,
        onClick: () => editor.chain().focus().toggleCode().run(),
        isActive: editor.isActive("code"),
        disabled: !editor.can().chain().focus().toggleCode().run(),
        tooltip: "Code"
      },
      {
        icon: <AiOutlineUndo className="size-5" />,
        onClick: () => editor.chain().focus().undo().run(),
        isActive: editor.isActive("undo"),
        disabled: !editor.can().chain().focus().undo().run(),
        tooltip: "Undo"
      },
      {
        icon: <AiOutlineRedo className="size-5" />,
        onClick: () => editor.chain().focus().redo().run(),
        isActive: editor.isActive("redo"),
        disabled: !editor.can().chain().focus().redo().run(),
        tooltip: "Redo"
      },
    ];
  
    return (
      <div className="mb-2 mt-2 flex space-x-2">
        {buttons.map(({ icon, onClick, isActive, disabled, tooltip }, index) => (
          <TooltipProvider key={index}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                  <Button
                key={index}
                onClick={onClick}
                isActive={isActive}
                disabled={disabled}
              >
                {icon}
              </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>{tooltip}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))} 
      </div>
    );
  }
  