import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UserStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    email: string;
    clerkId: string;
    wins: number;
    createdAt: string;
  } | null;
}

export default function UserStatsModal({ isOpen, onClose, user }: UserStatsModalProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('UserStatsModal props:', { isOpen, user });
  }, [isOpen, user]);

  const handleSendRequest = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Friend request sent!");
        onClose();
      } else {
        toast.error(data.error || "Failed to send friend request");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-zinc-900 border border-zinc-800 text-white rounded-lg shadow-lg z-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-serif">User Profile</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{user.email}</h3>
              <p className="text-sm text-zinc-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-sm text-zinc-400">Total Wins</p>
                <p className="text-2xl font-bold">{user.wins}</p>
              </div>
            </div>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleSendRequest}
              disabled={loading}
            >
              <UserPlus size={16} className="mr-2" />
              {loading ? "Sending..." : "Add Friend"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 