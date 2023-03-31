import React, { useContext, useEffect, useRef, useState } from 'react';
import { AudioMutedOutlined, AudioFilled } from '@ant-design/icons';
import { message, Slider } from 'antd';
import classNames from 'classnames';
import './avatar.scss';
import { Participant } from '../../../index-types';
import ZoomContext from '../../../context/zoom-context';
import { useHover } from '../../../hooks';
import ZoomMediaContext from '../../../context/media-context';
import { getIsHost } from '../../../utils/util';
import commandContext from '../../../context/cmd-context';
interface AvatarProps {
  participant: Participant;
  style?: { [key: string]: string };
  isActive: boolean;
  className?: string;
  volume?: number;
  setLocalVolume?: (userId: number, volume: number) => void;
  participantAllMute?: () => void;
  isAllMute?: boolean;
}
const Avatar = (props: AvatarProps) => {
  const { mediaStream } = useContext(ZoomMediaContext);
  const [isAllLockShare, setIsAllLockShare] = useState(false);
  const [isIndividualLockShare, setIsIndividualLockShare] = useState(true);
  const { participant, style, isActive, className, volume, setLocalVolume, participantAllMute, isAllMute } = props;
  const { displayName, audio, muted, bVideoOn, userId } = participant;
  const cmdClient = useContext(commandContext);
  const avatarRef = useRef(null);
  const isHover = useHover(avatarRef);
  const zmClient = useContext(ZoomContext);
  const onSliderChange = (value: number) => {
    setLocalVolume?.(userId, value);
  };
  const onHostParticipantMute = async () => {
    //TODO: 오디오 상태 확인
    // console.log("mute sharing ===> ", mediaStream?.muteShareAudio())
  // if(mediaStream?.isAudioMuted(userId))    
    console.log("isMuted", muted);
    if(!muted){
        await mediaStream?.muteAudio(userId).catch((e) => {
          const { reason } = e;
          if(reason === 'no audio joined'){
            message.error('사용자의 audio가 켜져있지 않습니다.');
          }
        })
    }else {
      // mediaStream?.unmuteAudio(userId);
      cmdClient?.send('unmute', userId);
      // cmdClient?.send('unmute', userId); 

      // cmdClient?.send('allmute'); // 전체 사용자 음소거 해제
    }
  }

  // const participantAllMute = () => {
  //   console.log("participant", participant)
  // }

  //host 화면 공유 잠금
  const onHostAllParticipantShareScreenLock = () => {
    if(isAllLockShare){
      console.log("공유잠금 해제!");
      mediaStream?.lockShare(false);
      setIsAllLockShare(false);
    }else {
      console.log("공유잠금 설정!");
      mediaStream?.lockShare(true);
      setIsAllLockShare(true);
    }
  }

  const onHostIndividualParticipantShareScreenLock = () => {
    if(!isIndividualLockShare){
      console.log("개인 공유잠금 설정");
      cmdClient?.send('sharescreenlock', userId);
      setIsIndividualLockShare(true);
    }else {
      console.log("개인 공유잠금 해제");
      cmdClient?.send('sharescreenunlock', userId);
      setIsIndividualLockShare(false);
    }

  }

  return (
    <div
      className={classNames('avatar', { 'avatar-active': isActive }, className)}
      style={{ ...style, background: bVideoOn ? 'transparent' : 'rgb(26,26,26)' }}
      ref={avatarRef}
    > 
      {zmClient.getSessionInfo().userId !== userId && zmClient.isHost() &&
        <div>
          <button className="corner-button-screen" onClick={onHostParticipantMute}>{muted ? '마이크 켜기' : '마이크 끄기' }</button>
          <button className="corner-button-muted" onClick={onHostIndividualParticipantShareScreenLock}>{isIndividualLockShare ? '공유화면 권한 해제' : '공유화면 권한 부여'}</button>
        </div>
      }
      {zmClient.getSessionInfo().userId === userId && zmClient.isHost() &&
        <div>
          <button className="corner-button-screen" onClick={onHostAllParticipantShareScreenLock}>{isAllLockShare ? '전체 공유화면 잠금 해제' : '전체 공유화면 잠금' }</button>
          <button className="corner-button-muted" onClick={participantAllMute}>{isAllMute ? '음소거 해제' : '모두 음소거'}</button>
        </div>
      }
      {(bVideoOn || (audio === 'computer' && muted)) && (
        <div className="corner-name">
          {audio === 'computer' && muted 
          ? <AudioMutedOutlined style={{ color: '#f00' }} />
          : <AudioFilled style={{ color: '#f00' }} />}
          {bVideoOn && <span>{displayName}</span>}
        </div>
      )}
      {!bVideoOn && <p className="center-name" style={{color: zmClient.getSessionInfo().userId === userId ? 'blue' : 'white'}}>{displayName}</p>}
      {isHover && audio === 'computer' && zmClient.getSessionInfo().userId !== userId && (
        <div className={classNames('avatar-volume')}>
          <label>Volume:</label>
          <Slider
            marks={{ 0: '0', 100: '100' }}
            tooltipVisible={true}
            defaultValue={100}
            onChange={onSliderChange}
            value={volume}
          />
        </div>
      )}
    </div>
  );
};

export default Avatar;
