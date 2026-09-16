"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/uploadImage";

interface ArticleEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function ArticleEditor({ content, onChange }: ArticleEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Image],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none min-h-[240px] px-3 py-2 border border-gray-300 border-t-0 rounded-b-md focus:outline-none",
      },
    },
  });

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setUploading(true);
    try {
      const fileUrl = await uploadImage(file);
      if (fileUrl) {
        editor.chain().focus().setImage({ src: fileUrl }).run();
      }
    } finally {
      setUploading(false);
    }
  }

  function toggleLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previousUrl || "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return null;

  const buttonClass = (active: boolean) =>
    `px-2 py-1 text-sm rounded font-medium ${
      active ? "bg-primary-600 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border border-gray-300 rounded-t-md bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive("bold"))}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive("italic"))}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 1 }))}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive("bulletList"))}
        >
          Bullet List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive("orderedList"))}
        >
          Numbered List
        </button>
        <button
          type="button"
          onClick={toggleLink}
          className={buttonClass(editor.isActive("link"))}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-2 py-1 text-sm rounded font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Insert Image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleImageFileChange}
          className="hidden"
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
