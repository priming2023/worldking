import type { AnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { serializeAnswerDisplay, answerToDisplay } from "@/lib/chuseok/answer-pattern";
import { expectedCodeForStep } from "@/lib/chuseok/codes";

export type MissionStepSeed = {
  stepOrder: number;
  question: string;
  answer: string;
  answerDisplay: AnswerDisplay;
  locationHint: string;
};

function step(
  order: number,
  question: string,
  answer: string,
  locationHint: string,
  display?: AnswerDisplay,
): MissionStepSeed {
  return {
    stepOrder: order,
    question,
    answer,
    answerDisplay: display ?? answerToDisplay(answer),
    locationHint,
  };
}

/**
 * 추석 퀴즈 확정본 (관리자 최종 저장 백업)
 * 복구: npx tsx scripts/restore-chuseok-steps.ts
 */
export const MISSION_STEPS_SEED: MissionStepSeed[] = [
  step(
    1,
    "추석에 먹는 대표적인 둥근 모양의 떡은 무엇일까요?",
    "송편",
    "🏁 레이스장",
  ),
  step(
    2,
    "네 개의 막대를 던져서 하는 전통 놀이는 무엇일까요?",
    "윷놀이",
    "🩹 정수기 근처 구급함",
    [["윷", "놀", "이"]],
  ),
  step(3, "추석 밤에 뜨는 둥근 달은?", "보름달", "🚻 화장실 앞 (안으로 들어가진 않아요.)"),
  step(4, "추석은 음력 O월 OO일 일까요?", "815", "🦕 공룡게임기", [["8", "1", "5"]]),
  step(
    5,
    "추석을 한자어로 부를 때 자주 쓰는 이름은 무엇일까요?",
    "한가위",
    "📋 2층 이용안내",
  ),
  step(
    6,
    "해충을 없애고 풍년을 기원하며 불을 놓던 정월대보름 전통놀이는 무엇일까요?",
    "쥐불놀이",
    "🚒 119기둥",
  ),
  step(
    7,
    "발로만 차서 떨어뜨리지 않고 오래하는 놀이는 무엇일까요?",
    "제기차기",
    "🧸 Toy창틀",
  ),
  step(
    8,
    "추석에 조상님께 감사드리는 아침에 드리는 제사를 무엇이라고 할까요?",
    "차례",
    "📸 photo앞",
  ),
  step(
    9,
    "추석 밤, 둥근 달 아래에서 손을 잡고 빙글빙글 원을 그리며 노는 전통놀이는 무엇일까요?",
    "강강술래",
    "🤖 AI사진관 근처",
  ),
  step(
    10,
    "추석에 온 가족이 함께 와서 신나게 놀 수 있는 놀이동산은 어디일까요?",
    "월드킹",
    "🛗 2층 엘레베이터 앞",
  ),
];

export function seedStepToDb(stepData: MissionStepSeed) {
  return {
    stepOrder: stepData.stepOrder,
    question: stepData.question,
    answer: stepData.answer,
    answerDisplay: serializeAnswerDisplay(stepData.answerDisplay),
    locationHint: stepData.locationHint,
    qrCode: expectedCodeForStep(stepData.stepOrder),
  };
}
