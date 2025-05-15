"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, UserPlus, Check, X, Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import UserStatsModal from "@/components/UserStatsModal";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useChallenge } from '@/contexts/ChallengeContext';

interface Friend {
  id: string;
  email: string;
}

interface FriendRequest {
  id: string;
  sender: {
    email: string;
    clerkId: string;
  };
}

interface User {
  email: string;
  clerkId: string;
  wins: number;
  createdAt: string;
}

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { sendChallenge } = useChallenge();

  // Fetch friends and requests
  const fetchFriendsAndRequests = async () => {
    try {
      setLoading(true);
      const [friendsRes, requestsRes] = await Promise.all([
        fetch("/api/friends"),
        fetch("/api/friends/requests")
      ]);

      if (friendsRes.ok) {
        const { friends } = await friendsRes.json();
        setFriends(friends);
      }

      if (requestsRes.ok) {
        const { requests } = await requestsRes.json();
        setRequests(requests);
      }
    } catch (error) {
      console.error("Error fetching friends and requests:", error);
      toast.error("Failed to load friends and requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendsAndRequests();
  }, []);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const { users } = await res.json();
          setSearchResults(users);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle friend request
  const handleRequest = async (requestId: string, accept: boolean) => {
    try {
      const res = await fetch(`/api/friends/requests/${requestId}`, {
        method: accept ? "POST" : "DELETE"
      });

      if (res.ok) {
        toast.success(accept ? "Friend request accepted!" : "Friend request rejected");
        fetchFriendsAndRequests();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to process friend request");
      }
    } catch (error) {
      console.error("Error processing friend request:", error);
      toast.error("Failed to process friend request");
    }
  };

  // Handle challenge
  const handleChallenge = (friendId: string) => {
    try {
      sendChallenge(friendId);
      toast.success('Challenge sent!');
    } catch (error) {
      console.error('Error in challenge:', error);
      toast.error('Failed to send challenge');
    }
  };

  // Add debug effect
  useEffect(() => {
    console.log('Modal state:', { showUserModal, selectedUser });
  }, [showUserModal, selectedUser]);

  const handleUserSelect = useCallback((user: User) => {
    console.log('User selected:', user);
    setSelectedUser(user);
    setShowUserModal(true);
    setSearchQuery("");
    // Force close the Command dropdown
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }
  }, []);

  // Add debug effect
  useEffect(() => {
    console.log('Modal state changed:', { showUserModal, selectedUser });
  }, [showUserModal, selectedUser]);

  // Add debug effect for modal rendering
  useEffect(() => {
    console.log('Rendering modal with:', { showUserModal, selectedUser });
  }, [showUserModal, selectedUser]);

  return (
    <main className="min-h-screen bg-zinc-900 p-4 w-screen flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto mt-4 md:mt-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center gap-2 md:gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-300 hover:text-white"
              onClick={() => router.push("/")}
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl md:text-3xl font-extrabold font-serif text-white tracking-wider">Friends</h1>
          </div>
          <div className="relative">
            <Command className="rounded-lg border border-white bg-zinc-900">
              <div className="flex items-center border-b border-white px-3">
                <Search className="h-4 w-4 shrink-0 text-white opacity-50" />
                <CommandInput
                  placeholder="Search users..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-white-50 disabled:cursor-not-allowed disabled:opacity-50 text-white border-0"
                />
              </div>
              {searchResults.length > 0 && (
                <CommandList className="absolute w-full bg-zinc-900 border border-t-0 border-white rounded-b-lg shadow-lg max-h-[300px] overflow-y-auto z-50">
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup>
                    {searchResults.map((user) => (
                      <div
                        key={user.clerkId}
                        onClick={() => handleUserSelect(user)}
                        className="cursor-pointer"
                      >
                        <CommandItem
                          value={user.email}
                          onSelect={() => handleUserSelect(user)}
                          className="text-white hover:bg-zinc-800 p-2 md:p-3"
                        >
                          {user.email}
                        </CommandItem>
                      </div>
                    ))}
                  </CommandGroup>
                </CommandList>
              )}
            </Command>
          </div>
        </motion.div>

        {/* Friend Requests */}
        {requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 md:mb-8"
          >
            <h2 className="text-lg md:text-xl font-bold font-serif text-white mb-4">Friend Requests</h2>
            <div className="space-y-2 md:space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="bg-zinc-800 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm md:text-base text-white font-medium">{request.sender.email}</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-500 hover:text-green-400"
                      onClick={() => handleRequest(request.id, true)}
                    >
                      <Check size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-400"
                      onClick={() => handleRequest(request.id, false)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Friends List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold font-serif text-white">Your Friends</h2>
          </div>
          <div className="space-y-2 md:space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-zinc-400 font-serif">Loading...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400 font-serif">No friends yet. Start adding some!</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 md:p-4 hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm md:text-base text-white font-medium">{friend.email}</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-500 hover:text-purple-400 w-full md:w-auto"
                      onClick={() => handleChallenge(friend.id)}
                    >
                      <Swords size={16} className="mr-2" />
                      Challenge
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <UserStatsModal
        isOpen={showUserModal}
        onClose={() => {
          console.log('Modal closing');
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </main>
  );
} 