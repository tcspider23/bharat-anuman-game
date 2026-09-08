// Questions for the AI engine.
// Each question has a predicate that operates on a personality's `traits` record.
// The engine picks the question with highest expected information gain.

import type { Category, Personality } from "./knowledge";

export type Answer = "yes" | "no" | "probablyYes" | "probablyNo" | "dontKnow";

export type Question = {
  id: string;
  /** Restrict to certain categories; if empty, applies to all. */
  categories?: Category[];
  /** Predicate: true if the trait matches. */
  ask: (p: Personality) => boolean;
  /** Translation keys for the question in 4 languages. */
  text: {
    en: string;
    hi: string;
    hinglish: string;
    ta: string;
  };
  /** Why asking this question - used in "Why This Question?" */
  reasoning: {
    en: string;
    hi: string;
    hinglish: string;
    ta: string;
  };
  /** Priority: "broad" | "category" | "profession" | "specific" */
  stage: "broad" | "category" | "profession" | "specific";
  /** Optional trait to set when answered yes (for candidate narrowing). */
  traitKey?: string;
  /** Questions in the same group are redundant variants — the engine limits how many can be asked. */
  group?: string;
};

// Helper to make translation objects shorter
const t = (en: string, hi: string, hinglish: string, ta: string) => ({ en, hi, hinglish, ta });
const r = (en: string, hi: string, hinglish: string, ta: string) => ({ en, hi, hinglish, ta });

