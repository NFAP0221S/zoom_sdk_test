import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Button } from 'antd';
import { useStore } from '../../../store/store';
interface InputFormProps {
  onLeaveOrJoinSession: (topic: string, name: string, password: string, role: string) => void;
  status: string;
}

const JoinInputForm: React.FunctionComponent<InputFormProps> = (props) => {
  const { onLeaveOrJoinSession, status } = props;
  const {
    isTopic,
    isName,
    isPassword,
    isRole,
    topicChange,
    nameChange,
    passwordChange,
    roleChange,
    isToggle,
    toggleHandler
  } = useStore();

  let actionText: any;
  if (status === 'connected') {
    actionText = 'Leave';
  } else if (status === 'closed') {
    actionText = 'Join';
  }

  const topicRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);

  const buttonHandler = () => {
    if (actionText === 'Join') {
      if (topicRef.current && nameRef.current && passwordRef.current && roleRef.current) {
        topicChange(topicRef.current.value);
        nameChange(nameRef.current.value);
        passwordChange(passwordRef.current.value);
        roleChange(roleRef.current.value);
      }
    }
    toggleHandler(!isToggle);
    // onLeaveOrJoinSession(isTopic, isName, isPassword, isRole);
  };

  useEffect(() => {
    // console.log('useEffect toggle', isToggle);
    if (isToggle) {
      onLeaveOrJoinSession(isTopic, isName, isPassword, isRole);
      // Toggle값을 false로 안돌려주면 강제로 세션Leave 시킴
      toggleHandler(!isToggle);
    }
  }, [isToggle]); // 의존성 배열 isToggle만 고정

  return (
    <div className="navinput">
      <ul className="navinput-join">
        <li>{actionText === 'Join' && <input ref={topicRef} type="text" placeholder="topic 입력" />}</li>
        <li>{actionText === 'Join' && <input ref={nameRef} type="text" placeholder="name 입력" />}</li>
        <li>{actionText === 'Join' && <input ref={passwordRef} type="password" placeholder="password 입력" />}</li>
        <li>{actionText === 'Join' && <input ref={roleRef} type="text" placeholder="role 입력" />}</li>
      </ul>
      <ul className="navinput-leave">
        <li>{actionText === 'Leave' && <div>topic:{isTopic}</div>}</li>
        <li>{actionText === 'Leave' && <div>name:{isName}</div>}</li>
        <li>{actionText === 'Leave' && <div>password:{isPassword}</div>}</li>
        <li>{actionText === 'Leave' && <div>role:{isRole}</div>}</li>
      </ul>
      {actionText === 'Join' && (
        <Button type="link" className="navleave" onClick={buttonHandler}>
          {actionText}
        </Button>
      )}
      {actionText === 'Leave' && (
        <Button type="link" className="navleave" onClick={buttonHandler}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default JoinInputForm;
