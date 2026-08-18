export interface CurrentEventTopic {
  id: string;
  title: string;
  category: string;
  promptGuidance: string;
}

export const CURRENT_EVENT_TOPICS: CurrentEventTopic[] = [
  {
    id: "ai-evolution-jobs",
    title: "AI技術の急速な進化と人間の仕事の未来",
    category: "技術",
    promptGuidance: "AIや自動化技術が急速に進化し、人間の創造性や雇用のあり方が再定義されつつあることについて。"
  },
  {
    id: "sns-overconnectedness",
    title: "SNSの常時接続と現代人の孤独・メンタルヘルス",
    category: "社会",
    promptGuidance: "24時間誰かとつながり通知に追われる現代社会で、逆に深まる孤独や『一人になる時間（デジタルデトックス）』の重要性について。"
  },
  {
    id: "climate-change-future",
    title: "異常気象の常態化と地球環境の未来",
    category: "社会",
    promptGuidance: "世界中で多発する猛暑や豪雨などの異常気象と、私たちが次の世代に何を残せるのかという環境倫理について。"
  },
  {
    id: "time-performance-taipa",
    title: "タイパ（時間対効果）至上主義と『無駄や余白』の価値",
    category: "哲学",
    promptGuidance: "倍速視聴や要約ツールなど効率化ばかりが追求される世の中で、あえて遠回りすることや『無駄な時間』の中に宿る豊かさについて。"
  },
  {
    id: "remote-work-community",
    title: "テレワーク・地方移住とリアルな人間関係の希薄化",
    category: "人生",
    promptGuidance: "働く場所が自由になった一方で、職場の雑談や地域社会との対面での温かみが失われつつある変化について。"
  },
  {
    id: "cashless-and-digital-economy",
    title: "完全キャッシュレス社会と『お金の重み・実体』の変容",
    category: "社会",
    promptGuidance: "紙幣や硬貨を使わないデジタル決済の普及により、労働やお金の物理的な手応えが薄れている感覚について。"
  },
  {
    id: "space-commercialization",
    title: "民間宇宙旅行の幕開けと地球を見つめ直す視点",
    category: "時事",
    promptGuidance: "宇宙開発が国家から民間へとシフトし、一般人が宇宙へ行ける時代における、地球の儚さや生命の神秘について。"
  },
  {
    id: "declining-birthrate-aging",
    title: "少子高齢化とこれからの『家族・支え合い』の形",
    category: "人生",
    promptGuidance: "家族のあり方が多様化し、血縁だけでなくコミュニティや他者とどのように孤独を防ぎ支え合っていくかについて。"
  }
];

export function getRandomCurrentEvent(): CurrentEventTopic {
  return CURRENT_EVENT_TOPICS[Math.floor(Math.random() * CURRENT_EVENT_TOPICS.length)];
}
