import { team_images, project_view } from '@mocks/data/viewer';
import { comment_list } from '@mocks/data/comment';
import { API_BASE_URL } from '@constants/env';
import { http, HttpResponse } from 'msw';

let currentProject = { ...project_view };
let comments = [...comment_list];

export const imageViewHandler = [
  http.get(`${API_BASE_URL}/api/teams/:teamId/images`, ({ params }) => {
    const parsedTeamId = Number(params.teamId);
    const images = team_images.filter((img) => img.teamId === parsedTeamId);
    return HttpResponse.json(images);
  }),
  http.get(`${API_BASE_URL}/api/teams/:teamId/image/:imageId`, ({ params }) => {
    const parsedTeamId = Number(params.teamId);
    const parsedImageId = Number(params.imageId);
    const image = team_images.find((img) => img.teamId === parsedTeamId && img.imageId === parsedImageId);

    if (!image) {
      return HttpResponse.json({ message: 'Image not found' }, { status: 404 });
    }

    return HttpResponse.json(null, { status: 200 });
  }),
];

export const projectViewHandler = [
  http.get(`${API_BASE_URL}/api/teams/:teamId`, ({ params }) => {
    const parsedTeamId = Number(params.teamId);

    if (parsedTeamId !== currentProject.teamId) {
      return HttpResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    return HttpResponse.json(currentProject);
  }),
  http.patch(`${API_BASE_URL}/api/teams/:teamId/like`, async ({ request, params }) => {
    const parsedTeamId = Number(params.teamId);

    if (parsedTeamId !== currentProject.teamId) {
      return HttpResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    const body = (await request.json()) as { isLiked: boolean };
    currentProject = { ...currentProject, isLiked: body.isLiked };

    return HttpResponse.json({
      teamId: parsedTeamId,
      isLiked: body.isLiked,
      message: 'OK',
      remainingLikeCount: 10,
      maxLikeCount: 10,
    });
  }),
  http.get(`${API_BASE_URL}/api/teams/:teamId/comments`, ({ params }) => {
    const parsedTeamId = Number(params.teamId);
    const teamComments = comments.filter((comment) => comment.teamId === parsedTeamId);
    return HttpResponse.json(teamComments);
  }),
  http.post(`${API_BASE_URL}/api/teams/:teamId/comments`, async ({ request, params }) => {
    const parsedTeamId = Number(params.teamId);
    const body = (await request.json()) as { description: string };

    const newCommentId = comments.length ? comments[comments.length - 1].commentId + 1 : 1;
    const newComment = {
      commentId: newCommentId,
      description: body.description,
      memberId: 0,
      memberName: '테스트 사용자',
      teamId: parsedTeamId,
    };

    comments = [...comments, newComment];

    return HttpResponse.json(newComment, { status: 201 });
  }),
  http.delete(`${API_BASE_URL}/api/teams/:teamId/comments/:commentId`, ({ params }) => {
    const parsedTeamId = Number(params.teamId);
    const parsedCommentId = Number(params.commentId);

    comments = comments.filter(
      (comment) => !(comment.teamId === parsedTeamId && comment.commentId === parsedCommentId),
    );

    return HttpResponse.json(null, { status: 204 });
  }),
  http.patch(`${API_BASE_URL}/api/teams/:teamId/comments/:commentId`, async ({ request, params }) => {
    const parsedTeamId = Number(params.teamId);
    const parsedCommentId = Number(params.commentId);
    const body = (await request.json()) as { description: string };

    comments = comments.map((comment) => {
      if (comment.teamId === parsedTeamId && comment.commentId === parsedCommentId) {
        return { ...comment, description: body.description };
      }
      return comment;
    });

    const updated = comments.find(
      (comment) => comment.teamId === parsedTeamId && comment.commentId === parsedCommentId,
    );

    return HttpResponse.json({ description: updated?.description ?? body.description });
  }),
];

export const viewerHandlers = [...imageViewHandler, ...projectViewHandler];
