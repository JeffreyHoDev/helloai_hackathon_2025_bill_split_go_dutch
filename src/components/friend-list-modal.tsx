
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

const initialRequests = []; // Mock requests

export default function FriendListModal() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<UserType[]>([]);
  const [allAvailableUsers, setAllAvailableUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const res = await fetch(`http://localhost:3001/api/users/${user.uid}/friends`, {
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setFriends(data);
          } else {
            console.error("Failed to fetch friends");
            toast({
              title: "Error",
              description: "Failed to load friends list.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching friends: ", error);
          toast({
            title: "Error",
            description: "Failed to load friends list.",
            variant: "destructive",
          });
        }
      }
    };

    fetchFriends();
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
  
  const handleRequest = (user: typeof allUsers[0], accept: boolean) => {
    setRequests(requests.filter(r => r.id !== user.id));
    if (accept) {
      addFriend(user);
      toast({
        title: "Friend Request Accepted",
        description: `You and ${user.name} are now friends.`,
      });
    } else {
      toast({
        title: "Friend Request Rejected",
        description: `You have rejected the friend request from ${user.name}.`,
      });
    }
  };

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return allAvailableUsers.filter(availableUser => 
      (availableUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      availableUser.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      !friends.find(f => f.id === availableUser.id) && // Don't show existing friends in search
      availableUser.id !== user?.uid // Don't show self
    );
  }, [searchTerm, friends, allAvailableUsers, user]);

  
}

