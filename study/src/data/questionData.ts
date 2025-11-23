// questionsData.ts

// 1. Define the ContentBlock types for the structured answers
export type ContentBlock =
    | { type: 'text'; content: string }
    | { type: 'heading'; content: string }
    | { type: 'list'; items: string[] }
    | { type: 'diagram'; label: string }
    | { type: 'callout'; content: string };

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
    // The answer field is now an array of blocks
    answer: ContentBlock[];
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
                    "options": ["Mining", "Analysis", "Sentiment", "Text"],
                    "correctAnswer": 2,
                    "explanation": "Sentiment is a difficult word to define. It is often linked to or confused with other terms like belief, view, opinion, and conviction.",
                    "topic": "Sentiment Basics"
                },
                {
                    "id": "u3-mcq-2",
                    "question": "As a field of research, sentiment analysis is closely related to __________ linguistics, natural language processing, and text mining.",
                    "options": ["Estimate", "Computational", "Conjecture", "Guesstimate"],
                    "correctAnswer": 1,
                    "explanation": "As a field of research, sentiment analysis is closely related to computational linguistics, natural language processing, and text mining.",
                    "topic": "Research Fields"
                },
                {
                    "id": "u3-mcq-3",
                    "question": "The __________ analyses of textual data are often visualized in easy-to-understand dashboards.",
                    "options": ["Real-time", "Current", "Past", "Mixed"],
                    "correctAnswer": 0,
                    "explanation": "Real-time analysis is crucial in sentiment analysis, allowing immediate insights from social media and customer feedback.",
                    "topic": "Data Visualization"
                },
                {
                    "id": "u3-mcq-4",
                    "question": "__________ is an integral part of an analytic CRM and customer experience management systems.",
                    "options": ["Voice of the Customer (VOC)", "Voice of the Market (VOM)", "Voice of the Employee (VOE)", "None"],
                    "correctAnswer": 0,
                    "explanation": "Voice of the Customer (VOC) integrates sentiment analysis into CRM systems to understand customer feedback.",
                    "topic": "CRM Applications"
                },
                {
                    "id": "u3-mcq-5",
                    "question": "__________ is about understanding aggregate opinions and trends. It's about knowing what stakeholders are saying about your products and services.",
                    "options": ["Voice of the Customer (VOC)", "Voice of the Market (VOM)", "Voice of the Employee (VOE)", "None"],
                    "correctAnswer": 1,
                    "explanation": "Voice of the Market (VOM) focuses on understanding broader market opinions and trends about products.",
                    "topic": "Market Analysis"
                },
                {
                    "id": "u3-mcq-6",
                    "question": "__________ analysis of market sentiments using social media, news, blogs, and discussion groups seems to be a proper way to compute the market movements. [ ]",
                    "options": ["Automated", "Text", "Sentiment", "Market"],
                    "correctAnswer": 0,
                    "explanation": "",
                    "topic": "Analytics Types"
                },
                {
                    "id": "u3-mcq-7",
                    "question": "__________ is a large lexical database of English, including nouns, verbs, adjectives, and adverbs grouped into sets of cognitive synonyms.",
                    "options": ["Worldwide Net", "Internet", "WordNet", "Intranet"],
                    "correctAnswer": 2,
                    "explanation": "WordNet is a lexical database that groups words into synsets and is widely used in NLP and sentiment analysis.",
                    "topic": "NLP Tools"
                },
                {
                    "id": "u3-mcq-8",
                    "question": "TREC stands for __________.",
                    "options": ["Term Retrieval Conference", "Trade Retrieval Conference", "Trivial Retrieval Conference", "Text Retrieval Conference"],
                    "correctAnswer": 3,
                    "explanation": "Text Retrieval Conference (TREC) is a research program for evaluating text retrieval methodologies.",
                    "topic": "Research Conferences"
                },
                {
                    "id": "u3-mcq-9",
                    "question": "CLEF stands for __________.",
                    "options": ["Care Language Evaluation Forum", "Cross Language Evaluation Forum", "Cover Language Evaluation Forum", "Connect Language Evaluation Forum"],
                    "correctAnswer": 1,
                    "explanation": "Cross Language Evaluation Forum (CLEF) evaluates multilingual information access systems.",
                    "topic": "Evaluation Forums"
                },
                {
                    "id": "u3-mcq-10",
                    "question": "__________ approach focuses on the explicit indications of sentiment and context of the spoken content within the audio.",
                    "options": ["Latest", "Loss Less", "Linguistic", "Learning"],
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
                    "question": "A __________ is essentially the catalog of words, their synonyms, and their meanings for a given language.",
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
                    "question": "The __________have all been extensively used as sources of annotated data.",
                    "correctAnswer": "Internet Movie Database",
                    "explanation": "The Internet Movie Database (IMDb) provides labeled reviews and ratings, making it a popular source of annotated data for sentiment analysis and NLP tasks.",
                    "topic": "Prescriptive Analytics"
                },
                {
                    "id": "u3-fb-8",
                    "question": "__________ initiatives, where the goal is to create an intimate relationship with the customer.",
                    "correctAnswer": "Customer Experince Management (CRM)",
                    "explanation": "Customer Experince Management (CRM) initiatives, where the goal is to create an intimate relationship with the customer.",
                    "topic": "Customer Experince Management (CRM)"
                },
                {
                    "id": "u3-fb-9",
                    "question": "Large vocabulary continuous speech recognition (LVCSR) system often referred to as __________.",
                    "correctAnswer": "Speech to text",
                    "explanation": "Speech to text is a technology that converts spoken language into text.",
                    "topic": "Speech to Text"
                },
                {
                    "id": "u3-fb-10",
                    "question": "__________ analysis helps companies with competitive intelligence and product development and positioning.",
                    "correctAnswer": "Voice of the Market (VOM)",
                    "explanation": "Voice of the Market (VOM) analysis helps companies with competitive intelligence and product development and positioning.",
                    "topic": "Voice of the Market (VOM)"
                }
            ],
            "descriptive": [
                {
                    "id": "u3-1a",
                    "question": "1a) Define Sentiment analysis?",
                    "answer": [
                        { type: "text", content: "Sentiment is a difficult word to define. It is often linked to or confused with other terms like belief, view, opinion, and conviction. As a field of research, sentiment analysis is closely related to computational linguistics, natural language processing, and text mining." },
                        { type: "callout", content: "Sentiment analysis has many names. It's often referred to as opinion mining, subjectivity analysis, and appraisal extraction, with some connections to affective computing (computer recognition and expression of emotion)." }
                    ],
                    "topic": "Sentiment Basics"
                },
                {
                    "id": "u3-1b",
                    "question": "1b) Explain how sentiment analysis is related to text mining?",
                    "answer": [
                        { type: "text", content: "Sentiment that appears in text comes in two flavors: explicit, where the subjective sentence directly expresses an opinion (\"It's a wonderful day\"), and implicit, where the text implies an opinion (\"The handle breaks too easily\")." },
                        { type: "heading", content: "Sentiment Polarity" },
                        { type: "text", content: "Sentiment polarity is a particular feature of text that sentiment analysis primarily focuses on. It is usually dichotomized into two-positive and negative-but polarity can also be thought of as a range. A document containing several opinionated statements would have a mixed polarity overall, which is different from not having a polarity at all (being objective) (Mejova, 2009)." }
                    ],
                    "topic": "Text Mining"
                },
                {
                    "id": "u3-1c",
                    "question": "1c) Illustrate the common challenges that sentiment analysis has to deal with?",
                    "answer": [
                        { type: "text", content: "Sentiment analysis, the task of determining the sentiment or emotion expressed in a piece of text, faces several challenges:" },
                        {
                            type: "list", items: [
                                "Ambiguity and Context: Sentences can be ambiguous, and the sentiment may change based on the context.",
                                "Negation: Sentiments can be negated by words like 'not' or 'but', reversing the meaning.",
                                "Sarcasm and Irony: Literal meaning is different from intended sentiment, making detection difficult.",
                                "Domain-specific Language: Models trained on one domain (e.g., movies) may fail on another (e.g., products).",
                                "Emoticons and Abbreviations: Interpreting symbols and short forms in online communication.",
                                "Subjectivity: Sentiments vary between individuals; what is positive for one may be negative for another.",
                                "Data Imbalance: Datasets may have more examples of one class, leading to bias.",
                                "Multilingual Challenges: Handling sentiment expression across different languages.",
                                "Handling Short Texts: Social media posts are often too short to capture context accurately.",
                                "Dynamic Language Use: Slang and expressions evolve over time.",
                                "Aspect-based Sentiment Analysis: Difficulty in separating sentiment for specific features vs overall product.",
                                "Emotional Valence: Capturing the intensity (degrees of positivity/negativity) is complex.",
                                "Data Annotation Challenges: Labeling data is subjective and prone to annotator disagreement."
                            ]
                        }
                    ],
                    "topic": "Challenges"
                },
                {
                    "id": "u3-2a",
                    "question": "2a) List out the various sentiment analysis applications?",
                    "answer": [
                        {
                            type: "list", items: [
                                "Voice of the Customer (VOC)",
                                "Voice of the Market (VOM)",
                                "Voice of the Employee (VOE)",
                                "Brand Management",
                                "Financial Markets",
                                "Politics",
                                "Government Intelligence",
                                "Other Interesting Areas (e-commerce, advertising)"
                            ]
                        }
                    ],
                    "topic": "Applications"
                },
                {
                    "id": "u3-2b",
                    "question": "2b) Explain how can sentiment analysis be used for brand management?",
                    "answer": [
                        { type: "heading", content: "Brand Management" },
                        { type: "text", content: "Brand management focuses on listening to social media where anyone (past/current/prospective customers, industry experts, other authorities) can post opinions that can damage or boost your reputation." },
                        { type: "text", content: "There are a number of relatively newly launched start-up companies that offer analytics-driven brand management services for others. Brand management is product and company (rather than customer) focused. It attempts to shape perceptions rather than to manage experiences using sentiment analysis techniques." }
                    ],
                    "topic": "Brand Management"
                },
                {
                    "id": "u3-2c",
                    "question": "2c) Explain briefly all the applications of Sentiment analysis?",
                    "answer": [
                        { type: "heading", content: "Voice of the Customer (VOC)" },
                        { type: "text", content: "VOC is an integral part of analytic CRM and customer experience management systems. Sentiment analysis accesses product and service reviews to better understand and manage customer complaints and praises." },

                        { type: "heading", content: "Voice of the Market (VOM)" },
                        { type: "text", content: "VOM is about understanding aggregate opinions and trends. It involves knowing what stakeholders are saying about your (and competitors') products. A well-done VOM analysis helps with competitive intelligence and product positioning." },

                        { type: "heading", content: "Voice of the Employee (VOE)" },
                        { type: "text", content: "Traditionally limited to surveys, VOE now uses text analytics to listen to what employees are saying. Happy employees empower customer experience efforts and improve satisfaction." },

                        { type: "heading", content: "Brand Management" },
                        { type: "text", content: "Focuses on listening to social media opinions that can damage or boost reputation. It attempts to shape perceptions rather than manage experiences." },

                        { type: "heading", content: "Financial Markets" },
                        { type: "text", content: "Used to predict future values of stocks by analyzing market sentiment, though this remains a complex problem." },

                        { type: "heading", content: "Politics" },
                        { type: "text", content: "Political discussions are dominated by quotes, sarcasm, and complex references, making this a difficult but potentially fruitful area for sentiment analysis." },

                        { type: "heading", content: "Government Intelligence" },
                        { type: "text", content: "Used by intelligence agencies to monitor hostile communications or analyze opinions on pending policy proposals." },

                        { type: "heading", content: "Other Areas" },
                        { type: "text", content: "Includes designing e-commerce sites (product suggestions), placing dynamic advertisements based on page sentiment, and managing opinion-aggregation websites." }
                    ],
                    "topic": "Applications"
                },
                {
                    "id": "u3-3a",
                    "question": "3a) Define the Sentiment analysis Process?",
                    "answer": [
                        { type: "text", content: "Sentiment analysis, also known as opinion mining, is the process of using natural language processing, text analysis, and computational linguistics to determine and extract subjective information from source materials." },
                        { type: "callout", content: "The goal is to understand the sentiment or opinion expressed in a piece of text, whether it's positive, negative, or neutral." }
                    ],
                    "topic": "Sentiment Process"
                },
                {
                    "id": "u3-3b",
                    "question": "3b) List out various steps of Sentiment analysis Process ?",
                    "answer": [
                        {
                            type: "list", items: [
                                "Step 1: Sentiment Detection",
                                "Step 2: N-P Polarity Classification",
                                "Step 3: Target Identification",
                                "Step 4: Collection and Aggregation"
                            ]
                        }
                    ],
                    "topic": "Sentiment Process Steps"
                },
                {
                    "id": "u3-3c",
                    "question": "3c) Explain briefly A Multi-Step Process to Sentiment Analysis ?",
                    "answer": [
                        { type: "diagram", label: "Process Flow of Sentiment Analysis", src: "/image.png" },
                        { type: "heading", content: "Step 1: Sentiment Detection" },
                        { type: "text", content: "This step focuses on identifying whether a text expresses a fact or an opinion. It classifies the text as objective (fact-based) or subjective (opinion-based)." },

                        { type: "heading", content: "Step 2: Polarity Classification" },
                        { type: "text", content: "Once an opinion is detected, this step determines its polarity—whether the sentiment is positive or negative. This is a binary classification task." },

                        { type: "heading", content: "Step 3: Target Identification" },
                        { type: "text", content: "The goal is to identify the object or entity the sentiment is directed toward (e.g., a person, product, or event)." },

                        { type: "heading", content: "Step 4: Collection and Aggregation" },
                        { type: "text", content: "Finally, all identified sentiments are combined to form an overall sentiment score or summary for the document." }
                    ],
                    "topic": "Multi-Step Process"
                },
                {
                    "id": "u3-4a",
                    "question": "4a) Define polarity identification?",
                    "answer": [
                        { type: "text", content: "Polarity identification is the process of identifying the polarity of a text (positive or negative). It can be made at the word, term, sentence, or document level." },
                        { type: "text", content: "The most granular level is the word level. Once identified at the word level, it can be aggregated to the next higher level until the desired level of aggregation is reached." }
                    ],
                    "topic": "Polarity"
                },
                {
                    "id": "u3-4b",
                    "question": "4b) List out the two dominant techniques used for identification of polarity?",
                    "answer": [
                        {
                            type: "list", items: [
                                "Using a lexicon as a reference library (manually or automatically developed).",
                                "Using a collection of training documents as the source of knowledge about the polarity of terms (machine learning)."
                            ]
                        }
                    ],
                    "topic": "Polarity Techniques"
                },
                {
                    "id": "u3-4c",
                    "question": "4c) Explain briefly identification of polarity using a Lexicon?",
                    "answer": [
                        { type: "text", content: "A lexicon is a collection of words, their meanings, and synonyms. In sentiment analysis, lexicons identify the emotional tone of words." },

                        { type: "diagram", label: "Structure of a Sentiment Lexicon", src: "/image1.png" },

                        { type: "text", content: "For English, WordNet is the most well-known lexicon. An extension, SentiWordNet, assigns three sentiment scores to each synset: positivity, negativity, and objectivity." },
                        { type: "text", content: "Esuli and Sebastiani (2006) extended WordNet by adding polarity labels using ternary classifiers (Positive, Negative, Objective) to help analyze sentiment more accurately." }
                    ],
                    "topic": "Lexicon Polarity"
                },
                {
                    "id": "u3-4d",
                    "question": "4d) Explain briefly identification of polarity using a collection of training documents?",
                    "answer": [
                        { type: "text", content: "Sentiment classification uses statistical and machine learning techniques on large collections of labeled documents (often manually annotated or rated)." },
                        { type: "callout", content: "Review websites like Amazon and IMDB provide valuable labeled data (star ratings) which serve as a gold standard for evaluating algorithms." },
                        { type: "heading", content: "Semantic Orientation of Sentences" },
                        { type: "text", content: "Once the semantic orientation of words is known, it is extended to phrases/sentences. This can be done by averaging polarity values or using machine learning models to analyze relationships between words." },
                        { type: "heading", content: "Semantic Orientation of Documents" },
                        { type: "text", content: "While most work focuses on words/phrases, some tasks like summarization require semantic labeling of the whole document." }
                    ],
                    "topic": "Training Documents Polarity"
                },
                {
                    "id": "u3-5a",
                    "question": "5a) Define the Speech analytics?",
                    "answer": [
                        { type: "text", content: "Speech analytics is a growing field of science that allows users to analyze and extract information from both live and recorded conversations." },
                        { type: "text", content: "It is used for security intelligence, enhancing rich media applications, and delivering business intelligence by analyzing millions of recorded calls in customer contact centers." }
                    ],
                    "topic": "Speech Analytics"
                },
                {
                    "id": "u3-5b",
                    "question": "5b) List out the Two steps approach of Speech analytics?",
                    "answer": [
                        { type: "heading", content: "1. The Acoustic Approach" },
                        { type: "text", content: "Focuses on analyzing audio features (tone, pitch, volume, rate) rather than words. It examines 'how' something is said to identify the emotional state." },
                        { type: "heading", content: "2. The Linguistic Approach" },
                        { type: "text", content: "Focuses on explicit expressions of sentiment and context in the spoken content. It studies language patterns, word choice, and syntax to detect underlying feelings." }
                    ],
                    "topic": "Speech Analytics Approach"
                },
                {
                    "id": "u3-5c",
                    "question": "5c) Explain briefly the acoustic approach of Speech analytics?",
                    "answer": [
                        { type: "text", content: "The acoustic approach analyzes sound characteristics to understand emotions. For example, a surprised person speaks faster and louder, while a sad person speaks slower and softer." },
                        { type: "heading", content: "Main Audio Features:" },
                        {
                            type: "list", items: [
                                "Intensity: Energy or sound pressure level.",
                                "Pitch: Variation in fundamental frequency.",
                                "Jitter: Variation in amplitude of vocal fold movements.",
                                "Shimmer: Variation in frequency of vocal fold movements.",
                                "Glottal pulse: Glottal-source spectral characteristics.",
                                "HNR: Harmonics-to-Noise Ratio.",
                                "Speaking rate: Number of words spoken per unit time."
                            ]
                        }
                    ],
                    "topic": "Acoustic Approach"
                },
                {
                    "id": "u3-5d",
                    "question": "5d) Explain briefly the linguistic approach of Speech analytics?",
                    "answer": [
                        { type: "text", content: "The linguistic approach identifies explicit signs of emotion through words and expressions. It assumes emotionally charged people use specific words in specific patterns." },
                        { type: "heading", content: "Main Features Analyzed:" },
                        {
                            type: "list", items: [
                                "Lexical: Words, phrases, and linguistic patterns.",
                                "Disfluencies: Pauses, hesitations, laughter, breathing.",
                                "Higher semantics: Contextual meaning and dialogue history."
                            ]
                        },
                        { type: "text", content: "Advanced versions use machine learning models to predict emotions based on these linguistic elements." }
                    ],
                    "topic": "Linguistic Approach"
                },
                {
                    "id": "u3-6a",
                    "question": "6a) Define lexicon in sentiment analysis process?",
                    "answer": [
                        { type: "text", content: "A lexicon is a predefined set of words or phrases associated with specific sentiments. It acts as a dictionary categorizing words into positive, negative, or neutral sentiments." },
                        { type: "heading", content: "Types of Lexicons:" },
                        {
                            type: "list", items: [
                                "Polarity-based: Assigns a score (positive/negative) to words.",
                                "Subjectivity-based: Classifies words as subjective (opinion) or objective (factual)."
                            ]
                        }
                    ],
                    "topic": "Lexicon Definition"
                },
                {
                    "id": "u3-6b",
                    "question": "6b) List out the various audio features can be measured in acoustic approach in speech analytics?",
                    "answer": [
                        {
                            type: "list", items: [
                                "Intensity",
                                "Pitch",
                                "Jitter",
                                "Shimmer",
                                "Glottal pulse",
                                "HNR (Harmonics-to-Noise Ratio)",
                                "Speaking rate"
                            ]
                        }
                    ],
                    "topic": "Audio Features"
                },
                {
                    "id": "u3-6c",
                    "question": "6c) Draw the diagram and label the A Multi-Step Process to Sentiment Analysis?",
                    "answer": [
                        { type: "diagram", label: "The Multi-Step Process of Sentiment Analysis", src: "/image.png" },
                        {
                            type: "list", items: [
                                "Step 1: Sentiment Detection",
                                "Step 2: N-P Polarity Classification",
                                "Step 3: Target Identification",
                                "Step 4: Collection and Aggregation"
                            ]
                        }
                    ],
                    "topic": "Sentiment Analysis Diagram"
                },
                {
                    "id": "u3-6d",
                    "question": "6d) Explain briefly N-P polarity classification with neat diagram?",
                    "answer": [
                        { type: "text", content: "N-P polarity classification typically refers to sentiment analysis or sentiment classification, where the goal is to determine the polarity (positive or negative) of a given text or document. The terms \"N\" and \"P\" stand for \"Negative\" and \"Positive,\" respectively." },
                        { type: "text", content: "Sentiment analysis has applications in various fields, including marketing, customer feedback analysis, social media monitoring, and more. The process involves using natural language processing (NLP) techniques to analyze the sentiment expressed in a piece of text." },

                        { type: "heading", content: "Simplified Overview of Steps:" },

                        { type: "heading", content: "1. Text Preprocessing" },
                        {
                            type: "list", items: [
                                "Tokenization: Breaking the text into individual words or tokens.",
                                "Lowercasing: Converting all words to lowercase to ensure consistency.",
                                "Removing stop words: Removing common words like \"and,\" \"the,\" etc., which may not contribute much to sentiment."
                            ]
                        },

                        { type: "heading", content: "2. Feature Extraction" },
                        { type: "text", content: "Transforming the text into a format suitable for machine learning models. This could involve techniques like TF-IDF (Term Frequency-Inverse Document Frequency) or word embeddings." },

                        { type: "heading", content: "3. Building a Model" },
                        { type: "text", content: "Using a machine learning algorithm, such as a Naive Bayes classifier, Support Vector Machine (SVM), or deep learning models like recurrent neural networks (RNNs) or transformers." },

                        { type: "heading", content: "4. Training the Model" },
                        { type: "text", content: "Training the model on a labeled dataset where each text is associated with its sentiment label (positive or negative)." },

                        { type: "heading", content: "5. Evaluation" },
                        { type: "text", content: "Assessing the model's performance on a separate set of data not used during training to ensure it generalizes well to new, unseen data." },

                        { type: "heading", content: "6. Inference" },
                        { type: "text", content: "Using the trained model to predict the sentiment of new, unseen text." }
                    ],
                    "topic": "N-P Polarity Classification"
                },
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
                    "options": ["Intranet", "Internet", "LAN", "MAN"],
                    "correctAnswer": 1,
                    "explanation": "The growth of the Internet has made data creation and exchange easier.",
                    "topic": "Web Fundamentals"
                },
                {
                    "id": "u4-mcq-2",
                    "question": "The __________ serves as an enormous repository of data and information on virtually everything one can conceive – business, personal, you name it; an abundant amount of it is there.",
                    "options": ["Worldwide Web", "Sentiment Analysis", "Text mining", "Text Analysis"],
                    "correctAnswer": 0,
                    "explanation": "The Worldwide Web serves as an enormous repository of data.",
                    "topic": "Web Repository"
                },
                {
                    "id": "u4-mcq-3",
                    "question": "__________ refers to the extraction of useful information from Web pages. The documents may be extracted in some machine-readable format so that automated techniques can extract some information from these Web pages.",
                    "options": ["Web Usage mining", "Web Structure mining", "Web Text mining", "Web Content mining"],
                    "correctAnswer": 3,
                    "explanation": "Web Content mining refers to the extraction of useful information from Web pages.",
                    "topic": "Web Mining Types"
                },
                {
                    "id": "u4-mcq-4",
                    "question": "__________ are used to read through the content of a Web site automatically.",
                    "options": ["Web Usage mining", "Web Text mining", "Web Crawlers", "Web Content mining"],
                    "correctAnswer": 2,
                    "explanation": "Web Crawlers are used to read through the content of a Web site automatically.",
                    "topic": "Web Crawlers"
                },
                {
                    "id": "u4-mcq-5",
                    "question": "The idea of __________ stems from earlier information retrieval work using citations among journal articles to evaluate the impact of research papers.",
                    "options": ["Authoritative mining", "Authoritative pages", "Authoritative Analysis", "Authoritative crawlers"],
                    "correctAnswer": 1,
                    "explanation": "The idea of Authoritative pages stems from earlier citation work.",
                    "topic": "Page Authority"
                },
                {
                    "id": "u4-mcq-6",
                    "question": "__________ mining is the process of extracting useful information from the links embedded in Web documents.",
                    "options": ["Web Usage mining", "Web Structure mining", "Web Text mining", "Web Content mining"],
                    "correctAnswer": 1,
                    "explanation": "Web Structure mining extracts information from links in Web documents.",
                    "topic": "Structure Mining"
                },
                {
                    "id": "u4-mcq-7",
                    "question": "__________ is the popular term for information retrieval system.",
                    "options": ["Search Engine", "Sentiment Analysis", "Planning", "Execution"],
                    "correctAnswer": 0,
                    "explanation": "Search Engine is the popular term for information retrieval system.",
                    "topic": "Search Engines"
                },
                {
                    "id": "u4-mcq-8",
                    "question": "The __________ is responsible for receiving a search request from the user and converting it into a standardized data structure.",
                    "options": ["Query Update", "Query Optimizer", "Query Resolver", "Query Analyzer"],
                    "correctAnswer": 3,
                    "explanation": "The Query Analyzer receives search requests and converts them into standardized structures.",
                    "topic": "Search Components"
                },
                {
                    "id": "u4-mcq-9",
                    "question": "__________ is Google's Web crawling robot, which finds and retrieves pages on the Web and hands them off to the Google indexer.",
                    "options": ["Google Indexer", "Google Optimizer", "Googlebot", "Google Query Processor"],
                    "correctAnswer": 2,
                    "explanation": "Googlebot is Google's Web crawling robot.",
                    "topic": "Google Tools"
                },
                {
                    "id": "u4-mcq-10",
                    "question": "The __________ has several parts, including the user interface (search box), the \"engine\" that evaluates queries and matches them to relevant documents, and the results formatter.",
                    "options": ["Google Indexer", "Google Optimizer", "Googlebot", "Google Query Processor"],
                    "correctAnswer": 3,
                    "explanation": "The Google Query Processor evaluates queries and matches them to relevant documents.",
                    "topic": "Search Processing"
                }
            ],
            "fillBlanks": [
                {
                    "id": "u4-fb-1",
                    "question": "__________ is the process of discovering intrinsic relationships (i.e., interesting and useful information) from Web data, which are expressed in the form of textual, linkage, or usage information.",
                    "correctAnswer": "Web mining",
                    "explanation": "Web mining is the process of discovering intrinsic relationships from Web data.",
                    "topic": "Web Mining"
                },
                {
                    "id": "u4-fb-2",
                    "question": "The structure of Web hyperlinks has led to another important category of Web pages called a __________.",
                    "correctAnswer": "Hub",
                    "explanation": "Hubs are an important category of Web pages derived from hyperlink structures.",
                    "topic": "Web Structure"
                },
                {
                    "id": "u4-fb-3",
                    "question": "The most popular publicly known and referenced algorithm used to calculate hubs and authorities is __________.",
                    "correctAnswer": "HITS",
                    "explanation": "HITS is the algorithm used to calculate hubs and authorities.",
                    "topic": "Ranking Algorithms"
                },
                {
                    "id": "u4-fb-4",
                    "question": "__________ is a software program that searches for documents based on the keywords that users have provided that have to do with the subject of their inquiry.",
                    "correctAnswer": "search engine",
                    "explanation": "A search engine searches for documents based on keywords.",
                    "topic": "Search Engines"
                },
                {
                    "id": "u4-fb-5",
                    "question": "The purpose of this __________ cycle is to create a huge database of documents/pages organized and indexed based on their content and information value.",
                    "correctAnswer": "Development",
                    "explanation": "The Development cycle creates the database of indexed documents.",
                    "topic": "Search Cycle"
                },
                {
                    "id": "u4-fb-6",
                    "question": "A __________ is a piece of software that systematically browses the World Wide Web for the purpose of finding and fetching Web pages.",
                    "correctAnswer": "Web crawler",
                    "explanation": "A Web crawler systematically browses the Web to find pages.",
                    "topic": "Crawlers"
                },
                {
                    "id": "u4-fb-7",
                    "question": "The __________ parses the search string into individual words/terms using a series of tasks that include tokenization, removal of stop words, stemming etc.",
                    "correctAnswer": "query analyzer",
                    "explanation": "The query analyzer parses the search string into individual terms.",
                    "topic": "Query Processing"
                },
                {
                    "id": "u4-fb-8",
                    "question": "Google uses a proprietary algorithm, called __________ to calculate the relative rank order of a given collection of Web pages.",
                    "correctAnswer": "PageRank",
                    "explanation": "PageRank is Google's algorithm for calculating the relative rank of Web pages.",
                    "topic": "PageRank"
                },
                {
                    "id": "u4-fb-9",
                    "question": "IDF stands for __________.",
                    "correctAnswer": "Inverse Document Frequency",
                    "explanation": "IDF stands for Inverse Document Frequency.",
                    "topic": "Text Weighting"
                },
                {
                    "id": "u4-fb-10",
                    "question": "HITS stands for __________.",
                    "correctAnswer": "Hyperlink-Induced Topic Search",
                    "explanation": "HITS stands for Hyperlink-Induced Topic Search.",
                    "topic": "Link Analysis"
                }
            ],
            "descriptive": [
                {
                    "id": "u4-1a",
                    "question": "1a) Define web mining?",
                    "answer": [
                        { type: "text", content: "Web mining (or Web data mining) is the process of discovering intrinsic relationships (i.e., interesting and useful information) from Web data, expressed as textual, linkage, or usage information." },
                        { type: "text", content: "It is essentially data mining using data generated over the Web. The goal is to turn vast repositories of business transactions and site usage data into actionable knowledge for better decision-making. It is often referred to as Web Analytics." }
                    ],
                    "topic": "Web Mining"
                },
                {
                    "id": "u4-1b",
                    "question": "1b) List out the challenges of web for effective and efficient knowledge discovery?",
                    "answer": [
                        {
                            type: "list", items: [
                                "The Web is too big for effective data mining.",
                                "The Web is too complex.",
                                "The Web is too dynamic.",
                                "The Web is not specific to a domain.",
                                "The Web has everything."
                            ]
                        }
                    ],
                    "topic": "Web Challenges"
                },
                {
                    "id": "u4-1c",
                    "question": "1c) List out the challenges of web for effective and efficient knowledge discovery?",
                    "answer": [

                        { type: "text", content: "The Web poses several significant challenges for knowledge discovery (Han and Kamber, 2006):" },
                        { type: "heading", content: "1. The Web is Too Big" },
                        { type: "text", content: "The sheer volume of data is staggering. This massive size makes it computationally expensive to crawl, index, and analyze. Traditional algorithms struggle to scale." },

                        { type: "heading", content: "2. The Web is Too Complex" },
                        { type: "text", content: "It is a mesh of unstructured and semi-structured data (text, images, video, links). There is no single schema governing how information is presented." },

                        { type: "heading", content: "3. The Web is Too Dynamic" },
                        { type: "text", content: "New pages are created and updated constantly. Knowledge discovered today might be obsolete tomorrow. Capturing a consistent snapshot is nearly impossible." },

                        { type: "heading", content: "4. The Web is Not Specific to a Domain" },
                        { type: "text", content: "It contains information on every topic imaginable. This lack of specificity makes it hard to filter noise and focus on relevant data." },

                        { type: "heading", content: "5. The Web Has Everything" },
                        { type: "text", content: "It includes high-quality sources mixed with spam, misinformation, and duplicates. Distinguishing trustworthy info from noise is a major hurdle." }
                    ],
                    "topic": "Web Challenges"
                },
                {
                    "id": "u4-1d",
                    "question": "1d) Illustrate the three main areas of Web mining? Explain How does it differ from regular data mining or text mining?",
                    "answer": [
                        { type: "diagram", label: "web mining taxonomy", src: "/image2.png" },
                        { type: "text", content: "Web mining is divided into three main areas:" },
                        { type: "heading", content: "1. Web Content Mining" },
                        { type: "text", content: "Refers to the extraction of useful information from Web pages. It involves crawlers reading content for competitive intelligence, sentiment analysis, or summarization. It differs from text mining by handling web-specific structures." },

                        { type: "heading", content: "2. Web Structure Mining" },
                        { type: "text", content: "Extracts information from links embedded in documents. It identifies authoritative pages and hubs (using algorithms like HITS or PageRank). Regular data mining does not typically analyze such hyperlink structures." },

                        { type: "heading", content: "3. Web Usage Mining" },
                        { type: "text", content: "Extracts information from data generated through page visits (server logs, cookies, user profiles). It analyzes user behavior (clickstreams), which is unique to the web environment compared to static database mining." }
                    ],
                    "topic": "Web Mining Areas"
                },
                {
                    "id": "u4-2a",
                    "question": "2a) Define Web content mining?",
                    "answer": [
                        { type: "text", content: "Web content mining involves extracting useful information from Web pages. It serves as an automated data collection tool and enhances search engine results. It is the most prevailing application of web mining." }
                    ],
                    "topic": "Web Content Mining"
                },
                {
                    "id": "u4-2b",
                    "question": "2b) Explain the \"authoritative pages\" web content mining?",
                    "answer": [
                        { type: "text", content: "The idea of authoritative pages stems from citation analysis in research. In the web context, an authoritative page is a high-quality page that is linked to by many other pages (especially hubs), indicating it is a trusted source for a specific topic." }
                    ],
                    "topic": "Authoritative Pages"
                },
                {
                    "id": "u4-2c",
                    "question": "2c) Explain briefly Web structure mining? How does it differ from Web content mining?",
                    "answer": [
                        { type: "heading", content: "Web Structure Mining" },
                        { type: "text", content: "This process extracts information from the links embedded in Web documents. It is used to identify authoritative pages and hubs, which are cornerstones of algorithms like PageRank. It analyzes the topology of the web to understand relationships between pages." },

                        { type: "heading", content: "Difference from Content Mining" },
                        { type: "text", content: "Web Content Mining focuses on the actual data (text, images) *on* the page. Web Structure Mining focuses on the *links* between pages (the structure). Content mining reads *what* is said; Structure mining analyzes *who points to whom*." }
                    ],
                    "topic": "Web Structure Mining"
                },
                {
                    "id": "u4-3a",
                    "question": "3a) Define the Web crawlers?",
                    "answer": [
                        { type: "text", content: "Web crawlers (also called spiders) are programs that automatically browse and read through the content of websites. They gather information for indexing, competitive intelligence, and automated data collection." }
                    ],
                    "topic": "Web Crawlers"
                },
                {
                    "id": "u4-3b",
                    "question": "3b) List out the two cycles of search Engine?",
                    "answer": [
                        { type: "heading", content: "1. Development Cycle" },
                        { type: "list", items: ["Web Crawler", "Document Indexer (Preprocessing, Parsing, Creating Term-Document Matrix)"] },
                        { type: "heading", content: "2. Response Cycle" },
                        { type: "list", items: ["Query Analyzer", "Document Matcher/Ranker"] }
                    ],
                    "topic": "Search Engine Cycles"
                },
                {
                    "id": "u4-3c",
                    "question": "3c) Explain briefly document indexer and steps?",
                    "answer": [
                        { type: "text", content: "The document indexer processes documents fetched by the crawler to place them into the database. It performs three main tasks:" },
                        { type: "heading", content: "Step 1: Preprocessing the Documents" },
                        { type: "text", content: "Converts documents into a standard representation/format, handling different content types (text, pdf, etc.)." },
                        { type: "heading", content: "Step 2: Parsing the Documents" },
                        { type: "text", content: "Uses text mining to parse documents and identify index-worthy terms." },
                        { type: "heading", content: "Step 3: Creating the Term-by-Document Matrix" },
                        { type: "text", content: "Identifies relationships between terms and documents, often using TF/IDF weights to create the index file." }
                    ],
                    "topic": "Document Indexer"
                },
                {
                    "id": "u4-4a",
                    "question": "4a) Define Query analyzer?",
                    "answer": [
                        { type: "text", content: "The query analyzer receives a user's search request and converts it into a standardized data structure. It parses the search string using tokenization, stemming, and disambiguation so it can be matched against the document database." }
                    ],
                    "topic": "Query Analyzer"
                },
                {
                    "id": "u4-4b",
                    "question": "4b) List out the two dominant techniques used for response cycle?",
                    "answer": [
                        {
                            type: "list", items: [
                                "Query Analyzer: Converts user request into structured data.",
                                "Document Matcher/Ranker: Matches query against database and ranks results."
                            ]
                        }
                    ],
                    "topic": "Response Cycle Techniques"
                },
                {
                    "id": "u4-4c",
                    "question": "4c) Explain briefly two main components of the response cycle in search engine?",
                    "answer": [
                        { type: "heading", content: "1. Query Analyzer" },
                        { type: "text", content: "Responsible for receiving the search request and converting it into a standardized structure. It performs tokenization, stop-word removal, and stemming. This ensures the query format matches the indexed data." },

                        { type: "heading", content: "2. Document Matcher/Ranker" },
                        { type: "text", content: "This component matches the structured query against the document database to find relevant pages. It then ranks them based on relevance and importance (using algorithms like PageRank) to return the best results to the user." }
                    ],
                    "topic": "Response Cycle Components"
                },
                {
                    "id": "u4-5a",
                    "question": "5a) Define the Search engine optimization (SEO)?",
                    "answer": [
                        { type: "text", content: "Search engine optimization (SEO) is the intentional activity of affecting the visibility of a website in a search engine's natural (unpaid) search results. Higher rankings and more frequent appearances lead to more visitors." }
                    ],
                    "topic": "SEO Definition"
                },
                {
                    "id": "u4-5b",
                    "question": "5b) List out the two methods involved in Search engine optimization (SEO)?",
                    "answer": [
                        {
                            type: "list", items: [
                                "White Hat Techniques: Recommended by search engines as good design.",
                                "Black Hat Techniques (Spamdexing): Disapproved techniques that search engines try to minimize."
                            ]
                        }
                    ],
                    "topic": "SEO Methods"
                },
                {
                    "id": "u4-5c",
                    "question": "5c) Explain briefly the two techniques of Search engine optimization (SEO)?",
                    "answer": [
                        { type: "text", content: "Both on-page and off-page SEO are crucial for a comprehensive search engine optimization strategy. By combining these techniques, websites can improve their chances of ranking higher in search engine results pages (SERPs) and attracting organic traffic." },

                        { type: "heading", content: "On-Page SEO" },
                        { type: "text", content: "Definition: On-page SEO refers to the optimization of elements on a website itself. It involves making changes to the website's content, HTML code, and structure to improve its relevance to specific keywords and make it more search engine-friendly." },
                        { type: "heading", content: "Key Aspects of On-Page SEO:" },
                        {
                            type: "list", items: [
                                "Keyword Optimization: Ensure that relevant keywords are strategically placed in titles, headings, and throughout the content.",
                                "Quality Content: Create high-quality, relevant, and valuable content that satisfies the user's intent.",
                                "Meta Tags: Optimize meta titles and meta descriptions to accurately describe the content and encourage click-throughs.",
                                "URL Structure: Use clean and descriptive URLs that include relevant keywords.",
                                "Header Tags: Use header tags (H1, H2, etc.) to structure content and highlight important information."
                            ]
                        },

                        { type: "heading", content: "Off-Page SEO" },
                        { type: "text", content: "Definition: Off-page SEO involves activities conducted outside the boundaries of the website to improve its visibility and credibility. It focuses on building a website's authority, relevance, and trustworthiness in the eyes of search engines." },
                        { type: "heading", content: "Key Aspects of Off-Page SEO:" },
                        {
                            type: "list", items: [
                                "Backlink Building: Acquire high-quality backlinks from authoritative and relevant websites to boost the site's credibility.",
                                "Social Signals: Engage in social media to promote content and increase visibility. Social signals, such as likes and shares, can impact search engine rankings.",
                                "Brand Mentions: Develop a positive online reputation by encouraging brand mentions and reviews.",
                                "Influencer Outreach: Collaborate with influencers or authoritative figures in your industry to gain exposure and credibility.",
                                "Local SEO: Optimize the website for local searches by ensuring accurate business information on online directories and creating local content."
                            ]
                        },

                        { type: "callout", content: "It's important to note that SEO is an ongoing process, and staying updated with search engine algorithms and user behavior is essential for long-term success." }
                    ],
                    "topic": "SEO Techniques"
                },
                {
                    "id": "u4-5d",
                    "question": "5d) Explain briefly Web Analytics maturity model?",
                    "answer": [
                        { type: "heading", content: "Concept of Maturity" },
                        { type: "text", content: "The term \"maturity\" relates to the degree of proficiency, formality, and optimization of business models, moving \"ad hoc\" practices to formally defined steps and optimal business processes. A maturity model is a formal depiction of critical dimensions and their competency levels of a business practice." },
                        { type: "text", content: "Collectively, these dimensions and levels define the maturity level of an organization in that area of practice. It often describes an evolutionary improvement path from ad hoc, immature practices to disciplined, mature processes with improved quality and efficiency." },

                        { type: "heading", content: "Examples of Maturity Models" },
                        {
                            type: "list", items: [
                                "TDWI BI Maturity Model: Describes the evolution of data warehousing in six stages (Management Reporting → Spreadmarts → Data Marts → Data Warehouse → Enterprise Data Warehouse → BI Services).",
                                "Simple Business Analytics Model: Moves from descriptive measures to predicting outcomes, to sophisticated decision systems (Descriptive → Predictive → Prescriptive Analytics)."
                            ]
                        },

                        { type: "heading", content: "Hamel's Web Analytics Maturity Model (2009)" },
                        { type: "text", content: "Perhaps the most comprehensive model for Web analytics was proposed by Stephane Hamel. This model assesses maturity across six specific dimensions:" },
                        {
                            type: "list", items: [
                                "1. Management, Governance and Adoption",
                                "2. Objectives Definition",
                                "3. Scoping",
                                "4. The Analytics Team and Expertise",
                                "5. The Continuous Improvement Process and Analysis Methodology",
                                "6. Tools, Technology and Data Integration"
                            ]
                        },

                        { type: "callout", content: "Proficiency Levels: For each dimension, the model uses six levels of competence, ranging from '0-Analytically Impaired' to '5-Analytical Competitor'." }
                    ],
                    "topic": "Web Analytics Maturity Model"
                },
                {
                    "id": "u4-6a",
                    "question": "6a) Define Web usage mining?",
                    "answer": [
                        { type: "text", content: "Web usage mining (also called Web analytics) is the extraction of useful information from data generated through Web page visits and transactions." }
                    ],
                    "topic": "Web Usage Mining"
                },
                {
                    "id": "u4-6b",
                    "question": "6b) List out the various types of data are generated through Web page visits?",
                    "answer": [
                        {
                            type: "list", items: [
                                "Automatically generated data (server access logs, referrer logs, cookies)",
                                "User profiles",
                                "Metadata (page attributes, content attributes, usage data)"
                            ]
                        }
                    ],
                    "topic": "Web Page Data Types"
                },
                {
                    "id": "u4-6c",
                    "question": "6c) Explain briefly Web Analytics Metrics?",
                    "answer": [
                        { type: "heading", content: "Overview" },
                        { type: "text", content: "Using a variety of data sources, Web analytics programs provide access to a lot of valuable marketing data, which can be leveraged for better insights to grow your business and better document your ROI." },
                        { type: "text", content: "The insight and intelligence gained from Web analytics can be used to effectively manage the marketing efforts of an organization and its various products or services. Web analytics programs provide nearly real-time data, which can document your marketing campaign successes or empower you to make timely adjustments to your current marketing strategies." },

                        { type: "heading", content: "Actionable Metrics Categories (TWG, 2013)" },
                        { type: "text", content: "While Web analytics provides a broad range of metrics, there are four categories of metrics that are generally actionable and can directly impact your business objectives:" },
                        {
                            type: "list", items: [
                                "Web site usability: How were they using my Web site?",
                                "Traffic sources: Where did they come from?",
                                "Visitor profiles: What do my visitors look like?",
                                "Conversion statistics: What does all this mean for the business?"
                            ]
                        }
                    ],
                    "topic": "Web Analytics Metrics"
                },
                {
                    "id": "u4-6d",
                    "question": "6d) Explain briefly Web Analytics Tools?",
                    "answer": [
                        { type: "text", content: "There are plenty of Web analytics applications (downloadable software tools and Web-based/on-demand service platforms) in the market. Many of the most popular tools are free for commercial or nonprofit use." },
                        { type: "heading", content: "Popular Free (or Almost Free) Tools:" },

                        { type: "heading", content: "GOOGLE WEB ANALYTICS" },
                        { type: "text", content: "This is a service offered by Google that generates detailed statistics about a Web site's traffic and traffic sources and measures conversions and sales." },

                        { type: "heading", content: "YAHOO! WEB ANALYTICS" },
                        { type: "text", content: "Yahoo! Web analytics is Yahoo!'s alternative to the dominant Google Analytics." },

                        { type: "heading", content: "OPEN WEB ANALYTICS" },
                        { type: "text", content: "Open Web Analytics (OWA) is a popular open source Web analytics software that anyone can use to track and analyze how people use Web sites and applications." },

                        { type: "heading", content: "PIWIK" },
                        { type: "text", content: "Piwik is one of the leading self-hosted, decentralized, open source Web analytics platforms, used by 460,000 Web sites in 150 countries." },

                        { type: "heading", content: "FIRESTAT" },
                        { type: "text", content: "A simple and straightforward application written in PHP/MySQL. It supports numerous platforms like WordPress, Drupal, and Joomla." },

                        { type: "heading", content: "SITE METER" },
                        { type: "text", content: "Provides counter and tracking information. By logging IP addresses, it provides info about visitors, including how they reached the site and visit duration." },

                        { type: "heading", content: "WOOPRA" },
                        { type: "text", content: "A real-time customer analytics service designed to help optimize the customer life cycle by delivering live, granular behavioral data." },

                        { type: "heading", content: "AWSTATS" },
                        { type: "text", content: "An open source reporting tool suitable for analyzing data from Internet services like Web, streaming media, and mail servers by parsing server log files." },

                        { type: "heading", content: "SNOOP" },
                        { type: "text", content: "A desktop-based application (Mac/Windows) that sits in the system tray and notifies you with audible sounds whenever something happens." },

                        { type: "heading", content: "MOCHIBOT" },
                        { type: "text", content: "A free tracking tool especially designed for Flash assets. It tracks who is sharing Flash content and prevents piracy." }
                    ],
                    "topic": "Web Analytics Tools"
                },
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
                    "options": ["Social", "Philosophical", "Multi", "Transmission"],
                    "correctAnswer": 0,
                    "explanation": "Social analytics focuses on analyzing content from social media platforms.",
                    "topic": "Social Analytics"
                },
                {
                    "id": "u5-mcq-2",
                    "question": "__________ studies are often considered a part of both the social sciences and the humanities, drawing heavily on fields such as sociology, psychology, anthropology, information science, biology, political science, and economics.",
                    "options": ["Criminal", "Community", "Communication", "Innovation"],
                    "correctAnswer": 2,
                    "explanation": "Communication studies draw from sociology, psychology, anthropology, and other fields.",
                    "topic": "Communication Networks"
                },
                {
                    "id": "u5-mcq-3",
                    "question": "__________ referred to a specific geographic location, and studies of community ties had to do with who talked, associated, and traded with whom.",
                    "options": ["Criminal", "Community", "Communication", "Innovation"],
                    "correctAnswer": 1,
                    "explanation": "Community traditionally referred to a specific geographic location.",
                    "topic": "Community Networks"
                },
                {
                    "id": "u5-mcq-4",
                    "question": "__________ are often grouped into three categories: connections, distributions, and segmentation.",
                    "options": ["Mimics", "Mutations", "Measurements", "Metrics"],
                    "correctAnswer": 3,
                    "explanation": "Social network metrics measure various aspects of network structure and behavior.",
                    "topic": "Network Metrics"
                },
                {
                    "id": "u5-mcq-5",
                    "question": "__________ refers to the enabling technologies of social interactions among people in which they create, share, and exchange information in virtual communities.",
                    "options": ["Social Media", "Social Analytics", "Sentiment Analysis", "Static Analysis"],
                    "correctAnswer": 0,
                    "explanation": "Social media platforms enable people to create and share content in online communities.",
                    "topic": "Social Media"
                },
                {
                    "id": "u5-mcq-6",
                    "question": "Social media __________ refers to the systematic and scientific ways to consume the vast amount of content created by Web-based social media outlets.",
                    "options": ["Network", "Sentiment", "Analytics", "Goals"],
                    "correctAnswer": 2,
                    "explanation": "Social media analytics systematically analyzes social media content for business insights.",
                    "topic": "Analytics Methods"
                },
                {
                    "id": "u5-mcq-7",
                    "question": "__________ analytics and text analytics examine the content in online conversations to identify themes, sentiments, and connections.",
                    "options": ["Preserving", "Predictive", "Descriptive", "Discrete"],
                    "correctAnswer": 1,
                    "explanation": "Predictive analytics and text analytics examine content in online conversations to identify themes, sentiments, and connections.",
                    "topic": "Content Analysis"
                },
                {
                    "id": "u5-mcq-8",
                    "question": "__________ analysis attempts to assess the impact of a change in the input data or parameters on the proposed solution.",
                    "options": ["Specificity", "Sentiment", "Social Analytics", "Sensitivity"],
                    "correctAnswer": 3,
                    "explanation": "Sensitivity analysis attempts to assess the impact of a change in the input data or parameters on the proposed solution.",
                    "topic": "Sensitivity Analysis"
                },
                {
                    "id": "u5-mcq-9",
                    "question": "__________ calculates the values of the inputs necessary to achieve a desired level of an output.",
                    "options": ["Goal Setting", "Goal Seeking", "Goal Section", "Goal Sector"],
                    "correctAnswer": 1,
                    "explanation": "Goal seeking calculates the values of the inputs necessary to achieve a desired level of an output.",
                    "topic": "Goal Seeking"
                },
                {
                    "id": "u5-mcq-10",
                    "question": "The analysis of management __________ aims at evaluating how far each alternative advances managers toward their goals.",
                    "options": ["Directions", "Decisions", "Developments", "Destinations"],
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
                },
                {
                    "id": "u5-fb-10",
                    "question": "__________ offers services geared toward monitoring, measuring, analyzing, profiling, and targeting audiences for a brand.",
                    "correctAnswer": "Webtrends",
                    "explanation": "Webtrends is a company that provides digital analytics and other services to help businesses understand their audience.",
                    "topic": "Analytics Vendors"
                }
            ],
            "descriptive": [
                {
                    "id": "u5-1a",
                    "question": "1a) Define Social analytics?",
                    "answer": [
                        { type: "text", content: "Social analytics refers to the process of collecting, analyzing, and interpreting data from social media platforms and other online sources." },
                        { type: "text", content: "The goal is to gain insights into social trends, user behavior, and the performance of social media strategies. It involves using tools to measure the impact of social media activities on an organization's goals." }
                    ],
                    "topic": "Social Analytics"
                },
                {
                    "id": "u5-1b",
                    "question": "1b) List out the social network types?",
                    "answer": [
                        {
                            type: "list", items: [
                                "Communication Networks",
                                "Community Networks",
                                "Criminal Networks",
                                "Innovation Networks"
                            ]
                        }
                    ],
                    "topic": "Social Network Types"
                },
                {
                    "id": "u5-1c",
                    "question": "1c) Illustrate the typical social network types that are relevant to business activities?",
                    "answer": [
                        { type: "text", content: "Social networks are complex structures composed of individuals, groups, or organizations linked by various relationships. Understanding these types is crucial for effective Social Network Analysis (SNA)." },

                        { type: "heading", content: "1. Communication Networks" },
                        { type: "text", content: "These networks are fundamentally focused on the flow of information between entities. Studies of communication networks are often considered a part of both the social sciences and the humanities. They draw heavily on diverse fields such as sociology, psychology, anthropology, information science, biology, political science, and economics." },
                        { type: "callout", content: "In a business organization, a communication network might map how official emails or informal chats flow between departments, revealing who the key information brokers are." },
                        { type: "heading", content: "2. Community Networks" },
                        { type: "text", content: "Traditionally, the concept of 'community' referred to a specific geographic location. Studies of community ties focused on physical interactions, analyzing who talked, associated, traded, and attended social activities with whom within a specific area. However, in the modern digital age, this definition has expanded to include virtual communities." },
                        { type: "heading", content: "3. Criminal Networks" },
                        { type: "text", content: "This type of network is a primary focus in criminology and urban sociology. Analysts study these networks to understand the structure of illicit activities, such as analyzing gang murders and other illegal activities as a series of exchanges between gangs. In a business context, these principles help detect fraud or internal corruption." },
                        { type: "heading", content: "4. Innovation Networks" },
                        { type: "text", content: "Innovation networks are critical for understanding business growth. They map the flow of new ideas, practices, and technologies. An innovation network analyzes how a new concept spreads from early adopters to the majority, helping identify 'opinion leaders' or 'influencers'." }
                    ],
                    "topic": "Business Social Networks"
                },
                {

                    "id": "u5-2a",
                    "question": "2a) Define Social Network?",
                    "answer": [
                        { type: "text", content: "A social network is a social structure composed of individuals/people (or organizations) linked to one another with some type of connections/relationships." },
                        { type: "text", content: "The study of these structures uses social network analysis to identify local and global patterns, locate influential entities, and examine network dynamics." }
                    ],
                    "topic": "Social Network Definition"
                },
                {
                    "id": "u5-2b",
                    "question": "2b) Explain the Social Network Analysis Metrics?",
                    "answer": [
                        { type: "text", content: "Social Network Analysis (SNA) is the systematic examination of social networks. It views social relationships in terms of network theory, consisting of nodes (individuals/organizations) and ties/connections (relationships like friendship or organizational position)." }
                    ],
                    "topic": "SNA Metrics"
                },
                {
                    "id": "u5-2c",
                    "question": "2c) Explain briefly most prevailing characteristics that help differentiate between social and industrial media?",
                    "answer": [
                        { type: "text", content: "Here are some of the most prevailing characteristics that help differentiate between social and industrial media (Morgan et al., 2010):" },

                        { type: "heading", content: "1. Quality" },
                        { type: "text", content: "In industrial publishing (mediated by a publisher), the range of quality is substantially narrower. In social media (unmediated), quality has high variance: ranging from very high-quality items to low-quality, sometimes abusive, content." },

                        { type: "heading", content: "2. Reach" },
                        { type: "text", content: "Both technologies provide global scale. However, industrial media uses a centralized framework for production and dissemination, whereas social media is decentralized, less hierarchical, and has multiple points of production." },

                        { type: "heading", content: "3. Frequency" },
                        { type: "text", content: "Updating and reposting on social media is easier, faster, and cheaper than industrial media. This leads to more frequent updates and fresher content." },

                        { type: "heading", content: "4. Accessibility" },
                        { type: "text", content: "Industrial media production tools are typically government or corporate-owned and costly. Social media tools are generally available to the public at little or no cost." },

                        { type: "heading", content: "5. Usability" },
                        { type: "text", content: "Industrial media requires specialized skills and training. Social media production requires only modest reinterpretation of existing skills; theoretically, anyone with access can operate the means of production." },

                        { type: "heading", content: "6. Immediacy" },
                        { type: "text", content: "The time lag in industrial media can be long (weeks, months, or years). In contrast, social media is capable of virtually instantaneous responses." },

                        { type: "heading", content: "7. Updatability" },
                        { type: "text", content: "Once created and distributed, industrial media cannot be altered (e.g., a printed magazine article). Social media can be altered almost instantaneously by editing or comments." }
                    ],
                    "topic": "Social vs Industrial Media"
                },
                {
                    "id": "u5-3a",
                    "question": "3a) Define the Social media analytics?",
                    "answer": [
                        { type: "text", content: "Social media analytics refers to the systematic and scientific ways to consume the vast amount of content created by Web-based social media outlets for the betterment of an organization's competitiveness. It allows organizations to understand consumers as never before." }
                    ],
                    "topic": "Social Media Analytics Definition"
                },
                {
                    "id": "u5-3b",
                    "question": "3b) List out the three broad categories of analysis tools?",
                    "answer": [
                        {
                            type: "list", items: [
                                "Descriptive analytics (identifying trends and activity)",
                                "Social network analysis (identifying influence and connections)",
                                "Advanced analytics (Predictive and text analytics)"
                            ]
                        }
                    ],
                    "topic": "Analysis Tools Categories"
                },
                {
                    "id": "u5-3c",
                    "question": "3c) Explain briefly Measuring the Social Media Impact?",
                    "answer": [
                        { type: "text", content: "For organizations, small or large, there is valuable insight hidden in all the user-generated content on social media sites. But how do you dig it out of dozens of review sites, thousands of blogs, millions of facebook posts, and billions of tweets? Once you do that, how do you measure the impact of your efforts?" },
                        { type: "text", content: "These questions can be addressed by the analytics extension of the social media technologies. Once you decide on your goal for social media (what it is that you want to accomplish), there is a multitude of tools to help you get there. These analysis tools usually fall into three broad categories:" },

                        { type: "heading", content: "1. Descriptive Analytics" },
                        { type: "text", content: "Uses simple statistics to identify activity characteristics and trends, such as how many followers you have, how many reviews were generated on Facebook, and which channels are being used most often." },

                        { type: "heading", content: "2. Social Network Analysis" },
                        { type: "text", content: "Follows the links between friends, fans, and followers to identify connections of influence as well as the biggest sources of influence." },

                        { type: "heading", content: "3. Advanced Analytics" },
                        { type: "text", content: "Includes predictive analytics and text analytics that examine the content in online conversations to identify themes, sentiments, and connections that would not be revealed by casual surveillance." },

                        { type: "callout", content: "Sophisticated tools and solutions to social media analytics use all three categories of analytics (i.e., descriptive, predictive, and prescriptive) in a somewhat progressive fashion." }
                    ],
                    "topic": "Measuring Social Media Impact"
                },
                {
                    "id": "u5-4a",
                    "question": "4a) Define continuously improve the accuracy of text analysis?",
                    "answer": [
                        { type: "text", content: "This refers to the ongoing process of enhancing the precision and reliability of algorithms used to analyze textual data. It involves refining NLP, machine learning models, and data preprocessing techniques." }
                    ],
                    "topic": "Text Analysis Accuracy"
                },
                {
                    "id": "u5-4b",
                    "question": "4b) List out the eight best Practices in Social Media Analytics?",
                    "answer": [
                        {
                            type: "list", items: [
                                "1. Think of measurement as a guidance system, not a rating system",
                                "2. Track the elusive sentiment",
                                "3. Continuously improve the accuracy of text analysis",
                                "4. Look at the ripple effect",
                                "5. Look beyond the brand",
                                "6. Identify your most powerful influencers",
                                "7. Look closely at the accuracy of your analytic tool",
                                "8. Incorporate social media intelligence into planning"
                            ]
                        }
                    ],
                    "topic": "Social Media Analytics Best Practices"
                },
                {
                    "id": "u5-4c",
                    "question": "4c) Explain the Best Practices in Social Media Analytics?",
                    "answer": [
                        { type: "text", content: "The Eight best Practices in Social Media Analytics are:" },
                        {
                            type: "list", items: [
                                "1. THINK OF MEASUREMENT AS A GUIDANCE SYSTEM, NOT A RATING SYSTEM",
                                "2. TRACK THE ELUSIVE SENTIMENT.",
                                "3. CONTINUOUSLY IMPROVE THE ACCURACY OF TEXT ANALYSIS.",
                                "4. LOOK AT THE RIPPLE EFFECT.",
                                "5. LOOK BEYOND THE BRAND.",
                                "6. IDENTIFY YOUR MOST POWERFUL INFLUENCERS.",
                                "7. LOOK CLOSELY AT THE ACCURACY OF YOUR ANALYTIC TOOL",
                                "8. INCORPORATE SOCIAL MEDIA INTELLIGENCE INTO PLANNING"
                            ]
                        },

                        { type: "heading", content: "1. THINK OF MEASUREMENT AS A GUIDANCE SYSTEM, NOT A RATING SYSTEM" },
                        { type: "text", content: "Measurements are often used for punishment or rewards; they should not be. They should be about figuring out what the most effective tools and practices are, what needs to be discontinued because it doesn't work, and what needs to be done more because it does work very well." },

                        { type: "heading", content: "2. TRACK THE ELUSIVE SENTIMENT" },
                        { type: "text", content: "Customers want to take what they are hearing and learning from online conversations and act on it. The key is to be precise in extracting and tagging their intentions by measuring their sentiments. Text analytic tools can categorize online content, uncover linked concepts, and reveal the sentiment in a conversation as \"positive,\" \"negative,\" or \"neutral,\" based on the words people use." },

                        { type: "heading", content: "3. CONTINUOUSLY IMPROVE THE ACCURACY OF TEXT ANALYSIS" },
                        { type: "text", content: "An industry-specific text analytics package will already know the vocabulary of your business. The system will have linguistic rules built into it, but it learns over time and gets better and better." },

                        { type: "heading", content: "4. LOOK AT THE RIPPLE EFFECT" },
                        { type: "text", content: "It is one thing to get a great hit on a high-profile site, but that's only the start. There's a difference between a great hit that just sits there and goes away versus a great hit that is tweeted, retweeted, and picked up by influential bloggers. Analysis should show you which social media activities go \"viral\" and which quickly go dormant- and why." },

                        { type: "heading", content: "5. LOOK BEYOND THE BRAND" },
                        { type: "text", content: "One of the biggest mistakes people make is to be concerned only about their brand. To successfully analyze and act on social media, you need to understand not just what is being said about your brand, but the broader conversation about the spectrum of issues surrounding your product or service, as well." },

                        { type: "heading", content: "6. IDENTIFY YOUR MOST POWERFUL INFLUENCERS" },
                        { type: "text", content: "Organizations struggle to identify who has the most power in shaping public opinion. It turns out, your most important influencers are not necessarily the ones who advocate specifically for your brand; they are the ones who influence the whole realm of conversation about your topic." },

                        { type: "heading", content: "7. LOOK CLOSELY AT THE ACCURACY OF YOUR ANALYTIC TOOL" },
                        { type: "text", content: "Until recently, computer based automated tools were not as accurate as humans for sifting through online content. Even now, accuracy varies depending on the media. For product review sites, hotel review sites, and Twitter, it can reach anywhere between 80 to 90 percent accuracy, because the context is more boxed in." },

                        { type: "heading", content: "8. INCORPORATE SOCIAL MEDIA INTELLIGENCE INTO PLANNING" },
                        { type: "text", content: "Once you have big-picture perspective and detailed insight, you can begin to incorporate this information into your planning cycle. But that is easier said than done." }
                    ],
                    "topic": "Social Media Analytics Best Practices"
                },
                {
                    "id": "u5-5a",
                    "question": "5a) Define the Social Media Analytics?",
                    "answer": [
                        { type: "text", content: "Social media analytics is the process of collecting and analyzing data from social media to gain insights into performance, audience behavior, and the effectiveness of marketing strategies using various metrics and KPIs." }
                    ],
                    "topic": "Social Media Analytics Definition"
                },
                {
                    "id": "u5-5b",
                    "question": "5b) List out the ten Social Media Analytics tools and vendors?",
                    "answer": [
                        {
                            type: "list", items: [
                                "Attensity360",
                                "Radian6/Salesforce Cloud",
                                "Sysomos",
                                "Collective Intellect",
                                "Webtrends",
                                "Crimson Hexagon",
                                "Converseon",
                                "Spiral 16",
                                "Buzzlogic",
                                "SproutSocial"
                            ]
                        }
                    ],
                    "topic": "Social Media Analytics Tools"
                },
                {
                    "id": "u5-5c",
                    "question": "5c) Explain briefly Goal seeking?",
                    "answer": [
                        { type: "text", content: "Goal Seeking: Goal seeking calculates the values of the inputs necessary to achieve a desired level of an output (goal). It represents a backward solution approach." },

                        { type: "heading", content: "Examples of Goal Seeking:" },
                        {
                            type: "list", items: [
                                "What annual R&D budget is needed for an annual growth rate of 15 percent by 2018?",
                                "How many nurses are needed to reduce the average waiting time of a patient in the emergency room to less than 10 minutes?"
                            ]
                        },

                        { type: "text", content: "Goal-seeking prescriptive analytics is a type of analytical approach that focuses on recommending actions to achieve specific desired outcomes or goals. It helps organizations determine the best course of action to meet a predefined objective." },

                        { type: "heading", content: "Key Components:" },

                        { type: "heading", content: "1. Objective Definition" },
                        { type: "text", content: "Identify a specific business objective or goal that the organization wants to achieve (e.g., maximizing profits, minimizing costs)." },

                        { type: "heading", content: "2. Data Analysis" },
                        { type: "text", content: "Analyze historical and current data to understand patterns, trends, and dependencies using statistical and machine learning techniques." },

                        { type: "heading", content: "3. Modeling and Simulation" },
                        { type: "text", content: "Develop mathematical models or simulations to represent relationships between variables and predict the impact of decisions on the final goal." },

                        { type: "heading", content: "4. Optimization" },
                        { type: "text", content: "Utilize optimization algorithms to find the best combination of variables or actions that will lead to the desired outcome." },

                        { type: "heading", content: "5. Prescriptive Recommendations" },
                        { type: "text", content: "Provide actionable recommendations to decision-makers based on the analysis, guiding them on specific actions to take." },

                        { type: "heading", content: "6. Continuous Monitoring and Adjustments" },
                        { type: "text", content: "Implement a system for continuous monitoring of actions and the evolving business environment to adjust strategies as needed." }
                    ],
                    "topic": "Goal Seeking"
                },
                {
                    "id": "u4-5d",
                    "question": "5d) Explain briefly Web Analytics maturity model?",
                    "answer": [
                        { type: "text", content: "A web analytics maturity model is a framework that organizations use to assess and enhance their capabilities in utilizing web analytics tools and data to improve their online performance." },
                        { type: "text", content: "The model typically consists of various stages or levels, each representing a different level of sophistication and effectiveness in utilizing web analytics. Here's a generalized outline of a web analytics maturity model:" },

                        { type: "heading", content: "Generalized Outline of Levels:" },
                        {
                            type: "list", items: [
                                "Basic Level: Foundational Understanding.",
                                "Intermediate Level: Data Collection and Customization",
                                "Advanced Level: Goal Setting and Conversion Tracking",
                                "Expert Level: Integration and Cross-Channel Analytics",
                                "Mature Level: Predictive Analytics and Optimization",
                                "Innovative Level: Artificial Intelligence and Machine Learning"
                            ]
                        }
                    ],
                    "topic": "Web Analytics Maturity Model"
                },
                {
                    "id": "u5-6a",
                    "question": "6a) Define Multiple Goals?",
                    "answer": [
                        { type: "text", content: "Multiple goals refer to the complex reality where managers must attain simultaneous, often conflicting goals (e.g., profit vs. sustainability) rather than a single simple goal." }
                    ],
                    "topic": "Multiple Goals"
                },
                {
                    "id": "u5-6b",
                    "question": "6b) List out the various difficulties may arise when analyzing multiple goals?",
                    "answer": [
                        { type: "heading", content: "Difficulties:" },
                        {
                            type: "list", items: [
                                "Difficulty obtaining explicit goal statements.",
                                "Changing importance of goals over time.",
                                "Different views at different organizational levels.",
                                "Dynamic environment changing goals.",
                                "Personal agendas of decision makers."
                            ]
                        },
                        { type: "heading", content: "Methods to Handle:" },
                        {
                            type: "list", items: [
                                "Utility theory",
                                "Goal programming",
                                "Constraints (LP)",
                                "Points system"
                            ]
                        }
                    ],
                    "topic": "Multiple Goals Difficulties"
                },
                {
                    "id": "u5-6c",
                    "question": "6c) Explain briefly Sensitivity Analysis?",
                    "answer": [
                        { type: "text", content: "A model builder makes predictions and assumptions regarding input data, many of which deal with the assessment of uncertain futures. When the model is solved, the results depend on these data. Sensitivity analysis attempts to assess the impact of a change in the input data or parameters on the proposed solution (i.e., the result variable)." },

                        { type: "text", content: "Sensitivity analysis is extremely important in MSS because it allows flexibility and adaptation to changing conditions and to the requirements of different decision-making situations, provides a better understanding of the model and the decision-making situation it attempts to describe, and permits the manager to input data in order to increase the confidence in the model." },

                        { type: "heading", content: "Sensitivity Analysis Tests Relationships Such As:" },
                        {
                            type: "list", items: [
                                "The impact of changes in external (uncontrollable) variables and parameters on the outcome variable(s)",
                                "The impact of changes in decision variables on the outcome variable(s)",
                                "The effect of uncertainty in estimating external variables",
                                "The effects of different dependent interactions among variables",
                                "The robustness of decisions under changing conditions."
                            ]
                        },

                        { type: "heading", content: "Sensitivity Analyses Are Used For:" },
                        {
                            type: "list", items: [
                                "Revising models to eliminate too-large sensitivities",
                                "Adding details about sensitive variables or scenarios",
                                "Obtaining better estimates of sensitive external variables",
                                "Altering a real-world system to reduce actual sensitivities",
                                "Accepting and using the sensitive (and hence vulnerable) real world, leading to the continuous and close monitoring of actual results."
                            ]
                        }
                    ],
                    "topic": "Sensitivity Analysis"
                },
                {
                    "id": "u5-6d",
                    "question": "6d) Explain briefly What-If Analysis?",
                    "answer": [
                        { type: "text", content: "What-if analysis is structured as: What will happen to the solution if an input variable, an assumption, or a parameter value is changed? With the appropriate user interface, it is easy for managers to ask a computer model these types of questions and get immediate answers." },

                        { type: "heading", content: "Examples of What-If Questions:" },
                        {
                            type: "list", items: [
                                "What will happen to the total inventory cost if the cost of carrying inventories increases by 10 percent?",
                                "What will be the market share if the advertising budget increases by 5 percent?"
                            ]
                        },

                        { type: "text", content: "Furthermore, they can perform multiple cases and thereby change the percentage, or any other data in the question, as desired. The decision maker does all this directly, without a computer programmer." },

                        { type: "heading", content: "Example Scenario (Spreadsheet Model):" },
                        { type: "text", content: "Figure 9.10 shows a spreadsheet example of a what-if query for a cash flow problem. When the user changes the cells containing the initial sales (from 100 to 120) and the sales growth rate (from 3% to 4% per quarter), the program immediately recomputes the value of the annual net profit cell (from $127 to $182)." },

                        { type: "callout", content: "At first, initial sales were 100, growing at 3 percent per quarter, yielding an annual net profit of $127. Changing the initial sales cell to 120 and the sales growth rate to 4 percent causes the annual net profit to rise to $182." },

                        { type: "text", content: "What-if analysis is also common in expert systems. Users are given the opportunity to change their answers to some of the system's questions, and a revised recommendation is found." }
                    ],
                    "topic": "What-If Analysis"
                },
            ]
        }
    ]
};