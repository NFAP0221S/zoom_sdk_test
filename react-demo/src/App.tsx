import React, { useEffect, useContext, useState, useCallback, useReducer, useMemo } from 'react';
import { BrowserRouter as Router, Switch, Route, useHistory, BrowserRouter } from 'react-router-dom';
import ZoomVideo, { ConnectionState, ReconnectReason } from '@zoom/videosdk';
import { message, Modal } from 'antd';
import 'antd/dist/antd.min.css';
import produce from 'immer';
import Home from './feature/home/home';
import Video from './feature/video/video';
import VideoSingle from './feature/video/video-single';
import VideoNonSAB from './feature/video/video-non-sab';
import Preview from './feature/preview/preview';
import ZoomContext from './context/zoom-context';
import ZoomMediaContext from './context/media-context';
import ChatContext from './context/chat-context';
import CommandContext from './context/cmd-context';
import LiveTranscriptionContext from './context/live-transcription';
import RecordingContext from './context/recording-context';
import LoadingLayer from './component/loading-layer';
import Chat from './feature/chat/chat';
import Command from './feature/command/command';
import Subsession from './feature/subsession/subsession';
import {
  ChatClient,
  CommandChannelClient,
  LiveTranscriptionClient,
  MediaStream,
  RecordingClient,
  SubsessionClient
} from './index-types';
import './App.css';
import SubsessionContext from './context/subsession-context';
import { isAndroidBrowser } from './utils/platform';
import { generateVideoToken } from './utils/util';
import {
  gettingSessionInfo,
  gettingSignature,
  localStorageClear,
  settingSessionInfo,
  settingSignature
} from './stores/LocalStorage';
interface AppProps {
  meetingArgs: {
    sdkKey: string;
    sdkSecret: string;
    topic: string;
    signature: string;
    name: string;
    password?: string;
    webEndpoint?: string;
    userIdentity?: string;
    enforceGalleryView?: string;
    sessionKey?: string;
  };
}
const mediaShape = {
  audio: {
    encode: false,
    decode: false
  },
  video: {
    encode: false,
    decode: false
  },
  share: {
    encode: false,
    decode: false
  }
};
const mediaReducer = produce((draft, action) => {
  switch (action.type) {
    case 'audio-encode': {
      draft.audio.encode = action.payload;
      break;
    }
    case 'audio-decode': {
      draft.audio.decode = action.payload;
      break;
    }
    case 'video-encode': {
      draft.video.encode = action.payload;
      break;
    }
    case 'video-decode': {
      draft.video.decode = action.payload;
      break;
    }
    case 'share-encode': {
      draft.share.encode = action.payload;
      break;
    }
    case 'share-decode': {
      draft.share.decode = action.payload;
      break;
    }
    case 'reset-media': {
      Object.assign(draft, { ...mediaShape });
      break;
    }
    default:
      break;
  }
}, mediaShape);

declare global {
  interface Window {
    webEndpoint: string | undefined;
    zmClient: any | undefined;
    mediaStream: any | undefined;
    crossOriginIsolated: boolean;
  }
}

