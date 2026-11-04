import type { VoteReportDto } from '../../types/DTO/voteReportDto';

export const mockVoteReport: VoteReportDto = {
  contestName: '제6회 PNU 창의융합 SW 해커톤',
  voteStartAt: '2026-10-20T09:00:00',
  voteEndAt: '2026-10-21T18:00:00',
  isVoteEnded: true,
  aggregatedAt: '2026-10-29T14:00:00',
  maxVotesLimit: 3,
  totalVoters: 200,
  totalVotes: 280,
  averageVotesPerVoter: 1.4,
  teamCount: 4,
  averageVotesPerTeam: 70,
  zeroVoteTeamCount: 1,
  dailyVotes: [{ date: '2026-10-20', voterCount: 200, voteCount: 280 }],
  voteUsages: [
    { usedVotes: 1, voterCount: 120, ratio: 60 },
    { usedVotes: 2, voterCount: 80, ratio: 40 },
  ],
  hourlyVotes: [{ hour: '2026-10-20T10:00:00', voteCount: 280, cumulativeVoterCount: 200 }],
  voterRoles: [{ role: null, voterCount: 200, ratio: 100 }],
  admissionYears: [{ admissionYear: null, voterCount: 200, ratio: 100 }],
  trackVotes: [
    { trackName: 'SW 개발', teamCount: 2, voteCount: 200, averageVotesPerTeam: 100 },
    { trackName: null, teamCount: 2, voteCount: 80, averageVotesPerTeam: 40 },
  ],
  trackTopRankings: [],
  rankings: [
    {
      rank: 1,
      teamId: 1,
      teamName: '바다',
      projectName: '지역과 함께 만드는 접근성 지도',
      trackName: 'SW 개발',
      voteCount: 120,
    },
    {
      rank: 2,
      teamId: 2,
      teamName: '이어봄',
      projectName: '청년을 위한 지역 정보 서비스',
      trackName: 'SW 개발',
      voteCount: 80,
    },
    {
      rank: 2,
      teamId: 3,
      teamName: '이어봄',
      projectName: '일상을 기록하는 작은 도구',
      trackName: null,
      voteCount: 80,
    },
    { rank: 4, teamId: 4, teamName: '새로운 시작', projectName: '우리 동네 열린 공간', trackName: null, voteCount: 0 },
  ],
};

/** 실제 사용자 정보와 외부 자원이 없는 한 페이지 PDF. 미리보기/파일 수명 QA용입니다. */
export const createMockVoteReportPdf = () => {
  const stream =
    'BT /F1 20 Tf 50 760 Td (OPUS - QA vote report) Tj 0 -34 Td /F1 12 Tf (Synthetic data only. Total votes: 280) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let text = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(text.length);
    text += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = text.length;
  text += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  text += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('');
  text += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(text);
};
