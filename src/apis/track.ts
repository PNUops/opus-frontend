import apiClient from './apiClient';
import { PostContestTrackRequestDto, GetContestTracksResponseDto } from 'types/DTO';

export const getContestTracks = async (contestId: number): Promise<GetContestTracksResponseDto> => {
  const res = await apiClient.get<GetContestTracksResponseDto>(`/contests/${contestId}/tracks`);
  return res.data;
};

export const createContestTrack = async (contestId: number, payload: PostContestTrackRequestDto) => {
  const res = await apiClient.post(`/contests/${contestId}/tracks`, payload);
  return res.data;
};

export const updateContestTrack = async (contestId: number, trackId: number, payload: PostContestTrackRequestDto) => {
  const res = await apiClient.patch(`/contests/${contestId}/tracks/${trackId}`, payload);
  return res.data;
};

export const deleteContestTrack = async (contestId: number, trackId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}/tracks/${trackId}`);
  return res.data;
};
