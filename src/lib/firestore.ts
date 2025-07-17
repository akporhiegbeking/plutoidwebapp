import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Post, User, Like, Comment, SavedItem, ViewAnalytic } from '@/types/firebase';

// Posts collection operations
export const postsCollection = collection(db, 'posts');

export const getPosts = async (limitCount = 20) => {
  const q = query(postsCollection, orderBy('dateCreated', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
};

export const createPost = async (postData: Omit<Post, 'id' | 'dateCreated'>) => {
  const docRef = await addDoc(postsCollection, {
    ...postData,
    dateCreated: Timestamp.now()
  });
  return docRef.id;
};

// Users collection operations
export const usersCollection = collection(db, 'users');

export const getUserByUid = async (uid: string) => {
  const q = query(usersCollection, where('uid', '==', uid));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
};

export const getUserByUsername = async (userName: string) => {
  const q = query(usersCollection, where('userName', '==', userName));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
};

// Likes collection operations
export const likesCollection = collection(db, 'likes_collection');

export const getLikesByPost = async (post_id: string) => {
  const q = query(likesCollection, where('post_id', '==', post_id));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Like));
};

export const getUserLike = async (uid: string, post_id: string) => {
  const q = query(likesCollection, where('uid', '==', uid), where('post_id', '==', post_id));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Like;
};

export const addLike = async (uid: string, post_id: string) => {
  const docRef = await addDoc(likesCollection, {
    uid,
    post_id,
    dateCreated: Timestamp.now()
  });
  return docRef.id;
};

export const removeLike = async (likeId: string) => {
  await deleteDoc(doc(likesCollection, likeId));
};

// Comments collection operations
export const commentsCollection = collection(db, 'comments');

export const getCommentsByPost = async (post_id: string) => {
  const q = query(commentsCollection, where('post_id', '==', post_id), orderBy('dateCreated', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
};

export const addComment = async (commentData: Omit<Comment, 'id'>) => {
  const docRef = await addDoc(commentsCollection, {
    ...commentData,
    dateCreated: Timestamp.now()
  });
  return docRef.id;
};

// Saved items collection operations
export const savedItemsCollection = collection(db, 'saved_items');

export const getUserSavedItems = async (uid: string) => {
  const q = query(savedItemsCollection, where('uid', '==', uid), orderBy('dateCreated', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedItem));
};

export const getUserSavedItem = async (uid: string, post_id: string) => {
  const q = query(savedItemsCollection, where('uid', '==', uid), where('post_id', '==', post_id));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as SavedItem;
};

export const addSavedItem = async (uid: string, post_id: string, imageURL: string) => {
  const docRef = await addDoc(savedItemsCollection, {
    uid,
    post_id,
    imageURL,
    dateCreated: Timestamp.now()
  });
  return docRef.id;
};

export const removeSavedItem = async (savedItemId: string) => {
  await deleteDoc(doc(savedItemsCollection, savedItemId));
};

// View analytics collection operations
export const viewAnalyticsCollection = collection(db, 'view_analytics');

export const addView = async (uid: string, post_id: string) => {
  const docRef = await addDoc(viewAnalyticsCollection, {
    uid,
    post_id,
    date_viewed: Timestamp.now()
  });
  return docRef.id;
};

export const getPostViews = async (post_id: string) => {
  const q = query(viewAnalyticsCollection, where('post_id', '==', post_id));
  const snapshot = await getDocs(q);
  return snapshot.size; // Return count of views
};