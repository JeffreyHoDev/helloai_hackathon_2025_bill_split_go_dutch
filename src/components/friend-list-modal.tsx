"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, UserMinus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const allUsers = [
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
    { id: '3', name: 'Sam Wilson', email: 'sam@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
    { id: '4', name: 'Alice Johnson', email: 'alice@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a' },
    { id: '5', name: 'Bob Brown', email: 'bob@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b' },
];

const initialFriends = [allUsers[0], allUsers[1]];

export default function FriendListModal() {
  const [friends, setFriends] = useState(initialFriends);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const addFriend = (user: typeof allUsers[0]) => {
    if (!friends.find(f => f.id === user.id)) {
      setFriends([...friends, user]);
      toast({
        title: "Friend Added",
        description: `${user.name} is now on your friend list.`,
      });
    }
  };

  const removeFriend = (userId: string) => {
    const friend = friends.find(f => f.id === userId);
    setFriends(friends.filter(f => f.id !== userId));
    if (friend) {
        toast({
            title: "Friend Removed",
            description: `${friend.name} has been removed from your friends.`,
            variant: "destructive"
        });
    }
  };

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return allUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="mr-2 h-4 w-4" /> Friend List
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Friend Management</DialogTitle>
          <DialogDescription>
            View your current friends or add new ones.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends">My Friends</TabsTrigger>
            <TabsTrigger value="add">Add Friend</TabsTrigger>
          </TabsList>
          <TabsContent value="friends" className="mt-4">
             <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {friends.length > 0 ? friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">{friend.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFriend(friend.id)}>
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              )) : (
                <p className="text-center text-muted-foreground pt-4">Your friend list is empty.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="add" className="mt-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search by name or email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="mt-4 space-y-4 max-h-[240px] overflow-y-auto pr-2">
                {searchTerm && searchResults.length > 0 ? searchResults.map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => addFriend(user)}
                            disabled={!!friends.find(f => f.id === user.id)}
                        >
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    </div>
                )) : (
                    searchTerm && <p className="text-center text-muted-foreground pt-4">No users found.</p>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
