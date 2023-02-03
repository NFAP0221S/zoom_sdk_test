import React, { useCallback, useState, useRef } from 'react';

interface InputFormProps {
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  setTopicValue: React.Dispatch<React.SetStateAction<string>>;
  setNameValue: React.Dispatch<React.SetStateAction<string>>;
  onLeaveOrJoinSession: () => void;
  topicValue: string;
  nameValue: string;
  status: string;
}

const InputForm: React.FunctionComponent<InputFormProps> = (props) => {
  const { onLeaveOrJoinSession, setStatus, setTopicValue, setNameValue, topicValue, nameValue } = props;
  //   const [topicValue, setTopicValue] = useState('');
  //   const [nameValue, setNameValue] = useState('');
  const topicRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const buttonHandler = useCallback(() => {
    // setStatus('connected');
    if (topicRef.current) {
      setTopicValue(topicRef.current.value);
    }
    if (nameRef.current) {
      setNameValue(nameRef.current.value);
    }
    onLeaveOrJoinSession();
  }, [onLeaveOrJoinSession, setNameValue, setTopicValue]);

  return (
    <div>
      <input ref={topicRef} type="text" placeholder="topic 입력" />
      <input ref={nameRef} type="text" placeholder="name 입력" />
      <button onClick={buttonHandler}>클릭</button>
    </div>
  );
};

export default InputForm;
