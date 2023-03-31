import React, { useContext } from 'react'
import { Participant } from '../../index-types';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
import commandContext from '../../context/cmd-context';
import { message } from 'antd';


interface IProps {
  participant: Participant
  allParicipantLength: number;
  participantAllMute?: () => void;
  isAllMute?: boolean;
}

function StudentList(props: IProps) {
  const { mediaStream } = useContext(ZoomMediaContext);
  const cmdClient = useContext(commandContext);
  const { participant, participantAllMute, isAllMute } = props;
  console.log("participant", participant);
  const {displayName, audio, muted, userId, isHost, bVideoOn} = participant

  const onHostParticipantMute = async () => {
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

  // 기획서에 카메라 제어 할 수 있는데 사생활 침해가 아닌가?
  const onHostParticipantCamera = async () => {
      cmdClient?.send('onCamera', userId)
  }

  return (
    <>
      <div style={{display:'flex'}}>
          {isHost ? <span>선생 :</span> : <span>학생 :</span>}
           <li>{displayName}</li>
           <button onClick={onHostParticipantMute}>{muted ? '마이크 켜기' : '마이크 끄기' }</button>
           <button onClick={onHostParticipantCamera}>{bVideoOn ? '카메라 끄기' : '카메라 켜기'}</button>
           {isHost && <button onClick={participantAllMute}>{isAllMute ? 'allunmute' : 'allmute'}</button>}
      </div>
    </>
  )
}
export default StudentList;