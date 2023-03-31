import { useCallback, useEffect, useState, MutableRefObject } from 'react';
import { getVideoLLayout } from '../video-l-layout-helper';
import { getVideoHorizonLayout } from '../video-horizon-layout-helper';
import { getVideoGridLayout } from '../video-grid-layout-helper';
import { useRenderVideo } from './useRenderVideo';
import { Dimension, Pagination, CellLayout } from '../video-types';
import { ZoomClient, MediaStream, Participant } from '../../../index-types';
import { useStore } from '../../../stores/zustand-store';
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
  const { videoLayoutBtn, clickedAvatar, clickToggle, setClcickToggle } = useStore();
  let size = pageSize;
  if (page === totalPage - 1) {
    size = Math.min(size, totalSize % pageSize || size);
  }

  // useEffect(() => {
  //   setLayout(getVideoLayout(dimension.width, dimension.height, size));
  // }, [dimension, size]);

  useEffect(() => {
    if (videoLayoutBtn === 0) {
      setLayout(getVideoGridLayout(dimension.width, dimension.height, size));
    }
    if (videoLayoutBtn === 1) {
      setLayout(getVideoHorizonLayout(dimension.width, dimension.height, size));
    }
    if (videoLayoutBtn === 2) {
      setLayout(getVideoLLayout(dimension.width, dimension.height, size));
    }
  }, [dimension, size, videoLayoutBtn]);

  // useEffect(() => {
  //   if (layout) console.log('useGalleryLayout layout', layout);
  // }, [layout]);

  useEffect(() => {
    if (clickToggle) {
      let newArr = visibleParticipants;
      console.log('newArr:', newArr);
      // 클릭된 index(id)
      console.log('clickedAvatar:', clickedAvatar);
      // 유저 배열에서, 클릭된 인덱스 원소만 추출
      const clickedId = visibleParticipants[Number(clickedAvatar)];
      console.log('clickedId:', clickedId);
      const mainAvatar = newArr.splice(Number(clickedAvatar), 1);
      console.log('newArr:', newArr);
      console.log('mainAvatar:', mainAvatar);
      /**
       * 임시로 displayName 으로 정렬함. (유저 네임을 인덱스 번호로 지정하여 테스트)
       * visibleParticipants 에 key or userId 값을 추가 후, 추가 한 값으로 정렬하는 방향으로..
       */
      const sortNewArr = newArr.sort((user1, user2) => Number(user1.displayName) - Number(user2.displayName));
      newArr = [...mainAvatar, ...sortNewArr];
      setVisibleParticipants(newArr);
      setClcickToggle(false);
    }
  }, [clickToggle, clickedAvatar, visibleParticipants]);

  const onParticipantsChange = useCallback(() => {
    const participants = zmClient.getAllUser();
    const currentUser = zmClient.getCurrentUserInfo();
    if (currentUser && participants.length > 0) {
      let pageParticipants: any[] = [];
      if (participants.length === 1) {
        pageParticipants = participants;
      } else {
        pageParticipants = participants
          .filter((user) => user.userId !== currentUser.userId)
          .sort((user1, user2) => Number(user2.bVideoOn) - Number(user1.bVideoOn));
        pageParticipants.splice(1, 0, currentUser);
        pageParticipants = pageParticipants.filter((_user, index) => Math.floor(index / pageSize) === page);
      }
      setVisibleParticipants(pageParticipants);
      const videoParticipants = pageParticipants.filter((user) => user.bVideoOn).map((user) => user.userId);
      setSubscribedVideos(videoParticipants);
    }
  }, [zmClient, page, pageSize]);
  useEffect(() => {
    zmClient.on('user-added', onParticipantsChange);
    zmClient.on('user-removed', onParticipantsChange);
    zmClient.on('user-updated', onParticipantsChange);
    return () => {
      zmClient.off('user-added', onParticipantsChange);
      zmClient.off('user-removed', onParticipantsChange);
      zmClient.off('user-updated', onParticipantsChange);
    };
  }, [zmClient, onParticipantsChange]);
  useEffect(() => {
    onParticipantsChange();
  }, [onParticipantsChange]);

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
