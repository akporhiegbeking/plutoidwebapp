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
  startAfter,
  DocumentSnapshot,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Post, User, Like, Comment, SavedItem, ViewAnalytic, ExtendedPost } from '@/types/firebase';

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

// Additional functions for new features
export const createUser = async (userData: Omit<User, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(usersCollection, {
      ...userData,
      dateCreated: Timestamp.fromDate(userData.dateCreated)
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getAllPosts = async (): Promise<{ posts: any[], lastDoc: DocumentSnapshot | null }> => {
  try {
    // Query all posts ordered by dateCreated desc
    const q = query(postsCollection, orderBy('dateCreated', 'desc'));
    const postsSnapshot = await getDocs(q);
    
    const userCache: { [uid: string]: User } = {};
    
    const postsPromises = postsSnapshot.docs.map(async (postDoc) => {
      const postData = postDoc.data();
      
      if (!postData.uid || !postData.dateCreated) {
        console.warn(`⛔ Skipping post ${postDoc.id} due to missing uid/dateCreated`);
        return null;
      }

      // Get user data with caching
      let userData = userCache[postData.uid];
      if (!userData) {
        const userSnapshot = await getDocs(
          query(usersCollection, where('uid', '==', postData.uid))
        );
        if (userSnapshot.empty) return null;
        userData = userSnapshot.docs[0].data() as User;
        userCache[postData.uid] = userData;
      }

      let postWithUser: any = {
        ...postData,
        id: postDoc.id,
        user: {
          uid: userData.uid,
          userName: userData.userName,
          firstName: userData.firstName,
          lastName: userData.lastName,
          imageURL: userData.imageURL,
          countryOrigin: userData.country,
        },
      };

      // Handle repost logic
      if (postData.re_post && postData.post_made_by) {
        const originalPosterSnap = await getDocs(
          query(usersCollection, where('uid', '==', postData.post_made_by))
        );
        if (!originalPosterSnap.empty) {
          const originalPosterData = originalPosterSnap.docs[0].data();
          postWithUser.originalPoster = {
            uid: originalPosterData.uid,
            firstName: originalPosterData.firstName,
            lastName: originalPosterData.lastName,
            userName: originalPosterData.userName,
            imageURL: originalPosterData.imageURL,
          };
        }
      }

      // Get current user ID safely
      const currentUserId = typeof window !== 'undefined' && 
        window.localStorage.getItem('currentUserId') || '';

      // Fetch all additional data in parallel
      const [
        commentsSnapshot,
        likeSnapshot,
        viewSnapshot,
        isLikedSnap,
        bookmarkSnap,
        isSavedSnap,
      ] = await Promise.all([
        getDocs(query(commentsCollection, where('post_id', '==', postDoc.id))),
        getDocs(query(likesCollection, where('post_id', '==', postDoc.id))),
        getDocs(query(viewAnalyticsCollection, where('post_id', '==', postDoc.id))),
        currentUserId ? getDocs(
          query(
            likesCollection,
            where('uid', '==', currentUserId),
            where('post_id', '==', postDoc.id)
          )
        ) : Promise.resolve({ empty: true }),
        getDocs(query(savedItemsCollection, where('post_id', '==', postDoc.id))),
        currentUserId ? getDocs(
          query(
            savedItemsCollection,
            where('uid', '==', currentUserId),
            where('post_id', '==', postDoc.id)
          )
        ) : Promise.resolve({ empty: true }),
      ]);

      return {
        ...postWithUser,
        commentsCount: commentsSnapshot.size,
        likeCount: likeSnapshot.size,
        viewCount: viewSnapshot.size,
        isLiked: !isLikedSnap.empty,
        bookmarkCount: bookmarkSnap.size,
        isSaved: !isSavedSnap.empty,
      };
    });

    const postsResults = await Promise.all(postsPromises);
    const validPosts = postsResults.filter(Boolean);

    return { posts: validPosts, lastDoc: null };
  } catch (error) {
    console.error('Error getting all posts:', error);
    return { posts: [], lastDoc: null };
  }
};

export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(usersCollection);
    
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    
    return users.filter(user => 
      user.firstName.toLowerCase().includes(query.toLowerCase()) ||
      user.lastName.toLowerCase().includes(query.toLowerCase()) ||
      user.userName.toLowerCase().includes(query.toLowerCase()) ||
      user.bio.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const searchPosts = async (query: string): Promise<Post[]> => {
  try {
    const querySnapshot = await getDocs(postsCollection);
    
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
    
    return posts.filter(post => 
      post.textCaption.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const postDoc = await getDoc(doc(postsCollection, postId));
    if (postDoc.exists()) {
      return { id: postDoc.id, ...postDoc.data() } as Post;
    }
    return null;
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

export const createComment = async (comment: Omit<Comment, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(commentsCollection, {
      ...comment,
      dateCreated: Timestamp.fromDate(comment.dateCreated)
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  try {
    const q = query(commentsCollection, where('post_id', '==', postId), orderBy('dateCreated', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

// Hashtag extraction and trending functions
export const getTrendingHashtags = async (limit: number = 20): Promise<{ hashtag: string; count: number }[]> => {
  try {
    const postsSnapshot = await getDocs(postsCollection);
    const hashtagCount: Record<string, number> = {};
    
    postsSnapshot.docs.forEach((doc) => {
      const post = doc.data();
      if (post.textCaption) {
        // Extract hashtags using regex
        const hashtags = post.textCaption.match(/#\w+/g) || [];
        hashtags.forEach((hashtag) => {
          const cleanHashtag = hashtag.toLowerCase();
          hashtagCount[cleanHashtag] = (hashtagCount[cleanHashtag] || 0) + 1;
        });
      }
    });
    
    // Sort hashtags by count and return top ones
    return Object.entries(hashtagCount)
      .map(([hashtag, count]) => ({ hashtag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    return [];
  }
};

export const getPostsByHashtag = async (hashtag: string): Promise<ExtendedPost[]> => {
  try {
    const postsSnapshot = await getDocs(
      query(
        postsCollection,
        orderBy('dateCreated', 'desc')
      )
    );
    
    const userCache: Record<string, User> = {};
    const filteredPosts: ExtendedPost[] = [];
    
    for (const postDoc of postsSnapshot.docs) {
      const postData = postDoc.data() as Post;
      
      // Check if post contains the hashtag
      if (postData.textCaption && postData.textCaption.toLowerCase().includes(hashtag.toLowerCase())) {
        // Get user data
        let userData = userCache[postData.uid];
        if (!userData) {
          const userSnapshot = await getDocs(
            query(usersCollection, where('uid', '==', postData.uid))
          );
          if (!userSnapshot.empty) {
            userData = userSnapshot.docs[0].data() as User;
            userCache[postData.uid] = userData;
          }
        }
        
        if (userData) {
          // Get engagement data
          const [likesSnapshot, commentsSnapshot, viewsSnapshot] = await Promise.all([
            getDocs(query(likesCollection, where('post_id', '==', postDoc.id))),
            getDocs(query(commentsCollection, where('post_id', '==', postDoc.id))),
            getDocs(query(viewAnalyticsCollection, where('post_id', '==', postDoc.id)))
          ]);
          
          const extendedPost: ExtendedPost = {
            ...postData,
            id: postDoc.id,
            user: userData,
            likeCount: likesSnapshot.size,
            commentsCount: commentsSnapshot.size,
            viewCount: viewsSnapshot.size,
            isLiked: false,
            bookmarkCount: 0,
            isSaved: false
          };
          
          filteredPosts.push(extendedPost);
        }
      }
    }
    
    return filteredPosts;
  } catch (error) {
    console.error('Error fetching posts by hashtag:', error);
    return [];
  }
};