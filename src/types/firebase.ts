// Types for Firebase collections
export interface User {
  id?: string;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  imageURL: string;
  country: string;
  bio: string;
  phoneNumber: string;
  deviceName: string;
  tfa: string;
  feed_preference: string;
  dateofBirth: string;
  gender: string;
  category: string;
  chat_setting: string;
  status: string;
  dateCreated: any; // Firestore Timestamp
}

export interface Post {
  id?: string;
  imageURL: string;
  dateCreated: any; // Firestore Timestamp
  uid: string;
  email: string;
  textCaption: string;
  country: string;
  re_post: string;
  // Extended fields from mobile app
  user?: {
    uid: string;
    userName: string;
    firstName: string;
    lastName: string;
    imageURL: string;
    countryOrigin: string;
  };
  originalPoster?: {
    uid: string;
    firstName: string;
    lastName: string;
    userName: string;
    imageURL: string;
  };
  commentsCount?: number;
  likeCount?: number;
  viewCount?: number;
  isLiked?: boolean;
  bookmarkCount?: number;
  isSaved?: boolean;
}

export interface SavedItem {
  id?: string;
  uid: string;
  post_id: string;
  imageURL: string;
  dateCreated: any; // Firestore Timestamp
}

export interface Like {
  id?: string;
  uid: string;
  post_id: string;
  dateCreated: any; // Firestore Timestamp
}

export interface Plute {
  id?: string;
  country: string;
  dateCreated: any; // Firestore Timestamp
  email: string;
  re_post: string;
  textCaption: string;
  uid: string;
  videoURL: string;
}

export interface Comment {
  id?: string;
  uid: string;
  post_id: string;
  email: string;
  textComment: string;
  dateCreated: any; // Firestore Timestamp
}

export interface ViewAnalytic {
  id?: string;
  uid: string;
  post_id: string;
  date_viewed: any; // Firestore Timestamp
}