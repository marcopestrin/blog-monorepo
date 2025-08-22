"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useEffect } from "react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function RichEditor({ name, defaultValue }: { name: string; defaultValue?: string; }) {
  const [value, setValue] = useState<string>(defaultValue || "");
  const hiddenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hiddenRef.current) {
      hiddenRef.current.value = value;
    }
  }, [value]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike", { color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        [{ font: [] }],
        ["link", "image"],
        [{ align: [] }],
        ["clean"],
      ],
      handlers: {
        image: async function (this: any) {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const fd = new FormData();
            fd.append("file", file);
            fd.append("alt", file.name);
            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
            if (!res.ok) {
              alert("Upload fallito");
              return;
            }
            const data = await res.json();
            const url = data?.media?.path as string | undefined;
            if (!url) return;

            // Ottieni l'istanza Quill dall'handler della toolbar
            const editor = this.quill as any;
            const range = editor?.getSelection(true);
            editor?.insertEmbed(range ? range.index : 0, "image", url, "user");
          };
          input.click();
        },
      },
    },
    clipboard: { matchVisual: true },
  }),[]
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "size",
    "font",
    "color",
    "background",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "image",
    "align",
  ];

  return (
    <>
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultValue || ""} />
      <div className="card" style={{ padding: 0 }}>
        <ReactQuill
          value={value}
          onChange={setValue}
          modules={modules as any}
          formats={formats}
          theme="snow"
          placeholder="Scrivi il contenuto dell'articolo..."
          style={{ minHeight: 200 }}
        />
      </div>
    </>
  );
}
