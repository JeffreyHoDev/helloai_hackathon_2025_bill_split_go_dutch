
"use client";

import { useState, useMemo, useEffect } from 'react';
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
import { Users, UserPlus, UserMinus, Search, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import type { User as UserType } from '@/types';

export default function FriendListModal() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<UserType[]>([]);
  const [allAvailableUsers, setAllAvailableUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<UserType[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFriendsAndUsers = async () => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const [friendsRes, usersRes] = await Promise.all([
            fetch(`http://localhost:3001/api/users/${user.uid}/friends`, {
              headers: { 'Authorization': `Bearer ${idToken}` },
            }),
            fetch(`http://localhost:3001/api/users`, {
              headers: { 'Authorization': `Bearer ${idToken}` },
            })
          ]);

          if (friendsRes.ok) {
            const data = await friendsRes.json();
            setFriends(data);
          } else {
            console.error("Failed to fetch friends");
            toast({
              title: "Error",
              description: "Failed to load friends list.",
              variant: "destructive",
            });
          }
          if (usersRes.ok) {
            const data = await usersRes.json();
            setAllAvailableUsers(data);
          } else {
            console.error("Failed to fetch users");
            toast({
              title: "Error",
              description: "Failed to load users.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching data: ", error);
          toast({
            title: "Error",
            description: "Failed to load initial data.",
            variant: "destructive",
          });
        }
      }
    };

    fetchFriendsAndUsers();
  }, [user, toast]);

  const addFriend = async (friendToAdd: UserType) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`http://localhost:3001/api/users/${user.uid}/friends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          friendId: friendToAdd.id,
          friendData: { name: friendToAdd.name, email: friendToAdd.email, avatar: friendToAdd.avatar },
        }),
      });

      if (res.ok) {
        setFriends(prev => [...prev, friendToAdd]);
        toast({
          title: "Friend Added",
          description: `${friendToAdd.name} is now on your friend list.`,
        });
      } else {
        console.error("Failed to add friend");
        toast({
          title: "Error",
          description: "Failed to add friend.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding friend: ", error);
      toast({
        title: "Error",
        description: "Failed to add friend.",
        variant: "destructive",
      });
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`http://localhost:3001/api/users/${user.uid}/friends/${friendId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (res.ok) {
        const friend = friends.find(f => f.id === friendId);
        setFriends(friends.filter(f => f.id !== friendId));
        if (friend) {
            toast({
                title: "Friend Removed",
                description: `${friend.name} has been removed from your friends.`,
                variant: "destructive"
            });
        }
      } else {
        console.error("Failed to remove friend");
        toast({
          title: "Error",
          description: "Failed to remove friend.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing friend: ", error);
      toast({
        title: "Error",
        description: "Failed to remove friend.",
        variant: "destructive",
      });
    }
  };
  
  const handleRequest = (requestUser: UserType, accept: boolean) => {
    setRequests(requests.filter(r => r.id !== requestUser.id));
    if (accept) {
      addFriend(requestUser);
      toast({
        title: "Friend Request Accepted",
        description: `You and ${requestUser.name} are now friends.`,
      });
    } else {
      toast({
        title: "Friend Request Rejected",
        description: `You have rejected the friend request from ${requestUser.name}.`,
      });
    }
  };

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return allAvailableUsers.filter(availableUser => 
      (availableUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (availableUser.email && availableUser.email.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      !friends.find(f => f.id === availableUser.id) && // Don't show existing friends in search
      availableUser.id !== user?.uid // Don't show self
    );
  }, [searchTerm, friends, allAvailableUsers, user]);


  return (
    <Dialog>
        <DialogTrigger asChild>
            <Button variant="outline" size="icon">
                <Users />
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Friends List</DialogTitle>
                <DialogDescription>
                    Manage your friends and find new people.
                </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="friends" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="friends">Friends</TabsTrigger>
                    <TabsTrigger value="requests">
                        Requests
                        {requests.length > 0 && <Badge className="ml-2">{requests.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="add">Add Friends</TabsTrigger>
                </TabsList>
                <TabsContent value="friends">
                    <div className="space-y-2 py-4 h-64 overflow-y-auto">
                        {friends.length > 0 ? friends.map(friend => (
                            <div key={friend.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={friend.avatar} alt={friend.name} />
                                    <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{friend.name}</p>
                                    <p className="text-sm text-muted-foreground">{friend.email}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => removeFriend(friend.id)}>
                                    <UserMinus className="text-destructive"/>
                                </Button>
                            </div>
                        )) : <p className="text-center text-muted-foreground pt-8">Your friend list is empty.</p>}
                    </div>
                </TabsContent>
                <TabsContent value="requests">
                    <div className="space-y-2 py-4 h-64 overflow-y-auto">
                        {requests.length > 0 ? requests.map(request => (
                             <div key={request.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={request.avatar} alt={request.name} />
                                    <AvatarFallback>{request.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{request.name}</p>
                                    <p className="text-sm text-muted-foreground">{request.email}</p>
                                </div>
                                <div className="ml-auto flex gap-x-2">
                                <Button variant="outline" size="icon" onClick={() => handleRequest(request, true)}>
                                    <Check className="text-green-500"/>
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => handleRequest(request, false)}>
                                    <X className="text-destructive"/>
                                </Button>
                                </div>
                            </div>
                        )) : <p className="text-center text-muted-foreground pt-8">No new friend requests.</p>}
                    </div>
                </TabsContent>
                <TabsContent value="add">
                    <div className="space-y-4 py-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 h-52 overflow-y-auto">
                           {searchResults.map(foundUser => (
                             <div key={foundUser.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={foundUser.avatar} alt={foundUser.name} />
                                    <AvatarFallback>{foundUser.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{foundUser.name}</p>
                                    <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                                </div>
                                <Button variant="outline" size="icon" className="ml-auto" onClick={() => addFriend(foundUser)}>
                                    <UserPlus/>
                                </Button>
                            </div>
                           ))}
                           {searchTerm && searchResults.length === 0 && (
                            <p className="text-center text-muted-foreground pt-8">No users found.</p>
                           )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </DialogContent>
    </Dialog>
  );
}
