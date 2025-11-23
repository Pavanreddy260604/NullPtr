// questionsData.ts
export interface MCQQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    topic?: string;
}

export interface FillBlankQuestion {
    id: string;
    question: string;
    correctAnswer: string;
    explanation: string;
    topic?: string;
}

export interface DescriptiveQuestion {
    id: string;
    question: string;
    answer: string;
    topic?: string;
}

export interface Unit {
    unit: number;
    title: string;
    subtitle: string;
    mcqs: MCQQuestion[];
    fillBlanks: FillBlankQuestion[];
    descriptive: DescriptiveQuestion[];
}

export const questionsData = {
    units: [
        {
            "unit": 3,
            "title": "Sentiment Analysis",
            "subtitle": "Understanding Emotions and Opinions from Text",
            "mcqs": [
                {
                    "id": "u3-mcq-1",
                    "question": "__________ is a difficult word to define. It is often linked to or confused with other terms like belief, view, opinion, and conviction.",
                    "options": [
                        "Mining",
                        "Analysis",
                        "Sentiment",
                        "Text"
                    ],
                    "correctAnswer": 2,
                    "explanation": "Sentiment is a difficult word to define. It is often linked to or confused with other terms like belief, view, opinion, and conviction.",
                    "topic": "Sentiment Basics"
                },
                {
                    "id": "u3-mcq-2",
                    "question": "As a field of research, sentiment analysis is closely related to __________ linguistics, natural language processing, and text mining.",
                    "options": [
                        "Estimate",
                        "Computational",
                        "Conjecture",
                        "Guesstimate"
                    ],
                    "correctAnswer": 1,
                    "explanation": "As a field of research, sentiment analysis is closely related to computational linguistics, natural language processing, and text mining.",
                    "topic": "Research Fields"
                },
                {
                    "id": "u3-mcq-3",
                    "question": "The __________ analyses of textual data are often visualized in easy-to-understand dashboards.",
                    "options": [
                        "Real-time",
                        "Current",
                        "Past",
                        "Mixed"
                    ],
                    "correctAnswer": 0,
                    "explanation": "Real-time analysis is crucial in sentiment analysis, allowing immediate insights from social media and customer feedback.",
                    "topic": "Data Visualization"
                },
                {
                    "id": "u3-mcq-4",
                    "question": "__________ is an integral part of an analytic CRM and customer experience management systems.",
                    "options": [
                        "Voice of the Customer (VOC)",
                        "Voice of the Market (VOM)",
                        "Voice of the Employee (VOE)",
                        "None"
                    ],
                    "correctAnswer": 0,
                    "explanation": "Voice of the Customer (VOC) integrates sentiment analysis into CRM systems to understand customer feedback.",
                    "topic": "CRM Applications"
                },
                {
                    "id": "u3-mcq-5",
                    "question": "__________ is about understanding aggregate opinions and trends. It's about knowing what stakeholders are saying about your products and services.",
                    "options": [
                        "Voice of the Customer (VOC)",
                        "Voice of the Market (VOM)",
                        "Voice of the Employee (VOE)",
                        "None"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Voice of the Market (VOM) focuses on understanding broader market opinions and trends about products.",
                    "topic": "Market Analysis"
                },
                {
                    "id": "u3-mcq-6",
                    "question": "__________ is a large lexical database of English, including nouns, verbs, adjectives, and adverbs grouped into sets of cognitive synonyms.",
                    "options": [
                        "Worldwide Net",
                        "Internet",
                        "WordNet",
                        "Intranet"
                    ],
                    "correctAnswer": 2,
                    "explanation": "WordNet is a lexical database that groups words into synsets and is widely used in NLP and sentiment analysis.",
                    "topic": "NLP Tools"
                },
                {
                    "id": "u3-mcq-7",
                    "question": "TREC stands for __________.",
                    "options": [
                        "Term Retrieval Conference",
                        "Trade Retrieval Conference",
                        "Trivial Retrieval Conference",
                        "Text Retrieval Conference"
                    ],
                    "correctAnswer": 3,
                    "explanation": "Text Retrieval Conference (TREC) is a research program for evaluating text retrieval methodologies.",
                    "topic": "Research Conferences"
                },
                {
                    "id": "u3-mcq-8",
                    "question": "CLEF stands for __________.",
                    "options": [
                        "Care Language Evaluation Forum",
                        "Cross Language Evaluation Forum",
                        "Cover Language Evaluation Forum",
                        "Connect Language Evaluation Forum"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Cross Language Evaluation Forum (CLEF) evaluates multilingual information access systems.",
                    "topic": "Evaluation Forums"
                },
                {
                    "id": "u3-mcq-9",
                    "question": "__________ approach focuses on explicit indications of sentiment and context of the spoken content within the audio.",
                    "options": [
                        "Latest",
                        "Loss Less",
                        "Linguistic",
                        "Learning"
                    ],
                    "correctAnswer": 2,
                    "explanation": "The linguistic approach in speech analytics analyzes the words and context of spoken content to determine sentiment.",
                    "topic": "Speech Analytics"
                }
            ],
            "fillBlanks": [
                {
                    "id": "u3-fb-1",
                    "question": "__________ has many names. It's often referred to as opinion mining, subjectivity analysis, and appraisal extraction.",
                    "correctAnswer": "Sentiment analysis",
                    "explanation": "Sentiment analysis is also known by several other names in the research community, including opinion mining and subjectivity analysis.",
                    "topic": "Sentiment Basics"
                },
                {
                    "id": "u3-fb-2",
                    "question": "__________ is one of those companies that provide such end-to-end solutions to companies' text analytics needs.",
                    "correctAnswer": "Attensity",
                    "explanation": "Attensity is a company specializing in providing comprehensive text analytics solutions for businesses.",
                    "topic": "Industry Tools"
                },
                {
                    "id": "u3-fb-3",
                    "question": "Traditionally, __________ has been limited to employee satisfaction surveys.",
                    "correctAnswer": "Voice of the Employee",
                    "explanation": "Voice of the Employee (VOE) analytics has traditionally focused on employee satisfaction surveys.",
                    "topic": "Employee Analytics"
                },
                {
                    "id": "u3-fb-4",
                    "question": "__________ management focuses on listening to social media where anyone can post opinions that can damage or boost your reputation.",
                    "correctAnswer": "Brand",
                    "explanation": "Brand management uses sentiment analysis to monitor and respond to social media conversations that affect brand reputation.",
                    "topic": "Brand Management"
                },
                {
                    "id": "u3-fb-5",
                    "question": "A __________ is essentially a catalog of words, their synonyms, and their meanings for a given language.",
                    "correctAnswer": "lexicon",
                    "explanation": "A lexicon is a vocabulary database that contains words and their meanings, crucial for sentiment analysis.",
                    "topic": "Lexicon"
                },
                {
                    "id": "u3-fb-6",
                    "question": "The __________ approach to sentiment analysis relies on extracting and measuring a specific set of features of the audio.",
                    "correctAnswer": "acoustic",
                    "explanation": "The acoustic approach analyzes audio features like pitch, tone, and volume to determine sentiment in speech.",
                    "topic": "Speech Analytics"
                },
                {
                    "id": "u3-fb-7",
                    "question": "Large vocabulary continuous speech recognition (LVCSR) system is often referred to as __________.",
                    "correctAnswer": "speech-to-text",
                    "explanation": "LVCSR systems convert spoken language into written text, enabling linguistic analysis of speech.",
                    "topic": "Speech Recognition"
                }
            ],
            "descriptive": [
                {
                    "id": "u3-1a",
                    "question": "1a) Define Sentiment analysis?",
                    "answer": "Sentiment is a difficult word to define. It is often linked to or confused with other terms like belief, view, opinion, and conviction. As a field of research, sentiment analysis is closely related to computational linguistics, natural language processing, and text mining. Sentiment analysis has many names. It's often referred to as opinion mining, subjectivity analysis, and appraisal extraction, with some connections to affective computing (computer recognition and expression of emotion).",
                    "topic": "Sentiment Basics"
                },
                {
                    "id": "u3-1b",
                    "question": "1b) Explain how sentiment analysis is related to text mining?",
                    "answer": "Sentiment that appears in text comes in two flavors: explicit, where the subjective sentence directly expresses an opinion (\"It's a wonderful day\"), and implicit, where the text implies an opinion (\"The handle breaks too easily\").\n\nSentiment polarity is a particular feature of text that sentiment analysis primarily focuses on. It is usually dichotomized into two-positive and negative-but polarity can also be thought of as a range. A document containing several opinionated statements would have a mixed polarity overall, which is different from not having a polarity at all (being objective) (Mejova, 2009).",
                    "topic": "Text Mining"
                },
                {
                    "id": "u3-1c",
                    "question": "1c) Illustrate the common challenges that sentiment analysis has to deal with?",
                    "answer": "Sentiment analysis, the task of determining the sentiment or emotion expressed in a piece of text, faces several challenges. Here are some common challenges associated with sentiment analysis:\nAmbiguity and Context: Sentences can be ambiguous, and the sentiment may change based on the context. For example, the phrase \"cool\" could mean positive or low temperature, depending on the context.\nNegation: Sentiments can be negated by the presence of words like \"not\" or \"but,\" which can reverse the sentiment expressed. For example, \"not bad\" has a positive sentiment.\nSarcasm and Irony: Text often contains sarcasm or irony, where the literal meaning is different from the intended sentiment. Detecting these nuances can be challenging for sentiment analysis models.\nDomain-specific Language: Sentiment analysis models trained on one domain may not perform well in another domain. The sentiment expressed in reviews about movies may differ significantly from sentiment in product reviews.\nEmoticons and Abbreviations: People often use emoticons, emojis, and abbreviations in online communication. Interpreting these symbols and understanding their impact on sentiment can be challenging.\nSubjectivity: Sentiments can be subjective, varying between individuals. What one person perceives as positive, another might interpret differently. Models must account for this subjectivity.\nData Imbalance: Sentiment analysis datasets may be imbalanced, with more examples of one sentiment class than others. This can lead models to be biased toward the majority class.\nMultilingual Challenges: Sentiment analysis becomes more complex when dealing with multiple languages. Different languages express sentiment in unique ways, and models need to account for these variations.\nHandling Short Texts: Social media posts, comments, or reviews are often short, making it challenging to capture the context and sentiment accurately.\nDynamic Language Use: Language is dynamic and evolves over time. New slang, expressions, or changes in word usage can affect the performance of sentiment analysis models, especially if they are not regularly updated.\nAspect-based Sentiment Analysis: Understanding sentiment about specific aspects or features of a product or service is more challenging than overall sentiment analysis. A review might express positive sentiment overall but contain negative feedback about a specific aspect.\nEmotional Valence: Sentiment is not always binary (positive or negative); it can also have degrees of positivity or negativity. Capturing the intensity of sentiment adds another layer of complexity.\nData Annotation Challenges: Creating a well-annotated dataset for training a sentiment analysis model can be challenging, as labeling sentiment is subjective, and annotators may interpret text differently.",
                    "topic": "Challenges"
                },
                {
                    "id": "u3-2a",
                    "question": "2a) List out the various sentiment analysis applications?",
                    "answer": "1. VOICE OF THE CUSTOMER (VOC) Voice of the customer (VOC)\n2. VOICE OF THE MARKET (VOM) Voice of the market.\n3. VOICE OF THE EMPLOYEE (VOE)\n4. BRAND MANAGEMENT.\n5. FINANCIAL MARKETS.\n6. POLITICS\n7. GOVERNMENT INTELLIGENCE.\n8. OTHER INTERESTING AREAS",
                    "topic": "Applications"
                },
                {
                    "id": "u3-2b",
                    "question": "2b) Explain how can sentiment analysis be used for brand management?",
                    "answer": "BRAND MANAGEMENT Brand management focuses on listening to social media where anyone (past/current/ prospective customers, industry experts, other authorities) can post opinions that can damage or boost your reputation. There are a number of relatively newly launched start-up companies that offer analytics-driven brand management services for others. Brand management is product and company (rather than customer) focused. It attempts to shape perceptions rather than to manage experiences using sentiment analysis techniques.",
                    "topic": "Brand Management"
                },
                {
                    "id": "u3-2c",
                    "question": "2c) Explain briefly all the applications of Sentiment analysis?",
                    "answer": "VOICE OF THE CUSTOMER (VOC) Voice of the customer (VOC) is an integral part of an analytic CRM and customer experience management systems. As the enabler of VOC, sentiment analysis can access a company's product and service reviews (either continuously or periodically) to better understand and better manage the customer complaints and praises.\n\nVOICE OF THE MARKET (VOM) Voice of the market is about understanding aggregate opinions and trends. It's about knowing what stakeholders- customers, potential customers, influencers, whoever- are saying about your (and your competitors') products and services. A well-done VOM analysis helps companies with competitive intelligence and product development and positioning.\n\nVOICE OF THE EMPLOYEE (VOE) Traditionally VOE has been limited to employee satisfaction surveys. Text analytics in general (and sentiment analysis in particular) is a huge enabler of assessing the VOE. Using rich, opinionated textual data is an effective and efficient way to listen to what employees are saying. As we all know, happy employees empower customer experience efforts and improve customer satisfaction.\n\nBRAND MANAGEMENT Brand management focuses on listening to social media where anyone (past/current/ prospective customers, industry experts, other authorities) can post opinions that can damage or boost your reputation. There are a number of relatively newly launched start-up companies that offer analytics-driven brand management services for others. Brand management is product and company (rather than customer) focused. It attempts to shape perceptions rather than to manage experiences using sentiment analysis techniques.\n\nFINANCIAL MARKETS Predicting the future values of individual (or a group oD stocks has been an interesting and seemingly unsolvable problem. What makes a stock (or a group of stocks) move up or down is anything but an exact science.\n\nPOLITICS As we all know, opm1ons matter a great deal in politics. Because political discussions are dominated by quotes, sarcasm, and complex references to persons, organizations, and ideas, politics is one of the most difficult, and potentially fruitful, areas for sentiment analysis.\n\nGOVERNMENT INTELLIGENCE Government intelligence is another application that has been used by intelligence agencies. For example, it has been suggested that one could monitor sources for increases in hostile or negative communications. Sentiment analysis can allow the automatic analysis of the opinions that people submit about pending policy or government-regulation proposals.\n\nOTHER INTERESTING AREAS Sentiments of customers can be used to better design e-commerce sites (product suggestions, upsell/ cross-sell advertising), better place advertisements (e.g., placing dynamic advertisement of products and services that consider the sentiment on the page the user is browsing), and manage opinion- or review-oriented search engines (i.e., an opinion-aggregation Web site, an alternative to sites like Epinions, summarizing user reviews).",
                    "topic": "Applications"
                },
                {
                    "id": "u3-3a",
                    "question": "3a) Define the Sentiment analysis Process?",
                    "answer": "Sentiment analysis, also known as opinion mining, is the process of using natural language processing, text analysis, and computational linguistics to determine and extract subjective information from source materials. The goal of sentiment analysis is to understand the sentiment or opinion expressed in a piece of text, whether it's positive, negative, or neutral. Here's a general overview of the sentiment analysis process.",
                    "topic": "Sentiment Process"
                },
                {
                    "id": "u3-3b",
                    "question": "3b) List out various steps of Sentiment analysis Process ?",
                    "answer": "STEP 1: SENTIMENT DETECTION\nSTEP 2: N-P POLARITY CLASSIFICATION\nSTEP 3: TARGET IDENTIFICATION\nSTEP 4: COLLECTION AND AGGREGATION",
                    "topic": "Sentiment Process Steps"
                },
                {
                    "id": "u3-3c",
                    "question": "3c) Explain briefly A Multi-Step Process to Sentiment Analysis ?",
                    "answer": "The process of sentiment analysis generally involves four main steps:\nStep 1: Sentiment Detection – This step focuses on identifying whether a text expresses a fact or an opinion. It classifies the text as objective (fact-based) or subjective (opinion-based).\nStep 2: Polarity Classification – Once an opinion is detected, the next step is to determine its polarity—whether the sentiment is positive or negative. This is a binary classification task, like labeling a review as \"thumbs up\" or \"thumbs down.\"\nStep 3: Target Identification – Here, the goal is to identify the object or entity the sentiment is directed toward (e.g., a person, product, or event). While it's easier in product reviews, it becomes difficult for general texts like blogs or news articles that mention multiple subjects.\nStep 4: Collection and Aggregation – Finally, all identified sentiments are combined to form an overall sentiment score or summary for the document. This can be done by adding up sentiment values or using advanced semantic aggregation techniques for more accurate results.",
                    "topic": "Multi-Step Process"
                },
                {
                    "id": "u3-4a",
                    "question": "4a) Define polarity identification?",
                    "answer": "polarity identification-identifying the polarity of a text-can be made at the word, term, sentence, or document level. The most granular level for polarity identification is at the word level. Once the polarity identification is made at the word level, then it can be aggregated to the next higher level, and then the next until the level of aggregation desired from the sentiment analysis is reached.",
                    "topic": "Polarity"
                },
                {
                    "id": "u3-4b",
                    "question": "4b) List out the two dominant techniques used for identification of polarity?",
                    "answer": "1. Using a lexicon as a reference library (either developed manually or automatically, by an individual for a specific task or developed by an institution for general use)\n\n2. Using a collection of training documents as the source of knowledge about the polarity of terms within a specific domain (i.e., inducing predictive models from opinionated textual documents).",
                    "topic": "Polarity Techniques"
                },
                {
                    "id": "u3-4c",
                    "question": "4c) Explain briefly identification of polarity using a Lexicon?",
                    "answer": "A lexicon is a collection or dictionary of words, their meanings, and synonyms for a particular language. In sentiment analysis, lexicons help identify the emotional tone of words. For English, there are several general-purpose lexicons, the most well-known being WordNet, developed at Princeton University. WordNet has been widely used and extended to create special-purpose lexicons for various research projects. An important extension of WordNet was made by Esuli and Sebastiani (2006), who added polarity (Positive–Negative) and objectivity (Subjective–Objective) labels to each term. They achieved this by classifying each group of synonyms (called a synset) using ternary classifiers, which assign one of three labels—Positive, Negative, or Objective—to help analyze sentiment more accurately.\nSentiWordNet assigns to each synset of WordNet three sentiment scores: positivity, negativity, objectivity. More about SentiWordNet can be found at sentiworclnet.isti.cnr.it.",
                    "topic": "Lexicon Polarity"
                },
                {
                    "id": "u3-4d",
                    "question": "4d) Explain briefly identification of polarity using a collection of training documents?",
                    "answer": "Sentiment classification can be done using statistical and machine learning techniques that make use of large collections of labeled documents, which are often manually annotated or rated using a star or point system. Popular review websites such as Amazon, CNET, eBay, RottenTomatoes, and IMDB provide valuable sources of such labeled data. These rating systems clearly indicate the overall sentiment polarity (positive or negative) of a review and are widely considered a gold standard for evaluating sentiment analysis algorithms.\n\nIdentifying Semantic Orientation of Sentences and Phrases\nOnce the semantic orientation (positive or negative meaning) of individual words is known, it can be extended to the phrase or sentence in which the words appear. The simplest way to do this is by averaging the polarity values of all the words in the phrase or sentence to determine the overall sentiment. However, more advanced approaches may use machine learning techniques to build predictive models that analyze the relationship between words, their polarity scores, and the overall sentiment of the phrase or sentence.\nIdentifying Semantic Orientation of Document\nEven though the vast majority of the work in this area is done in determining semantic orientation of words and phrases/ sentences, some tasks like summarization and information retrieval may require semantic labeling of the whole document (REF).",
                    "topic": "Training Documents Polarity"
                },
                {
                    "id": "u3-5a",
                    "question": "5a) Define the Speech analytics?",
                    "answer": "Speech analytics is a growing field of science that allows users to analyze and extract information from both live and recorded conversations. It is being used effectively to gather intelligence for security purposes, to enhance the presentation and utility of rich media applications, and perhaps most significantly, to deliver meaningful and quantitative business intelligence through the analysis of the millions of recorded calls that occur in customer contact centers around the world.",
                    "topic": "Speech Analytics"
                },
                {
                    "id": "u3-5b",
                    "question": "5b) List out the Two steps approach of Speech analytics?",
                    "answer": "THE ACOUSTIC APPROACH:The acoustic approach to sentiment analysis focuses on analyzing the audio features of speech rather than the words themselves. It examines how something is said rather than what is said. This method relies on extracting and measuring characteristics such as tone of voice, pitch or volume, speech intensity, and rate of speech. These acoustic features help identify the speaker's emotional state, such as happiness, anger, sadness, or excitement, providing valuable insight into the sentiment behind spoken communication.\nTHE LINGUISTIC APPROACH The linguistic approach in sentiment analysis focuses on the explicit expressions of sentiment and the context within spoken or written content. It recognizes that when people are emotionally charged, they tend to use specific words, exclamations, or phrases in a certain sequence that reflects their emotions. This approach studies language patterns to detect underlying feelings. The main features analyzed in a linguistic model typically include:\nChoice of words and phrases\nUse of adjectives and adverbs\nSentence structure and syntax\nExclamations and emphasis words\nContextual meaning and polarity of expressions",
                    "topic": "Speech Analytics Approach"
                },
                {
                    "id": "u3-5c",
                    "question": "5c) Explain briefly the acoustic approach of Speech analytics?",
                    "answer": "The acoustic approach to sentiment analysis focuses on analyzing the sound characteristics of speech to understand emotions. It measures specific audio features such as tone, pitch, volume, intensity, and speech rate, which can indicate different sentiments. For instance, a surprised person usually speaks faster, louder, and with a higher pitch, while sadness or depression is reflected in slower, softer, and lower-pitched speech. An angry speaker, on the other hand, may talk very fast, loudly, and with high-pitched stressed vowels.\nThe main audio features used in this approach include:\nIntensity: Energy or sound pressure level.\nPitch: Variation in fundamental frequency.\nJitter: Variation in the amplitude of vocal fold movements.\nShimmer: Variation in the frequency of vocal fold movements.\nGlottal pulse: Glottal-source spectral characteristics.\nHNR (Harmonics-to-Noise Ratio): Ratio of harmonic sound to noise.\nSpeaking rate: Number of phonemes, vowels, syllables, or words spoken per unit time.",
                    "topic": "Acoustic Approach"
                },
                {
                    "id": "u3-5d",
                    "question": "5d) Explain briefly the linguistic approach of Speech analytics?",
                    "answer": "The linguistic approach to sentiment analysis focuses on the spoken content and its context, identifying explicit signs of emotion through the words and expressions used. It assumes that when people are emotionally charged, they are more likely to use certain words, exclamations, or phrases in specific patterns that reveal their sentiment.\nThe main features analyzed in a linguistic model include:\nLexical: Words, phrases, and linguistic patterns.\nDisfluencies: Filled pauses, hesitations, restarts, and nonverbal cues like laughter or breathing.\nHigher semantics: Contextual meaning, dialogue history, and pragmatic understanding.\nThe simplest method in this approach is to identify a limited set of keywords (a domain-specific lexicon) that signal particular emotions. However, this basic method is less popular because of its limited accuracy and narrow applicability. More advanced versions build machine learning models that analyze linguistic elements to predict emotions. These models are then applied to audio recordings to detect and interpret the sentiments expressed within them.",
                    "topic": "Linguistic Approach"
                },
                {
                    "id": "u3-6a",
                    "question": "6a) Define lexicon in sentiment analysis process?",
                    "answer": "In the context of sentiment analysis, the term \"lexicon\" refers to a predefined set of words or phrases associated with specific sentiments or emotions. These lexicons serve as dictionaries that categorize words into positive, negative, or neutral sentiments based on their inherent meaning. Lexicons are an essential component of sentiment analysis algorithms, helping to determine the overall sentiment expressed in a piece of text.\n\nThere are two main types of lexicons used in sentiment analysis:\nPolarity-based lexicons: These lexicons assign a polarity (positive, negative, or neutral) to each word. Words are often assigned a score or weight that reflects their strength of sentiment. For example, words like \"happy\" or \"joyful\" might be assigned a positive score, while words like \"sad\" or \"angry\" might be assigned a negative score.\n\nSubjectivity-based lexicons: In addition to polarity, some lexicons also include information about the subjectivity of a word. Words can be classified as either subjective (expressing personal opinions or feelings) or objective (factual and unbiased). Subjectivity information can be useful in understanding the nuance of sentiment in a given text.",
                    "topic": "Lexicon Definition"
                },
                {
                    "id": "u3-6b",
                    "question": "6b) List out the various audio features can be measured in acoustic approach in speech analytics?",
                    "answer": "• Intensity: energy, sound pressure level\n• Pitch: variation of fundamental frequency\n• Jitter: variation in amplitude of vocal fold movements\n• Shimmer: variation in frequency of vocal fold movements\n• Glottal pulse: glottal-source spectral characteristics\n• HNR: harmonics-to-noise ratio\n• Speaking rate: number of phonemes, vowels, syllables, or words per unit of time",
                    "topic": "Audio Features"
                },
                {
                    "id": "u3-6c",
                    "question": "6c) Draw the diagram and label the A Multi-Step Process to Sentiment Analysis?",
                    "answer": "[Diagram showing the 4-step process: Step 1: Sentiment Detection → Step 2: N-P Polarity Classification → Step 3: Target Identification → Step 4: Collection and Aggregation]",
                    "topic": "Sentiment Analysis Diagram"
                },
                {
                    "id": "u3-6d",
                    "question": "6d) Explain briefly N-P polarity classification with neat diagram?",
                    "answer": "N-P polarity classification typically refers to sentiment analysis or sentiment classification, where the goal is to determine the polarity (positive or negative) of a given text or document. The terms \"N\" and \"P\" stand for \"Negative\" and \"Positive,\" respectively.\n\nSentiment analysis has applications in various fields, including marketing, customer feedback analysis, social media monitoring, and more. The process involves using natural language processing (NLP) techniques to analyze the sentiment expressed in a piece of text.\n\nHere's a simplified overview of the steps involved in N-P polarity classification:\nText Preprocessing:\nTokenization: Breaking the text into individual words or tokens.\nLowercasing: Converting all words to lowercase to ensure consistency.\nRemoving stop words: Removing common words like \"and,\" \"the,\" etc., which may not contribute much to sentiment.\nFeature Extraction:\nTransforming the text into a format suitable for machine learning models. This could involve techniques like TF-IDF (Term Frequency-Inverse Document Frequency) or word embeddings.\nBuilding a Model:\nUsing a machine learning algorithm, such as a Naive Bayes classifier, Support Vector Machine (SVM), or deep learning models like recurrent neural networks (RNNs) or transformers.\nTraining the Model:\nTraining the model on a labeled dataset where each text is associated with its sentiment label (positive or negative).\nEvaluation:\nAssessing the model's performance on a separate set of data not used during training to ensure it generalizes well to new, unseen data.\nInference:\nUsing the trained model to predict the sentiment of new, unseen text.",
                    "topic": "N-P Polarity Classification"
                }
            ]
        },
        {
            "unit": 4,
            "title": "Web Mining & Web Analytics",
            "subtitle": "Discovering Patterns from Web Data",
            "mcqs": [
                {
                    "id": "u4-mcq-1",
                    "question": "The growth of the __________ and its enabling technologies has made data creation, data collection, and data/information/opinion exchange easier.",
                    "options": [
                        "Intranet",
                        "Internet",
                        "LAN",
                        "MAN"
                    ],
                    "correctAnswer": 1,
                    "explanation": "The Internet's growth has revolutionized data collection and information exchange globally.",
                    "topic": "Web Fundamentals"
                },
                {
                    "id": "u4-mcq-2",
                    "question": "The __________ serves as an enormous repository of data and information on virtually everything one can conceive.",
                    "options": [
                        "Worldwide Web",
                        "Sentiment Analysis",
                        "Text mining",
                        "Text Analysis"
                    ],
                    "correctAnswer": 0,
                    "explanation": "The World Wide Web is a vast repository of information accessible through the Internet.",
                    "topic": "Web Repository"
                },
                {
                    "id": "u4-mcq-3",
                    "question": "__________ refers to the extraction of useful information from Web pages.",
                    "options": [
                        "Web Usage mining",
                        "Web Structure mining",
                        "Web Text mining",
                        "Web Content mining"
                    ],
                    "correctAnswer": 3,
                    "explanation": "Web Content mining extracts useful information from the content of web pages.",
                    "topic": "Web Mining Types"
                },
                {
                    "id": "u4-mcq-4",
                    "question": "__________ are used to read through the content of a Web site automatically.",
                    "options": [
                        "Web Usage mining",
                        "Web Text mining",
                        "Web Crawlers",
                        "Web Content mining"
                    ],
                    "correctAnswer": 2,
                    "explanation": "Web crawlers (or spiders) automatically browse and index web pages.",
                    "topic": "Web Crawlers"
                },
                {
                    "id": "u4-mcq-5",
                    "question": "The idea of __________ stems from earlier information retrieval work using citations among journal articles to evaluate the impact of research papers.",
                    "options": [
                        "Authoritative mining",
                        "Authoritative pages",
                        "Authoritative Analysis",
                        "Authoritative crawlers"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Authoritative pages concept comes from citation analysis in academic research.",
                    "topic": "Page Authority"
                },
                {
                    "id": "u4-mcq-6",
                    "question": "__________ mining is the process of extracting useful information from the links embedded in Web documents.",
                    "options": [
                        "Web Usage mining",
                        "Web Structure mining",
                        "Web Text mining",
                        "Web Content mining"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Web Structure mining analyzes the link structure and relationships between web pages.",
                    "topic": "Structure Mining"
                },
                {
                    "id": "u4-mcq-7",
                    "question": "__________ is the popular term for information retrieval system.",
                    "options": [
                        "Search Engine",
                        "Sentiment Analysis",
                        "Planning",
                        "Execution"
                    ],
                    "correctAnswer": 0,
                    "explanation": "Search engines are systems designed to search for and retrieve information from the web.",
                    "topic": "Search Engines"
                },
                {
                    "id": "u4-mcq-8",
                    "question": "The __________ is responsible for receiving a search request from the user and converting it into a standardized data structure.",
                    "options": [
                        "Query Update",
                        "Query Optimizer",
                        "Query Resolver",
                        "Query Analyzer"
                    ],
                    "correctAnswer": 3,
                    "explanation": "The Query Analyzer processes and standardizes user search queries.",
                    "topic": "Search Components"
                },
                {
                    "id": "u4-mcq-9",
                    "question": "__________ is Google's Web crawling robot, which finds and retrieves pages on the Web.",
                    "options": [
                        "Google Indexer",
                        "Google Optimizer",
                        "Googlebot",
                        "Google Query Processor"
                    ],
                    "correctAnswer": 2,
                    "explanation": "Googlebot is Google's web crawler that discovers and fetches web pages for indexing.",
                    "topic": "Google Tools"
                },
                {
                    "id": "u4-mcq-10",
                    "question": "The __________ has several parts, including the user interface (search box), the engine that evaluates queries, and the results formatter.",
                    "options": [
                        "Google Indexer",
                        "Google Optimizer",
                        "Googlebot",
                        "Google Query Processor"
                    ],
                    "correctAnswer": 3,
                    "explanation": "The Google Query Processor handles user queries and formats search results.",
                    "topic": "Search Processing"
                }
            ],
            "fillBlanks": [
                {
                    "id": "u4-fb-1",
                    "question": "__________ is the process of discovering intrinsic relationships from Web data, which are expressed in the form of textual, linkage, or usage information.",
                    "correctAnswer": "Web mining",
                    "explanation": "Web mining discovers patterns and useful information from web data including text, links, and usage logs.",
                    "topic": "Web Mining"
                },
                {
                    "id": "u4-fb-2",
                    "question": "The structure of Web hyperlinks has led to another important category of Web pages called a __________.",
                    "correctAnswer": "Hub",
                    "explanation": "Hub pages are central pages that link to many authoritative pages on a topic.",
                    "topic": "Web Structure"
                },
                {
                    "id": "u4-fb-3",
                    "question": "The most popular publicly known and referenced algorithm used to calculate hubs and authorities is __________.",
                    "correctAnswer": "HITS",
                    "explanation": "HITS (Hyperlink-Induced Topic Search) is an algorithm for rating web pages based on hubs and authorities.",
                    "topic": "Ranking Algorithms"
                },
                {
                    "id": "u4-fb-4",
                    "question": "__________ is a software program that searches for documents based on the keywords that users have provided.",
                    "correctAnswer": "search engine",
                    "explanation": "A search engine indexes and retrieves web documents based on user queries.",
                    "topic": "Search Engines"
                },
                {
                    "id": "u4-fb-5",
                    "question": "The purpose of this __________ cycle is to create a huge database of documents/pages organized and indexed based on their content.",
                    "correctAnswer": "Development",
                    "explanation": "The development cycle in search engines involves crawling, indexing, and organizing web content.",
                    "topic": "Search Cycle"
                },
                {
                    "id": "u4-fb-6",
                    "question": "A __________ is a piece of software that systematically browses the World Wide Web for the purpose of finding and fetching Web pages.",
                    "correctAnswer": "Web crawler",
                    "explanation": "Web crawlers (or spiders) automatically discover and download web pages for indexing.",
                    "topic": "Crawlers"
                },
                {
                    "id": "u4-fb-7",
                    "question": "The __________ parses the search string into individual words/terms using tokenization, removal of stop words, stemming etc.",
                    "correctAnswer": "query analyzer",
                    "explanation": "The query analyzer processes and normalizes user search queries before retrieval.",
                    "topic": "Query Processing"
                },
                {
                    "id": "u4-fb-8",
                    "question": "Google uses a proprietary algorithm, called __________ to calculate the relative rank order of a given collection of Web pages.",
                    "correctAnswer": "PageRank",
                    "explanation": "PageRank is Google's algorithm that ranks web pages based on their link structure and importance.",
                    "topic": "PageRank"
                },
                {
                    "id": "u4-fb-9",
                    "question": "IDF stands for __________.",
                    "correctAnswer": "Inverse Document Frequency",
                    "explanation": "Inverse Document Frequency is a measure of how important a term is in a document collection.",
                    "topic": "Text Weighting"
                },
                {
                    "id": "u4-fb-10",
                    "question": "HITS stands for __________.",
                    "correctAnswer": "Hyperlink-Induced Topic Search",
                    "explanation": "HITS is an algorithm that rates web pages based on their hub and authority values.",
                    "topic": "Link Analysis"
                }
            ],
            "descriptive": [
                {
                    "id": "u4-1a",
                    "question": "1a) Define web mining?",
                    "answer": "Web mining (or Web data mining) is the process of discovering intrinsic relationships (i.e ., interesting and useful information) from Web data, which are expressed in the form of textual, linkage, or usage information.\n\nWeb mining is essentially the same as data mining that uses data generated over the Web. The goal is to turn vast repositories of business transactions, customer interactions, and Web site usage data into actionable information (i.e ., knowledge) to promote better decision making throughout the enterprise. Because of the increased popularity of the term analytics, nowadays many have started to call Web mining Web analytics.",
                    "topic": "Web Mining"
                },
                {
                    "id": "u4-1b",
                    "question": "1b) List out the challenges of web for effective and efficient knowledge discovery?",
                    "answer": "The Web also poses great challenges for effective and efficient knowledge discovery (Han and Kamber, 2006):\n\nThe Web is too big for effective data mining.\nThe Web is too complex.\nThe Web is too dynamic.\nThe Web is not specific to a domain.\nThe Web is not specific to a domain.\nThe Web has everything.",
                    "topic": "Web Challenges"
                },
                {
                    "id": "u4-1c",
                    "question": "1c) Illustrate the three main areas of Web mining? Explain How does it differ from regular data mining or text mining?",
                    "answer": "presents a simple taxonomy of Web mining, where it is divided into three main areas: Web content mining, Web structure mining, and Web usage mining. In the figure, the data sources used in these three main areas are also specified. Although these three areas are shown separately, as you will see in the following section, they are often used collectively and synergistically to address business problems and opportunities.\n\nWeb content mining refers to the extraction of useful information from Web pages. The documents may be extracted in some machine-readable format so that automated techniques can extract some information from these Web pages.\n\nWeb crawlers (also called spiders) are used to read through the content of a Web site automatically. The information gathered may include document characteristics similar to what are used in text mining, but it may also include additional concepts, such as the document hierarchy. Such an automated (or semi automated) process of collecting and mining Web content can be used for competitive intelligence (collecting intelligence about competitors' products, services, and customers). It can also be used for information/ news/ opinion collection and summarization, sentiment analysis, automated data collection, and structuring for predictive modeling.\n\nWeb content mining as an automated data collection tool, consider the following. Web content mining can also be used to enhance the results produced by search engines. In fact, search is perhaps the most prevailing application of Web content mining and Web structure mining.\n\nA search on the Web to obtain information on a specific topic (presented as a collection of keywords or a sentence) usually returns a few relevant, high-quality Web pages and a larger number of unusable Web pages. Use of a relevance index based on keywords and authoritative pages (or some measure of it) will improve the search results and ranking of relevant pages. The idea of authority (or authoritative pages) stems from earlier information retrieval work using citations among journal articles to evaluate the impact of research papers (Miller, 2005). Though that was the origin of the idea, there are significant differences between the citations in research articles and hyperlinks on Web pages.\n\nThe structure of Web hyperlinks has led to another important category of Web pages called a hub. A hub is one or more Web pages that provide a collection of links to authoritative pages. Hub pages may not be prominent and only a few links may point to them; however, they provide links to a collection of prominent sites on a specific topic of interest.\n\nA hub could be a list of recommended links on an individual's homepage, recommended reference sites on a course Web page, or a professionally assembled resource list on a specific topic.\n\nHub pages play the role of implicitly conferring the authorities on a narrow field. In essence, a close symbiotic relationship exists between good hubs and authoritative pages; a good hub is good because it points to many good authorities, and a good authority is good because it is being pointed to by many good hubs. Such relationships between hubs and authorities make it possible to automatically retrieve high-quality content from the Web.\n\nThe most popular publicly known and referenced algorithm used to calculate hubs and authorities is hyperlink-induced topic search (HITS). It was originally developed by Kleinberg 0999) and has since been improved on by many researchers.\n\nWeb structure mining:\nWeb structure mining is the process of extracting useful information from the links embedded in Web documents. It is used to identify authoritative pages and hubs, which are the cornerstones of the contemporary page-rank algorithms that are central to popular search engines such as Google and Yahoo!. Just as links going to a Web page may indicate a site's popularity (or authority), links within the Web page (or the compete Web site) may indicate the depth of coverage of a specific topic. Analysis of links is very important in understanding the interrelationships among large numbers of Web pages, leading to a better understanding of a specific Web community, clan, or clique. Application Case 8.1 describes a project that used both Web content mining and Web structure mining to better understand how U.S. extremist groups are connected.\n\nWeb usage mining:\n\nWeb usage mining (also called Web analytics) is the extraction of useful information from data generated through Web page visits and transactions. Three types of data are generated through Web page visits:\n\n1. Automatically generated data stored in server access logs, referrer logs, agent logs, and client-side cookies.\n2. User profiles.\n3. Metadata, such as page attributes, content attributes, and usage data.\n\nAnalysis of the information collected by Web servers can help us better understand user behavior. Analysis of this data is often called dick stream analysis.",
                    "topic": "Web Mining Areas"
                },
                {
                    "id": "u4-2a",
                    "question": "2a) Define Web content mining?",
                    "answer": "Web content mining as an automated data collection tool, consider the following. Web content mining can also be used to enhance the results produced by search engines. In fact, search is perhaps the most prevailing application of Web content mining and Web structure mining.",
                    "topic": "Web Content Mining"
                },
                {
                    "id": "u4-2b",
                    "question": "2b) Explain the \"authoritative pages\" web content mining?",
                    "answer": "The idea of authority (or authoritative pages) stems from earlier information retrieval work using citations among journal articles to evaluate the impact of research papers (Miller, 2005). Though that was the origin of the idea, there are significant differences between the citations in research articles and hyperlinks on Web pages.",
                    "topic": "Authoritative Pages"
                },
                {
                    "id": "u4-2c",
                    "question": "2c) Explain briefly Web structure mining? How does it differ from Web content mining?",
                    "answer": "Web structure mining:\nWeb structure mining is the process of extracting useful information from the links embedded in Web documents. It is used to identify authoritative pages and hubs, which are the cornerstones of the contemporary page-rank algorithms that are central to popular search engines such as Google and Yahoo!. Just as links going to a Web page may indicate a site's popularity (or authority), links within the Web page (or the compete Web site) may indicate the depth of coverage of a specific topic. Analysis of links is very important in understanding the interrelationships among large numbers of Web pages, leading to a better understanding of a specific Web community, clan, or clique. Application Case 8.1 describes a project that used both Web content mining and Web structure mining to better understand how U.S. extremist groups are connected.\n\nWeb Link Mining:\n\nDefinition: This type of mining focuses on the analysis of hyperlinks between web pages. It involves examining the link structure of the web to discover patterns and trends.\nObjectives:\nIdentify relationships between web pages.\nAnalyze the link-based structure of websites.\nUncover the importance of specific web pages based on their connectivity.\n\nWeb usage mining:\n\nWeb usage mining (also called Web analytics) is the extraction of useful information from data generated through Web page visits and transactions. Three types of data are generated through Web page visits:\n\n1. Automatically generated data stored in server access logs, referrer logs, agent logs, and client-side cookies.\n2. User profiles.\n3. Metadata, such as page attributes, content attributes, and usage data.\n\nAnalysis of the information collected by Web servers can help us better understand user behavior. Analysis of this data is often called dick stream analysis.\n\nWeb structure mining can be applied for various purposes, including:\n\nSearch Engine Optimization (SEO):\n\nUnderstanding link structures and analyzing web content helps in optimizing websites for search engines.\n\nRecommendation Systems: Analyzing user behavior on the web can lead to better recommendations for products, services, or content.\n\nWeb Navigation Improvement: Discovering patterns in web structures can help improve the organization and navigation of websites.\n\nSecurity and Fraud Detection: Analyzing web usage patterns can aid in detecting unusual or malicious activities on the web.",
                    "topic": "Web Structure Mining"
                },
                {
                    "id": "u4-3a",
                    "question": "3a) Define the Web crawlers?",
                    "answer": "Web crawlers (also called spiders) are used to read through the content of a Web site automatically. The information gathered may include document characteristics similar to what are used in text mining, but it may also include additional concepts, such as the document hierarchy. Such an automated (or semi automated) process of collecting and mining Web content can be used for competitive intelligence (collecting intelligence about competitors' products, services, and customers). It can also be used for information/ news/ opinion collection and summarization, sentiment analysis, automated data collection, and structuring for predictive modeling.",
                    "topic": "Web Crawlers"
                },
                {
                    "id": "u4-3b",
                    "question": "3b) List out the two cycles of search Engine?",
                    "answer": "The two cycles of search Engine are:\n\n1. Development Cycle:\n\nWeb Crawler\nDocument Indexer\n\nSTEP 1: PREPROCESSING THE DOCUMENTS\nSTEP 2: PARSING THE DOCUMENTS\nSTEP 3: CREATING THE TERM-BY-DOCUMENT MATRIX\n\n2. Response Cycle\nThe two main components of the responding cycle are the query analyzer and the document matcher/ ranker.\nQuery Analyzer\nDocument Matcher/Ranker",
                    "topic": "Search Engine Cycles"
                },
                {
                    "id": "u4-3c",
                    "question": "3c) Explain briefly document indexer and steps?",
                    "answer": "Document Indexer:\n\nAs the documents are found and fetched by the crawler, they are stored in a temporary staging area for the document indexer to grab and process. The document indexer is responsible for processing the documents (Web pages or document files) and placing them into the document database. In order to convert the documents/ pages into the desired, easily searchable format, the document indexer performs the following tasks.\n\nSTEP 1: PREPROCESSING THE DOCUMENTS Because the documents fetched by the crawler may all be in different formats, for the ease of processing them further, in this step they all are converted to some type of standard representation. For instance, different content types (text, hyperlink, image, etc.) may be separated from each other, formatted (if necessary), and stored in a place for further processing.\n\nSTEP 2: PARSING THE DOCUMENTS This ste p is essentially the application of text mining (i.e., computational linguistic, natural language processing) tools and techniques to a collection of documents/ pages. In this step , first the standardized documents are parsed into its components to identify index-worthy words/terms. Then, using a set of rules, the words/ terms are indexed.\n\nSTEP 3: CREATING THE TERM-BY-DOCUMENT MATRIX In this step, the relationships between the words/terms and documents/pages are identified. The weight can be as simple as assigning 1 for presence or O for absence of the word/term in the document/ page.\n\nText mining research and practice have clearly indicated that the best weighting may come from the use of tenn-Jrequency divided by inverse-document-frequency (TF/IDF). This algorithm measures the frequency of occurrence of each word/ term within a document, and then compares that frequency against the frequency of occurrence in the document collection. As we all know, not all high-frequency words/term are good document discriminators; and a good document discriminator in a domain may not be one in another domain. Once the weighing schema is determined, the weights are calculated and the term-by-document index file is created.",
                    "topic": "Document Indexer"
                },
                {
                    "id": "u4-4a",
                    "question": "4a) Define Query analyzer?",
                    "answer": "The query analyzer is responsible for receiving a search request from the user (via the search engine's Web server interface) and converting it into a standardized data structure, so that it can be easily queried/ matched against the entries in the document database. How the query analyzer does what it is supposed to do is quite similar to what the document indexer does.\n\nThe query analyzer parses the search string into individual words/terms using a series of tasks that include tokenization, removal of stop words, stemming, and word/ term disambiguation (identification of spelling errors, synonyms, and homonyms).",
                    "topic": "Query Analyzer"
                },
                {
                    "id": "u4-4b",
                    "question": "4b) List out the two dominant techniques used for response cycle?",
                    "answer": "The two main components of the responding cycle are the query analyzer and the document matcher/ ranker.\n\nQuery analyzer:\n\nThe query analyzer is responsible for receiving a search request from the user (via the search engine's Web server interface) and converting it into a standardized data structure, so that it can be easily queried/ matched against the entries in the document database. How the query analyzer does what it is supposed to do is quite similar to what the document indexer does (as we have just explained).\n\nDocument Matcher/Ranker:\n\nThis is where the structured query data is matched against the document database to find the most relevant documents/ pages and also rank them in the order of relevance/ importance.",
                    "topic": "Response Cycle Techniques"
                },
                {
                    "id": "u4-4c",
                    "question": "4c) Explain briefly two main components of the response cycle in search engine?",
                    "answer": "Query Analyzer:\nThe query analyzer is responsible for receiving a search request from the user (via the search engine's Web server interface) and converting it into a standardized data structure, so that it can be easily queried/ matched against the entries in the document database. How the query analyzer does what it is supposed to do is quite similar to what the document indexer does (as we have just explained). The query analyzer parses the search string into individual words/terms using a series of tasks that include tokenization, removal of stop words, stemming, and word/ term disambiguation (identification of spelling errors, synonyms, and homonyms). The close similarity between the query analyzer and document indexer is not coincidental. In fact, it is quite logical, because both are working off of the document database; one is putting in documents/pages using a specific index structures, and the other is converting a query string into the same structure so that it can be used to quickly locate most relevant documents/ pages.\n\nDocument Matcher/Ranker:\n\nThis is where the structured query data is matched against the document database to find the most relevant documents/ pages and also rank them in the order of relevance/ importance. The proficiency of this step is perhaps the most important component when different search engines are compared to one another. Every search engine has its own (often proprietary) algorithm that it uses to carry out this important step. The early search engines used a simple keyword match against the document database and returned a list of ordered documents/ pages, where the determinant of the order was a function that used the number of words/ terms matched between the query and the document along with the weights of those words/ terms. The quality and the usefulness of the search results were not all that good. Then, in 1997, the creators of Google came up with a new algorithm, called PageRank. As the name implies, PageRank is an algorithmic way to rank-order documents/pages based on their relevance and value/ importance. Technology Insights 8.1 provides a high-level description of this patented algorithm.",
                    "topic": "Response Cycle Components"
                },
                {
                    "id": "u4-5a",
                    "question": "5a) Define the Search engine optimization (SEO)?",
                    "answer": "Search engine optimization (SEO) is the intentional activity of affecting the visibility of an e-commerce site or a Web site in a search engine's natural (unpaid or organic) search results. In general, the higher ranked on the search results page, and more frequently a site appears in the search results list, the more visitors it will receive from the search engine's users.",
                    "topic": "SEO Definition"
                },
                {
                    "id": "u4-5b",
                    "question": "5b) List out the two methods involved in Search engine optimization (SEO)?",
                    "answer": "In general, SEO techniques can be classified into two broad categories: techniques that search engines recommend as part of good site design, and those techniques of which search engines do not approve.\n\nThe search engines attempt to minimize the effect of the latter, which is often called spamdexing (also known as search spam, search engine spam, or search engine poisoning).",
                    "topic": "SEO Methods"
                },
                {
                    "id": "u4-5c",
                    "question": "5c) Explain briefly the two techniques of Search engine optimization (SEO)?",
                    "answer": "Search Engine Optimization (SEO) is a set of techniques and strategies used to enhance the visibility of a website or web page in search engine results. There are two main techniques in SEO:\n\nOn-Page SEO :\nDefinition :\nOn-page SEO refers to the optimization of elements on a website itself. It involves making changes to the website's content, HTML code, and structure to improve its relevance to specific keywords and make it more search engine-friendly.\n\nKey Aspects:\n\nKeyword Optimization: Ensure that relevant keywords are strategically placed in titles, headings, and throughout the content.\nQuality Content: Create high-quality, relevant, and valuable content that satisfies the user's intent.\nMeta Tags: Optimize meta titles and meta descriptions to accurately describe the content and encourage click-throughs.\nURL Structure: Use clean and descriptive URLs that include relevant keywords.\nHeader Tags: Use header tags (H1, H2, etc.) to structure content and highlight important information.\n\nOff-Page SEO:\nDefinition: Off-page SEO involves activities conducted outside the boundaries of the website to improve its visibility and credibility. It focuses on building a website's authority, relevance, and trustworthiness in the eyes of search engines.\n\nKey Aspects:\nBacklink Building: Acquire high-quality backlinks from authoritative and relevant websites to boost the site's credibility.\nSocial Signals: Engage in social media to promote content and increase visibility. Social signals, such as likes and shares, can impact search engine rankings.\nBrand Mentions: Develop a positive online reputation by encouraging brand mentions and reviews.\nInfluencer Outreach: Collaborate with influencers or authoritative figures in your industry to gain exposure and credibility.\nLocal SEO: Optimize the website for local searches by ensuring accurate business information on online directories and creating local content.\n\nBoth on-page and off-page SEO are crucial for a comprehensive search engine optimization strategy. By combining these techniques, websites can improve their chances of ranking higher in search engine results pages (SERPs) and attracting organic traffic. It's important to note that SEO is an ongoing process, and staying updated with search engine algorithms and user behavior is essential for long-term success.",
                    "topic": "SEO Techniques"
                },
                {
                    "id": "u4-5d",
                    "question": "5d) Explain briefly Web Analytics maturity model?",
                    "answer": "The term \"maturity\" relates to the degree of proficiency, formality, and optimization of business models, moving \"ad hoc\" practices to formally defined steps and optimal business processes. A maturity model is a formal depiction of critical dimensions and their competency levels of a business practice. Collectively, these dimensions and levels define the maturity level of an organization in that area of practice. It often describes an evolutionary improvement path from ad hoc, immature practices to disciplined, mature processes with improved quality and efficiency.\n\nA good example of maturity models is the BI Maturity Model developed by The Data Warehouse Institute (TDWI). In the TDWI BI Maturity Model the main purpose was to gauge where organization data warehousing initiatives are at a point in time and where it should go next. It was represented in a six-stage framework (Management Reporting -+ Spreadmarts -+ Data Marts -+ Data Warehouse -+ Enterprise Data Warehouse -+ BI Services). Another related example is the simple business analytics maturity model, moving from simple descriptive measures to predicting future outcomes, to obtaining sophisticated decision systems (i.e., Descriptive Analytics-+ Predictive Analytics-+ Prescriptive Analytics).\n\nFor Web analytics perhaps the most comprehensive model was proposed by Stephane Hamel (2009). In this model, Hamel used six dimensions-Cl) Management, Governance and Adoption, (2) Objectives Definition, (3) Scoping, ( 4) The Analytics Team and Expertise, (5) The Continuous Improvement Process and Analysis Methodology, (6) Tools, Technology and Data Integration-and for each dimension he used six levels of proficiency/competence. Figure 8.7 shows Hamel's six dimensions and the respective proficiency levels.\nThe proficiency/ competence levels have different terms/labels for each of the six dimensions, describing specifically what each level means. Essentially, the six levels are indications of analytical maturity ranging from \"0-Analytically Impaired\" to \"5-Analytical Competitor.\"",
                    "topic": "Web Analytics Maturity Model"
                },
                {
                    "id": "u4-6a",
                    "question": "6a) Define Web usage mining?",
                    "answer": "Web usage mining (also called Web analytics) is the extraction of useful information from data generated through Web page visits and transactions.",
                    "topic": "Web Usage Mining"
                },
                {
                    "id": "u4-6b",
                    "question": "6b) List out the various types of data are generated through Web page visits?",
                    "answer": "State that at least three types of data are generated through Web page visits:\n1. Automatically generated data stored in server access logs, referrer logs, agent logs, and client-side cookies\n2. User profiles\n3. Metadata, such as page attributes, content attributes, and usage data.",
                    "topic": "Web Page Data Types"
                },
                {
                    "id": "u4-6c",
                    "question": "6c) Explain briefly Web Analytics Metrics?",
                    "answer": "Web Analytics Metrics:\n\nUsing a variety of data sources, Web analytics programs provide access to a lot of valuable marketing data, which can be leveraged for better insights to grow your business and better document your ROI. The insight and intelligence gained fro m Web analytics can be used to effectively manage the marketing efforts of an organization and its various products or services. Web analytics programs provide nearly real-time data, which can document your marketing campaign successes or empower you to make timely adjustments to your current marketing strategies. While Web analytics provides a broad range of metrics, there are four categories of metrics that are generally actionable and can directly impact your business objectives (TWG, 2013). These categories include:\n\n• Web site usability: How were they using my Web site?\n• Traffic sources: Where did they come from?\n• Visitor profiles: What do my visitors look like?\n• Conversion statistics: What does all this mean for the business?",
                    "topic": "Web Analytics Metrics"
                },
                {
                    "id": "u4-6d",
                    "question": "6d) Explain briefly Web Analytics Tools?",
                    "answer": "Web Analytics Tools :\n\nThere are plenty of Web analytics applications (downloadable software tools and Webbased/ on-demand service platforms) in the market. Companies (large, medium, or small) are creating products and services to grab their fair share from the emerging Web analytics marketplace. What is the most interesting is that many of the most popular Web analytics tools are free- yes, free to download and use for whatever reasons, commercial or nonprofit. The following are among the most popular free (or almost free) Web analytics tools:\nGOOGLE WEB ANALYTICS (GOOGLE.COM/ANALYTICS) This is a service offered by Google that generates detailed statistics about a Web site's traffic and traffic sources and measures conversions and sales.\n\nYAHOO! WEB ANALYTICS (WEB.ANALYTICS.YAHOO.COM) Yahoo! Web analytics is Yahoo!'s alternative to the dominant Google Analytics.\n\nOPEN WEB ANALYTICS (OPENWEBANALYTICS.COM) Open Web Analytics (OWA) is a popular open source Web analytics software that anyone can use to track and analyze how people use Web sites and applications.\n\nPIWIK (PIWIK.ORG) Piwik is the one of the leading self-hosted, decentralized, open source Web analytics platforms, used by 460,000 Web sites in 150 countries. Piwik was founded by Matthieu Aub1y in 2007.\n\nFIRESTAT (FIRESTATS.CC) FireStats is a simple and straightforward Web analytics application written in PHP/ MySQL. It supports numerous platforms and set-ups including C# sites, Django sites, Drupal, Joomla!, WordPress, and several others. FireStats has an intuitive API that assists developers in creating their own custom apps or publishing platform components.\n\nSITE METER (SITEMETER.COM) Site Meter is a service that provides counter and tracking information for Web sites. By logging IP addresses and using JavaScript or HTML to track visitor information , Site Meter provides Web site owners with information about their visitors, including how they reached the site, the date and time of their visit, and more.\n\nWOOPRA (WOOPRA.COM) Woopra is a real-time customer analytics service that provides solutions for sales, service, marketing, and product teams. The platform is designed to help organizations optimize the customer life cycle by delivering live, granular behavioral data for individual Web site visitors and customers. It ties this individual-level data to aggregate analytics reports for a full life-cycle view that bridges departmental gaps.\n\nAWSTATS (AWSTATS.ORG) A WStats is an open source Web analytics reporting tool, suitable for analyzing data from Internet services such as Web, streaming media, mail, and FTP servers. A WStats parses and analyzes server log files, producing HTML reports. Data is visually presented within repotts by tables and bar graphs. Static reports can be created through a command line interface, and on-demand reporting is supported through a Web browser CGI program.\n\nSNOOP (REINVIGORATE.NET) Snoop is a desktop-based application that runs on the Mac OS X and Windows XP/Vista platforms. It sits nicely on your system status bar/system tray, notifying you with audible sounds whenever something happens.\n\nMOCHIBOT (MOCHIBOT.COM) MochiBot is a free Web analytics/ tracking tool especially designed for Flash assets. With MochiBot, you can see who's sharing your Flash content, how many times people view your content, as well as help you track where your Flash content is to prevent piracy and content theft. Installing MochiBot is a breeze; you simply copy a few lines of ActionScript code in the .FLA files you want to monitor.",
                    "topic": "Web Analytics Tools"
                }
            ]
        },
        {
            "unit": 5,
            "title": "Social Media Analytics",
            "subtitle": "Analyzing Social Networks and Interactions",
            "mcqs": [
                {
                    "id": "u5-mcq-1",
                    "question": "Social analytics include mining the textual content created in __________ media.",
                    "options": [
                        "Social",
                        "Philosophical",
                        "Multi",
                        "Transmission"
                    ],
                    "correctAnswer": 0,
                    "explanation": "Social analytics focuses on analyzing content from social media platforms.",
                    "topic": "Social Analytics"
                },
                {
                    "id": "u5-mcq-2",
                    "question": "__________ studies are often considered a part of both the social sciences and the humanities.",
                    "options": [
                        "Criminal",
                        "Community",
                        "Communication",
                        "Innovation"
                    ],
                    "correctAnswer": 2,
                    "explanation": "Communication studies draw from sociology, psychology, anthropology, and other fields.",
                    "topic": "Communication Networks"
                },
                {
                    "id": "u5-mcq-3",
                    "question": "__________ referred to a specific geographic location, and studies of community ties had to do with who talked, associated, and traded with whom.",
                    "options": [
                        "Criminal",
                        "Community",
                        "Communication",
                        "Innovation"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Community networks analyze social ties within specific geographic locations.",
                    "topic": "Community Networks"
                },
                {
                    "id": "u5-mcq-4",
                    "question": "__________ are often grouped into three categories: connections, distributions, and segmentation.",
                    "options": [
                        "Mimics",
                        "Mutations",
                        "Measurements",
                        "Metrics"
                    ],
                    "correctAnswer": 3,
                    "explanation": "Social network metrics measure various aspects of network structure and behavior.",
                    "topic": "Network Metrics"
                },
                {
                    "id": "u5-mcq-5",
                    "question": "__________ refers to the enabling technologies of social interactions among people in which they create, share, and exchange information in virtual communities.",
                    "options": [
                        "Social Media",
                        "Social Analytics",
                        "Sentiment Analysis",
                        "Static Analysis"
                    ],
                    "correctAnswer": 0,
                    "explanation": "Social media platforms enable people to create and share content in online communities.",
                    "topic": "Social Media"
                },
                {
                    "id": "u5-mcq-6",
                    "question": "Social media __________ refers to the systematic and scientific ways to consume the vast amount of content created by Web-based social media outlets.",
                    "options": [
                        "Media",
                        "Analytics",
                        "Analysis",
                        "Mining"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Social media analytics systematically analyzes social media content for business insights.",
                    "topic": "Analytics Methods"
                },
                {
                    "id": "u5-mcq-7",
                    "question": "__________ analytics and text analytics examine the content in online conversations to identify themes, sentiments, and connections.",
                    "options": [
                        "Static",
                        "Social",
                        "Simple",
                        "Standard"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Social analytics uses text analytics to uncover patterns in online conversations.",
                    "topic": "Content Analysis"
                },
                {
                    "id": "u5-mcq-8",
                    "question": "__________ analysis attempts to assess the impact of a change in the input data or parameters on the proposed solution.",
                    "options": [
                        "Sentiment",
                        "Sensitivity",
                        "Social",
                        "Statistical"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Sensitivity analysis evaluates how changes in inputs affect outputs in decision-making.",
                    "topic": "Sensitivity Analysis"
                },
                {
                    "id": "u5-mcq-9",
                    "question": "__________ calculates the values of the inputs necessary to achieve a desired level of an output.",
                    "options": [
                        "What-If Analysis",
                        "Goal Seeking",
                        "Sensitivity Analysis",
                        "Optimization"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Goal seeking works backward from a desired outcome to find the required inputs.",
                    "topic": "Goal Seeking"
                },
                {
                    "id": "u5-mcq-10",
                    "question": "The analysis of management __________ aims at evaluating how far each alternative advances managers toward their goals.",
                    "options": [
                        "Directions",
                        "Decisions",
                        "Developments",
                        "Destinations"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Decision analysis helps managers evaluate alternatives against their objectives.",
                    "topic": "Decision Analysis"
                }
            ],
            "fillBlanks": [
                {
                    "id": "u5-fb-1",
                    "question": "Social analytics can be classified into __________ different, but not necessarily mutually exclusive, branches.",
                    "correctAnswer": "two",
                    "explanation": "Social analytics is typically divided into two main branches: social network analysis and social media analytics.",
                    "topic": "Analytics Branches"
                },
                {
                    "id": "u5-fb-2",
                    "question": "__________ is a structure composed of individuals linked to one another with some type of connections or relationships.",
                    "correctAnswer": "Social network",
                    "explanation": "A social network represents relationships and interactions between people or organizations.",
                    "topic": "Network Structure"
                },
                {
                    "id": "u5-fb-3",
                    "question": "__________ is the systematic examination of social networks.",
                    "correctAnswer": "Social network analysis",
                    "explanation": "Social Network Analysis (SNA) studies the structure and patterns of social relationships.",
                    "topic": "SNA"
                },
                {
                    "id": "u5-fb-4",
                    "question": "__________ is structured as what will happen to the solution if an input variable, an assumption, or a parameter value is changed.",
                    "correctAnswer": "What-if analysis",
                    "explanation": "What-if analysis explores different scenarios by changing input variables.",
                    "topic": "What-If Analysis"
                },
                {
                    "id": "u5-fb-5",
                    "question": "The study of these structures uses social network analysis to identify local and global patterns, locate influential entities, and examine __________.",
                    "correctAnswer": "network dynamics",
                    "explanation": "Network dynamics refers to how relationships and structures change over time.",
                    "topic": "Network Patterns"
                },
                {
                    "id": "u5-fb-6",
                    "question": "In __________ and urban sociology, much attention has been paid to the social networks among criminal actors.",
                    "correctAnswer": "criminology",
                    "explanation": "Criminology uses network analysis to understand criminal organizations and patterns.",
                    "topic": "Criminal Networks"
                },
                {
                    "id": "u5-fb-7",
                    "question": "An __________ specific text analytics package will already know the vocabulary of your business.",
                    "correctAnswer": "industry",
                    "explanation": "Industry-specific analytics tools are pre-trained on domain-specific vocabulary and concepts.",
                    "topic": "Industry Tools"
                },
                {
                    "id": "u5-fb-8",
                    "question": "Social analytics may mean different things to different people, based on their __________ and field of study.",
                    "correctAnswer": "worldview",
                    "explanation": "Social analytics interpretations vary based on perspectives and academic backgrounds.",
                    "topic": "Perspectives"
                },
                {
                    "id": "u5-fb-9",
                    "question": "The __________ between communications produced by industrial media can be long compared to social media.",
                    "correctAnswer": "time lag",
                    "explanation": "Industrial media has longer production cycles, while social media enables real-time communication.",
                    "topic": "Media Differences"
                }
            ],
            "descriptive": [
                {
                    "id": "u5-1a",
                    "question": "1a) Define Social analytics?",
                    "answer": "Social analytics refers to the process of collecting, analyzing, and interpreting data from social media platforms and other online sources to gain insights into social trends, user behavior, and the performance of social media strategies. It involves using various tools and techniques to measure, track, and report on the impact of social media activities on an organization's goals and objectives.",
                    "topic": "Social Analytics"
                },
                {
                    "id": "u5-1b",
                    "question": "1b) List out the social network types?",
                    "answer": "A few typical social network types that is relevant to business activities.\nCOMMUNICATION NETWORKS\nCOMMUNITY NETWORKS\nCRIMINAL NETWORKS\nINNOVATION NETWORKS",
                    "topic": "Social Network Types"
                },
                {
                    "id": "u5-1c",
                    "question": "1c) Illustrate the typical social network types that are relevant to business activities?",
                    "answer": "A few typical social network types that is relevant to business activities.\nCOMMUNICATION NETWORKS\nCOMMUNITY NETWORKS\nCRIMINAL NETWORKS\nINNOVATION NETWORKS\n\nCOMMUNICATION NETWORKS :\nCommunication studies are often considered a part of both the social sciences and the humanities, drawing heavily on fields such as sociology, psychology, anthropology, information science, biology, political science, and economics.\n\nCOMMUNITY NETWORKS :\nTraditionally, community referred to a specific geographic location, and studies of community ties had to do with who talked, associated, traded, and attended social activities with whom.\n\nCRIMINAL NETWORKS :\nIn criminology and urban sociology, much attention has been paid to the social networks among criminal actors. For example, studying gang murders and other illegal activities as a series of exchanges between gangs can lead to better understanding and prevention of such criminal activities. Now that we live in a highly connected world (thanks to the Internet), many of the criminal networks' formations and their activities are being watched/ pursued by security agencies using state-of-the-art Internet tools and tactics. Even though the Internet has changed the landscape for criminal networks and law enforcement agencies, the traditional social and philosophical theories still apply to a large extent.",
                    "topic": "Business Social Networks"
                },
                {
                    "id": "u5-2a",
                    "question": "2a) Define Social Network?",
                    "answer": "A social network is a social structure composed of individuals/ people (or groups of individuals or organizations) linked to one another with some type of connections/ relationships. The social network perspective provides a holistic approach to analyzing structure and dynamics of social entities. The study of these structures uses social network analysis to identify local and global patterns, locate influential entities, and examine network dynamics.",
                    "topic": "Social Network Definition"
                },
                {
                    "id": "u5-2b",
                    "question": "2b) Explain the Social Network Analysis Metrics?",
                    "answer": "Social network analysis (SNA) is the systematic examination of social networks. Social network analysis views social relationships in terms of network theory, consisting of nodes (representing individuals or organizations within the network) and ties/connections (which represent relationships between the individuals or organizations, such as friendship, kinship, organizational position, etc.).",
                    "topic": "SNA Metrics"
                },
                {
                    "id": "u5-2c",
                    "question": "2c) Explain briefly most prevailing characteristics that help differentiate between social and industrial media?",
                    "answer": "Here are some of the most prevailing characteristics that help differentiate between social and industrial media (Morgan et al., 2010):\n\nQuality: In industrial publishing- mediated by a publisher-the typical range of quality is substantially narrower than in niche, unmediated markets. The main challenge posed by content in social media sites is the fact that the distribution of quality has high variance: from ve1y high-quality items to low-quality, sometimes abusive, content.\n\nReach: Both industrial and social media technologies provide scale and are capable of reaching a global audience. Industrial media, however, typically use a centralized framework for organization, production, and dissemination, whereas social media are by their very nature more decentralized, less hierarchical, and distinguished by multiple points of production and utility.\n\nFrequency: Compared to industrial media, updating and reposting on social media platforms is easier, faster, and cheaper, and therefore practiced more frequently, resulting in fresher content.\n\nAccessibility: The means of production for industrial media are typically government and/or corporate (privately owned), and are costly, whereas social media tools are generally available to the public at little or no cost.\n\nUsability: Industrial media production typically requires specialized skills and training. Conversely, most social media production requires only modest reinterpretation of existing skills; in theory, anyone with access can operate the means of social media production.\n\nImmediacy: The time lag between communications produced by industrial media can be long (weeks, months, or even years) compared to social media (which can be capable of virtually instantaneous responses).\n\nUpdatability: Industrial media, once created, cannot be altered (once a magazine article is printed and distributed, changes cannot be made to that same article), whereas social media can be altered almost instantaneously by comments or editing.",
                    "topic": "Social vs Industrial Media"
                },
                {
                    "id": "u5-3a",
                    "question": "3a) Define the Social media analytics?",
                    "answer": "Social media analytics refers to the systematic and scientific ways to consume the vast amount of content created by Web-based social media outlets, tools, and techniques for the betterment of an organization's competitiveness. Social media analytics is rapidly becoming a new force in organizations around the world, allowing them to reach out to and understand consumers as never before.",
                    "topic": "Social Media Analytics Definition"
                },
                {
                    "id": "u5-3b",
                    "question": "3b) List out the three broad categories of analysis tools?",
                    "answer": "These analysis tools usually fall into three broad categories:\n\n• Descriptive analytics: Uses simple statistics to identify activity characteristics and trends, such as how many followers you have, how many reviews were generated on Facebook, and which channels are being used most often.\n\n• Social network analysis: Follows the links between friends, fans, and followers to identify connections of influence as well as the biggest sources of influence.\n\n• Advanced analytics: Includes predictive analytics and text analytics that examine the content in online conversations to identify themes, sentiments, and connections that would not be revealed by casual surveillance. Sophisticated tools and solutions to social media analytics use all three categories of analytics (i.e., descriptive, predictive, and prescriptive) in a somewhat progressive fashion.",
                    "topic": "Analysis Tools Categories"
                },
                {
                    "id": "u5-3c",
                    "question": "3c) Explain briefly Measuring the Social Media Impact?",
                    "answer": "For organizations, small or large, there is valuable insight hidden in all the user-generated content on social media sites. But how do you dig it out of dozens of review sites, thousands of blogs, millions of facebook posts, and billions of tweets? Once you do that, how do you measure the impact of your efforts? These questions can be addressed by the analytics extension of the social media technologies. Once you decide on your goal for social media (what it is that you want to accomplish), there is a multitude of tools to help you get there. These analysis tools usually fall into three broad categories:\n\n• Descriptive analytics: Uses simple statistics to identify activity characteristics and trends, such as how many followers you have, how many reviews were generated on Face book, and which channels are being used most often.\n\n• Social network analysis: Follows the links between friends, fans, and followers to identify connections of influence as well as the biggest sources of influence.\n\n• Advanced analytics: Includes predictive analytics and text analytics that examine the content in online conversations to identify themes, sentiments, and connections that would not be revealed by casual surveillance. Sophisticated tools and solutions to social media analytics use all three categories of analytics (i.e., descriptive, predictive, and prescriptive) in a somewhat progressive fashion.",
                    "topic": "Measuring Social Media Impact"
                },
                {
                    "id": "u5-4a",
                    "question": "4a) Define continuously improve the accuracy of text analysis?",
                    "answer": "\"Continuously improving the accuracy of text analysis\" refers to the ongoing process of enhancing the precision, reliability, and overall performance of algorithms and models used to analyze and understand textual data. This improvement involves refining various aspects of text analysis, such as natural language processing (NLP), machine learning models, and data preprocessing techniques.",
                    "topic": "Text Analysis Accuracy"
                },
                {
                    "id": "u5-4b",
                    "question": "4b) List out the eight best Practices in Social Media Analytics?",
                    "answer": "The Eight best Practices in Social Media Analytics are:\n1. THINK OF MEASUREMENT AS A GUIDANCE SYSTEM, NOT A RATING SYSTEM\n2. TRACK THE ELUSIVE SENTIMENT.\n3. CONTINUOUSLY IMPROVE THE ACCURACY OF TEXT ANALYSIS.\n4. LOOK AT THE RIPPLE EFFECT.\n5. LOOK BEYOND THE BRAND.\n6. IDENTIFY YOUR MOST POWERFUL INFLUENCERS.\n7. LOOK CLOSELY AT THE ACCURACY OF YOUR ANALYTIC TOOL\n8. INCORPORATE SOCIAL MEDIA INTELLIGENCE INTO PLANNING",
                    "topic": "Social Media Analytics Best Practices"
                },
                {
                    "id": "u5-4c",
                    "question": "4c) Explain the Best Practices in Social Media Analytics?",
                    "answer": "The Eight best Practices in Social Media Analytics are:\n1. THINK OF MEASUREMENT AS A GUIDANCE SYSTEM, NOT A RATING SYSTEM\n2. TRACK THE ELUSIVE SENTIMENT.\n3. CONTINUOUSLY IMPROVE THE ACCURACY OF TEXT ANALYSIS.\n4. LOOK AT THE RIPPLE EFFECT.\n5. LOOK BEYOND THE BRAND.\n6. IDENTIFY YOUR MOST POWERFUL INFLUENCERS.\n7. LOOK CLOSELY AT THE ACCURACY OF YOUR ANALYTIC TOOL\n8. INCORPORATE SOCIAL MEDIA INTELLIGENCE INTO PLANNING\n\nTHINK OF MEASUREMENT AS A GUIDANCE SYSTEM, NOT A RATING SYSTEM: Measurements are often used for punishment or rewards; they should not be. They should be about figuring out what the most effective tools and practices are, what needs to be discontinued because it doesn't work, and what needs to be done more because it does work very well.\n\nTRACK THE ELUSIVE SENTIMENT: Customers want to take what they are hearing and learning from online conversations and act on it. The key is to be precise in extracting and tagging their intentions by measuring their sentiments. text analytic tools can categorize online content, uncover linked concepts, and reveal the sentiment in a conversation as \"positive,\" \"negative,\" or \"neutral,\" based on the words people use.\n\nCONTINUOUSLY IMPROVE THE ACCURACY OF TEXT ANALYSIS: An industry-specific text analytics package will already know the vocabulary of your business. The system will have linguistic rules built into it, but it learns over time and gets better and better.\n\nLOOK AT THE RIPPLE EFFECT: It is one thing to get a great hit on a high-profile site, but that's only the start. There's a difference between a great hit that just sits there and goes away versus a great hit that is tweeted, retweeted, and picked up by influential bloggers. Analysis should show you which social media activities go \"viral\" and which quickly go dormant- and why.\n\nLOOK BEYOND THE BRAND : One of the biggest mistakes people make is to be concerned only about their brand. To successfully analyze and act on social media, one must also understand the broader context of the conversation.",
                    "topic": "Social Media Analytics Best Practices"
                },
                {
                    "id": "u5-5a",
                    "question": "5a) Define the Social Media Analytics?",
                    "answer": "Social media analytics refers to the process of collecting, measuring, analyzing, and interpreting data from social media platforms. The goal is to gain insights into social media performance, audience behavior, and the effectiveness of social media marketing strategies. Social media analytics involves tracking various metrics and key performance indicators (KPIs) to evaluate the impact of social media activities on business objectives.",
                    "topic": "Social Media Analytics Definition"
                },
                {
                    "id": "u5-5b",
                    "question": "5b) List out the ten Social Media Analytics tools and vendors?",
                    "answer": "It is to provide only 10 of the many successful SMA vendors and their respective tools/ services with which we have some familiarity.\n\nATTENS1TV360\nRAD1AN6/SALESFORCE CLOUD.\nSVSOMOS\nCOLLECTIVE INTELLECT\nWEBTRENDS\nCRIMSON HEXAGON\nCONVERSEON\nSPIRAL 16\nBUZZLOGIC\nSPROUTSOCIAL",
                    "topic": "Social Media Analytics Tools"
                },
                {
                    "id": "u5-5c",
                    "question": "5c) Explain briefly Goal seeking?",
                    "answer": "Goal Seeking : Goal seeking calculates the values of the inputs necessary to achieve a desired level of an output (goal). It represents a backward solution approach. The following are some examples of goal seeking:\n\n• What annual R&D budget is needed for an annual growth rate of 15 percent by 2018?\n• How many nurses are needed to reduce the average waiting time of a patient in the emergency room to less than 10 minutes?\n\nGoal-seeking prescriptive analytics is a type of analytical approach that focuses on recommending actions to achieve specific desired outcomes or goals. In other words, it helps organizations determine the best course of action to meet a predefined objective. This type of analytics is particularly useful when decision-makers have a clear goal in mind and want to understand the optimal steps or strategies to reach that goal.\n\nHere's a brief breakdown of the key components:\n1. Objective definition:\nIdentify a specific business objective or goal that the organization wants to achieve. This could be anything from maximizing profits, minimizing costs, optimizing resource utilization, or achieving a target performance metric.\n\n2. Data Analysis:\nAnalyze historical and current data to understand patterns, trends, and dependencies. This often involves using advanced statistical and machine learning techniques to extract meaningful insights from the data.\n\n3. Modeling and simulation:\n\nDevelop mathematical models or simulations that represent the relationships between different variables and factors influencing the desired outcome. These models help predict the impact of various decisions or actions on the final goal.\n\n4. Optimization:\nUtilize optimization algorithms to find the best combination of variables or actions that will lead to the desired outcome. The goal-seeking analytics process aims to find the most efficient and effective path to achieve the predefined goal.\n\n5. Prescriptive Recommendations:\nProvide actionable recommendations to decision-makers based on the analysis and optimization results. These recommendations guide organizations on the specific actions they should take to maximize the likelihood of reaching their goals.\n\n6. Continuous monitoring and adjustments:\nImplement a system for continuous monitoring of the chosen actions and the evolving business environment. As circumstances change, the organization may need to adjust its strategies to stay on track toward the original goal.",
                    "topic": "Goal Seeking"
                },
                {
                    "id": "u5-5d",
                    "question": "5d) Explain briefly Web Analytics maturity model?",
                    "answer": "A web analytics maturity model is a framework that organizations use to assess and enhance their capabilities in utilizing web analytics tools and data to improve their online performance. The model typically consists of various stages or levels, each representing a different level of sophistication and effectiveness in utilizing web analytics. Here's a generalized outline of a web analytics maturity model:\n\nBasic Level: Foundational Understanding.\nIntermediate Level: Data Collection and Customization\nAdvanced Level: Goal Setting and Conversion Tracking\nExpert Level: Integration and Cross-Channel Analytics\nMature Level: Predictive Analytics and Optimization\nInnovative Level: Artificial Intelligence and Machine Learning",
                    "topic": "Web Analytics Maturity Model"
                },
                {
                    "id": "u5-6a",
                    "question": "6a) Define Multiple Goals?",
                    "answer": "The analysis of management decisions aims at evaluating, to the greatest possible extent, how far each alternative advances managers toward their goals. Unfortunately, managerial problems are seldom evaluated with a single simple goal, such as profit maximization. Today's management systems are much more complex, and one with a single goal is rare. Instead, managers want to attain simultaneous goals, some of which may conflict. Different stakeholders have different goals.",
                    "topic": "Multiple Goals"
                },
                {
                    "id": "u5-6b",
                    "question": "6b) List out the various difficulties may arise when analyzing multiple goals?",
                    "answer": "Certain difficulties may arise when analyzing multiple goals:\n• It is usually difficult to obtain an explicit statement of the organization's goals.\n• The decision maker may change the importance assigned to specific goals over time or for different decision scenarios.\n• Goals and sub-goals are viewed differently at various levels of the organization and within different departments.\n• Goals change in response to changes in the organization and its environment.\n• The relationship between alternatives and their role in determining goals may be difficult to quantify.\n• Complex problems are solved by groups of decision makers, each of whom has a personal agenda.\n• Participants assess the importance (priorities) of the various goals differently.\nSeveral methods of handling multiple goals can be used when working with MSS.\n\nThe most common ones are :\n• Utility theory\n• Goal programming\n• Expression of goals as constraints, using LP\n• A points system",
                    "topic": "Multiple Goals Difficulties"
                },
                {
                    "id": "u5-6c",
                    "question": "6c) Explain briefly Sensitivity Analysis?",
                    "answer": "A model builder makes predictions and assumptions regarding input data, many of which deal with the assessment of uncertain futures. When the model is solved, the results depend on these data. Sensitivity analysis attempts to assess the impact of a change in the input data or parameters on the proposed solution (i.e ., the result variable).\n\nSensitivity analysis is extremely important in MSS because it allows flexibility and adaptation to changing conditions and to the requirements of different decision-making situations, provides a better understanding of the model and the decision-making situation it attempts to describe, and permits the manager to input data in order to increase the confidence in the model. Sensitivity analysis tests relationships such as the following:\n\n• The impact of changes in external (uncontrollable) variables and parameters on the outcome variable(s)\n• The impact of changes in decision variables on the outcome variable(s)\n• The effect of uncertainty in estimating external variables\n• The effects of different dependent interactions among variables\n• The robustness of decisions under changing conditions\n\nSensitivity analyses are used for:\n\n• Revising models to eliminate too-large sensitivities\n• Adding details about sensitive variables or scenarios\n• Obtaining better estimates of sensitive external variables\n• Altering a real-world system to reduce actual sensitivities\n• Accepting and using the sensitive (and hence vulnerable) real world, leading to the continuous and close monitoring of actual results.",
                    "topic": "Sensitivity Analysis"
                },
                {
                    "id": "u5-6d",
                    "question": "6d) Explain briefly What-If Analysis?",
                    "answer": "What-if analysis is structured as What will happen to the solution if an input variable, an assumption, or a parameter value is changed? Here are some examples:\n\n• What will happen to the total inventory cost if the cost of carrying inventories increases by 10 percent?\n\n• What will be the market share if the advertising budget increases by 5 percent?\n\nWith the appropriate user interface, it is easy for managers to ask a computer model these types of questions and get immediate answers. Furthermore, they can perform multiple cases and thereby change the percentage, or any other data in the question, as desired. The decision maker does all this directly, without a computer programmer. Figure 9.10 shows a spreadsheet example of a what-if query for a cash flow problem. When the user changes the cells containing the initial sales (from 100 to 120) and the sales growth rate (from 3% to 4% per quarter), the program immediately recomputes the value of the annual net profit cell (from $127 to $182). At first, initial sales were 100, growing at 3 percent per quarter, yielding an annual net profit of $127. Changing the initial sales cell to 120 and the sales growth rate to 4 percent causes the annual net profit to rise to $182. What-if analysis is common in expert systems. Users are given the opportunity to change their answers to some of the system's questions, and a revised recommendation is found.",
                    "topic": "What-If Analysis"
                }
            ]
        }
    ]
};