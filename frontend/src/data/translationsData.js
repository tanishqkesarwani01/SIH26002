// Multilingual Emergency Broadcast Templates for 6 Northeast Regional Languages

export const EMERGENCY_TRANSLATIONS = {
  en: {
    langCode: "en-IN",
    langName: "English",
    flag: "🇬🇧",
    region: "National / Inter-State Logistics Command",
    headline: "CRITICAL HIGHWAY DISRUPTION ALERT",
    alertBody: "EMERGENCY ADVISORY: NH-6 Sonapur Tunnel section is BLOCKED due to a major landslide (3,800 cu.m debris). All in-transit freight and medical supplies heading to Silchar, Tripura, and Mizoram are strictly instructed to divert via NH-27 Haflong East-West Corridor. BRO clearing machinery is deployed. Estimated clearance: 5.5 hours.",
    driverSmsText: "ALERT: NH-6 Sonapur is closed due to landslide. Heavy trucks & tankers divert immediately to NH-27 via Dabaka-Haflong. Safe parking at Jowai bay. Emergency Control: 1070.",
    whatsappTemplate: `🚨 *NER LOGISTICS RESILIENCE PLATFORM | URGENT TRAFFIC DISPATCH* 🚨\n\n⚠️ *Incident:* Severe Landslide & Highway Severance\n📍 *Location:* NH-6 Sonapur Tunnel (KM 141.2)\n🚧 *Corridor Status:* RED / FULLY BLOCKED\n\n🔄 *REROUTE DIRECTIVE FOR DRIVERS:*\n• *Critical Medical & Oxygen:* Priority escort via NH-27 (Lumding-Haflong-Silchar).\n• *Commercial Freight:* Park at nearest certified holding bay.\n• *Estimated Clearance:* ~5.5 Hours (BRO Project Pushpak engaged).\n\n📞 *Control Tower Helpline:* 1800-345-3882\n🌐 *Live GIS Navigation:* https://ner-lrp.gov.in/nav?cid=nh-6`,
    ttsVoiceHint: "en-IN"
  },
  hi: {
    langCode: "hi-IN",
    langName: "हिन्दी (Hindi)",
    flag: "🇮🇳",
    region: "National Highway Network",
    headline: "अति आवश्यक राजमार्ग अवरोध सूचना",
    alertBody: "आपातकालीन चेतावनी: एनएच-6 सोनापुर सुरंग क्षेत्र भारी भूस्खलन (3,800 घन मीटर मलबा) के कारण पूर्णतः अवरुद्ध है। सिलचर, त्रिपुरा और मिजोरम जाने वाले सभी मालवाहक वाहनों और आवश्यक मेडिकल आपूर्ति को तुरंत एनएच-27 हाफलोंग मार्ग से डायवर्ट किया जा रहा है। बीआरओ मशीनरी मलबा हटाने में जुटी है। अनुमानित समय: 5.5 घंटे।",
    driverSmsText: "चेतावनी: एनएच-6 सोनापुर भूस्खलन से बंद है। सभी ट्रक तुरंत एनएच-27 हाफलोंग मार्ग लें। आपातकालीन नंबर: 1070।",
    whatsappTemplate: `🚨 *पूर्वोत्तर रसद लचीलापन प्लेटफॉर्म | आपातकालीन सूचना* 🚨\n\n⚠️ *घटना:* भारी भूस्खलन व मार्ग अवरोध\n📍 *स्थान:* एनएच-6 सोनापुर टनल (किमी 141.2)\n🚧 *स्थिति:* लाल / पूर्णतः बंद\n\n🔄 *चालकों के लिए डायवर्जन निर्देश:*\n• *ऑक्सीजन व दवा वाहन:* एनएच-27 हाफलोंग-सिलचर मार्ग से तत्काल रवाना हों।\n• *व्यावसायिक ट्रक:* जोवाई होल्डिंग बे पर सुरक्षित रुकें।\n• *सड़क खुलने का अनुमानित समय:* ~5.5 घंटे।\n\n📞 *कंट्रोल रूम:* 1800-345-3882`,
    ttsVoiceHint: "hi-IN"
  },
  as: {
    langCode: "as-IN",
    langName: "অসমীয়া (Assamese)",
    flag: "🌿",
    region: "Assam & Brahmaputra Valley",
    headline: "জৰুৰী ৰাষ্ট্ৰীয় ঘাইপথ অৱৰোধ সতৰ্কবাৰ্তা",
    alertBody: "জৰুৰী সতৰ্কবাৰ্তা: ৬ নং ৰাষ্ট্ৰীয় ঘাইপথৰ সোণাপুৰ সুৰংগ অঞ্চলত প্ৰবল ভূমিস্খলনৰ বাবে পথ সম্পূৰ্ণৰূপে বন্ধ হৈ পৰিছে। শিলচৰ, ত্ৰিপুৰা আৰু মিজোৰাম অভিমুখী সকলো খাদ্য সামগ্ৰী, ঔষধ আৰু অক্সিজেন পৰিবাহী বাহনক ২৭ নং ৰাষ্ট্ৰীয় ঘাইপথ (হাফলং হৈ) বিকল্প পথেৰে যাবলৈ নিৰ্দেশ দিয়া হৈছে। বিআৰঅ'ৰ পথ পৰিষ্কাৰ অভিযান অব্যাহত।",
    driverSmsText: "সতৰ্কবাৰ্তা: ভূমিস্খলনৰ বাবে NH-6 সোণাপুৰ বন্ধ। সকলো ট্ৰাক ২৭ নং ঘাইপথ হাফলং হৈ ডাইভাৰ্ট কৰক। হেল্পলাইন: ১০৭০।",
    whatsappTemplate: `🚨 *উত্তৰ-পূব লজিষ্টিক কমাণ্ড টাৱাৰ | জৰুৰী ঘোষণা* 🚨\n\n⚠️ *ঘটনা:* প্ৰচণ্ড ভূমিস্খলন আৰু পথ অৱৰোধ\n📍 *স্থান:* NH-6 সোণাপুৰ সুৰংগ (১৪১.২ কিমি)\n🚧 *স্থিতি:* সম্পূৰ্ণৰূপে বন্ধ (ৰঙা সতৰ্কবাৰ্তা)\n\n🔄 *চালকসকলৰ বাবে বিকল্প পথৰ নিৰ্দেশ:*\n• *মেডিকেল আৰু অক্সিজেন বাহন:* ২৭ নং ৰাষ্ট্ৰীয় ঘাইপথ (হাফলং-শিলচৰ) ব্যৱহাৰ কৰক।\n• *পণ্যবাহী ট্ৰাক:* ওচৰৰ সুৰক্ষিত স্থানত ৰখাই থওক।\n• *পথ মুকলিৰ আনুমানিক সময়:* ৫.৫ ঘণ্টা।\n\n📞 *নিয়ন্ত্ৰণ কক্ষ:* ১৮০০-৩৪৫-৩৮৮২`,
    ttsVoiceHint: "as-IN"
  },
  mz: {
    langCode: "lus-IN",
    langName: "Mizo ṭawng (Mizo)",
    flag: "🏔️",
    region: "Mizoram Logistics Corridor",
    headline: "KHAWPUI LEH KAWNGPUI HNARKAW DISRUPTION ALERT",
    alertBody: "HRIATTIRNA PAWIMAWH: NH-6 Sonapur Tunnel bula lei min nasa tak avangin kawng a ping vek. Silchar leh Mizoram pan motor, damdawi leh oxygen phur zawng zawngte NH-27 Haflong kawng lam zawh turin hriattir in ni. BRO ten kawng laih tlang hna an thawk mek a, darkar 5.5 hnu velah hawn beisei a ni.",
    driverSmsText: "HRIATTIRNA: NH-6 Sonapur lei min avangin a tlang theih loh. Motor lian zawng zawng NH-27 Haflong kawng zawh rawh u. Helpline: 1070.",
    whatsappTemplate: `🚨 *NER LOGISTICS RESILIENCE | HRIATTIRNA PAWIMAWH* 🚨\n\n⚠️ *Thil Thleng:* Lei min nasa tak\n📍 *Hmun:* NH-6 Sonapur Tunnel (KM 141.2)\n🚧 *Dinhmun:* A Tlang Theih Loh / Ping Vek\n\n🔄 *KHAWLTHENG MOTOR KAWNG PENG:*\n• *Damdawi & Oxygen Phur:* NH-27 (Haflong kaltlang) zawh nghal rawh u.\n• *Bungraw Phur:* Hmun him laiah lo innghak rih rawh u.\n• *Hawn Hun Beisei:* Darkar ~5.5 hnuah.\n\n📞 *Control Tower:* 1800-345-3882`,
    ttsVoiceHint: "hi-IN"
  },
  mni: {
    langCode: "mni-IN",
    langName: "মৈতৈলোন্ (Manipuri)",
    flag: "🌸",
    region: "Manipur & Barak Lifeline",
    headline: "লম্বী-থোং ৱাফমগী অথোইবা চেকশিল ৱারোল",
    alertBody: "চেকশিল ৱারোল: NH-6 সোনাপুর টনেলদা নুংখ্ৰুং য়াম্না থুংদুনা লম্বী পুম্নমক থিংজিনখ্ৰে। মণিপুর, শিলচর অমসুং ত্রিপুরাদা চৎকদবা হিদাক-লাংথক অমসুং অক্সিজেন পুবা গাডী পুম্নমক NH-27 হাফলং লম্বীদগী লেন্থোকহন্নবা খঙহনজরি। বি.আর.ও.না লম্বী শেংদোকপগী থবক কন্না চত্থরি।",
    driverSmsText: "চেকশিল ৱারোল: NH-6 সোনাপুরদা নুংখ্ৰুং তাখিবনা লম্বী থিংলে। গাডীশিং NH-27 হাফলং লম্বীদা চৎলু। হেল্পলাইন: ১০৭০।",
    whatsappTemplate: `🚨 *নোর্থ ইষ্ট লোজিষ্টিক্স কমান্দ | অথোইবা লাউথোকপা* 🚨\n\n⚠️ *থৌদোক:* নুংখ্ৰুং থুংদুনা লম্বী থিংবা\n📍 *মফম:* NH-6 সোনাপুর টনেল\n🚧 *ফিভম:* লম্বী অপুনবা থিংলে (RED)\n\n🔄 *গাডী থৌবশিংদা খঙহনবা:*\n• *হিদাক অমসুং অক্সিজেন পুবা:* NH-27 হাফলং লম্বীদা লেন্থোকউ।\n• *পোট পুবা গাডী:* শেফ পার্কিংদা লেপসি।\n• *লম্বী শেংদোকপগী মতম:* পুং ৫.৫ মুক।\n\n📞 *হেল্পলাইন:* ১৮০০-৩৪৫-৩৮৮২`,
    ttsVoiceHint: "bn-IN"
  },
  bn: {
    langCode: "bn-IN",
    langName: "বাংলা (Bengali)",
    flag: "🌊",
    region: "Barak Valley, Tripura & Silchar",
    headline: "জরুরি মহাসড়ক অবরুদ্ধ সতর্কবার্তা",
    alertBody: "জরুরি সতর্কবার্তা: ভারী ভূমিধসের কারণে ৬ নং জাতীয় সড়কের সোনাপুর টানেল সংলগ্ন অংশ সম্পূর্ণ বন্ধ হয়ে গেছে। শিলচর, ত্রিপুরা ও করিমগঞ্জ অভিমুখী সমস্ত পণ্যবাহী গাড়ি ও জরুরি মেডিকেল অক্সিজেন কনভয় অবিলম্বে ২৭ নং জাতীয় সড়ক (হাফলং দিয়ে) বিকল্প পথ ব্যবহার করার জন্য নির্দেশ দেওয়া হচ্ছে। বিআরও-এর ৩টি খননকারী যন্ত্র মোতায়েন রয়েছে। আনুমানিক সময়: ৫.৫ ঘণ্টা।",
    driverSmsText: "সতর্কবার্তা: ভূমিধসের কারণে NH-6 সোনাপুর বন্ধ। সব ট্রাক ২৭ নং জাতীয় সড়ক হাফলং হয়ে ডাইভার্ট করুন। কন্ট্রোল রুম: ১০৭০।",
    whatsappTemplate: `🚨 *উত্তর-পূর্ব লজিস্টিক রেজিলিয়েন্স কমান্ড টাওয়ার | জরুরি বুলেটিন* 🚨\n\n⚠️ *ঘটনা:* তীব্র ভূমিধস ও মহাসড়ক অবরুদ্ধ\n📍 *স্থান:* NH-6 সোনাপুর টানেল (KM 141.2)\n🚧 *অবস্থা:* সম্পূর্ণ অবরুদ্ধ (RED ALERT)\n\n🔄 *ড্রাইভারদের জন্য জরুরি ডাইভারশন নির্দেশ:*\n• *মেডিকেল ও অক্সিজেন যান:* অবিলম্বে NH-27 (হাফলং-শিলচর) রুট ব্যবহার করুন।\n• *সাধারণ পণ্যবাহী ট্রাক:* নিকটবর্তী নিরাপদ জোনে অপেক্ষা করুন।\n• *সড়ক স্বাভাবিক হওয়ার আনুমানিক সময়:* ~৫.৫ ঘণ্টা।\n\n📞 *কন্ট্রোল টাওয়ার হেল্পলাইন:* ১৮০০-৩৪৫-৩৮৮২`,
    ttsVoiceHint: "bn-IN"
  }
};
