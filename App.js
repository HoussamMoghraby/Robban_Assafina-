import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, NativeModules, StatusBar, ImageBackground, Dimensions, Alert, I18nManager } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import AssafinaNavigator from './navigation/AssafinaNavigator';
import { enableScreens } from 'react-native-screens';
import CustomColors from './constants/CustomColors';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider, useSelector } from 'react-redux';
import postsReducer from './store/reducers/posts';
import categoriesReducer from './store/reducers/categories';
import authReducer from './store/reducers/auth';
import ReduxThunk from 'redux-thunk';
import { isPlatformAndroid } from './helpers/Platform';
import * as Notifications_NEW from 'expo-notifications';
import { Notifications } from 'expo';
import AsyncStorage from '@react-native-community/async-storage';
import RootScreen from './screens/RootScreen';

Notifications_NEW.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldShowAlert: true
    }
  }
});

Notifications_NEW.addNotificationResponseReceivedListener(response => {
  debugger;
})



I18nManager.allowRTL(false);
enableScreens();

const rootReducer = combineReducers({
  posts: postsReducer,
  categories: categoriesReducer,
  auth: authReducer
});
const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

const fetchFonts = () => {
  return Font.loadAsync({
    'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
  });
};

export default function App(props) {
  console.log(props);
  if (props.exp.notification || props.exp.notifications) {
    debugger;
  }
  StatusBar.setBarStyle(isPlatformAndroid() ? 'light-content' : 'default');
  if (isPlatformAndroid())
    StatusBar.setBackgroundColor(CustomColors.accentColor);

  const [fontLoaded, setFontLoaded] = useState(false);
  const [loadCustomSplash, setLoadCustomSplash] = useState(0);
  const [customSplashURL, setCustomSplashURL] = useState();

  // useEffect(() => {
  //   //Background notification handler
  //   const backgroundSubscription = Notifications_NEW.addNotificationResponseReceivedListener(response => {
  //     debugger;
  //     console.log(response.notification.request.content.data);
  //     try {
  //       if (response.notification.request.content.data && response.notification.request.content.data.postId) {
  //         AsyncStorage.setItem('tappedNotificationPostId', response.notification.request.content.data.postId.toString()).then(() => { });
  //       }
  //     }
  //     catch (e) {
  //       console.error(e);
  //     }
  //   });
  //   return () => {
  //     backgroundSubscription.remove();
  //   }
  // }, []);

  useEffect(() => {
    const loadSplash = async () => {
      console.log('getting custom splash');
      try {
        const splashResponse = await fetch('http://assafinaonline.com/wp-json/wp/v2/media?search=Mobile_App_Splash_Screen&ordeby=date&order=desc');
        const splashResponseJSON = await splashResponse.json();
        console.log('setting custom splash');
        //throw new Error('123');
        setCustomSplashURL(splashResponseJSON[0].media_details.sizes.full.source_url);
      }
      catch (error) {
        console.log(error);
        setCustomSplashURL('ERROR');
      }
    }
    if (loadCustomSplash == 1)
      loadSplash();
  }, [loadCustomSplash]);

  if (!fontLoaded)
    return (<AppLoading startAsync={fetchFonts} onFinish={() => { setFontLoaded(true); setLoadCustomSplash(1); }}></AppLoading>);

  if (loadCustomSplash == 1 && (!customSplashURL || customSplashURL == 'ERROR')) {
    if (customSplashURL == 'ERROR') {
      console.log('Could not load custom splash');
      setTimeout(() => {
        setLoadCustomSplash(2);
      }, 500);
    }
    return (
      // <View style={{ flex: 1, backgroundColor: '#e0f2fe', width: '100%', height: '100%' }}></View>
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: '#e0f2fe' }}>
        <ImageBackground source={require('./assets/splash-new-4.png')} style={{ height: Dimensions.get('window').height, width: Dimensions.get('window').width }} resizeMode="contain" >
        </ImageBackground>
      </View >
    );
  }

  if (loadCustomSplash == 1 && customSplashURL && customSplashURL != 'ERROR') {
    setTimeout(() => {
      setLoadCustomSplash(2);
    }, 4000);
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <ImageBackground source={{ uri: customSplashURL }} style={{ height: Dimensions.get('window').height, width: Dimensions.get('window').width }} resizeMode="contain" >
        </ImageBackground>
      </View >
    );
  }
  if (loadCustomSplash == 2) {
    return (
      <Provider store={store}>
        <SafeAreaView style={styles.appContainer}>
          {/* <AssafinaNavigator></AssafinaNavigator> */}
          <RootScreen></RootScreen>
        </SafeAreaView>
      </Provider>
    );
  }
  else
    return (<View style={{ justifyContent: 'center', alignItems: 'center' }}><Text>Could not open App</Text></View>)
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  }
});
