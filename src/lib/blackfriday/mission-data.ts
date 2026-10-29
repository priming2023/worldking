import type { AnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { serializeAnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { expectedCodeForStep } from "@/lib/blackfriday/codes";

export type BlackfridayStepSeed = {
  stepOrder: number;
  question: string;
  answer: string;
  answerDisplay: AnswerDisplay;
  locationHint: string;
  hint: string;
};

function step(
  order: number,
  question: string,
  answer: string,
  display: AnswerDisplay,
  locationHint: string,
  hint: string,
): BlackfridayStepSeed {
  return { stepOrder: order, question, answer, answerDisplay: display, locationHint, hint };
}

/**
 * 위치 힌트는 2026-10-29 기준 추석 관리자(/chuseok/admin) 저장값을 번호별로 복사.
 * 문제·정답·힌트는 블랙프라이데이 초안.
 */
export const BLACKFRIDAY_STEPS_SEED: BlackfridayStepSeed[] = [
  step(
    1,
    "월드킹 당진서산점이 있는 도시는 어디일까요?",
    "당진",
    [["당", "진"]],
    "🏁 레이스장 (애기손바닥크기 QR코드를 찾아보세요.)",
    "우리 가게 이름 뒤에 붙어 있어요!",
  ),
  step(
    2,
    "월드킹에서 신나게 놀 수 있는 층은 모두 몇 층일까요?",
    "2",
    [["2"]],
    "🩹 정수기 근처 구급함",
    "위를 한번 올려다보세요!",
  ),
  step(
    3,
    "월드킹은 저녁 몇 시에 문을 닫을까요?",
    "8",
    [["8"]],
    "🚻 화장실 앞 (안으로 들어가진 않아요.)",
    "저녁을 먹고 와도 놀 수 있는 시간이에요.",
  ),
  step(
    4,
    "아기들만 들어갈 수 있는 전용 공간은 몇 개월 미만 아기를 위한 곳일까요?",
    "36",
    [["3", "6"]],
    "🦕 공룡게임기 (1층 게임장에 있어요)",
    "3년을 개월로 바꾸면 몇 개월일까요?",
  ),
  step(
    5,
    "월드킹 파티룸 2시간 이용료는 얼마일까요?",
    "20000",
    [["2", "0", "0", "0", "0"]],
    "📋 2층 이용안내 (1층에 있어요)",
    "2로 시작하는 다섯 자리 숫자예요.",
  ),
  step(
    6,
    "블랙프라이데이는 무슨 요일에 열리는 날일까요?",
    "금요일",
    [["금", "요", "일"]],
    "🚒 119기둥 (이제 2층으로~~)",
    "'프라이데이'가 무슨 뜻일까요?",
  ),
  step(
    7,
    "월드킹 2시간 이용권 한 장은 원래 얼마일까요?",
    "14000",
    [["1", "4", "0", "0", "0"]],
    "🧸 Toy창틀",
    "1로 시작하는 다섯 자리 숫자예요.",
  ),
  step(
    8,
    "블랙프라이데이 기간에 이용권 10장을 80,000원에 사면, 한 장에 얼마일까요?",
    "8000",
    [["8", "0", "0", "0"]],
    "📸 photo앞",
    "80,000을 10으로 나눠보세요!",
  ),
  step(
    9,
    "월드킹 고객앱에서 모으면 선물로 바꿀 수 있는 것은 무엇일까요?",
    "코인",
    [["코", "인"]],
    "🤖 AI사진관 근처",
    "매장에서 쓰는 동그란 것이에요!",
  ),
  step(
    10,
    "11월, 온 가족이 함께 와서 신나게 놀 수 있는 놀이동산은 어디일까요?",
    "월드킹",
    [["월", "드", "킹"]],
    "🛗 2층 엘레베이터 앞",
    "지금 여기가 어디일까요?",
  ),
];

export function seedStepToDb(stepData: BlackfridayStepSeed) {
  return {
    stepOrder: stepData.stepOrder,
    question: stepData.question,
    answer: stepData.answer,
    answerDisplay: serializeAnswerDisplay(stepData.answerDisplay),
    locationHint: stepData.locationHint,
    hint: stepData.hint,
    qrCode: expectedCodeForStep(stepData.stepOrder),
  };
}
