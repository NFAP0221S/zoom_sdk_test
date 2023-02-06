import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Button } from 'antd';
import { useStore } from '../../../store/store';
interface InputFormProps {
  onLeaveOrJoinSession: (topic: string, name: string, password: string, role: string) => void;
  status: string;
}

const InputForm: React.FunctionComponent<InputFormProps> = (props) => {
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

  const buttonHandler = useCallback(() => {
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
  }, [actionText, isToggle, nameChange, passwordChange, roleChange, toggleHandler, topicChange]);

  useEffect(() => {
    if (isToggle) {
      onLeaveOrJoinSession(isTopic, isName, isPassword, isRole);
    }
  }, [isToggle]);

  return (
    <div>
      {actionText === 'Join' && <input ref={topicRef} type="text" placeholder="topic 입력" />}
      {actionText === 'Join' && <input ref={nameRef} type="text" placeholder="name 입력" />}
      {actionText === 'Join' && <input ref={passwordRef} type="password" placeholder="password 입력" />}
      {actionText === 'Join' && <input ref={roleRef} type="text" placeholder="role 입력" />}
      {actionText === 'Leave' && <div>topic:{isTopic}</div>}
      {actionText === 'Leave' && <div>name:{isName}</div>}
      {actionText === 'Leave' && <div>password:{isPassword}</div>}
      {actionText === 'Leave' && <div>role:{isRole}</div>}
      {/* <button onClick={buttonHandler}>클릭</button> */}
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

export default InputForm;
