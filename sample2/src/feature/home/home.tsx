/* eslint-disable no-restricted-globals */
import React, { useCallback, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Card, Button } from 'antd';
import { IconFont } from '../../component/icon-font';
import './home.scss';

const { Meta } = Card;
interface HomeProps extends RouteComponentProps {
  status: string;
  onLeaveOrJoinSession: (joinData: any) => void;
}
const Home: React.FunctionComponent<HomeProps> = (props) => {
  const { history, status, onLeaveOrJoinSession } = props;
  const [joinData, setJoinData] = useState({
    topic: '',
    name: '',
    password: '',
    role: 0
  });
  const onCardClick = (type: string) => {
    history.push(`/${type}${location.search}`);
  };
  const featureList = [
    {
      key: 'video',
      icon: 'icon-meeting',
      title: 'Audio, video and share',
      description: 'Gallery Layout, Start/Stop Audio, Mute/Unmute, Start/Stop Video, Start/Stop Screen Share'
    },
    {
      key: 'chat',
      icon: 'icon-chat',
      title: 'Session chat',
      description: 'Session Chat, Chat Priviledge'
    },
    {
      key: 'command',
      icon: 'icon-chat',
      title: 'Command Channel chat',
      description: 'Session Command Channel chat'
    },
    {
      key: 'Subsession',
      icon: 'icon-group',
      title: 'Subsession',
      description: 'Open/Close Subsession, Assign/Move Participants into Subsession, Join/Leave Subsession'
    },
    {
      key: 'preview',
      icon: 'icon-meeting',
      title: 'Local Preview',
      description: 'Audio and Video preview'
    }
  ];
  let actionText;
  if (status === 'connected') {
    actionText = 'Leave';
  } else if (status === 'closed') {
    actionText = 'Join';
  }

  const joinDataOnChange = useCallback(
    (e) => {
      const currentName = e.target.name;
      let currentValue = e.target.value;
      if (currentValue === '강사') currentValue = 1;
      if (currentValue === '학생') currentValue = 0;
      console.log('e.target.value', currentValue);
      setJoinData({ ...joinData, [currentName]: currentValue });
    },
    [joinData]
  );

  return (
    <div>
      <div className="nav">
        <a href="/" className="navhome">
          <img src="./logo.svg" alt="Home" />
          <span>VideoSDK Demo</span>
        </a>
        <div className="navdoc">
          <a href="https://marketplace.zoom.us/docs/sdk/video/web/reference" target="_blank" rel="noreferrer">
            <span>API Reference</span>
          </a>

          <a href="https://marketplace.zoom.us/docs/sdk/video/web/build/sample-app" target="_blank" rel="noreferrer">
            <span>Doc</span>
          </a>
        </div>
        {actionText && (
          <Button type="link" className="navleave" onClick={onLeaveOrJoinSession}>
            {actionText}
          </Button>
        )}
      </div>
      {status === 'connected' ? (
        <div className="home">
          <h1>Zoom Video SDK feature</h1>
          <div className="feature-entry">
            {featureList.map((feature) => {
              const { key, icon, title, description } = feature;
              return (
                <Card
                  cover={<IconFont style={{ fontSize: '72px' }} type={icon} />}
                  hoverable
                  style={{ width: 320 }}
                  className="entry-item"
                  key={key}
                  onClick={() => onCardClick(key)}
                >
                  <Meta title={title} description={description} />
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="container-entrance">
          <form action="#">
            <div className="row">
              <label htmlFor="input-topic">topic</label>
              <input type="text" id="input-topic" name="topic" onChange={(e) => joinDataOnChange(e)} />
            </div>
            <div className="row">
              <label htmlFor="input-name">name</label>
              <input type="text" id="input-name" name="name" onChange={(e) => joinDataOnChange(e)} />
            </div>
            <div className="row">
              <label htmlFor="input-password">password</label>
              <input type="password" id="input-password" name="password" onChange={(e) => joinDataOnChange(e)} />
            </div>
            <div className="row">
              <label htmlFor="input-token">password</label>
              <input type="password" id="input-token" name="token" onChange={(e) => joinDataOnChange(e)} />
            </div>
            <div className="row">
              <label htmlFor="dropdown-user-type">구분</label>
              <select id="dropdown-user-type" name="role" onChange={(e) => joinDataOnChange(e)}>
                <option>학생</option>
                <option>강사</option>
              </select>
            </div>
            <input type="submit" value="join" onClick={() => onLeaveOrJoinSession(joinData)} />
          </form>
        </div>
      )}
    </div>
  );
};
export default Home;
