![Miniature](https://user-images.githubusercontent.com/43630417/167732465-f02c0dea-48db-4e23-ab26-90ca69115251.png)
# Chat App using React Native Expo and Firebase

- See a video tutorial showing how to clone this repository 👉🏼 [https://www.youtube.com/watch?v=iHrTQDHq1WI&t=385s](https://www.youtube.com/watch?v=iHrTQDHq1WI&t=385s)

- Check out the Tutorial 👉🏼 [https://www.youtube.com/watch?v=B6bKBiljKxU&t=323s](https://www.youtube.com/watch?v=B6bKBiljKxU&t=323s)

## How to clone

Clone the repo

```
git clone https://github.com/betomoedano/ChatApp.git
```

cd into the just created project and install dependencies with yarn

```
cd ChatApp && yarn
```

Add your firebase backend config in the `firebase.js` file

```
const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.apiKey,
  authDomain: Constants.expoConfig.extra.authDomain,
  projectId: Constants.expoConfig.extra.projectId,
  storageBucket: Constants.expoConfig.extra.storageBucket,
  messagingSenderId: Constants.expoConfig.extra.messagingSenderId,
  appId: Constants.expoConfig.extra.appId,
  databaseURL: Constants.expoConfig.extra.databaseURL,
  //   @deprecated is deprecated Constants.manifest
};
```

Run the project

```
expo start
```

Congratulations 🎉 Now you have a functional Chat App working locally

Subscribe to [my channel](https://youtube.com/c/BetoMoedano)

## Known issues

Expo SDK and libreries are always updating their versions and deprecating others. before installing the libreries run.

```
yarn add expo@latest
```

Next you can run:

```
    npx expo install --fix
```

Older versions of `react-native-gifted-chat` have a some issues. make sure you have the latest.

```
npx expo install react-native-gifted-chat@latest
```

Expo will show you what dependencies need to be updated. Install the dependencies expo suggest you. It is possible that there is cache and you have to run.

```
yarn start --reset-cache
```

## Support My Work

If you find this project helpful and want to support my work, the best way is by enrolling in one of my courses:

- **React Native Course**: [codewithbeto.dev/learn](https://codewithbeto.dev/learn)
- **React with TypeScript Course**: [codewithbeto.dev/learnReact](https://codewithbeto.dev/learnReact)
- **Git & GitHub Course**: [codewithbeto.dev/learnGit](https://codewithbeto.dev/learnGit)

For other ways to support my work, please consider:

- **Become a Code with Beto channel member**: [YouTube Membership](https://www.youtube.com/channel/UCh247h68vszOMA_OWpGEa5g/join)
- **GitHub Sponsors**: [Sponsor Me](https://github.com/sponsors/betomoedano)

You can also support me by using my referral links:

- Get an exclusive 40% discount on CodeCrafters: [Referral Link](https://app.codecrafters.io/join?via=betomoedano)
- Get a 10% discount on Vexo Analytics with code "BETO10": [Vexo](https://vexo.co)
- Sign up for Robinhood and we'll both pick our own gift stock 🎁: [Robinhood](https://join.robinhood.com/albertm-8254f5)
- Get 500 MB of Dropbox storage: [Dropbox](https://www.dropbox.com/referrals/AAC52bYrrPqp8FZ7K5gxa-I74wecLpiQuB4?src=global9)

Your support helps me keep creating amazing projects!


## Connect with Me

- **Website**: [Code With Beto](https://codewithbeto.dev)
- **X (formerly Twitter)**: [@betomoedano](https://x.com/betomoedano)
- **GitHub**: [betomoedano](https://github.com/betomoedano)
- **LinkedIn**: [Beto Moedano](https://www.linkedin.com/in/betomoedano/)
- **Discord**: [Join Our Community](https://discord.com/invite/G2RnuUD8)
- **Medium**: [@betomoedano01](https://medium.com/@betomoedano01)
- **Figma**: [betomoedano](https://www.figma.com/@betomoedano)


import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, Entypo, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import colors from '../colors';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const navigation = useNavigation();
  const sidebarWidth = new Animated.Value(0);  // Initialize sidebar animation

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={toggleSidebar} style={styles.headerIcon}>
          <Entypo name="menu" size={24} color={colors.gray} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <Image source={{ uri: "https://i.pravatar.cc/300" }} style={styles.profileImage} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const postsRef = collection(database, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, []);

  const toggleSidebar = () => {
    if (isSidebarVisible) {
      Animated.timing(sidebarWidth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsSidebarVisible(false));
    } else {
      setIsSidebarVisible(true);
      Animated.timing(sidebarWidth, {
        toValue: 250,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.userAvatar || "https://i.pravatar.cc/150" }} style={styles.userAvatar} />
        <View>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.handle}>@{item.handle}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <AntDesign name="hearto" size={18} color={colors.dark} />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="comment-o" size={18} color={colors.dark} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={18} color={colors.dark} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isSidebarVisible && (
        <TouchableWithoutFeedback onPress={toggleSidebar}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        <TouchableOpacity style={styles.sidebarOption} onPress={() => navigation.navigate('Profile')}>
          <FontAwesome name="user" size={24} color={colors.dark} />
          <Text style={styles.sidebarText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarOption} onPress={() => navigation.navigate('Settings')}>
          <AntDesign name="setting" size={24} color={colors.dark} />
          <Text style={styles.sidebarText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarOption}>
          <FontAwesome name="user-plus" size={24} color={colors.dark} />
          <Text style={styles.sidebarText}>Follow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarOption}>
          <MaterialIcons name="groups" size={24} color={colors.dark} />
          <Text style={styles.sidebarText}>Groups</Text>
        </TouchableOpacity>
      </Animated.View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.postsContainer}
      />

      {/* Chat Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Chat")}
        style={styles.chatButton}
      >
        <Entypo name="chat" size={24} color={colors.lightGray} />
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerIcon: {
    marginLeft: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: colors.lightGray,
    padding: 20,
    zIndex: 2,
  },
  sidebarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  sidebarText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.gray,
  },
  postsContainer: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  post: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  handle: {
    fontSize: 14,
    color: colors.gray,
  },
  postContent: {
    fontSize: 15,
    color: colors.darkGray,
    marginVertical: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    color: colors.gray,
  },
  chatButton: {
    backgroundColor: colors.primary,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 50,
    right: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
});
