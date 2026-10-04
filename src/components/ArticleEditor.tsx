"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useRef, useState } from "react";
import { uploadImage, uploadPdf } from "@/lib/uploadImage";

// Link that also carries data-pdf-viewer, so an embedded PDF survives editing
// and saving. In the editor it shows as a chip rather than a live viewer.
const PdfAwareLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      pdfViewer: {
        default: null,
        parseHTML: (element) =>
          element.hasAttribute("data-pdf-viewer") ? "true" : null,
        renderHTML: (attributes) =>
          attributes.pdfViewer
            ? {
                "data-pdf-viewer": "true",
                class:
                  "inline-block rounded-full bg-red-50 px-3 py-0.5 text-sm font-medium text-red-700 no-underline before:content-['PDF_·_']",
              }
            : {},
      },
    };
  },
});

interface ArticleEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function ArticleEditor({ content, onChange }: ArticleEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ link: false }), PdfAwareLink, Image],
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

  async function handlePdfFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setUploadError("");
    setUploading(true);
    try {
      const result = await uploadPdf(file);
      if ("error" in result) {
        setUploadError(result.error);
        return;
      }
      const defaultText = file.name.replace(/\.pdf$/i, "");
      const text = window.prompt("Link text for the PDF", defaultText);
      if (text === null) return;
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: text.trim() || defaultText,
          marks: [
            {
              type: "link",
              attrs: { href: result.fileUrl, pdfViewer: "true" },
            },
          ],
        })
        .run();
    } finally {
      setUploading(false);
    }
  }

  function toggleLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link");
    const previousUrl = previous.href as string | undefined;
    const url = window.prompt("URL", previousUrl || "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, pdfViewer: previous.pdfViewer ?? null } as never)
      .run();
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
        <button
          type="button"
          onClick={() => pdfInputRef.current?.click()}
          disabled={uploading}
          className="px-2 py-1 text-sm rounded font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Insert PDF
        </button>
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          onChange={handlePdfFileChange}
          className="hidden"
        />
      </div>
      {uploadError && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {uploadError}
        </p>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
