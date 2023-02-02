import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import './transcription-subtitle.scss';
interface TranscriptionSubtitleProps {
  text?: string;
  userName?: string;
}
export const TranscriptionSubtitle = (props: TranscriptionSubtitleProps) => {
  const { text, userName } = props;
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<number>();
  // test
  useEffect(() => {
    if (text) {
      setVisible(true);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      // timerRef.current = window.setTimeout(() => {
      //   setVisible(false);
      // }, 3000);
    }
  }, [text]);
  return (
    <>
      <div className={classNames('transcript-subtitle', { 'transcript-subtitle-show': visible })}>
        {userName}:<p className="transcript-subtitle-message">{text}</p>
      </div>
      <div className={classNames('transcript-subtitle', { 'transcript-subtitle-show': visible })}>
        {userName}:<p className="transcript-subtitle-message">{text}</p>
      </div>
    </>
  );
};
