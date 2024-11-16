
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,TouchableOpacity,Text,Image,FlatList,StyleSheet,Animated,TouchableWithoutFeedback,TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, Entypo, AntDesign, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { auth, database } from "../config/firebase";
import colors from "../colors";

// Custom hook for sidebar animation
const useSidebarAnimation = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const sidebarWidth = useRef(new Animated.Value(0)).current;

  const toggleSidebar = useCallback(() => {
    Animated.timing(sidebarWidth, {
      toValue: isSidebarVisible ? 0 : 150,
      duration: 300,
      useNativeDriver: false, // Width changes can't use native driver
    }).start(() => setIsSidebarVisible(!isSidebarVisible));
  }, [isSidebarVisible]);

  return { isSidebarVisible, sidebarWidth, toggleSidebar };
};



// Custom hook to fetch posts
const usePosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const postsRef = collection(database, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isFollowing: Math.random() < 0.5, // Simulated state
          likes: Math.floor(Math.random() * 100),
          comments: [
            {
              id: 1,
              username: "JohnDoe",
              content: "Great post! 👏",
              avatar: "https://i.pravatar.cc/150?img=1",
            },
            {
              id: 2,
              username: "JaneSmith",
              content: "Totally agree with this!",
              avatar: "https://i.pravatar.cc/150?img=2",
            },
          ],
        }))
      );
    });

    return unsubscribe;
  }, []);

  return posts;
};

// Sidebar Component
const Sidebar = ({ sidebarWidth, toggleSidebar }) => (
  <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
    <View style={styles.sidebarHeader}>
      <Image source={{ uri: "https://i.pravatar.cc/300" }} style={styles.sidebarProfileImage} />
      <View>
        <Text style={styles.sidebarName}>Vera Mo</Text>
        <Text style={styles.sidebarHandle}>@veraMo</Text>
      </View>
    </View>
    <SidebarOption icon="user" text="Profile" />
    <SidebarOption icon="cog" text="Settings" />
    <SidebarOption icon="comments" text="Comments" />
    <SidebarOption icon="user-plus" text="Follow" />
    <SidebarOption icon="paper-plane-o" text="Post" />
    <SidebarOption icon="bookmark-o" text="Saved Posts" />
    <SidebarOption icon="group" text="Groups" />
    <SidebarOption icon="sign-out" text="Logout" color={colors.error} />
  </Animated.View>
);


const SidebarOption = ({ icon, text, color = colors.dark }) => (
  <TouchableOpacity style={styles.sidebarOption}>
    <FontAwesome name={icon} size={24} color={color} />
    <Text style={[styles.sidebarText, { color }]}>{text}</Text>
  </TouchableOpacity>
);

