import React, { useState } from 'react'
import { Participant } from '../../index-types';
import ChatContainer from '../chat/chat';
import StudentList from './student-list';

interface IProps {
  canvasHeight?: number;
  visibleParticipants: Participant[]
  participantAllMute?: () => void;
  isAllMute?:boolean
}

const ManageBox = (props : IProps) => {
  const { canvasHeight, visibleParticipants, participantAllMute, isAllMute } = props;
  const [num, setNum] = useState(0);


  return (
     <div className='' style={{color:'white', width:'400px', backgroundColor:'black'}}>
          <div style={{
            color:'black',
            width:'100%', 
            height: canvasHeight, 
            backgroundColor:'white', 
          }}
          >
            <ul style={{display:'flex'}}>
                <li onClick={() => setNum(0)}><button>채팅</button></li>
                <li onClick={() => setNum(1)}><button>학생</button></li>
                <li onClick={() => setNum(2)}><button>관리</button></li>
            </ul>
            {
              num === 0 ? 
              <>
                <div>채팅창</div>
                <ChatContainer /> 
              </>: 
              num === 1 ? 
              <>
                <span>총 :{visibleParticipants.length} 명</span>
                <ul>
                  {visibleParticipants.map((user) => {
                    const visibleParticipantsLength = visibleParticipants.length;
                    return <StudentList 
                      participant={user} 
                      allParicipantLength={visibleParticipantsLength}
                      participantAllMute={participantAllMute}
                      isAllMute={isAllMute}
                    />
                  })}
                </ul>
              </>
              : <div>관리</div>
            }
          </div>
          

    </div>
  )
}

export default ManageBox;