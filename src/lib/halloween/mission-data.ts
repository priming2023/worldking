import type { AnswerDisplay } from "@/lib/halloween/answer-pattern";
import { serializeAnswerDisplay, answerToDisplay } from "@/lib/halloween/answer-pattern";
import { expectedCodeForStep } from "@/lib/halloween/codes";

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
 * 할로윈 퀴즈 확정본 (관리자 최종 저장 백업)
 * 복구: npx tsx scripts/restore-halloween-steps.ts
 */
export const MISSION_STEPS_SEED: MissionStepSeed[] = [
  step(
    1,
    "할로윈에 웃는 얼굴을 그려 넣는, 주황색 동그란 채소는 무엇일까요?",
    "호박",
    "🏁 레이스장",
  ),
  step(
    2,
    "투명한 몸으로 밤에 나타나는 무서운 존재는 무엇일까요?",
    "유령",
    "🩹 정수기 근처 구급함",
  ),
  step(
    3,
    "밤에 날아다니고, 거꾸로 매달려 자는 동물은 무엇일까요?",
    "박쥐",
    "🚻 화장실 앞 (안으로 들어가진 않아요.)",
  ),
  step(
    4,
    "빗자루를 타고 하늘을 나는 마법을 쓰는 무서운 여자는 누구일까요?",
    "마녀",
    "🦕 공룡게임기",
  ),
  step(5, "이빨이 길고, 피를 좋아한다는 백작은?", "드라큘라", "📋 2층 이용안내"),
  step(
    6,
    "천천히 걸어 다니며 '으아~' 하는, 되살아난 시체 괴물은 무엇일까요?",
    "좀비",
    "🚒 119기둥",
  ),
  step(7, "보름달이 뜨면 늑대로 변하는 사람은?", "늑대인간", "🧸 Toy창틀", [
    ["늑", "대", "인", "간"],
  ]),
  step(
    8,
    "붕대를 온몸에 감고 있는, 이집트에서 온 듯한 괴물은?",
    "미라",
    "📸 photo앞",
  ),
  step(
    9,
    "초록 얼굴에 머리에 나사 볼트가 있는 큰 괴물 이름은?",
    "프랑켄슈타인",
    "🤖 AI사진관 근처",
    [["프", "랑", "켄", "슈", "타", "인"]],
  ),
  step(
    10,
    "할로윈에도 온 가족이 함께 와서 신나게 놀 수 있는 놀이동산은 어디일까요?",
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
