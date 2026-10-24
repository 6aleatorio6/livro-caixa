import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Uma vez, na entrada do app. O `webClientId` é o do cliente OAuth "Web" do projeto Firebase: é
// com ele que o Google devolve o `idToken` que o Firebase Auth aceita.
GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
