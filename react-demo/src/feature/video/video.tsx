import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
import Avatar from './components/avatar';
import VideoFooter from './components/video-footer';
import Pagination from './components/pagination';
import { useCanvasDimension } from './hooks/useCanvasDimension';
import { useGalleryLayout } from './hooks/useGalleryLayout';
import { usePagination } from './hooks/usePagination';
import { useActiveVideo } from './hooks/useAvtiveVideo';
import { useShare } from './hooks/useShare';
import { useLocalVolume } from './hooks/useLocalVolume';
import './video.scss';
import { isSupportWebCodecs } from '../../utils/platform';
import { isShallowEqual } from '../../utils/util';
import { useSizeCallback } from '../../hooks/useSizeCallback';
import { gettingSessionInfo } from '../../stores/LocalStorage';
import { ArrowLeftOutlined } from '@ant-design/icons';
import commandContext from '../../context/cmd-context'
import ManageBox from './manage-box';

const VideoContainer: React.FunctionComponent<RouteComponentProps> = (props) => {
  const history = useHistory();
  const zmClient = useContext(ZoomContext);
  const cmdClient = useContext(commandContext);
  const { topic } = gettingSessionInfo();
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady }
  } = useContext(ZoomMediaContext);
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const shareRef = useRef<HTMLCanvasElement | null>(null);
  const selfShareRef = useRef<(HTMLCanvasElement & HTMLVideoElement) | null>(null);
  const shareContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerDimension, setContainerDimension] = useState({
    width: 0,
    height: 0
  });
  const [shareViewDimension, setShareViewDimension] = useState({
    width: 0,
    height: 0
  });
  const [isAllMute, setIsAllMute] = useState<boolean>(false);
  const canvasDimension = useCanvasDimension(mediaStream, videoRef);
  const activeVideo = useActiveVideo(zmClient);
  const { page, pageSize, totalPage, totalSize, setPage } = usePagination(zmClient, canvasDimension);
  const { visibleParticipants, layout: videoLayout } = useGalleryLayout(
    zmClient,
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    canvasDimension,
    {
      page,
      pageSize,
      totalPage,
      totalSize
    }
  );
  const { isRecieveSharing, isStartedShare, sharedContentDimension } = useShare(zmClient, mediaStream, shareRef);

  const { userVolumeList, setLocalVolume } = useLocalVolume();

  const isSharing = isRecieveSharing || isStartedShare;
  useEffect(() => {
    if (isSharing && shareContainerRef.current) {
      const { width, height } = sharedContentDimension;
      const { width: containerWidth, height: containerHeight } = containerDimension;
      const ratio = Math.min(containerWidth / width, containerHeight / height, 1);
      setShareViewDimension({
        width: Math.floor(width * ratio),
        height: Math.floor(height * ratio)
      });
    }
  }, [isSharing, sharedContentDimension, containerDimension]);

  const onShareContainerResize = useCallback(({ width, height }) => {
    _.throttle(() => {
      setContainerDimension({ width, height });
    }, 50)();
  }, []);
  useSizeCallback(shareContainerRef.current, onShareContainerResize);
  useEffect(() => {
    if (!isShallowEqual(shareViewDimension, sharedContentDimension)) {
      mediaStream?.updateSharingCanvasDimension(shareViewDimension.width, shareViewDimension.height);
    }
  }, [mediaStream, sharedContentDimension, shareViewDimension]);

  const goBack = () => {
    history.goBack();
  }

  const participantAllMute = async () => {
    if(isAllMute) {
      cmdClient?.send("unmute");
      setIsAllMute(false);
    }else {
      console.log("음소거 설정", isAllMute);

      visibleParticipants.forEach(async (item, idx) => {
        if(zmClient.getSessionInfo().userId !== item.userId){
          await mediaStream?.muteAudio(item.userId).catch((e) =>{
            console.log("eeeeeeeee", e, idx, item);
          })
        }
      })
      setIsAllMute(true);
    }
  }
  const { height: canvasHeight2 } = canvasDimension;
  return (
    <>
    <div style={{display:'flex'}}>
   
    <div className="viewport">
    <div className="viewport-header">
        <h1>방 이름: {topic}</h1>
        <button className="corner-name" onClick={goBack}>
          <ArrowLeftOutlined  style={{ color: 'white' }} />
        </button>
      </div>
      <div
        className={classnames('share-container', {
          'in-sharing': isSharing
        })}
        ref={shareContainerRef}
      >
        <div
          className="share-container-viewport"
          style={{
            width: `${shareViewDimension.width}px`,
            height: `${shareViewDimension.height}px`
          }}
        >
          <canvas className={classnames('share-canvas', { hidden: isStartedShare })} ref={shareRef} />
          {isSupportWebCodecs() ? (
            <video
              className={classnames('share-canvas', {
                hidden: isRecieveSharing
              })}
              ref={selfShareRef}
            />
          ) : (
            <canvas
              className={classnames('share-canvas', {
                hidden: isRecieveSharing
              })}
              ref={selfShareRef}
            />
          )}
        </div>
      </div>
      <div
        className={classnames('video-container', {
          'in-sharing': isSharing
        })}
      >
        <canvas className="video-canvas" id="video-canvas" width="800" height="600" ref={videoRef} />
        <ul className="avatar-list">
          {visibleParticipants.map((user, index) => {
            if (index > videoLayout.length - 1) {
              return null;
            }
            const dimension = videoLayout[index];
            const { width, height, x, y } = dimension; // video-layout-helper.ts 의 return 값
            const { height: canvasHeight } = canvasDimension;
            console.log("canvasHeight ====>", canvasHeight); // video-canvase의 height 값
            console.log("dimension y ====>", y);
            console.log("dimension height ====>", height);
            return (
              <Avatar
                participant={user}
                key={user.userId}
                isActive={activeVideo === user.userId}
                volume={userVolumeList.find((u) => u.userId === user.userId)?.volume}
                setLocalVolume={setLocalVolume}
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  top: `${canvasHeight - y - height}px`,
                  left: `${x}px`
                }}
                participantAllMute={participantAllMute}
                isAllMute={isAllMute}
              />
            );
          })}
        </ul>
      </div>
      <VideoFooter className="video-operations" sharing shareRef={selfShareRef} />
      {totalPage > 1 && <Pagination page={page} totalPage={totalPage} setPage={setPage} inSharing={isSharing} />}
    </div>
    <ManageBox 
      canvasHeight={canvasHeight2}
      visibleParticipants={visibleParticipants}
      participantAllMute={participantAllMute}
      isAllMute={isAllMute}
    />
    {/* <div className='' style={{color:'white', width:'400px', backgroundColor:'black'}}>
          <div style={{
            color:'white',
            width:'100%', 
            height:canvasHeight2, 
            backgroundColor:'white', 
          }}
          >
            박스
          </div>

    </div> */}
    </div>
    </>
  );
};

export default VideoContainer;
