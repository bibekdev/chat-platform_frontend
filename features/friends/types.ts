export interface Friend {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequestWithSender extends FriendRequest {
  sender: Friend;
}

export interface FriendRequestWithReceiver extends FriendRequest {
  receiver: Friend;
}

export interface GetAllFriendsResponse {
  id: string;
  friendId: string;
  createdAt: string;
  userId: string;
  friend: Friend;
}
