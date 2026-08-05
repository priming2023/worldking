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

/** 추석·민속놀이 퀴즈 10개 + 위치 (관리자에서 수정 가능) */
export const MISSION_STEPS_SEED: MissionStepSeed[] = [
  step(1, "추석에 먹는 대표 음식, 밤·콩·깨를 넣어 찐 떡", "송편", "레이스장"),
  step(2, "네 개의 막대를 던져서 하는 전통 놀이", "윷놀이", "정수기 근처 구급함", [
    ["윷"],
    ["놀", "이"],
  ]),
  step(3, "추석 밤에 달을 보며 소원을 빌어요. 보름달을?", "감사", "화장실 앞 (안으로 들어가진 않아요.)"),
  step(4, "추석에 입는 한복에서 여자가 입는 치마", "치마", "공룡게임기"),
  step(5, "송편을 빚을 때 동그랗게 만드는 모양, 달을 닮았어요", "보름달", "2층 이용안내"),
  step(6, "윷놀이에서 '윷'이 네 개 모두 앞면일 때 나오는 이름", "윷", "119기둥"),
  step(7, "추석에 조상님께 차례를 지낼 때 올리는 과일 중 하나, 둥글고 붉은", "감", "Toy창틀"),
  step(8, "민속놀이, 줄 위에서 앞뒤로 왔다 갔다 하는 놀이", "그네", "photo앞"),
  step(9, "추석은 음력 몇 월 보름날? (숫자+월)", "8월", "AI사진관 근처"),
  step(10, "추석에 가족이 모여 함께 하는 말, '한가위'의 다른 이름", "추석", "2층 엘레베이터 앞"),
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
