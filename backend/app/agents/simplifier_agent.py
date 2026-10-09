import re
from typing import Dict, Any, List

class SimplifierAgent:
    """
    Translates complex clinical terminology and discharge jargon into
    patient-friendly, clear, and reassuring instructions.
    Supports English (en), Hindi (hi), and Tamil (ta).
    """

    DICTIONARY = {
        "diverticulitis": {
            "en": "inflammation in the intestine",
            "hi": "आंतों में सूजन",
            "ta": "குடலில் ஏற்படும் வீக்கம்"
        },
        "hypertension": {
            "en": "high blood pressure",
            "hi": "उच्च रक्तचाप",
            "ta": "உயர் இரத்த அழுத்தம்"
        },
        "total knee arthroplasty": {
            "en": "knee replacement surgery",
            "hi": "घुटने के जोड़ का प्रत्यारोपण",
            "ta": "முழங்கால் மாற்று அறுவை சிகிச்சை"
        },
        "dvt prophylaxis": {
            "en": "prevention of blood clots in the legs",
            "hi": "पैरों में खून का थक्का जमने से रोकना",
            "ta": "கால்களில் இரத்த உறைவு உருவாவதைத் தடுத்தல்"
        },
        "subcutaneous injection": {
            "en": "a gentle injection just under the skin (belly area)",
            "hi": "पेट की त्वचा के ठीक नीचे लगने वाला आसान इंजेक्शन",
            "ta": "தோலின் அடியில் மெதுவாக செலுத்தப்படும் ஊசி"
        },
        "prn": {
            "en": "only when you actually need it",
            "hi": "केवल आवश्यकता पड़ने पर",
            "ta": "தேவைப்படும் போது மட்டும்"
        },
        "low-fiber diet": {
            "en": "soft, easy-to-digest light food (like rice, bananas, broth)",
            "hi": "हल्का और आसानी से पचने वाला भोजन",
            "ta": "எளிதில் செரிக்கும் எளிய உணவு"
        },
        "maintain wound hygiene": {
            "en": "keep the surgical wound clean and dry, watching for any redness or oozing",
            "hi": "घाव को साफ और सूखा रखें, किसी भी लालिमा पर नजर रखें",
            "ta": "காயத்தை சுத்தமாகவும் உலர்வாகவும் வைத்திருக்கவும்"
        },
        "aquacel silver dressing": {
            "en": "protective silver dressing bandage; do not peel off",
            "hi": "विशेष सुरक्षात्मक सिल्वर पट्टी; इसे न हटाएं",
            "ta": "சிறப்பு பாதுகாப்பு வெள்ளி கட்டு; அதை அகற்ற வேண்டாம்"
        },
        "acute decompensated heart failure": {
            "en": "temporary fluid buildup and extra strain on the heart",
            "hi": "हृदय पर अतिरिक्त दबाव और शरीर में पानी का जमाव",
            "ta": "இதயத்தில் அதிக சிரமம் மற்றும் உடலில் நீர் தேங்குதல்"
        },
        "chronic kidney disease": {
            "en": "long-term reduced kidney filtering ability",
            "hi": "गुर्दे (किडनी) की धीमी कार्यक्षमता",
            "ta": "நீண்ட கால சிறுநீரக செயல்பாட்டு குறைவு"
        },
        "euvolemic state": {
            "en": "balanced normal fluid levels in your body",
            "hi": "शरीर में पानी का सामान्य और संतुलित स्तर",
            "ta": "உடலில் சமநிலையான திரவ அளவு"
        }
    }

    HINDI_COMMON = {
        "Wound Care": "घाव की देखभाल: पट्टी को सूखा और साफ रखें। जब तक डॉक्टर न कहें, पट्टी न हटाएं।",
        "Activity": "शारीरिक गतिविधि: हल्का चलना-फिरना शुरू करें। भारी वजन (>5 किलो) बिल्कुल न उठाएं।",
        "Diet": "आहार संबंधी निर्देश: हल्का और सुपाच्य भोजन लें। पर्याप्त मात्रा में पानी पिएं।",
        "Appointment": "डॉक्टर से मिलने का समय: कृपया समय पर उपस्थित हों।",
        "Test": "जांच / टेस्ट: निर्धारित तिथि पर लैब में परीक्षण करवाएं।",
        "Medication": "दवा संबंधी निर्देश: डॉक्टर के पर्चे के अनुसार निर्धारित समय पर दवा लें।"
    }

    TAMIL_COMMON = {
        "Wound Care": "காயப் பராமரிப்பு: கட்டை உலர்வாகவும் சுத்தமாகவும் வைக்கவும். மருத்துவர் அறிவுறுத்தும் வரை கட்டை எடுக்க வேண்டாம்.",
        "Activity": "உடற்பயிற்சி மற்றும் இயக்கம்: மெதுவாக நடக்கவும். கடுமையான அல்லது கனமான பொருட்களை தூக்க வேண்டாம்.",
        "Diet": "உணவு முறை: எளிதில் ஜீரணமாகும் உணவுகளை உட்கொள்ளவும். தேவையான அளவு தண்ணீர் குடிக்கவும்.",
        "Appointment": "மருத்துவர் சந்திப்பு: குறித்த நேரத்தில் மருத்துவரை நேரில் சந்திக்கவும்.",
        "Test": "பரிசோதனை: பரிந்துரைக்கப்பட்ட நாளில் ஆய்வகத்தில் இரத்த அல்லது ஸ்கேன் சோதனை செய்யவும்.",
        "Medication": "மருந்து வழிகாட்டல்: மருத்துவர் பரிந்துரைத்தபடி தவறாமல் மருந்துகளை உட்கொள்ளவும்."
    }

    @classmethod
    def simplify_instruction(cls, original_text: str, category: str = "General", lang: str = "en") -> str:
        lang = (lang or "en").lower()

        if lang == "hi":
            if category in cls.HINDI_COMMON:
                return f"{cls.HINDI_COMMON[category]} (मूल निर्देश: {original_text})"
            return f"निर्देश: {original_text} (कृपया डॉक्टर की सलाह का पालन करें)"

        if lang == "ta":
            if category in cls.TAMIL_COMMON:
                return f"{cls.TAMIL_COMMON[category]} (அசல் குறிப்பு: {original_text})"
            return f"வழிகாட்டல்: {original_text} (மருத்துவரின் ஆலோசனையைப் பின்பற்றவும்)"

        # English Simplification
        simplified = original_text
        for term, mapping in cls.DICTIONARY.items():
            pattern = re.compile(re.escape(term), re.IGNORECASE)
            simplified = pattern.sub(f"{mapping['en']} [{term}]", simplified)
            
        # Clarify clinical contractions
        simplified = re.sub(r"\bBID\b", "twice a day (every 12 hours)", simplified, flags=re.IGNORECASE)
        simplified = re.sub(r"\bTID\b", "three times a day (every 8 hours)", simplified, flags=re.IGNORECASE)
        simplified = re.sub(r"\bQID\b", "four times a day (every 6 hours)", simplified, flags=re.IGNORECASE)
        simplified = re.sub(r"\bQD\b", "once every day", simplified, flags=re.IGNORECASE)
        simplified = re.sub(r"\bPRN\b", "as needed for symptoms", simplified, flags=re.IGNORECASE)
        simplified = re.sub(r"\bPO\b", "by mouth", simplified, flags=re.IGNORECASE)

        return simplified
