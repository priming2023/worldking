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

/** 할로윈 귀신·괴물 퀴즈 10개 + 위치 (관리자에서 수정 가능) */
export const MISSION_STEPS_SEED: MissionStepSeed[] = [
  step(1, "할로윈에 웃는 얼굴을 그려 넣는, 주황색 동그란 채소", "호박", "🏁 레이스장"),
  step(2, "하얀 천을 뒤집어쓰고 '으으~' 하는 귀신", "유령", "🩹 정수기 근처 구급함"),
  step(3, "밤에 날아다니고, 거꾸로 매달려 자는 동물", "박쥐", "🚻 화장실 앞 (안으로 들어가진 않아요.)"),
  step(4, "빗자루를 타고 하늘을 나는 모자 쓴 마법사(여자)", "마녀", "🦕 공룡게임기"),
  step(5, "밤에만 나오고, 이빨이 길고, 피를 좋아한다는 괴물", "뱀파이어", "📋 2층 이용안내", [
    ["뱀", "파", "이", "어"],
  ]),
  step(6, "천천히 걸어 다니며 '으아~' 하는, 되살아난 시체 괴물", "좀비", "🚒 119기둥"),
  step(7, "보름달이 뜨면 늑대로 변하는 사람", "늑대인간", "🧸 Toy창틀", [
    ["늑", "대"],
    ["인", "간"],
  ]),
  step(8, "붕대를 온몸에 감고 있는, 이집트에서 온 듯한 괴물", "미라", "📸 photo앞"),
  step(9, "뼈만 남은 모습으로 움직이는 것", "해골", "🤖 AI사진관 근처"),
  step(10, "초록 얼굴에 머리에 나사 볼트가 있는 큰 괴물 이름", "프랑켄슈타인", "🛗 2층 엘레베이터 앞", [
    ["프", "랑", "켄"],
    ["슈", "타", "인"],
  ]),
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