const BASE_QUESTIONS: Question[] = [
  // ============ BROAD / ERA / LIVING ============
  {
    id: "isLiving",
    text: t("Is this person currently alive?", "क्या यह व्यक्ति अब भी जीवित हैं?", "Kya ye person abhi bhi zinda hai?", "இந்த நபர் இப்போது உயிருடன் இருக்கிறாரா?"),
    reasoning: r("This separates recent from historical personalities, narrowing the era dramatically.", "यह हालिया और ऐतिहासिक हस्तियों को अलग करता है।", "Ye recent aur historical personalities ko alag karta hai.", "இது சமீபத்திய மற்றும் வரலாற்று நபர்களை பிரிக்கிறது."),
    ask: (p) => !!p.living,
    stage: "broad",
  },
  {
    id: "isMale",
    text: t("Is this person male?", "क्या यह व्यक्ति पुरुष हैं?", "Kya ye person male hai?", "இந்த நபர் ஆணா?"),
    reasoning: r("Splits the candidate pool roughly in half.", "उम्मीदवारों को आधा करता है।", "Candidates ko aadha karta hai.", "வேட்பாளர்களை பாதியாக பிரிக்கிறது."),
    ask: (p) => p.gender === "male",
    stage: "broad",
  },
  {
    id: "isContemporary",
    text: t("Is this person active in the last 20 years?", "क्या यह व्यक्ति पिछले 20 सालों से सक्रिय हैं?", "Kya ye person pichhle 20 saal se active hai?", "இந்த நபர் கடந்த 20 வருடங்களாக செயலில் இருக்கிறாரா?"),
    reasoning: r("Identifies modern vs historical personalities.", "आधुनिक और ऐतिहासिक हस्तियों को अलग करता है।", "Modern aur historical personalities ko alag karta hai.", "நவீன மற்றும் வரலாற்று நபர்களை பிரிக்கிறது."),
    ask: (p) => p.era === "contemporary" || p.era === "modern",
    stage: "broad",
  },
  {
    id: "isFreedomFighter",
    text: t("Was this person a freedom fighter?", "क्या यह व्यक्ति स्वतंत्रता सेनानी थे?", "Kya ye person freedom fighter the?", "இந்த நபர் சுதந்திர போராட்ட வீரரா?"),
    reasoning: r("Picks out freedom fighters, a very specific and small pool.", "स्वतंत्रता सेनानियों को अलग करता है।", "Freedom fighters ko alag karta hai.", "சுதந்திர போராட்ட வீரர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isFreedomFighter,
    stage: "category",
  },
  {
    id: "isPolitician",
    text: t("Is this person primarily known as a politician?", "क्या यह व्यक्ति मुख्य रूप से एक राजनेता हैं?", "Kya ye person primarily politician hain?", "இந்த நபர் முதன்மையாக அரசியல்வாதியா?"),
    reasoning: r("Splits politicians from non-politicians.", "राजनेताओं को अलग करता है।", "Politicians ko alag karta hai.", "அரசியல்வாதிகளை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isPolitician,
    stage: "profession",
  },
  {
    id: "isScientist",
    text: t("Is this person a scientist or researcher?", "क्या यह व्यक्ति एक वैज्ञानिक हैं?", "Kya ye person scientist hain?", "இந்த நபர் விஞ்ஞானியா?"),
    reasoning: r("Identifies scientists and researchers.", "वैज्ञानिकों की पहचान करता है।", "Scientists ki pehchaan karta hai.", "விஞ்ஞானிகளை அடையாளம் காட்டுகிறது."),
    ask: (p) => !!p.traits.isScientist,
    stage: "profession",
  },
  {
    id: "isActor",
    text: t("Is this person an actor or actress?", "क्या यह व्यक्ति एक अभिनेता/अभिनेत्री हैं?", "Kya ye person actor/actress hain?", "இந்த நபர் நடிகரா?"),
    reasoning: r("Identifies film/TV actors.", "अभिनेताओं की पहचान करता है।", "Actors ki pehchaan karta hai.", "நடிகர்களை அடையாளம் காட்டுகிறது."),
    ask: (p) => !!p.traits.isActor || !!p.traits.isActress,
    stage: "profession",
  },
  {
    id: "isSinger",
    text: t("Is this person a singer or musician?", "क्या यह व्यक्ति गायक या संगीतकार हैं?", "Kya ye person singer ya musician hain?", "இந்த நபர் பாடகரா?"),
    reasoning: r("Identifies singers and musicians.", "गायकों की पहचान करता है।", "Singers ki pehchaan karta hai.", "பாடகர்களை அடையாளம் காட்டுகிறது."),
    ask: (p) => !!p.traits.isSinger || !!p.traits.isMusicComposer,
    stage: "profession",
  },
  {
    id: "isCricketer",
    text: t("Is this person a cricketer?", "क्या यह व्यक्ति क्रिकेटर हैं?", "Kya ye person cricketer hain?", "இந்த நபர் கிரிக்கெட் வீரரா?"),
    reasoning: r("Cricket is a huge pool in India - this narrows quickly.", "क्रिकेट को अलग करता है।", "Cricket ko alag karta hai.", "கிரிக்கெட் வீரர்களை பிரிக்கிறது."),
    ask: (p) => p.category === "cricket",
    stage: "category",
  },
  {
    id: "isSportsperson",
    text: t("Is this person a sportsperson?", "क्या यह व्यक्ति एक खिलाड़ी हैं?", "Kya ye person khiladi hain?", "இந்த நபர் விளையாட்டு வீரரா?"),
    reasoning: r("Separates sportspersons from non-sportspersons.", "खिलाड़ियों को अलग करता है।", "Khiladiyon ko alag karta hai.", "விளையாட்டு வீரர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isSportsperson,
    stage: "category",
  },
  {
    id: "isBatsman",
    text: t("Is this cricketer primarily a batsman?", "क्या यह क्रिकेटर मुख्य रूप से बल्लेबाज है?", "Kya ye cricketer primarily batsman hai?", "இந்த கிரிக்கெட் வீரர் முதன்மையாக பேட்ஸ்மேனா?"),
    reasoning: r("Separates batsmen from bowlers and all-rounders.", "बल्लेबाजों को अलग करता है।", "Batsmen ko alag karta hai.", "பேட்ஸ்மேன்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isBatsman && !p.traits.isBowler && !p.traits.isAllRounder,
    stage: "specific",
    categories: ["cricket"],
  },
  {
    id: "isBowler",
    text: t("Is this cricketer primarily a bowler?", "क्या यह क्रिकेटर मुख्य रूप से गेंदबाज है?", "Kya ye cricketer primarily bowler hai?", "இந்த கிரிக்கெட் வீரர் முதன்மையாக பவுளரா?"),
    reasoning: r("Separates bowlers from other cricketers.", "गेंदबाजों को अलग करता है।", "Bowlers ko alag karta hai.", "பவுளர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isBowler && !p.traits.isAllRounder,
    stage: "specific",
    categories: ["cricket"],
  },
  {
    id: "isAllRounder",
    text: t("Is this cricketer an all-rounder?", "क्या यह क्रिकेटर ऑलराउंडर है?", "Kya ye cricketer all-rounder hai?", "இந்த கிரிக்கெட் வீரர் ஆல் ரவுண்டரா?"),
    reasoning: r("Identifies all-rounders in cricket.", "ऑलराउंडरों की पहचान करता है।", "All-rounders ki pehchaan karta hai.", "ஆல் ரவுண்டர்களை அடையாளம் காட்டுகிறது."),
    ask: (p) => !!p.traits.isAllRounder,
    stage: "specific",
    categories: ["cricket"],
  },
  {
    id: "isWicketkeeper",
    text: t("Is this cricketer a wicketkeeper?", "क्या यह क्रिकेटर विकेटकीपर है?", "Kya ye cricketer wicketkeeper hai?", "இந்த கிரிக்கெட் வீரர் விக்கெட் கீப்பரா?"),
    reasoning: r("Wicketkeepers are a smaller pool.", "विकेटकीपरों को अलग करता है।", "Wicketkeepers ko alag karta hai.", "விக்கெட் கீப்பர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isWicketkeeper,
    stage: "specific",
    categories: ["cricket"],
  },
  {
    id: "isCaptain",
    text: t("Has this cricketer captained the Indian team?", "क्या इस क्रिकेटर ने भारतीय टीम की कप्तानी की है?", "Kya is cricketer ne Indian team ki captaincy ki hai?", "இந்த கிரிக்கெட் வீரர் இந்திய அணியை வழிநடத்தியுள்ளாரா?"),
    reasoning: r("Captains are a smaller, elite pool.", "कप्तानों को अलग करता है।", "Captains ko alag karta hai.", "கேப்டன்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isCaptain,
    stage: "specific",
    categories: ["cricket"],
  },
  {
    id: "isIPL",
    text: t("Is this cricketer strongly associated with the IPL?", "क्या यह क्रिकेटर IPL से जुड़ा है?", "Kya ye cricketer IPL se juda hai?", "இந்த கிரிக்கெட் வீரர் IPL உடன் தொடர்புடையவரா?"),
    reasoning: r("Modern cricket stars tend to have IPL associations.", "IPL से जुड़े खिलाड़ियों की पहचान करता है।", "IPL se jude players ki pehchaan karta hai.", "IPL உடன் தொடர்புடைய வீரர்களை அடையாளம் காட்டுகிறது."),
    ask: (p) => !!p.traits.isIPLIcon,
    stage: "specific",
    categories: ["cricket"],
  },
  {
    id: "isWorldCupWinner",
    text: t("Did this cricketer win a Cricket World Cup?", "क्या इस क्रिकेटर ने क्रिकेट विश्व कप जीता है?", "Kya is cricketer ne Cricket World Cup jeeta hai?", "இந்த கிரிக்கெட் வீரர் கிரிக்கெட் உலகக் கோப்பையை வென்றாரா?"),
    reasoning: r("World Cup winners are a small elite pool.", "विश्व कप विजेताओं को अलग करता है।", "World Cup winners ko alag karta hai.", "உலகக் கோப்பை வென்றவர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isWorldCupWinner,
    stage: "specific",
    categories: ["cricket"],
  },
  {
    id: "isDirector",
    text: t("Is this person a film director?", "क्या यह व्यक्ति एक फिल्म निर्देशक हैं?", "Kya ye person film director hain?", "இந்த நபர் திரைப்பட இயக்குனரா?"),
    reasoning: r("Directors are a smaller pool than actors.", "निर्देशकों की पहचान करता है।", "Directors ki pehchaan karta hai.", "இயக்குனர்களை அடையாளம் காட்டுகிறது."),
    ask: (p) => !!p.traits.isDirector,
    stage: "profession",
  },
  {
    id: "isHindiCinema",
    text: t("Is this person primarily from Hindi cinema (Bollywood)?", "क्या यह व्यक्ति मुख्य रूप से हिंदी सिनेमा (बॉलीवुड) से हैं?", "Kya ye person primarily Hindi cinema (Bollywood) se hain?", "இந்த நபர் முதன்மையாக ஹிந்தி சினிமாவை சேர்ந்தவரா?"),
    reasoning: r("Separates Bollywood from regional cinema.", "बॉलीवुड को अलग करता है।", "Bollywood ko alag karta hai.", "பாலிவுட்டை பிரிக்கிறது."),
    ask: (p) => (p.traits.language === "hindi") && (p.category === "bollywood" || !!p.traits.isActor || !!p.traits.isActress),
    stage: "category",
  },
  {
    id: "isAwardBig",
    text: t("Has this person received the Bharat Ratna or a Nobel Prize?", "क्या इस व्यक्ति को भारत रत्न या नोबेल पुरस्कार मिला है?", "Kya is person ko Bharat Ratna ya Nobel mila hai?", "இந்த நபருக்கு பாரத ரத்னா அல்லது நோபல் விருது கிடைத்ததா?"),
    reasoning: r("Very few people have these top honors - very strong eliminator.", "सबसे बड़े पुरस्कारों को अलग करता है।", "Sabse bade awards ko alag karta hai.", "மிக உயர்ந்த விருதுகளை பிரிக்கிறது."),
    ask: (p) => p.traits.award === "bharatRatna" || p.traits.award === "nobel",
    stage: "specific",
  },
  {
    id: "isPadma",
    text: t("Has this person received a Padma award?", "क्या इस व्यक्ति को पद्म पुरस्कार मिला है?", "Kya is person ko Padma award mila hai?", "இந்த நபருக்கு பத்மா விருது கிடைத்ததா?"),
    reasoning: r("Padma awards are given to distinguished Indians.", "पद्म पुरस्कारों को अलग करता है।", "Padma awards ko alag karta hai.", "பத்மா விருதுகளை பிரிக்கிறது."),
    ask: (p) => {
      const a = p.traits.award;
      return a === "bharatRatna" || a === "padmaVibhushan" || a === "padmaBhushan" || a === "padmaShri";
    },
    stage: "specific",
  },
  {
    id: "isFounder",
    text: t("Is this person a founder or CEO of a major company?", "क्या यह व्यक्ति किसी बड़ी कंपनी के संस्थापक/CEO हैं?", "Kya ye person kisi badi company ke founder/CEO hain?", "இந்த நபர் ஒரு பெரிய நிறுவனத்தின் நிறுவனரா?"),
    reasoning: r("Separates business leaders from other professions.", "बिजनेस लीडर्स को अलग करता है।", "Business leaders ko alag karta hai.", "வணிக தலைவர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isFounder || !!p.traits.isCEO,
    stage: "profession",
  },
  {
    id: "isTech",
    text: t("Is this person associated with the tech/IT industry?", "क्या यह व्यक्ति तकनीक/IT उद्योग से जुड़े हैं?", "Kya ye person tech/IT industry se jude hain?", "இந்த நபர் ஐடி தொழில்துறையுடன் தொடர்புடையவரா?"),
    reasoning: r("Separates tech leaders from traditional business.", "टेक लीडर्स को अलग करता है।", "Tech leaders ko alag karta hai.", "டெக் தலைவர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isTechLeader,
    stage: "profession",
  },
  {
    id: "isYouTuber",
    text: t("Is this person a YouTuber or content creator?", "क्या यह व्यक्ति यूट्यूबर या कंटेंट क्रिएटर हैं?", "Kya ye person YouTuber ya content creator hain?", "இந்த நபர் யூடியூபரா?"),
    reasoning: r("Modern creators have a distinct profile.", "यूट्यूबर्स को अलग करता है।", "YouTubers ko alag karta hai.", "யூடியூபர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isYouTuber || !!p.traits.isCreator,
    stage: "profession",
  },
  {
    id: "isTV",
    text: t("Is this person primarily known from television?", "क्या यह व्यक्ति मुख्य रूप से टीवी से जाने जाते हैं?", "Kya ye person primarily TV se jaane jaate hain?", "இந்த நபர் முதன்மையாக தொலைக்காட்சியிலிருந்து அறியப்பட்டவரா?"),
    reasoning: r("TV personalities form a specific pool.", "टीवी हस्तियों को अलग करता है।", "TV personalities ko alag karta hai.", "தொலைக்காட்சி நபர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isTV,
    stage: "profession",
  },
  {
    id: "isOlympian",
    text: t("Has this person competed in the Olympics?", "क्या इस व्यक्ति ने ओलंपिक में भाग लिया है?", "Kya is person ne Olympics mein bhaag liya hai?", "இந்த நபர் ஒலிம்பிக்ஸில் பங்கேற்றாரா?"),
    reasoning: r("Olympians are an elite pool.", "ओलंपियंस को अलग करता है।", "Olympians ko alag karta hai.", "ஒலிம்பிக் வீரர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isOlympian,
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "isChampion",
    text: t("Is this person a world champion or Olympic medalist?", "क्या यह व्यक्ति विश्व चैंपियन या ओलंपिक पदक विजेता हैं?", "Kya ye person world champion ya Olympic medalist hain?", "இந்த நபர் உலக சாம்பியனா?"),
    reasoning: r("Champions are a smaller pool within sports.", "चैंपियंस को अलग करता है।", "Champions ko alag karta hai.", "சாம்பியன்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isChampion,
    stage: "specific",
  },
  {
    id: "sportBadminton",
    text: t("Is this person a badminton player?", "क्या यह व्यक्ति बैडमिंटन खिलाड़ी हैं?", "Kya ye person badminton player hain?", "இந்த நபர் பாட்மிண்டன் வீரரா?"),
    reasoning: r("Narrows down the sport.", "खेल को अलग करता है।", "Sport ko alag karta hai.", "விளையாட்டை பிரிக்கிறது."),
    ask: (p) => p.traits.sport === "badminton",
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "sportTennis",
    text: t("Is this person a tennis player?", "क्या यह व्यक्ति टेनिस खिलाड़ी हैं?", "Kya ye person tennis player hain?", "இந்த நபர் டென்னிஸ் வீரரா?"),
    reasoning: r("Narrows down the sport.", "खेल को अलग करता है।", "Sport ko alag karta hai.", "விளையாட்டை பிரிக்கிறது."),
    ask: (p) => p.traits.sport === "tennis",
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "sportBoxing",
    text: t("Is this person a boxer?", "क्या यह व्यक्ति एक बॉक्सर हैं?", "Kya ye person boxer hain?", "இந்த நபர் குத்துச்சண்டை வீரரா?"),
    reasoning: r("Narrows down the sport.", "खेल को अलग करता है।", "Sport ko alag karta hai.", "விளையாட்டை பிரிக்கிறது."),
    ask: (p) => p.traits.sport === "boxing",
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "sportWrestling",
    text: t("Is this person a wrestler?", "क्या यह व्यक्ति पहलवान हैं?", "Kya ye person wrestler hain?", "இந்த நபர் மல்யுத்த வீரரா?"),
    reasoning: r("Narrows down the sport.", "खेल को अलग करता है।", "Sport ko alag karta hai.", "விளையாட்டை பிரிக்கிறது."),
    ask: (p) => p.traits.sport === "wrestling",
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "sportAthletics",
    text: t("Is this person from athletics (track and field)?", "क्या यह व्यक्ति एथलेटिक्स से हैं?", "Kya ye person athletics se hain?", "இந்த நபர் தடகள விளையாட்டு வீரரா?"),
    reasoning: r("Narrows down the sport.", "खेल को अलग करता है।", "Sport ko alag karta hai.", "விளையாட்டை பிரிக்கிறது."),
    ask: (p) => p.traits.sport === "athletics",
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "sportShooting",
    text: t("Is this person a shooter?", "क्या यह व्यक्ति एक निशानेबाज हैं?", "Kya ye person shooter hain?", "இந்த நபர் துப்பாக்கி சுடுபவரா?"),
    reasoning: r("Narrows down the sport.", "खेल को अलग करता है।", "Sport ko alag karta hai.", "விளையாட்டை பிரிக்கிறது."),
    ask: (p) => p.traits.sport === "shooting",
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "sportChess",
    text: t("Is this person a chess player?", "क्या यह व्यक्ति शतरंज खिलाड़ी हैं?", "Kya ye person chess player hain?", "இந்த நபர் சதுரங்க வீரரா?"),
    reasoning: r("Narrows down the sport.", "खेल को अलग करता है।", "Sport ko alag karta hai.", "விளையாட்டை பிரிக்கிறது."),
    ask: (p) => p.traits.sport === "chess",
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "isWriter",
    text: t("Is this person a writer, poet, or author?", "क्या यह व्यक्ति लेखक, कवि, या रचनाकार हैं?", "Kya ye person writer, poet ya author hain?", "இந்த நபர் எழுத்தாளரா?"),
    reasoning: r("Identifies writers and poets.", "लेखकों की पहचान करता है।", "Writers ki pehchaan karta hai.", "எழுத்தாளர்களை அடையாளம் காட்டுகிறது."),
    ask: (p) => !!p.traits.isWriter || !!p.traits.isPoet,
    stage: "profession",
  },
  {
    id: "isSocialWorker",
    text: t("Is this person known for social service or humanitarian work?", "क्या यह व्यक्ति सामाजिक सेवा के लिए जाने जाते हैं?", "Kya ye person social service ke liye jaane jaate hain?", "இந்த நபர் சமூக சேவைக்காக அறியப்பட்டவரா?"),
    reasoning: r("Identifies social workers.", "सामाजिक कार्यकर्ताओं की पहचान करता है।", "Social workers ki pehchaan karta hai.", "சமூக பணியாளர்களை அடையாளம் காட்டுகிறது."),
    ask: (p) => !!p.traits.isSocialWorker,
    stage: "profession",
  },
  {
    id: "isSouthIndian",
    text: t("Is this person primarily from South India?", "क्या यह व्यक्ति मुख्य रूप से दक्षिण भारत से हैं?", "Kya ye person primarily South India se hain?", "இந்த நபர் முதன்மையாக தென்னிந்தியாவை சேர்ந்தவரா?"),
    reasoning: r("Separates South Indian personalities.", "दक्षिण भारतीय हस्तियों को अलग करता है।", "South Indian personalities ko alag karta hai.", "தென்னிந்திய நபர்களை பிரிக்கிறது."),
    ask: (p) => {
      const southStates = ["TN", "Kerala", "Karnataka", "AP", "Telangana"];
      return !!p.region && southStates.includes(p.region);
    },
    stage: "category",
    group: "region",
  },
  {
    id: "isNorthIndian",
    text: t("Is this person from North India?", "क्या यह व्यक्ति उत्तर भारत से हैं?", "Kya ye person North India se hain?", "இந்த நபர் வட இந்தியாவை சேர்ந்தவரா?"),
    reasoning: r("Separates North Indian personalities.", "उत्तर भारतीय हस्तियों को अलग करता है।", "North Indian personalities ko alag karta hai.", "வட இந்திய நபர்களை பிரிக்கிறது."),
    ask: (p) => {
      const northStates = ["Delhi", "UP", "Haryana", "Punjab", "Rajasthan", "HP", "Bihar", "Jharkhand"];
      return !!p.region && northStates.includes(p.region);
    },
    stage: "category",
    group: "region",
  },
  {
    id: "isWestIndian",
    text: t("Is this person from West India (Maharashtra, Gujarat)?", "क्या यह व्यक्ति पश्चिम भारत से हैं?", "Kya ye person West India se hain?", "இந்த நபர் மேற்கு இந்தியாவை சேர்ந்தவரா?"),
    reasoning: r("Identifies Western Indian personalities.", "पश्चिम भारतीय हस्तियों को अलग करता है।", "West Indian personalities ko alag karta hai.", "மேற்கு இந்திய நபர்களை பிரிக்கிறது."),
    ask: (p) => {
      const westStates = ["Maharashtra", "Gujarat"];
      return !!p.region && westStates.includes(p.region);
    },
    stage: "category",
    group: "region",
  },
  {
    id: "isEastIndian",
    text: t("Is this person from East India (Bengal, Odisha, Assam)?", "क्या यह व्यक्ति पूर्व भारत से हैं?", "Kya ye person East India se hain?", "இந்த நபர் கிழக்கு இந்தியாவை சேர்ந்தவரா?"),
    reasoning: r("Identifies Eastern Indian personalities.", "पूर्वी भारतीय हस्तियों को अलग करता है।", "East Indian personalities ko alag karta hai.", "கிழக்கு இந்திய நபர்களை பிரிக்கிறது."),
    ask: (p) => {
      const eastStates = ["Bengal", "Odisha", "Assam"];
      return !!p.region && eastStates.includes(p.region);
    },
    stage: "category",
    group: "region",
  },
  // ---- Clean decade buckets (non-overlapping) — strong late-game discriminators ----
  {
    id: "bornBefore1950",
    text: t("Was this person born before 1950?", "क्या यह व्यक्ति 1950 से पहले पैदा हुए थे?", "Kya ye person 1950 se pehle paida hue the?", "இந்த நபர் 1950 க்கு முன்பு பிறந்தாரா?"),
    reasoning: r("Isolates the older/historical generation.", "पुरानी पीढ़ी को अलग करता है।", "Older generation ko alag karta hai.", "பழைய தலைமுறையை பிரிக்கிறது."),
    ask: (p) => (p.traits.bornDecade as number) < 1950,
    stage: "broad",
    group: "era",
  },
  {
    id: "bornIn1950s",
    text: t("Was this person born in the 1950s?", "क्या यह व्यक्ति 1950 के दशक में पैदा हुए थे?", "Kya ye person 1950s mein paida hue the?", "இந்த நபர் 1950-களில் பிறந்தவரா?"),
    reasoning: r("Narrows to the 1950s generation.", "1950s पीढ़ी को अलग करता है।", "1950s generation ko alag karta hai.", "1950-கள் தலைமுறையை பிரிக்கிறது."),
    ask: (p) => { const d = p.traits.bornDecade as number; return d >= 1950 && d < 1960; },
    stage: "broad",
    group: "era",
  },
  {
    id: "bornIn1960s",
    text: t("Was this person born in the 1960s?", "क्या यह व्यक्ति 1960 के दशक में पैदा हुए थे?", "Kya ye person 1960s mein paida hue the?", "இந்த நபர் 1960-களில் பிறந்தவரா?"),
    reasoning: r("Narrows to the 1960s generation.", "1960s पीढ़ी को अलग करता है।", "1960s generation ko alag karta hai.", "1960-கள் தலைமுறையை பிரிக்கிறது."),
    ask: (p) => { const d = p.traits.bornDecade as number; return d >= 1960 && d < 1970; },
    stage: "broad",
    group: "era",
  },
  {
    id: "bornIn1970s",
    text: t("Was this person born in the 1970s?", "क्या यह व्यक्ति 1970 के दशक में पैदा हुए थे?", "Kya ye person 1970s mein paida hue the?", "இந்த நபர் 1970-களில் பிறந்தவரா?"),
    reasoning: r("Narrows to the 1970s generation.", "1970s पीढ़ी को अलग करता है।", "1970s generation ko alag karta hai.", "1970-கள் தலைமுறையை பிரிக்கிறது."),
    ask: (p) => { const d = p.traits.bornDecade as number; return d >= 1970 && d < 1980; },
    stage: "broad",
    group: "era",
  },
  {
    id: "bornIn1980s",
    text: t("Was this person born in the 1980s?", "क्या यह व्यक्ति 1980 के दशक में पैदा हुए थे?", "Kya ye person 1980s mein paida hue the?", "இந்த நபர் 1980-களில் பிறந்தவரா?"),
    reasoning: r("Narrows to the 1980s generation.", "1980s पीढ़ी को अलग करता है।", "1980s generation ko alag karta hai.", "1980-கள் தலைமுறையை பிரிக்கிறது."),
    ask: (p) => { const d = p.traits.bornDecade as number; return d >= 1980 && d < 1990; },
    stage: "broad",
    group: "era",
  },
  {
    id: "bornIn1990s",
    text: t("Was this person born in the 1990s?", "क्या यह व्यक्ति 1990 के दशक में पैदा हुए थे?", "Kya ye person 1990s mein paida hue the?", "இந்த நபர் 1990-களில் பிறந்தவரா?"),
    reasoning: r("Narrows to the 1990s generation.", "1990s पीढ़ी को अलग करता है।", "1990s generation ko alag karta hai.", "1990-கள் தலைமுறையை பிரிக்கிறது."),
    ask: (p) => { const d = p.traits.bornDecade as number; return d >= 1990 && d < 2000; },
    stage: "broad",
    group: "era",
  },
  {
    id: "bornIn2000s",
    text: t("Was this person born in the 2000s or later?", "क्या यह व्यक्ति 2000 के बाद पैदा हुए हैं?", "Kya ye person 2000 ke baad paida hue hain?", "இந்த நபர் 2000-க்கு பிறகு பிறந்தவரா?"),
    reasoning: r("Narrows to the newest generation.", "नवीनतम पीढ़ी को अलग करता है।", "Newest generation ko alag karta hai.", "புதிய தலைமுறையை பிரிக்கிறது."),
    ask: (p) => (p.traits.bornDecade as number) >= 2000,
    stage: "broad",
    group: "era",
  },
  {
    id: "isBollywoodStar",
    text: t("Is this person a Bollywood superstar (A-list)?", "क्या यह व्यक्ति बॉलीवुड का A-list सुपरस्टार हैं?", "Kya ye person Bollywood ka A-list superstar hain?", "இந்த நபர் பாலிவுட் ஏ-லிஸ்ட் சூப்பர்ஸ்டாரா?"),
    reasoning: r("Separates the biggest names from the rest.", "सबसे बड़े नामों को अलग करता है।", "Sabse bade names ko alag karta hai.", "மிகப்பெரிய நட்சத்திரங்களை பிரிக்கிறது."),
    ask: (p) => {
      const superstars = ["srk", "salman", "aamir", "amitabh"];
      return superstars.includes(p.id);
    },
    stage: "specific",
    categories: ["bollywood"],
  },
  {
    id: "isBollywoodActress",
    text: t("Is this person an actress?", "क्या यह व्यक्ति एक अभिनेत्री हैं?", "Kya ye person actress hain?", "இந்த நபர் நடிகையா?"),
    reasoning: r("Separates actresses from male actors.", "अभिनेत्रियों को अलग करता है।", "Actresses ko alag karta hai.", "நடிகைகளை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isActress,
    stage: "profession",
  },
  {
    id: "isBollywoodActor",
    text: t("Is this person a male actor?", "क्या यह व्यक्ति एक पुरुष अभिनेता हैं?", "Kya ye person male actor hain?", "இந்த நபர் ஆண் நடிகரா?"),
    reasoning: r("Separates male actors.", "पुरुष अभिनेताओं को अलग करता है।", "Male actors ko alag karta hai.", "ஆண் நடிகர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isActor && p.gender === "male" && p.category === "bollywood",
    stage: "profession",
  },
  {
    id: "isPlayback",
    text: t("Is this person a playback singer?", "क्या यह व्यक्ति पार्श्व गायक हैं?", "Kya ye person playback singer hain?", "இந்த நபர் பின்புல பாடகரா?"),
    reasoning: r("Identifies playback singers.", "पार्श्व गायकों की पहचान करता है।", "Playback singers ki pehchaan karta hai.", "பின்புல பாடகர்களை அடையாளம் காட்டுகிறது."),
    ask: (p) => !!p.traits.isPlayback,
    stage: "specific",
    categories: ["music", "bollywood"],
  },
  {
    id: "isComposer",
    text: t("Is this person a music composer?", "क्या यह व्यक्ति संगीतकार/कंपोजर हैं?", "Kya ye person music composer hain?", "இந்த நபர் இசை அமைப்பாளரா?"),
    reasoning: r("Identifies composers.", "कंपोजर्स की पहचान करता है।", "Composers ki pehchaan karta hai.", "இசை அமைப்பாளர்களை அடையாளம் காட்டுகிறது."),
    ask: (p) => !!p.traits.isMusicComposer,
    stage: "profession",
  },
  {
    id: "isReligiousIcon",
    text: t("Is this person known as a spiritual or religious leader?", "क्या यह व्यक्ति आध्यात्मिक या धार्मिक नेता हैं?", "Kya ye person spiritual ya religious leader hain?", "இந்த நபர் ஆன்மீக தலைவரா?"),
    reasoning: r("Identifies spiritual leaders.", "आध्यात्मिक नेताओं की पहचान करता है।", "Spiritual leaders ki pehchaan karta hai.", "ஆன்மீக தலைவர்களை அடையாளம் காட்டுகிறது."),
    ask: () => false, // placeholder - no spiritual leaders in DB yet
    stage: "profession",
  },
  {
    id: "isMilitary",
    text: t("Is this person associated with the armed forces?", "क्या यह व्यक्ति सशस्त्र बलों से जुड़े हैं?", "Kya ye person armed forces se jude hain?", "இந்த நபர் ராணுவத்துடன் தொடர்புடையவரா?"),
    reasoning: r("Identifies military personnel.", "सैन्य कर्मियों की पहचान करता है।", "Military personnel ki pehchaan karta hai.", "ராணுவத்தினரை அடையாளம் காட்டுகிறது."),
    ask: (p) => !!p.traits.isMilitary,
    stage: "profession",
  },

  // ============ HIGH-VALUE SEPARATORS (added to cut down question count) ============
  {
    id: "isTamilLang",
    text: t("Is this person mainly from Tamil language/cinema/music?", "क्या यह व्यक्ति मुख्य रूप से तमिल भाषा/सिनेमा/संगीत से जुड़े हैं?", "Kya ye person mainly Tamil language/cinema/music se jude hain?", "இந்த நபர் முக்கியமாக தமிழ் மொழி/திரைப்பட/இசை உடன் தொடர்புடையவரா?"),
    reasoning: r("Splits Tamil personalities from the rest — very strong separator.", "तमिल हस्तियों को अलग करता है।", "Tamil personalities ko alag karta hai.", "தமிழ் நபர்களை பிரிக்கிறது."),
    ask: (p) => p.traits.language === "tamil",
    stage: "category",
  },
  {
    id: "isTeluguLang",
    text: t("Is this person mainly from Telugu language/cinema/music?", "क्या यह व्यक्ति मुख्य रूप से तेलुगु भाषा/सिनेमा/संगीत से जुड़े हैं?", "Kya ye person mainly Telugu language/cinema/music se jude hain?", "இந்த நபர் முக்கியமாக தெலுங்கு மொழி/திரைப்பட/இசை உடன் தொடர்புடையவரா?"),
    reasoning: r("Splits Telugu personalities from the rest.", "तेलुगु हस्तियों को अलग करता है।", "Telugu personalities ko alag karta hai.", "தெலுங்கு நபர்களை பிரிக்கிறது."),
    ask: (p) => p.traits.language === "telugu",
    stage: "category",
  },
  {
    id: "isMalayalamLang",
    text: t("Is this person mainly from Malayalam language/cinema?", "क्या यह व्यक्ति मुख्य रूप से मलयालम भाषा/सिनेमा से जुड़े हैं?", "Kya ye person mainly Malayalam language/cinema se jude hain?", "இந்த நபர் முக்கியமாக மலையாள மொழி/திரைப்பட உடன் தொடர்புடையவரா?"),
    reasoning: r("Splits Malayalam personalities from the rest.", "मलयालम हस्तियों को अलग करता है।", "Malayalam personalities ko alag karta hai.", "மலையாள நபர்களை பிரிக்கிறது."),
    ask: (p) => p.traits.language === "malayalam",
    stage: "category",
  },
  {
    id: "isKannadaLang",
    text: t("Is this person mainly from Kannada language/cinema?", "क्या यह व्यक्ति मुख्य रूप से कन्नड़ भाषा/सिनेमा से जुड़े हैं?", "Kya ye person mainly Kannada language/cinema se jude hain?", "இந்த நபர் முக்கியமாக கன்னட மொழி/திரைப்பட உடன் தொடர்புடையவரா?"),
    reasoning: r("Splits Kannada personalities from the rest.", "कन्नड़ हस्तियों को अलग करता है।", "Kannada personalities ko alag karta hai.", "கன்னட நபர்களை பிரிக்கிறது."),
    ask: (p) => p.traits.language === "kannada",
    stage: "category",
  },
  {
    id: "isPunjabiLang",
    text: t("Is this person mainly from Punjabi language/film industry?", "क्या यह व्यक्ति मुख्य रूप से पंजाबी भाषा/सिनेमा से जुड़े हैं?", "Kya ye person mainly Punjabi language/film se jude hain?", "இந்த நபர் முக்கியமாக பஞ்சாபி மொழி/திரைப்பட உடன் தொடர்புடையவரா?"),
    reasoning: r("Splits Punjabi personalities from the rest.", "पंजाबी हस्तियों को अलग करता है।", "Punjabi personalities ko alag karta hai.", "பஞ்சாபி நபர்களை பிரிக்கிறது."),
    ask: (p) => p.traits.language === "punjabi",
    stage: "category",
  },
  {
    id: "isRapper",
    text: t("Is this person a rapper/hip-hop artist?", "क्या यह व्यक्ति एक रैपर/हिप-हॉप आर्टिस्ट हैं?", "Kya ye person rapper/hip-hop artist hain?", "இந்த நபர் ரேப்பரா?"),
    reasoning: r("Identifies rappers — a distinct modern group.", "रैपर्स की पहचान करता है।", "Rappers ki pehchaan karta hai.", "ரேப்பர்களை அடையாளம் காட்டுகிறது."),
    ask: (p) => p.profession === "Rapper",
    stage: "profession",
  },
  {
    id: "isClassicalArtist",
    text: t("Is this person a classical/traditional musician?", "क्या यह व्यक्ति शास्त्रीय/पारंपरिक संगीतकार हैं?", "Kya ye person classical/traditional musician hain?", "இந்த நபர் கிளாசிக்கல்/பாரம்பரிய இசையாளரா?"),
    reasoning: r("Separates classical artists from pop/playback singers.", "शास्त्रीय कलाकारों को अलग करता है।", "Classical artists ko alag karta hai.", "கிளாசிக்கல் கலைஞர்களை பிரிக்கிறது."),
    ask: (p) =>
      ["Sitarist", "Tabla Player", "Shehnai Maestro", "Flutist", "Santoor Player", "Sarod Player", "Violinist", "Carnatic Singer", "Qawwali Singer", "Carnatic Vocalist"].includes(p.profession),
    stage: "profession",
  },
  {
    id: "isFootballer",
    text: t("Is this person a footballer?", "क्या यह व्यक्ति फुटबॉल खिलाड़ी हैं?", "Kya ye person footballer hain?", "இந்த நபர் ஃபுட்ரால் வீரரா?"),
    reasoning: r("Identifies footballers specifically.", "फुटबॉलरों को अलग करता है।", "Footballers ko alag karta hai.", "ஃபுட்ரால் வீரர்களை பிரிக்கிறது."),
    ask: (p) => p.traits.sport === "football",
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "isHockey",
    text: t("Is this person a hockey player?", "क्या यह व्यक्ति हॉकी खिलाड़ी हैं?", "Kya ye person hockey player hain?", "இந்த நபர் ஹாக்கி வீரரா?"),
    reasoning: r("Identifies hockey players.", "हॉकी खिलाड़ियों को अलग करता है।", "Hockey players ko alag karta hai.", "ஹாக்கி வீரர்களை பிரிக்கிறது."),
    ask: (p) => p.traits.sport === "hockey",
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "isWrestler",
    text: t("Is this person a wrestler?", "क्या यह व्यक्ति पहलवान हैं?", "Kya ye person wrestler hain?", "இந்த நபர் மல்யுத்த வீரரா?"),
    reasoning: r("Identifies wrestlers.", "पहलवानों को अलग करता है।", "Wrestlers ko alag karta hai.", "மல்யுத்த வீரர்களை பிரிக்கிறது."),
    ask: (p) => p.traits.sport === "wrestling",
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "isShooterSport",
    text: t("Is this person a shooter?", "क्या यह व्यक्ति निशानेबाज हैं?", "Kya ye person shooter hain?", "இந்த நபர் சுடும் வீரரா?"),
    reasoning: r("Identifies shooters.", "निशानेबाजों को अलग करता है।", "Shooters ko alag karta hai.", "சுடும் வீரர்களை பிரிக்கிறது."),
    ask: (p) => p.traits.sport === "shooting",
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "isBadminton",
    text: t("Is this person a badminton player?", "क्या यह व्यक्ति बैडमिंटन खिलाड़ी हैं?", "Kya ye person badminton player hain?", "இந்த நபர் பாட்மிண்டன் வீரரா?"),
    reasoning: r("Identifies badminton players.", "बैडमिंटन खिलाड़ियों को अलग करता है।", "Badminton players ko alag karta hai.", "பாட்மிண்டன் வீரர்களை பிரிக்கிறது."),
    ask: (p) => p.traits.sport === "badminton",
    stage: "specific",
    categories: ["sports"],
  },
  {
    id: "isHistoricalFigure",
    text: t("Is this person from ancient or pre-modern history?", "क्या यह व्यक्ति प्राचीन या पुरा कालीन इतिहास से हैं?", "Kya ye person ancient ya pre-modern history se hain?", "இந்த நபர் பண்டைய/முதல் கால வரலாறு உடையவரா?"),
    reasoning: r("Separates ancient figures like Aryabhata, Sushruta from modern ones.", "प्राचीन हस्तियों को अलग करता है।", "Ancient figures ko alag karta hai.", "பண்டைய நபர்களை பிரிக்கிறது."),
    ask: (p) => p.era === "historical",
    stage: "category",
  },
  {
    id: "isFreedomEra",
    text: t("Was this person active during the freedom struggle (1900-1950)?", "क्या यह व्यक्ति स्वतंत्रता संग्राम के समय (1900-1950) सक्रिय थे?", "Kya ye person freedom struggle ke time (1900-1950) active the?", "இந்த நபர் விடுதலைப் போராட்ட காலத்தில் (1900-1950) செயலில் இருந்தவரா?"),
    reasoning: r("Isolates freedom-era figures.", "स्वतंत्रता युग की हस्तियों को अलग करता है।", "Freedom era figures ko alag karta hai.", "விடுதலைக் கால நபர்களை பிரிக்கிறது."),
    ask: (p) => p.era === "freedom",
    stage: "category",
  },
  {
    id: "isTechLeader",
    text: t("Is this person a leader in the tech/IT/startup industry?", "क्या यह व्यक्ति टेक/IT/स्टार्टअप उद्योग में नेता हैं?", "Kya ye person tech/IT/startup industry mein leader hain?", "இந்த நபர் டெக்/ஐடி/ஸ்டார்ட்அப் துறையில் தலைவரா?"),
    reasoning: r("Identifies tech leaders among business people.", "टेक लीडर्स की पहचान करता है।", "Tech leaders ki pehchaan karta hai.", "டெக் தலைவர்களை அடையாளம் காட்டுகிறது."),
    ask: (p) => !!p.traits.isTechLeader,
    stage: "profession",
    categories: ["business"],
  },
  {
    id: "isIndustrialist",
    text: t("Is this person from a traditional industrial business family?", "क्या यह व्यक्ति पारंपरिक औद्योगिक व्यवसाय परिवार से हैं?", "Kya ye person traditional industrial business family se hain?", "இந்த நபர் பாரம்பரிய தொழில் வடிவ வணிக குடும்பத்தை சேர்ந்தவரா?"),
    reasoning: r("Separates old-money industrialists from startup founders.", "औद्योगिकीकारों को अलग करता है।", "Industrialists ko alag karta hai.", "தொழில்முனைவாளர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isIndustrialist,
    stage: "profession",
    categories: ["business"],
  },
  {
    id: "isStartupFounder",
    text: t("Did this person found their company in the last 20 years?", "क्या इस व्यक्ति ने पिछले 20 सालों में अपनी कंपनी स्थापित की?", "Kya is person ne pichhle 20 saal mein apni company founded ki?", "இந்த நபர் கடந்த 20 ஆண்டுகளில் தங்கள் நிறுவனத்தை நிறுவியவரா?"),
    reasoning: r("Splits modern startup founders from older business leaders.", "नए स्टार्टअप फाउंडर्स को अलग करता है।", "Naye startup founders ko alag karta hai.", "புதிய ஸ்டார்ட்அப் நிறுவனங்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isFounder && !p.traits.isIndustrialist && (p.traits.bornDecade as number) >= 1960,
    stage: "specific",
    categories: ["business"],
  },
  {
    id: "isCricketLegend",
    text: t("Is this a legendary cricketer (active before 2000)?", "क्या यह एक लेजेंडरी क्रिकेटर हैं (2000 से पहले सक्रिय)?", "Kya ye legendary cricketer hain (2000 se pehle active)?", "இந்தவர் ஒரு கதையும் சொல்லும் போலும் (2000க்கு முன் செயலில்)?"),
    reasoning: r("Separates cricket legends from the modern generation.", "क्रिकेट की गलियारियों को अलग करता है।", "Cricket legends ko alag karta hai.", "கிரிக்கெட் கதாநாயகன்களை பிரிக்கிறது."),
    ask: (p) => p.category === "cricket" && (p.traits.bornDecade as number) <= 1980,
    stage: "specific",
    categories: ["cricket"],
  },
  {
    id: "isIPLEra",
    text: t("Is this cricketer from the modern IPL era?", "क्या यह क्रिकेटर आधुनिक IPL युग का है?", "Kya ye cricketer modern IPL era ka hai?", "இந்த கிரிக்கெட் வீரர் நவீன ஐபிஎல் யுகத்தை சேர்ந்தவரா?"),
    reasoning: r("Separates the modern IPL generation of cricketers.", "आधुनिक IPL पीढ़ी को अलग करता है।", "Modern IPL generation ko alag karta hai.", "நவீன ஐபிஎல் தலைமுறையை பிரிக்கிறது."),
    ask: (p) => p.category === "cricket" && (p.traits.bornDecade as number) >= 1985,
    stage: "specific",
    categories: ["cricket"],
  },
  {
    id: "isNationalIcon",
    text: t("Is this person a nationally celebrated icon (not just regional)?", "क्या यह व्यक्ति राष्ट्रीय स्तर पर पहचाने जाने वाले आइकॉन हैं (सिर्फ क्षेत्रीय नहीं)?", "Kya ye person national level icon hain (sirf regional nahi)?", "இந்த நபர் தேசிய அளவில் புகழ்பெற்றவர் ஆவரா (பகுதியல்ல)?"),
    reasoning: r("Ranks out the most nationally famous names.", "राष्ट्रीय स्तर के आइकॉन्स को अलग करता है।", "National icons ko alag karta hai.", "தேசிய அளவிலான அடையாளங்களை பிரிக்கிறது."),
    ask: (p) => ["sachin", "virat", "srk", "amitabh", "gandhi", "nehru", "kal", "lata", "tagore", "ambedkar", "modi"].includes(p.id),
    stage: "specific",
  },
  {
    id: "isFilmDirector",
    text: t("Is this person known primarily as a filmmaker/director?", "क्या यह व्यक्ति मुख्य रूप से फिल्म निर्देशक के रूप में जाने जाते हैं?", "Kya ye person primarily filmmaker/director ke roop mein jaane jaate hain?", "இந்த நபர் முதன்மையாக திரைப்பட இயக்குனராக அறியப்படுகிறாரா?"),
    reasoning: r("Splits directors from actors and other film people.", "निर्देशकों को अलग करता है।", "Directors ko alag karta hai.", "இயக்குனர்களை பிரிக்கிறது."),
    ask: (p) => !!p.traits.isDirector,
    stage: "profession",
  },
];

// Questions for "why this question" reasoning

// ============================================================================
// STATE-LEVEL DISCRIMINATOR QUESTIONS (generated)
// Fine-grained region questions that let the AI tell apart very similar
// candidates (e.g. two actresses from different states in the same era).
// Region values in the data are normalized so "TN"/"Tamil Nadu" match, etc.
// ============================================================================
const REGION_ALIASES: Record<string, string[]> = {
  "Uttar Pradesh": ["UP"],
  "Maharashtra": ["Maharashtra"],
  "Tamil Nadu": ["TN", "Tamil Nadu"],
  "Karnataka": ["Karnataka"],
  "Andhra Pradesh": ["AP"],
  "Punjab": ["Punjab"],
  "West Bengal": ["Bengal", "Kolkata"],
  "Haryana": ["Haryana"],
  "Gujarat": ["Gujarat"],
  "Kerala": ["Kerala"],
  "Delhi": ["Delhi"],
  "Bihar": ["Bihar"],
  "Madhya Pradesh": ["MP"],
  "Rajasthan": ["Rajasthan"],
  "Assam": ["Assam"],
  "Odisha": ["Odisha"],
};

function regionQuestion(display: string, aliases: string[]): Question {
  const set = new Set(aliases);
  return {
    id: "state_" + aliases[0].toLowerCase().replace(/[^a-z]/g, ""),
    text: t(
      `Is this person from ${display}?`,
      `क्या यह व्यक्ति ${display} से हैं?`,
      `Kya ye person ${display} se hain?`,
      `இந்த நபர் ${display} சார்ந்தவரா?`
    ),
    reasoning: r(
      `Narrows the pool to people associated with ${display}.`,
      `${display} से जुड़े लोगों तक सीमित करता है।`,
      `Pool ko ${display} se jude logon tak narrow karta hai.`,
      `உடல்களை ${display} தொடர்புடையவர்களாக வரையறுக்கிறது.`
    ),
    ask: (p) => !!p.region && set.has(p.region),
    stage: "specific",
    group: "regionState",
  };
}

const REGION_QUESTIONS: Question[] = Object.entries(REGION_ALIASES).map(
  ([display, aliases]) => regionQuestion(display, aliases)
);

export const QUESTIONS: Question[] = [...BASE_QUESTIONS, ...REGION_QUESTIONS];