function App(props: AppProps) {
  const {
    meetingArgs: {
      sdkKey,
      topic,
      signature,
      name,
      password,
      webEndpoint: webEndpointArg,
      enforceGalleryView,
      userIdentity,
      sessionKey,
      sdkSecret
    }
  } = props;
  const [loading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');
  const [isFailover, setIsFailover] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('closed');
  const [mediaState, dispatch] = useReducer(mediaReducer, mediaShape);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);
  const [recordingClient, setRecordingClient] = useState<RecordingClient | null>(null);
  const [commandClient, setCommandClient] = useState<CommandChannelClient | null>(null);
  const [subsessionClient, setSubsessionClient] = useState<SubsessionClient | null>(null);
  const [liveTranscriptionClient, setLiveTranscriptionClient] = useState<LiveTranscriptionClient | null>(null);
  const [isSupportGalleryView, setIsSupportGalleryView] = useState<boolean>(true);
  const zmClient = useContext(ZoomContext);
  const history = useHistory();
  let newSignature: string = gettingSignature() || '';
  let webEndpoint: any;
  if (webEndpointArg) {
    webEndpoint = webEndpointArg;
  } else {
    webEndpoint = window?.webEndpoint ?? 'zoom.us';
  }
  const mediaContext = useMemo(() => ({ ...mediaState, mediaStream }), [mediaState, mediaStream]);
  const galleryViewWithoutSAB = Number(enforceGalleryView) === 1 && !window.crossOriginIsolated;
  useEffect(() => {
    const init = async () => {
      await zmClient.init('en-US', `${window.location.origin}/lib`, {
        webEndpoint,
        enforceMultipleVideos: galleryViewWithoutSAB,
        stayAwake: true
      });
      try {
        if (gettingSignature() && gettingSessionInfo()) {
          const { topic: oldTopic, userName: oldUserName, password: oldPassword } = gettingSessionInfo();
          setLoadingText('재접속중입니다...');
          await zmClient.join(oldTopic, gettingSignature(), oldUserName, oldPassword).catch((e) => {
            const { reason } = e;
            // session 만료 예외처리
            if (reason === 'Verify JWT failed') {
              localStorageClear();
              history.replace('/');
            }
            console.log(e);
            return;
          });
          const stream = zmClient.getMediaStream();
          setMediaStream(stream);
          setIsSupportGalleryView(stream.isSupportMultipleVideos() && !isAndroidBrowser());
          const chatClient = zmClient.getChatClient();
          const commandClient = zmClient.getCommandClient();
          const recordingClient = zmClient.getRecordingClient();
          const ssClient = zmClient.getSubsessionClient();
          const ltClient = zmClient.getLiveTranscriptionClient();
          setChatClient(chatClient);
          setCommandClient(commandClient);
          setRecordingClient(recordingClient);
          setSubsessionClient(ssClient);
          setLiveTranscriptionClient(ltClient);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (e: any) {
        setIsLoading(false);
        message.error(e.reason);
        localStorageClear();
      }
    };
    init();
    return () => {
      ZoomVideo.destroyClient();
    };
  }, [zmClient]);

  const leaveSession = async () => {
    console.log('testtest');
    await zmClient.leave();
    localStorageClear();
  };

  useEffect(() => {
    // 좀 더 테스트 필요
    window.addEventListener('beforeunload', () => {
      leaveSession();
    });
    window.addEventListener('unload', () => {
      leaveSession();
    });

    if (location.pathname !== '/') {
      console.log('location pathname ===>', location.pathname);
      if (!gettingSignature() || !gettingSessionInfo()) {
        history.replace({ pathname: '/' });
      }
    }
    return () => {
      window.removeEventListener('beforeunload', leaveSession);
      window.removeEventListener('unload', leaveSession);
    };
  }, []);
  // window.addEventListener('beforeunload', async (event) => {
  //   // event.preventDefault();
  //   // event.returnValue = '';
  //   try {
  //     await zmClient.leave();
  //   } catch (e: any) {
  //     console.log(e);
  //   }
  // });

  const onConnectionChange = useCallback(
    (payload) => {
      if (payload.state === ConnectionState.Reconnecting) {
        setIsLoading(true);
        setIsFailover(true);
        setStatus('connecting');
        const { reason, subsessionName } = payload;
        if (reason === ReconnectReason.Failover) {
          setLoadingText('Session Disconnected,Try to reconnect');
          // 재 연결 시도
        } else if (reason === ReconnectReason.JoinSubsession || reason === ReconnectReason.MoveToSubsession) {
          setLoadingText(`Joining ${subsessionName}...`);
        } else if (reason === ReconnectReason.BackToMainSession) {
          setLoadingText('Returning to Main Session...');
        }
      } else if (payload.state === ConnectionState.Connected) {
        setStatus('connected');
        if (isFailover) {
          setIsLoading(false);
        }
        window.zmClient = zmClient;
        window.mediaStream = zmClient.getMediaStream();
        const sessionInfo = zmClient.getSessionInfo();
        settingSignature(newSignature); // 시그니쳐 정보 로컬스토리지 저장;
        settingSessionInfo(sessionInfo); // 세션 정보 로컬 스토리지 저장
        console.log('getSessionInfo', zmClient.getSessionInfo());
      } else if (payload.state === ConnectionState.Closed) {
        setStatus('closed');
        dispatch({ type: 'reset-media' });
        if (payload.reason === 'ended by host') {
          Modal.warning({
            title: 'Meeting ended',
            content: 'This meeting has been ended by host'
          });
        }
      }
    },
    [isFailover, zmClient]
  );
  const onMediaSDKChange = useCallback((payload) => {
    const { action, type, result } = payload;
    dispatch({ type: `${type}-${action}`, payload: result === 'success' });
  }, []);

  const onDialoutChange = useCallback((payload) => {
    console.log('onDialoutChange', payload);
  }, []);

  const onAudioMerged = useCallback((payload) => {
    console.log('onAudioMerged', payload);
  }, []);

  const onLeaveOrJoinSession = useCallback(
    async (joinData: any) => {
      console.log('joinData', joinData);
      if (status === 'closed') {
        try {
          // newSignature = generateVideoToken(
          //   sdkKey,
          //   sdkSecret,
          //   joinData.topic,
          //   joinData.password,
          //   userIdentity,
          //   sessionKey,
          //   parseInt(joinData.role, 10)
          // );
          setLoadingText('Joining the session...');
          setIsLoading(true);
          if (joinData.token !== '') {
            // console.log('토큰');
            // console.log('tk', joinData.token);
            // console.log('key', joinData.sdkKey);
            // console.log('scr', joinData.sdkSecret);
            await zmClient.join(joinData.topic, joinData.token, joinData.name, joinData.password);
          } else {
            // console.log('시그니처');
            // console.log('tk', joinData.token);
            // console.log('key', joinData.sdkKey);
            // console.log('scr', joinData.sdkSecret);
            newSignature = generateVideoToken(
              joinData.sdkKey,
              joinData.sdkSecret,
              joinData.topic,
              joinData.password,
              userIdentity,
              sessionKey,
              parseInt(joinData.role, 10)
            );
            await zmClient.join(joinData.topic, newSignature, joinData.name, joinData.password);
          }
          setIsLoading(false);
          const stream = zmClient.getMediaStream();
          setMediaStream(stream);
          setIsSupportGalleryView(stream.isSupportMultipleVideos() && !isAndroidBrowser());
          const chatClient = zmClient.getChatClient();
          const commandClient = zmClient.getCommandClient();
          const recordingClient = zmClient.getRecordingClient();
          const ssClient = zmClient.getSubsessionClient();
          const ltClient = zmClient.getLiveTranscriptionClient();
          setChatClient(chatClient);
          setCommandClient(commandClient);
          setRecordingClient(recordingClient);
          setSubsessionClient(ssClient);
          setLiveTranscriptionClient(ltClient);
          setIsLoading(false);
        } catch (e: any) {
          setIsLoading(false);
          console.log('e', e);
          message.error(e.reason);
        }
      } else if (status === 'connected') {
        leaveSession();
        message.warn('You have left the session.');
      }
    },
    [zmClient, status, topic, signature, name, password]
  );
  useEffect(() => {
    zmClient.on('connection-change', onConnectionChange);
    zmClient.on('media-sdk-change', onMediaSDKChange);
    zmClient.on('dialout-state-change', onDialoutChange);
    zmClient.on('merged-audio', onAudioMerged);
    return () => {
      zmClient.off('connection-change', onConnectionChange);
      zmClient.off('media-sdk-change', onMediaSDKChange);
      zmClient.off('dialout-state-change', onDialoutChange);
      zmClient.off('merged-audio', onAudioMerged);
    };
  }, [zmClient, onConnectionChange, onMediaSDKChange, onDialoutChange, onAudioMerged]);
  return (
    <div className="App">
      {loading && <LoadingLayer content={loadingText} />}
      {!loading && (
        <ZoomMediaContext.Provider value={mediaContext}>
          <ChatContext.Provider value={chatClient}>
            <RecordingContext.Provider value={recordingClient}>
              <CommandContext.Provider value={commandClient}>
                <SubsessionContext.Provider value={subsessionClient}>
                  <LiveTranscriptionContext.Provider value={liveTranscriptionClient}>
                    <Router>
                      <Switch>
                        <Route
                          path="/"
                          render={(props) => (
                            <Home {...props} status={status} onLeaveOrJoinSession={onLeaveOrJoinSession} />
                          )}
                          exact
                        />
                        <Route path="/index.html" component={Home} exact />
                        <Route path="/chat" component={Chat} />
                        <Route path="/command" component={Command} />
                        <Route
                          path="/video"
                          component={isSupportGalleryView ? Video : galleryViewWithoutSAB ? VideoNonSAB : VideoSingle}
                        />
                        <Route path="/subsession" component={Subsession} />
                        <Route path="/preview" component={Preview} />
                      </Switch>
                    </Router>
                  </LiveTranscriptionContext.Provider>
                </SubsessionContext.Provider>
              </CommandContext.Provider>
            </RecordingContext.Provider>
          </ChatContext.Provider>
        </ZoomMediaContext.Provider>
      )}
    </div>
  );
}

export default App;