// Post Component
const Post = ({ item, toggleLike, toggleFollow, activeCommentId, setActiveCommentId, newComment, setNewComment, addComment }) => (
  <View style={styles.post}>
    <View style={styles.postHeader}>
      <View style={styles.userInfo}>
        <Image source={{ uri: item.userAvatar || "https://i.pravatar.cc/150" }} style={styles.userAvatar} />
        <View>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.handle}>@{item.handle}</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.followButton, item.isFollowing ? styles.followingButton : null]} onPress={() => toggleFollow(item.id)}>
        <Text style={[styles.followButtonText, item.isFollowing ? styles.followingButtonText : null]}>{item.isFollowing ? "Following" : "Follow"}</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.postContent}>{item.content}</Text>
    {item.image && <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />}

    <View style={styles.postStats}>
      <Text style={styles.statsText}>{item.likes} likes</Text>
      <Text style={styles.statsText}>{item.comments.length} comments</Text>
    </View>

    <View style={styles.postActions}>
      <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(item.id)}>
        <AntDesign name={item.isLiked ? "heart" : "hearto"} size={18} color={item.isLiked ? colors.primary : colors.dark} />
        <Text style={[styles.actionText, item.isLiked ? { color: colors.primary } : null]}>Like</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => setActiveCommentId(activeCommentId === item.id ? null : item.id)}>
        <FontAwesome name="comment-o" size={18} color={colors.dark} />
        <Text style={styles.actionText}>Comment</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}>
        <MaterialIcons name="share" size={18} color={colors.dark} />
        <Text style={styles.actionText}>Share</Text>
      </TouchableOpacity>
    </View>

    <FlatList data={item.comments} renderItem={renderComment} keyExtractor={(comment) => comment.id.toString()} scrollEnabled={false} />
    {activeCommentId === item.id && (
      <View style={styles.commentInput}>
        <TextInput style={styles.input} placeholder="Add a comment..." value={newComment} onChangeText={setNewComment} multiline />
        <TouchableOpacity style={styles.sendButton} onPress={() => addComment(item.id)}>
          <Ionicons name="send" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const Home = () => {
  const posts = usePosts();
  const { isSidebarVisible, sidebarWidth, toggleSidebar } = useSidebarAnimation();
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [newComment, setNewComment] = useState("");
  const navigation = useNavigation();

  const toggleFollow = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === postId ? { ...post, isFollowing: !post.isFollowing } : post))
    );
  };

  const toggleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === postId ? { ...post, likes: post.likes + (post.isLiked ? -1 : 1), isLiked: !post.isLiked } : post))
    );
  };

  const addComment = (postId) => {
    if (newComment.trim()) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  { id: Date.now(), username: "CurrentUser", content: newComment.trim(), avatar: "https://i.pravatar.cc/150?img=3" },
                ],
              }
            : post
        )
      );
      setNewComment("");
      setActiveCommentId(null);
    }
  };

  return (
    <View style={styles.container}>
      {isSidebarVisible && <TouchableWithoutFeedback onPress={toggleSidebar}><View style={styles.overlay} /></TouchableWithoutFeedback>}
      <Sidebar sidebarWidth={sidebarWidth} toggleSidebar={toggleSidebar} />

      {/* Chat Button */}
      <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate("Chat")}>
        <Ionicons name="chatbubbles-outline" size={24} color={colors.black} />
      </TouchableOpacity>

      <FlatList data={posts} renderItem={(item) => <Post {...item} toggleFollow={toggleFollow} toggleLike={toggleLike} addComment={addComment} />} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.postsContainer} />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  
    // Sidebar Styles
    sidebar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: colors.lightGray,
      zIndex: 1,
      elevation: 5,
      padding: 20,
    },
    sidebarHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    sidebarProfileImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
    },
    sidebarName: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.dark,
    },
    sidebarHandle: {
      fontSize: 14,
      color: colors.gray,
    },
    sidebarOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
    },
    sidebarText: {
      fontSize: 16,
      fontWeight: "500",
      marginLeft: 10,
      color: colors.dark,
    },
    
      
  
    // Overlay for Sidebar
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 0,
    },
  
    // Post Styles
    postsContainer: {
      paddingTop: 20,
      paddingBottom: 80,
    },
    post: {
      backgroundColor: colors.white,
      marginHorizontal: 15,
      marginBottom: 15,
      padding: 15,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    postHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    username: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.dark,
    },
    handle: {
      fontSize: 14,
      color: colors.gray,
    },
    followButton: {
      backgroundColor: colors.primary,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    followingButton: {
      backgroundColor: colors.grayLight,
    },
    followButtonText: {
      color: colors.white,
      fontWeight: "600",
    },
    followingButtonText: {
      color: colors.dark,
    },
    postContent: {
      fontSize: 16,
      color: colors.dark,
      marginBottom: 10,
    },
    postImage: {
      width: "100%",
      height: 200,
      borderRadius: 10,
      marginTop: 10,
    },
    postStats: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 8,
    },
    statsText: {
      fontSize: 14,
      color: colors.gray,
    },
    postActions: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 5,
      paddingVertical: 5,
      borderTopWidth: 1,
      borderTopColor: colors.grayLight,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionText: {
      fontSize: 14,
      color: colors.dark,
      marginLeft: 5,
    },
  
    // Comment Styles
    commentContainer: {
      flexDirection: "row",
      marginTop: 10,
      alignItems: "center",
    },
    commentAvatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginRight: 10,
    },
    commentContent: {
      flex: 1,
      backgroundColor: colors.lightGray,
      borderRadius: 10,
      padding: 8,
    },
    commentUsername: {
      fontWeight: "bold",
      color: colors.dark,
      marginBottom: 3,
    },
    commentText: {
      fontSize: 14,
      color: colors.gray,
    },
    commentInput: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      paddingVertical: 5,
      borderTopWidth: 1,
      borderTopColor: colors.grayLight,
    },
    input: {
      flex: 1,
      backgroundColor: colors.lightGray,
      borderRadius: 20,
      padding: 10,
      marginRight: 10,
      color: colors.dark,
    },
    sendButton: {
      padding: 8,
    },
    chatButton: {
  position: "absolute",
  right: 20,
  bottom: 20,
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: colors.primary,
  justifyContent: "center",
  alignItems: "center",
  elevation: 6,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
},

  });
  
