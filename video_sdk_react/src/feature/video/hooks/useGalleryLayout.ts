import { useCallback, useEffect, useState, MutableRefObject } from 'react';
import { getVideoLayout_2 } from '../video-layout-helper-2';
import { getVideoLayout_1 } from '../video-layout-helper-1';
import { getVideoLayout_0 } from '../video-layout-helper-0';
import { useRenderVideo } from './useRenderVideo';
import { Dimension, Pagination, CellLayout } from '../video-types';
import { ZoomClient, MediaStream, Participant } from '../../../index-types';
import { useParticipantsChange } from './useParticipantsChange';
import { useStore } from '../../../store/store';
/**
 * Default order of video:
 *  1. video's participants first
 *  2. self on the second position
 */
export function useGalleryLayout(
  zmClient: ZoomClient,
  mediaStream: MediaStream | null,
  isVideoDecodeReady: boolean,
  videoRef: MutableRefObject<HTMLCanvasElement | null>,
  dimension: Dimension,
  pagination: Pagination
) {
  const [visibleParticipants, setVisibleParticipants] = useState<Participant[]>([]);
  const [layout, setLayout] = useState<CellLayout[]>([]);
  const [subscribedVideos, setSubscribedVideos] = useState<number[]>([]);
  const { page, pageSize, totalPage, totalSize } = pagination;
  let size = pageSize;
  if (page === totalPage - 1) {
    size = Math.min(size, totalSize % pageSize || size);
  }
  const { videoLayoutBtn } = useStore();
  useEffect(() => {
    if (videoLayoutBtn === 0) {
      setLayout(getVideoLayout_0(dimension.width, dimension.height, size));
    }
    if (videoLayoutBtn === 1) {
      setLayout(getVideoLayout_1(dimension.width, dimension.height, size));
    }
    if (videoLayoutBtn === 2) {
      setLayout(getVideoLayout_2(dimension.width, dimension.height, size));
    }
  }, [dimension, size, videoLayoutBtn]);

  useEffect(() => {
    if (layout) console.log('useGalleryLayout layout', layout);
  }, [layout]);

  const onParticipantsChange = useCallback(
    (participants: Participant[]) => {
      const currentUser = zmClient.getCurrentUserInfo();
      if (currentUser && participants.length > 0) {
        let pageParticipants: Participant[] = [];
        pageParticipants = participants;
        if (participants.length === 1) {
          pageParticipants = participants;
        } else {
          pageParticipants = participants
            .filter((user) => user.userId !== currentUser.userId)
            .sort((user1, user2) => Number(user2.bVideoOn) - Number(user1.bVideoOn));
          // pageParticipants.splice(1, 0, currentUser);
          pageParticipants.splice(0, 0, currentUser);
          pageParticipants = pageParticipants.filter((_user, index) => Math.floor(index / pageSize) === page);
        }
        console.log('onParticipantsChange pageParticipants', pageParticipants);
        setVisibleParticipants(pageParticipants);
        const videoParticipants = pageParticipants.filter((user) => user.bVideoOn).map((user) => user.userId);
        setSubscribedVideos(videoParticipants);
      }
    },
    [zmClient, page, pageSize]
  );
  useParticipantsChange(zmClient, onParticipantsChange);

  useRenderVideo(
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    layout,
    subscribedVideos,
    visibleParticipants,
    zmClient.getCurrentUserInfo()?.userId
  );
  return {
    visibleParticipants,
    layout
  };
}
