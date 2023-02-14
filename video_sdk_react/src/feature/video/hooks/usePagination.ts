import { useState, useCallback, useEffect } from 'react';
import { maxViewportVideoCounts } from '../video-layout-helper-2';
import { useMount } from '../../../hooks';
import { Dimension } from '../video-types';
import { ZoomClient } from '../../../index-types';
import { useStore } from '../../../store/store';
let MAX_NUMBER_PER_PAGE = 25;
export function usePagination(zmClient: ZoomClient, dimension: Dimension) {
  const { videoLayoutBtn } = useStore();
  const [page, setPage] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  if (videoLayoutBtn === 1) {
    MAX_NUMBER_PER_PAGE = 6;
  }
  const [pageSize, setPageSize] = useState(MAX_NUMBER_PER_PAGE);
  useEffect(() => {
    console.log('dimension.width', dimension.width);
    console.log('dimension.height', dimension.height);
    const size = Math.min(MAX_NUMBER_PER_PAGE, maxViewportVideoCounts(dimension.width, dimension.height));
    setPageSize(size);
  }, [dimension]);
  const onParticipantsChange = useCallback(() => {
    setTotalSize(zmClient.getAllUser().length);
  }, [zmClient]);
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
  useMount(() => {
    setTotalSize(zmClient.getAllUser().length);
  });

  // test
  useEffect(() => {
    console.log('usePagination page', page);
  }, [page]);
  return {
    page,
    totalPage: Math.ceil(totalSize / pageSize),
    pageSize,
    totalSize,
    setPage
  };
}
