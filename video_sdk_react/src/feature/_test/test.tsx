import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import './test.scss';
import { RouteComponentProps } from 'react-router-dom';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';

const Test: React.FunctionComponent<RouteComponentProps> = () => {
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady }
  } = useContext(ZoomMediaContext);
  return (
    <div className="test-container">
      {/* Other users */}
      <div className="users-container">users-container</div>
      {/* Cam, Chat */}
      <div className="middle-container">
        {/* My cam */}
        <div className="test-mycam-container">mycam</div>
        {/* Chatting */}
        <div className="test-chat-container">chat</div>
      </div>
      {/* Footer menu */}
      <div className="footer-container">footer</div>
    </div>
  );
};

export default Test;
