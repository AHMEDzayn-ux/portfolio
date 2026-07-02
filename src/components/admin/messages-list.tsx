"use client";

import { useState } from "react";
import { Mail, MailOpen } from "lucide-react";
import { setMessageRead } from "@/lib/actions/messages";
import type { Database } from "@/types/database.types";

type MessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];

export function MessagesList({ messages }: { messages: MessageRow[] }) {
  const [items, setItems] = useState(messages);

  async function toggleRead(id: string, read: boolean) {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
    const result = await setMessageRead(id, read);
    if (!result.ok) {
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, read: !read } : m)));
    }
  }

  if (items.length === 0) {
    return <p className="mt-8 text-sm text-foreground/50">No messages yet.</p>;
  }

  return (
    <div className="mt-8 space-y-3">
      {items.map((message) => (
        <div
          key={message.id}
          className={`rounded-2xl border p-5 transition-colors ${
            message.read ? "border-border/50" : "border-brand/40 bg-brand/5"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{message.name}</p>
              <a
                href={`mailto:${message.email}`}
                className="text-sm text-foreground/60 hover:text-brand"
              >
                {message.email}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-foreground/45">
                {new Date(message.created_at).toLocaleDateString()}
              </span>
              <button
                type="button"
                onClick={() => toggleRead(message.id, !message.read)}
                aria-label={message.read ? "Mark as unread" : "Mark as read"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 transition-colors hover:bg-secondary hover:text-foreground"
              >
                {message.read ? (
                  <MailOpen className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/75">{message.message}</p>
        </div>
      ))}
    </div>
  );
}
