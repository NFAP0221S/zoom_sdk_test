import React, { useState } from 'react';

interface InputFormProps {
  setTopic: React.Dispatch<React.SetStateAction<string>>;
  setName: React.Dispatch<React.SetStateAction<string>>;
  onLeaveOrJoinSession: () => void;
}

const InputForm: React.FunctionComponent<InputFormProps> = (props) => {
  const { setTopic, setName, onLeaveOrJoinSession } = props;
  const [topicValue, setTopicValue] = useState('');
  const [nameValue, setNameValue] = useState('');

  const topicInputHandler = (e: any) => {
    setTopicValue(e.target.value);
  };
  const nameInputHandler = (e: any) => {
    setNameValue(e.target.value);
  };

  const buttonHandler = () => {
    setTopic(topicValue);
    setName(nameValue);
    onLeaveOrJoinSession();
  };

  return (
    <div>
      <input type="text" value={topicValue} onChange={topicInputHandler} placeholder="topic 입력" />
      <input type="text" value={nameValue} onChange={nameInputHandler} placeholder="name 입력" />
      <button onClick={buttonHandler}>클릭</button>
    </div>
  );
};

export default InputForm;
