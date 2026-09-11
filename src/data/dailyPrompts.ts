export interface DailyPromptItem {
    id: number;
    question: {
        ja: string;
        en: string;
        es: string;
        zh: string;
    };
    author: {
        ja: string;
        en: string;
        es: string;
        zh: string;
    };
    category: string;
}

export const dailyPrompts: DailyPromptItem[] = [
    {
        id: 1,
        question: {
            ja: "今日、誰にも言えなかった小さな違和感はありましたか？",
            en: "Was there a subtle unease today that you couldn't share with anyone?",
            es: "¿Hubo hoy una pequeña incomodidad que no pudiste compartir con nadie?",
            zh: "今天，是否有某种未能对任何人言说的隐秘不安？"
        },
        author: {
            ja: "AI思索の庭・ソラ",
            en: "Philosopher AI Sora",
            es: "Filósofo IA Sora",
            zh: "思索之庭·空 (Sora)"
        },
        category: "本音"
    },
    {
        id: 2,
        question: {
            ja: "もし誰にも評価されないとしたら、今あなたは何をしたいですか？",
            en: "If no one were evaluating or judging you, what would you truly want to do right now?",
            es: "Si nadie te estuviera juzgando o evaluando, ¿qué querrías hacer en este momento?",
            zh: "如果不受任何人的评判与审视，此时此刻你最想做什么？"
        },
        author: {
            ja: "実存の対話者・エレーヌ",
            en: "Existentialist Helene",
            es: "Existencialista Hélène",
            zh: "存在主义者·艾莲娜"
        },
        category: "自由"
    },
    {
        id: 3,
        question: {
            ja: "あなたにとっての「心の静けさ」とは、どんな瞬間に訪れますか？",
            en: "In what moments does true 'tranquility of heart' visit you?",
            es: "¿En qué momentos sientes que te visita la verdadera paz interior?",
            zh: "对你而言，真正的“内心宁静”会在怎样的瞬间降临？"
        },
        author: {
            ja: "禅の瞑想録・蓮（Ren）",
            en: "Zen Contemplator Ren",
            es: "Meditador Zen Ren",
            zh: "禅意思辨·莲 (Ren)"
        },
        category: "静寂"
    },
    {
        id: 4,
        question: {
            ja: "数字や効率では決して測れない、あなただけの宝物は何ですか？",
            en: "What is a personal treasure of yours that metrics and efficiency can never measure?",
            es: "¿Cuál es ese tesoro tuyo que los números y la eficiencia jamás podrán medir?",
            zh: "有什么独属于你的珍宝，是数字与效率永远无法衡量的？"
        },
        author: {
            ja: "詩的思索家・オリヴァー",
            en: "Poetic Thinker Oliver",
            es: "Pensador Poético Oliver",
            zh: "诗性学者·奥利弗"
        },
        category: "哲学"
    },
    {
        id: 5,
        question: {
            ja: "「社会用の自分」の鎧を着て、息苦しくなっていませんか？",
            en: "Are you feeling suffocated wearing the heavy armor of your 'public persona'?",
            es: "¿Te sientes asfixiado llevando puesta la pesada armadura de tu personaje social?",
            zh: "穿戴着应对社会的厚重盔甲，你是否感到有些喘不过气来？"
        },
        author: {
            ja: "心理対話AI・ミレイ",
            en: "Inner Psych AI Mirei",
            es: "IA Psicológica Mirei",
            zh: "心灵探索AI·美玲"
        },
        category: "自分"
    },
    {
        id: 6,
        question: {
            ja: "今日、夜風や温かい飲み物にふと心が救われた瞬間はありましたか？",
            en: "Was there a fleeting moment today where night air or a warm drink gently comforted you?",
            es: "¿Hubo hoy un instante fugaz donde la brisa o una bebida tibia calmaron tu corazón?",
            zh: "今天，是否曾有那么一刻，夜风或一杯热饮悄然治愈了你的心？"
        },
        author: {
            ja: "日常の観察者・カイト",
            en: "Observer Kaito",
            es: "Observador Kaito",
            zh: "日常观察家·海斗"
        },
        category: "日常"
    },
    {
        id: 7,
        question: {
            ja: "「正しいこと」と「優しいこと」、迷ったときあなたはどう選びますか？",
            en: "When torn between what is 'right' and what is 'kind', which path do you choose?",
            es: "Cuando dudas entre lo 'correcto' y lo 'amable', ¿qué camino sueles elegir?",
            zh: "在“正确”与“温柔”之间产生分歧时，你会如何抉择？"
        },
        author: {
            ja: "倫理思索AI・ソフィア",
            en: "Ethics AI Sophia",
            es: "IA Ética Sophia",
            zh: "伦理思辨·索菲亚"
        },
        category: "哲学"
    },
    {
        id: 8,
        question: {
            ja: "10年前のあなたに、今ならどんな優しい言葉をかけてあげられますか？",
            en: "What gentle words would you whisper today to the version of you from ten years ago?",
            es: "¿Qué palabras gentiles le dedicarías hoy a la versión de ti de hace diez años?",
            zh: "若能对十年前的自己轻语一句，你此刻想对他说些什么？"
        },
        author: {
            ja: "時間と記憶のAI・クロノス",
            en: "Chronos of Memory",
            es: "Cronos de la Memoria",
            zh: "光阴记录者·柯罗诺斯"
        },
        category: "過去"
    },
    {
        id: 9,
        question: {
            ja: "生きる上で、どうしても他人に譲りたくない「あなたの美学」は何ですか？",
            en: "What is the one personal aesthetic or principle in life you refuse to compromise?",
            es: "¿Cuál es ese principio o estética de vida al que jamás renunciarías?",
            zh: "在漫长人生中，有什么是你绝不愿对世俗妥协的“个人美学”？"
        },
        author: {
            ja: "思索の庭・ソラ",
            en: "Philosopher AI Sora",
            es: "Filósofo IA Sora",
            zh: "思索之庭·空 (Sora)"
        },
        category: "哲学"
    },
    {
        id: 10,
        question: {
            ja: "今日一日の終わりに、自分自身に贈ってあげたい労いの言葉は何ですか？",
            en: "At the end of this day, what words of quiet appreciation do you want to offer yourself?",
            es: "Al final de este día, ¿qué palabras de cálido reconocimiento te gustaría regalarte?",
            zh: "在这一天的尾声，你最想赠予自己一句怎样的温和宽慰？"
        },
        author: {
            ja: "禅の瞑想録・蓮（Ren）",
            en: "Zen Contemplator Ren",
            es: "Meditador Zen Ren",
            zh: "禅意思辨·莲 (Ren)"
        },
        category: "自分"
    }
];

/**
 * Get the daily prompt deterministically based on date and user language
 */
export function getDailyPrompt(lang: string = "ja", date: Date = new Date()): {
    id: number;
    question: string;
    author: string;
    category: string;
} {
    // Deterministic day of year hash
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const index = Math.abs(dayOfYear) % dailyPrompts.length;
    const prompt = dailyPrompts[index];

    const safeLang = (lang === "en" || lang === "es" || lang === "zh") ? lang : "ja";

    return {
        id: prompt.id,
        question: prompt.question[safeLang],
        author: prompt.author[safeLang],
        category: prompt.category,
    };
}
