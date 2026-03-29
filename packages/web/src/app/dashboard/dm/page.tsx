import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AddFriendDialog } from "@/components/friends/add-friend-dialog";
import { FriendsList } from "@/components/friends/friends-list";
import { PendingRequests } from "@/components/friends/pending-requests";
import { SentRequests } from "@/components/friends/sent-requests";

export default function DMPage() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel — friends sidebar */}
      <aside className="w-60 flex flex-col bg-muted/50 border-r border-border">
        <div className="px-3 pt-4 pb-2">
          <AddFriendDialog />
        </div>
        <Separator />
        <Tabs defaultValue="friends" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="mx-3 mt-3 mb-1">
            <TabsTrigger value="friends" className="flex-1 text-xs">Friends</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 text-xs">Pending</TabsTrigger>
            <TabsTrigger value="sent" className="flex-1 text-xs">Sent</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto px-1 pb-3">
            <TabsContent value="friends" className="mt-2"><FriendsList /></TabsContent>
            <TabsContent value="pending" className="mt-2"><PendingRequests /></TabsContent>
            <TabsContent value="sent" className="mt-2"><SentRequests /></TabsContent>
          </div>
        </Tabs>
      </aside>

      {/* Right panel — conversation area (messaging, future) */}
      <main className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Select a friend to start a conversation
      </main>
    </div>
  );
}
