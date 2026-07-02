import { MessagesList } from "@/components/admin/messages-list";
import { listMessages } from "@/lib/actions/messages";

export default async function AdminMessagesPage() {
  const messages = await listMessages();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Messages</h1>
      <p className="mt-1 text-sm text-foreground/60">{messages.length} total</p>
      <MessagesList messages={messages} />
    </div>
  );
}
