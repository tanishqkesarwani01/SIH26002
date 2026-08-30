"""
Multilingual Alert Translation and Dispatch Service for Northeast India Logistics Platform.
Supports 6 Regional Languages: English (EN), Hindi (HI), Assamese (AS), Mizo (MZ),
Manipuri (MN), and Bengali (BN).
"""

from typing import Dict, Any
from models import MultilingualText, AlertSeverity, DamageType


class MultilingualAlertService:
    """Regional linguistic localization and translation engine for logistics safety alerts."""

    INCIDENT_NAMES = {
        DamageType.LANDSLIDE: {
            "en": "Massive Landslide",
            "hi": "भारी भूस्खलन",
            "as": "ভয়ংকৰ ভূমিস্খলন",
            "mz": "Leimin nasa tak",
            "mn": "চাউনা লৈবাক তুম্বা (লান্দস্লাইদ)",
            "bn": "মারাত্মক ভূমিধস"
        },
        DamageType.FLASH_FLOOD: {
            "en": "Flash Flood Inundation",
            "hi": "आकस्मिक बाढ़ / जलभराव",
            "as": "হঠকাৰী বানপানী",
            "mz": "Tui lian thut",
            "mn": "অচুম্বা ঈশিং ইচাউ",
            "bn": "আকস্মিক বন্যা / প্লাবন"
        },
        DamageType.MUDSLIP: {
            "en": "Heavy Mudslip & Silt Flow",
            "hi": "कीचड़ का बहाव और मलबे का जमाव",
            "as": "বোকা আৰু পলসৰ স্খলন",
            "mz": "Chirh leimin",
            "mn": "লৈরাং/লৈবাক মাংবা",
            "bn": "কাদা ও পলি ধস"
        },
        DamageType.ROAD_BREACH: {
            "en": "Highway Roadbed Breach / Washout",
            "hi": "राजमार्ग का कटाव व सड़क टूटना",
            "as": "ৰাষ্ট্ৰীয় ঘাইপথ খহনীয়া / বিচ্ছিন্ন",
            "mz": "Kawng chhia / tuiin a lak",
            "mn": "লমবি কাইখ্ৰবা / থুগাৎখ্ৰবা",
            "bn": "মহাসড়ক ভাঙন ও রাস্তা বিচ্ছিন্ন"
        },
        DamageType.ROCKFALL: {
            "en": "Active Boulder & Rockfall Hazard",
            "hi": "चट्टान गिरने का सक्रिय खतरा",
            "as": "শিলাবৃষ্টি আৰু শিল খহি পৰাৰ শংকা",
            "mz": "Lung lian tla hlauhawm",
            "mn": "নুং তুম্বা লান্দস্লাইদ",
            "bn": "পাথর ধসে পড়ার বিপদ"
        },
        DamageType.SUBSIDENCE: {
            "en": "Deep Ground Subsidence / Road Sinking",
            "hi": "सड़क का धंसाव (सिंकिंग जोन)",
            "as": "মাটি আৰু পথ তললৈ বহি যোৱা",
            "mz": "Leilung chim / hniam suk",
            "mn": "লৈমাই খুমজিনবা / লমবি চিঙবা",
            "bn": "মাটি ও সড়ক দেবে যাওয়া"
        },
        DamageType.BRIDGE_DAMAGE: {
            "en": "Bridge Structural Damage",
            "hi": "पुल की संरचनात्मक क्षति",
            "as": "দলংৰ গাঁথনিগত ক্ষতি",
            "mz": "Leihlawn chhia",
            "mn": "থোং কাইখ্ৰবা",
            "bn": "সেতুর কাঠামোগত ক্ষতি"
        },
        DamageType.WATERLOGGING: {
            "en": "Severe Highway Waterlogging",
            "hi": "राजमार्ग पर भारी जलभराव",
            "as": "ঘাইপথত প্ৰৱল জলমগ্নতা",
            "mz": "Kawng tui tlin nasa",
            "mn": "লমবিদ ঈশিং তুম্বা",
            "bn": "মহাসড়কে তীব্র জলাবদ্ধতা"
        }
    }

    SEVERITY_HEADERS = {
        AlertSeverity.CRITICAL: {
            "en": "CRITICAL EMERGENCY ALERT",
            "hi": "अति गंभीर आपातकालीन चेतावनी",
            "as": "অত্যন্ত জৰুৰী সতৰ্কবাৰ্তা",
            "mz": "CHHETNA HLAUHAWM THUCHUAH",
            "mn": "য়াম্না লুনা অকিব পোৎথোক পাউ",
            "bn": "জরুরি লাল সতর্কতা"
        },
        AlertSeverity.WARNING: {
            "en": "HIGH HAZARD WARNING",
            "hi": "उच्च जोखिम चेतावनी",
            "as": "উচ্চ বিপদৰ সতৰ্ক সংকেত",
            "mz": "HLAUHAWM CHHINTIAH",
            "mn": "অকিবা লৈরবা চেৎনা পাউতাক",
            "bn": "উচ্চ বিপদ সংকেত"
        },
        AlertSeverity.WATCH: {
            "en": "MONSOON SAFETY WATCH",
            "hi": "मौसम व सड़क निगरानी अलर्ट",
            "as": "বৰষুণ আৰু পথ নিৰীক্ষণ সতৰ্কতা",
            "mz": "FIMKHUR THUCHUAH",
            "mn": "চেকশিনবা থম্নবা পাউতাক",
            "bn": "সতর্ক দৃষ্টি ও পর্যবেক্ষণ"
        },
        AlertSeverity.INFO: {
            "en": "LOGISTICS ADVISORY",
            "hi": "लॉजिस्टिक्स परामर्श",
            "as": "পৰিবহণ পৰামৰ্শৱালী",
            "mz": "KHAWNG PUANNA",
            "mn": "চৎথোক-চৎশিনগী পাউ",
            "bn": "পরিবহন পরামর্শ"
        }
    }

    ACTIONS = {
        "divert_alternate": {
            "en": "Immediate diversion to alternative corridors recommended.",
            "hi": "तुरंत वैकल्पिक मार्ग अपनाने की सलाह दी जाती है।",
            "as": "অনতিপলমে বিকল্প সুৰক্ষিত পথ ব্যৱহাৰ কৰিবলৈ পৰামৰ্শ দিয়া হ'ল।",
            "mz": "Kawng dang zawh nghal tura hriattir in ni.",
            "mn": "অতোপ্পা অহাংবা লমবি চৎনবা পাউতাক পীরি।",
            "bn": "অবিলম্বে বিকল্প নিরাপদ রাস্তা ব্যবহারের পরামর্শ দেওয়া হচ্ছে।"
        },
        "halt_immediately": {
            "en": "Halt all cargo and vehicle transit at nearest staging hub immediately.",
            "hi": "सभी वाहन निकटतम सुरक्षित पड़ाव/हब पर तुरंत रोकें।",
            "as": "সকলো মালবাহী গাড়ী নিকটৱৰ্তী সুৰক্ষিত স্থানত ততালিকে ৰখাই দিয়ক।",
            "mz": "Hmun him hnaivai berah motor tiding nghal rawh.",
            "mn": "য়াম্না থুনা নাকনগী চেকথবা মফমদা গাড়ী লেপহনগদবনি।",
            "bn": "সকল প্রকার পরিবহন নিকটস্থ নিরাপদ স্টপ/হাবে অবিলম্বে থামান।"
        },
        "proceed_caution": {
            "en": "Proceed at minimal speed with extreme caution. Expect heavy delays.",
            "hi": "अत्यंत सावधानी और धीमी गति से आगे बढ़ें। भारी देरी संभव है।",
            "as": "অতি সাৱধানেৰে ধীৰে ধীৰে আগবাঢ়ক। পথত পলম হ'ব পাৰে।",
            "mz": "Fimkhur tak leh muangchangin kal rawh. Thlen a tlai ang.",
            "mn": "য়াম্না চেকশিন্না তপ্না চৎলো। মতম থোঙনা চঙগনি।",
            "bn": "সর্বোচ্চ সতর্কতা সহকারে ধীর গতিতে চালান। যানজট হতে পারে।"
        }
    }

    @classmethod
    def generate_multilingual_alert(
        cls,
        corridor_name: str,
        location_name: str,
        damage_type: DamageType,
        severity: AlertSeverity,
        action_key: str = "divert_alternate",
        custom_note: str = ""
    ) -> MultilingualText:
        """Create fully translated alert message in 6 languages."""
        inc_dict = cls.INCIDENT_NAMES.get(damage_type, cls.INCIDENT_NAMES[DamageType.LANDSLIDE])
        sev_dict = cls.SEVERITY_HEADERS.get(severity, cls.SEVERITY_HEADERS[AlertSeverity.WARNING])
        act_dict = cls.ACTIONS.get(action_key, cls.ACTIONS["divert_alternate"])

        # English
        en = (
            f"[{sev_dict['en']}] {inc_dict['en']} reported near {location_name} on {corridor_name}. "
            f"{act_dict['en']} {custom_note}".strip()
        )

        # Hindi
        hi = (
            f"[{sev_dict['hi']}] {corridor_name} पर {location_name} के समीप {inc_dict['hi']} की सूचना। "
            f"{act_dict['hi']} {custom_note}".strip()
        )

        # Assamese
        as_ = (
            f"[{sev_dict['as']}] {corridor_name}-ৰ {location_name}-ৰ ওচৰত {inc_dict['as']} সংঘটিত হৈছে। "
            f"{act_dict['as']} {custom_note}".strip()
        )

        # Mizo
        mz = (
            f"[{sev_dict['mz']}] {corridor_name} a {location_name} bulah {inc_dict['mz']} a thleng. "
            f"{act_dict['mz']} {custom_note}".strip()
        )

        # Manipuri
        mn = (
            f"[{sev_dict['mn']}] {corridor_name} গী {location_name} মনাক্তা {inc_dict['mn']} থোক্লে। "
            f"{act_dict['mn']} {custom_note}".strip()
        )

        # Bengali
        bn = (
            f"[{sev_dict['bn']}] {corridor_name}-এর {location_name}-এর কাছে {inc_dict['bn']} ঘটেছে। "
            f"{act_dict['bn']} {custom_note}".strip()
        )

        return MultilingualText(
            en=en,
            hi=hi,
            as_=as_,
            mz=mz,
            mn=mn,
            bn=bn
        )


# Global singleton
multilingual_service = MultilingualAlertService()
