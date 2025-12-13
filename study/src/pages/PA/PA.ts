export const examData = {
    "units": [
        {
            "unit": 3,
            "title": "Predictive Modeling and Machine Learning",
            "subtitle": "Classification, Neural Networks, and Model Assessment",
            "mcqs": [],
            "fillBlanks": [],
            "descriptive": [
                {
                    "id": "u3-1a",
                    "question": "a) Define predictive modeling in machine learning.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Predictive modeling is the process of creating a mathematical model that forecasts future outcomes, trends, or behaviors by analyzing patterns found in historical and current data."
                        }
                    ],
                    "topic": "Predictive Modeling Basics"
                },
                {
                    "id": "u3-1b",
                    "question": "b) List any two predictive algorithms used for classification tasks.",
                    "answer": [
                        {
                            "type": "list",
                            "items": [
                                "Logistic Regression",
                                "Decision Trees",
                                "Support Vector Machines (SVM)",
                                "Naive Bayes",
                                "k-Nearest Neighbors (kNN)"
                            ]
                        }
                    ],
                    "topic": "Classification Algorithms"
                },
                {
                    "id": "u3-1c",
                    "question": "c) Problem: Given a small dataset for weather (Sunny, Rainy) and a binary target (Play: Yes/No), manually build a Decision Tree using the Information Gain criterion. Show all calculations and draw the final tree.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Step 1: Calculate Entropy of the Dataset"
                        },
                        {
                            "type": "text",
                            "content": "The dataset has 4 instances: 2 'Yes' and 2 'No'. P(Yes) = 0.5, P(No) = 0.5. Entropy(S) = -[0.5 * log₂(0.5) + 0.5 * log₂(0.5)] = 1"
                        },
                        {
                            "type": "heading",
                            "content": "Step 2: Calculate Information Gain for Weather"
                        },
                        {
                            "type": "text",
                            "content": "For Weather='Sunny': 2 instances (1 Yes, 1 No), Entropy = 1. For Weather='Rainy': 2 instances (1 Yes, 1 No), Entropy = 1. Weighted Average Entropy = (2/4)*1 + (2/4)*1 = 1"
                        },
                        {
                            "type": "text",
                            "content": "Information Gain(Weather) = Entropy(S) - Weighted Avg Entropy = 1 - 1 = 0"
                        },
                        {
                            "type": "heading",
                            "content": "Step 3: Build the Decision Tree"
                        },
                        {
                            "type": "callout",
                            "content": "Since Information Gain is 0, splitting on 'Weather' does not reduce uncertainty. The tree becomes a single root node predicting the majority class. With equal classes (2 Yes, 2 No), no meaningful split can be made."
                        }
                    ],
                    "topic": "Decision Tree Construction"
                },
                {
                    "id": "u3-2a",
                    "question": "a) State one assumption of Logistic Regression.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "The model assumes a linear relationship between the independent variables and the log-odds (logit) of the dependent variable."
                        }
                    ],
                    "topic": "Logistic Regression"
                },
                {
                    "id": "u3-2b",
                    "question": "b) Give an example where kNN could be effectively applied.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Classifying a customer as a high-risk or low-risk loan applicant by finding the 'k' most similar past customers in the database based on features like income, credit score, and employment history."
                        }
                    ],
                    "topic": "kNN Applications"
                },
                {
                    "id": "u3-2c",
                    "question": "c) Problem: For given test data points and training samples with class labels, apply the kNN algorithm (k=3) to classify the test points. Show distance calculations and neighborhood selection clearly.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Training Data: Point A(1,2) Class=0, Point B(2,3) Class=1, Point C(3,1) Class=0. Test Points: X(2,2), Y(3,3). Using Euclidean distance formula: d = √[(x₂-x₁)² + (y₂-y₁)²]"
                        },
                        {
                            "type": "heading",
                            "content": "Classification for Point X(2,2)"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Distance(X,A) = √[(2-1)² + (2-2)²] = 1",
                                "Distance(X,B) = √[(2-2)² + (2-3)²] = 1",
                                "Distance(X,C) = √[(2-3)² + (2-1)²] = √2 ≈ 1.41",
                                "3 Nearest Neighbors: A(Class 0), B(Class 1), C(Class 0)",
                                "Majority Class: 0 → Predicted Class for X: 0"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Classification for Point Y(3,3)"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Distance(Y,A) = √[(3-1)² + (3-2)²] = √5 ≈ 2.24",
                                "Distance(Y,B) = √[(3-2)² + (3-3)²] = 1",
                                "Distance(Y,C) = √[(3-3)² + (3-1)²] = 2",
                                "3 Nearest Neighbors: B(Class 1), C(Class 0), A(Class 0)",
                                "Majority Class: 0 → Predicted Class for Y: 0"
                            ]
                        }
                    ],
                    "topic": "kNN Algorithm"
                },
                {
                    "id": "u3-3a",
                    "question": "a) What is the purpose of an activation function in a neural network?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "To introduce non-linearity into the model, enabling the network to learn complex patterns beyond simple linear relationships."
                        }
                    ],
                    "topic": "Neural Network Basics"
                },
                {
                    "id": "u3-3b",
                    "question": "b) Differentiate between supervised and unsupervised learning.",
                    "answer": [
                        {
                            "type": "list",
                            "items": [
                                "Supervised Learning: Uses labeled input-output pairs to train a model to predict the output for new inputs.",
                                "Unsupervised Learning: Uses unlabeled data to find hidden patterns, structures, or groupings within the data itself."
                            ]
                        }
                    ],
                    "topic": "Learning Types"
                },
                {
                    "id": "u3-3c",
                    "question": "c) Explain the process of training a feed-forward neural network using backpropagation. Include examples of how weights are adjusted and how error propagates backward. Also, discuss how overfitting can be avoided.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Phase 1: Forward Pass"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Input data is fed into the input layer",
                                "Data flows through hidden layers with weighted sums and activation functions",
                                "Final output is generated at the output layer as the network's prediction"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Phase 2: Backward Pass (Backpropagation)"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Error Calculation: Compare prediction with actual target using a loss function (MSE, Cross-Entropy)",
                                "Error Propagation: Calculate gradients using chain rule, propagating error backwards",
                                "Weight Adjustment: new_weight = old_weight - learning_rate × gradient"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Avoiding Overfitting"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Regularization (L1/L2): Add penalty term to discourage large weights",
                                "Dropout: Randomly set neuron activations to zero during training",
                                "Early Stopping: Stop when validation performance degrades",
                                "Cross-Validation: Use k-fold validation to tune hyperparameters",
                                "Data Augmentation: Artificially increase training data diversity"
                            ]
                        }
                    ],
                    "topic": "Backpropagation"
                },
                {
                    "id": "u3-4a",
                    "question": "a) Define Batch Approach to model assessment.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "The Batch Approach involves scoring all records in a dataset at once and then summarizing the model's performance using aggregate metrics like accuracy, precision, or AUC."
                        }
                    ],
                    "topic": "Model Assessment"
                },
                {
                    "id": "u3-4b",
                    "question": "b) What is Rank-Ordered Approach in model evaluation?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "The Rank-Ordered Approach evaluates a model based on its ability to correctly rank cases, typically by sorting them by their predicted probability score and assessing performance at different score thresholds."
                        }
                    ],
                    "topic": "Model Evaluation"
                },
                {
                    "id": "u3-4c",
                    "question": "c) Describe three common model validation techniques used in batch assessment.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Holdout Method"
                        },
                        {
                            "type": "text",
                            "content": "Dataset is split into training set and testing set (e.g., 70%-30%). Model is built on training set and evaluated on unseen testing set. Simple but can have high variance depending on the split."
                        },
                        {
                            "type": "heading",
                            "content": "K-Fold Cross-Validation"
                        },
                        {
                            "type": "text",
                            "content": "Dataset is divided into 'k' equal folds. Model is trained k times, each time using one fold for validation and k-1 folds for training. Performance scores are averaged for robust estimation."
                        },
                        {
                            "type": "heading",
                            "content": "Bootstrap Validation"
                        },
                        {
                            "type": "text",
                            "content": "Sampling with replacement creates multiple bootstrap samples. Model is trained on each sample and tested on out-of-bag (OOB) instances not included in that sample. Performance is averaged across iterations."
                        }
                    ],
                    "topic": "Validation Techniques"
                },
                {
                    "id": "u3-4d",
                    "question": "d) Given confusion matrix, calculate Percent Correct Classification and assess model accuracy.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Given: TP=40, TN=45, FP=5, FN=10"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Total Correct = TP + TN = 40 + 45 = 85",
                                "Total Predictions = TP + TN + FP + FN = 100",
                                "Accuracy = (85/100) × 100 = 85%"
                            ]
                        },
                        {
                            "type": "callout",
                            "content": "An accuracy of 85% indicates the model correctly classified 85 out of 100 instances. Full assessment should also consider Precision and Recall, especially for imbalanced classes."
                        }
                    ],
                    "topic": "Confusion Matrix Analysis"
                },
                {
                    "id": "u3-5a",
                    "question": "a) Define Mean Squared Error (MSE).",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Mean Squared Error is a metric that measures the average of the squares of the errors—that is, the average squared difference between the estimated values and the actual value."
                        }
                    ],
                    "topic": "Regression Metrics"
                },
                {
                    "id": "u3-5b",
                    "question": "b) What does the R-squared value indicate in regression analysis?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "R-squared (R²) indicates the proportion of the variance in the dependent variable that is predictable from the independent variable(s). It measures how well the model fits the data."
                        }
                    ],
                    "topic": "R-Squared"
                },
                {
                    "id": "u3-5c",
                    "question": "c) How is residual analysis conducted to assess regression model fit? Provide examples.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Residual analysis involves examining the differences (residuals) between observed and predicted values to check if the model's assumptions hold true."
                        },
                        {
                            "type": "heading",
                            "content": "Steps and Plot Types"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Calculate Residuals: residual = observed_value - predicted_value",
                                "Residuals vs Fitted Values Plot: Checks linearity and homoscedasticity (constant variance)",
                                "Normal Q-Q Plot: Checks if residuals are normally distributed",
                                "Scale-Location Plot: Another check for homoscedasticity"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Interpretation"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Good Fit: Points randomly scattered around residual=0, no discernible pattern",
                                "Bad Fit (Non-linearity): Clear curved pattern (U-shape) indicates missing non-linear relationship",
                                "Bad Fit (Heteroscedasticity): Funnel shape where spread changes with fitted values"
                            ]
                        }
                    ],
                    "topic": "Residual Analysis"
                },
                {
                    "id": "u3-5d",
                    "question": "d) Given observed values and predicted values, calculate RMSE and interpret its significance on model quality.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Observed (y): [3.0, 5.0, 7.5, 8.5], Predicted (ŷ): [2.8, 5.2, 7.1, 8.9]"
                        },
                        {
                            "type": "heading",
                            "content": "RMSE Calculation"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Errors: 0.2, -0.2, 0.4, -0.4",
                                "Squared Errors: 0.04, 0.04, 0.16, 0.16",
                                "MSE = (0.04 + 0.04 + 0.16 + 0.16) / 4 = 0.10",
                                "RMSE = √0.10 ≈ 0.316"
                            ]
                        },
                        {
                            "type": "callout",
                            "content": "RMSE of 0.316 means predictions are off by about 0.316 units on average. For values ranging 3-9, this is relatively small, indicating good model fit."
                        }
                    ],
                    "topic": "RMSE Calculation"
                },
                {
                    "id": "u3-6a",
                    "question": "a) State two limitations of the Bayesian approach in predictive modeling.",
                    "answer": [
                        {
                            "type": "list",
                            "items": [
                                "It can be computationally intensive, especially for large datasets or complex models.",
                                "The choice of the prior distribution can be subjective and can significantly influence the results."
                            ]
                        }
                    ],
                    "topic": "Bayesian Limitations"
                },
                {
                    "id": "u3-6b",
                    "question": "b) Define posterior probability in Bayesian inference.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Posterior probability is the probability of a hypothesis occurring after taking into account new evidence. It's the updated probability of an event after observing the data."
                        }
                    ],
                    "topic": "Bayesian Inference"
                },
                {
                    "id": "u3-6c",
                    "question": "c) Outline the steps to build a Naïve Bayes classifier for document classification.",
                    "answer": [
                        {
                            "type": "list",
                            "items": [
                                "Data Preparation: Collect labeled dataset of documents (e.g., emails labeled as 'spam' or 'not spam')",
                                "Text Preprocessing: Tokenization, lowercase conversion, remove stop words",
                                "Feature Extraction: Create vocabulary, represent documents as feature vectors (word counts or TF-IDF)",
                                "Calculate Prior Probabilities: P(Class) for each class (e.g., P(spam) = #spam_emails / total_emails)",
                                "Calculate Conditional Probabilities: P(Word|Class) with Laplace smoothing for unseen words",
                                "Classification: For new document, calculate P(Class|Document) ∝ P(Class) × Π P(Word|Class), predict class with highest posterior"
                            ]
                        }
                    ],
                    "topic": "Naïve Bayes Classifier"
                },
                {
                    "id": "u3-6d",
                    "question": "d) Compare the interpretability and performance of Bayesian classifiers with regression models in predictive tasks, with examples.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Bayesian Classifiers (e.g., Naïve Bayes)"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Interpretability: High - based on transparent probabilities like P(word='free'|spam)=0.9",
                                "Performance: Good but can be limited by 'naïve' independence assumption",
                                "Example: Spam Filter - quickly classifies emails based on word probabilities"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Regression Models (e.g., Logistic Regression)"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Interpretability: High - coefficients show feature influence directly",
                                "Performance: Generally strong, can model feature interactions without independence assumption",
                                "Example: Credit Scoring - coefficients show how income, age, debt affect risk score"
                            ]
                        }
                    ],
                    "topic": "Model Comparison"
                }
            ]
        },
        {
            "unit": 4,
            "title": "Ensemble Methods and Advanced Learning",
            "subtitle": "Bagging, Boosting, Random Forests, and Model Interpretability",
            "mcqs": [],
            "fillBlanks": [],
            "descriptive": [
                {
                    "id": "u4-1a",
                    "question": "a) What are some challenges or limitations related to applying the 'Wisdom of the Crowd' concept?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "A key challenge is 'groupthink,' where individuals conform to the majority opinion, reducing the diversity of thought that makes the concept effective."
                        }
                    ],
                    "topic": "Wisdom of the Crowd"
                },
                {
                    "id": "u4-1b",
                    "question": "b) How does the learning rate affect the training of a neural network?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "The learning rate controls the step size during weight updates. A high rate can cause the model to overshoot the optimal solution, while a low rate can make training very slow."
                        }
                    ],
                    "topic": "Learning Rate"
                },
                {
                    "id": "u4-1c",
                    "question": "c) Explain the working principle of random forests as an extension of bagging. How do random features and multiple trees contribute to the robustness of random forests?",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Working Principle as Extension of Bagging"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Bagging Foundation: Creates multiple subsets via bootstrap sampling with replacement",
                                "Extension - Feature Randomness: At each split, only a random subset of features is considered instead of all features"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Contribution of Multiple Trees"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Variance Reduction: Averaging predictions smooths out fluctuations and prevents overfitting",
                                "Error Averaging: Errors from some trees are compensated by correct predictions from others"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Contribution of Random Features"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Decorrelation of Trees: Forces trees to consider different predictors, making them diverse and less correlated",
                                "Improved Generalization: Diverse, decorrelated trees capture broader patterns, better generalizing to new data"
                            ]
                        }
                    ],
                    "topic": "Random Forests"
                },
                {
                    "id": "u4-2a",
                    "question": "a) How do heterogeneous ensembles differ from homogeneous ensembles?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Homogeneous ensembles combine multiple models of the same type (e.g., many decision trees), while heterogeneous ensembles combine models of different types (e.g., a decision tree, a neural network, and a support vector machine)."
                        }
                    ],
                    "topic": "Ensemble Types"
                },
                {
                    "id": "u4-2b",
                    "question": "b) How are random forests different from simple bagging ensembles?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Random Forests add an extra layer of randomness by selecting a random subset of features for each split in a decision tree, whereas simple bagging ensembles consider all features when building each tree."
                        }
                    ],
                    "topic": "Random Forest vs Bagging"
                },
                {
                    "id": "u4-2c",
                    "question": "c) Discuss how stochastic gradient boosting differs from traditional boosting. Why is introducing randomness beneficial in gradient boosting?",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Difference from Traditional Gradient Boosting"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Traditional: Each weak learner trains on the entire training dataset",
                                "Stochastic: Each weak learner trains on a random subsample drawn without replacement"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Benefits of Introducing Randomness"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Reduction of Overfitting: Training on data fractions reduces sensitivity to noise, acts as regularization",
                                "Improved Computational Efficiency: Smaller datasets per iteration = faster training, more scalable",
                                "Increased Model Diversity: Different subsets encourage diverse weak learners capturing different patterns"
                            ]
                        }
                    ],
                    "topic": "Stochastic Gradient Boosting"
                },
                {
                    "id": "u4-3a",
                    "question": "a) How is the 'Wisdom of the Crowd' principle applied in ensemble learning methods?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "It's applied by combining the predictions from multiple diverse models (the 'crowd') to produce a single, more accurate and robust prediction than any individual model could achieve on its own."
                        }
                    ],
                    "topic": "Ensemble Learning Principle"
                },
                {
                    "id": "u4-3b",
                    "question": "b) Name two strategies to prevent overfitting in a predictive model.",
                    "answer": [
                        {
                            "type": "list",
                            "items": [
                                "Regularization: Adding a penalty term to the loss function to discourage model complexity (e.g., L1/L2 regularization)",
                                "Cross-Validation: Using techniques like k-fold cross-validation to ensure the model generalizes well to unseen data"
                            ]
                        }
                    ],
                    "topic": "Overfitting Prevention"
                },
                {
                    "id": "u4-3c",
                    "question": "c) Explore practical scenarios and industries where ensemble methods have demonstrated significant improvements in predictive modeling accuracy and robustness.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Finance - Credit Scoring and Fraud Detection"
                        },
                        {
                            "type": "text",
                            "content": "Banks use heterogeneous ensembles combining logistic regression, gradient boosting, and neural networks for more accurate risk assessment and fraud detection."
                        },
                        {
                            "type": "heading",
                            "content": "Healthcare - Disease Diagnosis"
                        },
                        {
                            "type": "text",
                            "content": "Random Forests and Gradient Boosting analyze patient features to identify disease patterns. Ensembles of deep learning models achieve expert-level accuracy in medical imaging."
                        },
                        {
                            "type": "heading",
                            "content": "E-commerce - Recommendation Systems"
                        },
                        {
                            "type": "text",
                            "content": "Platforms like Amazon and Netflix blend collaborative filtering, content-based, and knowledge-based models for highly personalized recommendations."
                        },
                        {
                            "type": "heading",
                            "content": "Manufacturing - Predictive Maintenance"
                        },
                        {
                            "type": "text",
                            "content": "Stacking ensembles analyze sensor data to predict machinery failures, preventing costly downtime by combining models that detect sudden changes and long-term degradation."
                        },
                        {
                            "type": "heading",
                            "content": "Data Science Competitions"
                        },
                        {
                            "type": "text",
                            "content": "Kaggle winning solutions typically involve sophisticated ensembles blending XGBoost, LightGBM, and Neural Networks for maximum predictive accuracy."
                        }
                    ],
                    "topic": "Ensemble Applications"
                },
                {
                    "id": "u4-4a",
                    "question": "a) Why can heterogeneous ensembles outperform single models or homogeneous ensembles?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Because they combine models with different inductive biases and strengths, allowing them to capture a wider variety of patterns in the data and compensate for each other's weaknesses."
                        }
                    ],
                    "topic": "Heterogeneous Ensembles"
                },
                {
                    "id": "u4-4b",
                    "question": "b) What is stacking in ensemble learning?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Stacking is an ensemble technique where a new model (the 'meta-model' or 'blender') is trained to learn how to best combine the predictions of several base models."
                        }
                    ],
                    "topic": "Stacking"
                },
                {
                    "id": "u4-4c",
                    "question": "c) Explain the bias-variance tradeoff in machine learning. How does it affect the accuracy and generalization capability of predictive models? Provide examples to illustrate underfitting and overfitting.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "The bias-variance tradeoff describes the tension between a model's ability to capture true patterns (bias) and its sensitivity to training data variations (variance)."
                        },
                        {
                            "type": "heading",
                            "content": "Definitions"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Bias: Error from erroneous assumptions. High bias = too simple model, fails to capture patterns (underfitting)",
                                "Variance: Error from sensitivity to training data fluctuations. High variance = captures noise (overfitting)"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Effect on Generalization"
                        },
                        {
                            "type": "list",
                            "items": [
                                "High Bias: Poor accuracy on both training and new data",
                                "High Variance: Excellent training accuracy but poor test accuracy"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Examples"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Underfitting (High Bias): Fitting a straight line to U-shaped data - too simple to capture the pattern",
                                "Overfitting (High Variance): High-degree polynomial passing through every noisy point - perfect training fit but poor predictions"
                            ]
                        }
                    ],
                    "topic": "Bias-Variance Tradeoff"
                },
                {
                    "id": "u4-4d",
                    "question": "d) Describe the boosting technique in ensemble learning. How does it sequentially focus on misclassified instances to improve overall accuracy?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Boosting converts 'weak learners' (slightly better than random) into a 'strong learner' by focusing sequentially on errors."
                        },
                        {
                            "type": "heading",
                            "content": "Sequential Process"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Initial Model: Train a simple weak learner (e.g., decision stump) on entire dataset",
                                "Identify Errors: Evaluate which instances were misclassified or had largest errors",
                                "Adjust Weights: Give more importance to misclassified instances in next iteration",
                                "Combine Models: Repeat for specified iterations, focusing each new model on previous mistakes",
                                "Weighted Voting: Better-performing models get more weight in final prediction"
                            ]
                        },
                        {
                            "type": "callout",
                            "content": "Each new model acts as a 'corrector' for previous mistakes, leading to continuous accuracy improvement."
                        }
                    ],
                    "topic": "Boosting"
                },
                {
                    "id": "u4-5a",
                    "question": "a) Describe the difference between overfitting and underfitting.",
                    "answer": [
                        {
                            "type": "list",
                            "items": [
                                "Overfitting: Model is too complex, learns noise in training data, high training accuracy but poor performance on new data",
                                "Underfitting: Model is too simple, fails to capture underlying patterns, poor performance on both training and new data"
                            ]
                        }
                    ],
                    "topic": "Overfitting vs Underfitting"
                },
                {
                    "id": "u4-5b",
                    "question": "b) When would you prefer a heterogeneous ensemble over a homogeneous one?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "When you suspect that different types of algorithms can capture different, complementary patterns in the data, and you want to maximize the diversity and robustness of the ensemble."
                        }
                    ],
                    "topic": "Ensemble Selection"
                },
                {
                    "id": "u4-5c",
                    "question": "c) Compare and contrast Bagging and Boosting as ensemble learning techniques in machine learning.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Bagging (Bootstrap Aggregating)"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Main Aim: Reduce variance and prevent overfitting",
                                "Training Process: Parallel - models trained independently on bootstrap samples",
                                "Error Reduction: Averages out errors by combining diverse models",
                                "Base Learners: Strong/unstable learners like full decision trees"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Boosting"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Main Aim: Reduce bias (and also variance)",
                                "Training Process: Sequential - each model focuses on previous errors",
                                "Error Reduction: Systematically reduces errors by weighting misclassified instances",
                                "Base Learners: Weak learners like decision stumps"
                            ]
                        }
                    ],
                    "topic": "Bagging vs Boosting"
                },
                {
                    "id": "u4-5d",
                    "question": "d) Discuss the interpretability challenges of ensemble models and strategies to address them.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Interpretability Challenges"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Complexity: Ensemble is a 'black box' of many models, hard to understand overall logic",
                                "Feature Importance: No single definitive score, different models weigh features differently",
                                "Decision Boundaries: Complex combination of many boundaries, impossible to visualize simply"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Strategies to Address"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Feature Importance Aggregation: Aggregate Gini or permutation importance across all trees",
                                "Model-Agnostic Explanations: Use LIME or SHAP to explain individual predictions locally",
                                "Surrogate Models: Train simple interpretable model to mimic ensemble behavior"
                            ]
                        }
                    ],
                    "topic": "Ensemble Interpretability"
                },
                {
                    "id": "u4-6a",
                    "question": "a) How can you detect if a model is overfitting?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "A key indicator is a large performance gap between the training set and the validation/test set—high accuracy on training data but significantly lower accuracy on new data."
                        }
                    ],
                    "topic": "Overfitting Detection"
                },
                {
                    "id": "u4-6b",
                    "question": "b) How does stacking differ from bagging and boosting?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Unlike bagging (parallel, simple averaging) and boosting (sequential, weighted voting), stacking uses a new meta-model to learn how to optimally combine the predictions of the base models."
                        }
                    ],
                    "topic": "Stacking vs Others"
                },
                {
                    "id": "u4-6c",
                    "question": "c) Describe how ensemble methods help reduce overfitting, variance, and bias in predictive modeling.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Reducing Overfitting (via Variance Reduction)"
                        },
                        {
                            "type": "text",
                            "content": "Bagging and Random Forests create diverse models on different data/feature subsets. Averaging their predictions smooths out fluctuations and reduces sensitivity to training noise."
                        },
                        {
                            "type": "heading",
                            "content": "Reducing Bias"
                        },
                        {
                            "type": "text",
                            "content": "Boosting builds models sequentially, each correcting previous errors. Iteratively adding models that address shortcomings captures complex patterns and reduces systematic error."
                        },
                        {
                            "type": "heading",
                            "content": "Combined Effect"
                        },
                        {
                            "type": "text",
                            "content": "Ensembles achieve better bias-variance tradeoff than single models—leveraging low bias of complex models while mitigating variance, leading to accurate and generalizable models."
                        }
                    ],
                    "topic": "Ensemble Error Reduction"
                },
                {
                    "id": "u4-6d",
                    "question": "d) Define bagging (bootstrap aggregating) in the context of ensemble learning. How does bagging improve model performance?",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Definition"
                        },
                        {
                            "type": "text",
                            "content": "Bagging (Bootstrap Aggregating) generates multiple predictors, each trained on different bootstrap samples of the original data, then aggregates their predictions."
                        },
                        {
                            "type": "heading",
                            "content": "How It Improves Performance"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Creating Diverse Models: Bootstrap sampling (with replacement) creates slightly different subsets, producing diverse models with different learned patterns",
                                "Averaging Predictions: Final prediction averages all models (regression) or takes majority vote (classification), reducing variance and preventing overfitting"
                            ]
                        },
                        {
                            "type": "callout",
                            "content": "A single decision tree is prone to overfitting. A Random Forest of 100 trees on different data/feature subsets is much more stable."
                        }
                    ],
                    "topic": "Bagging Definition"
                }
            ]
        },
        {
            "unit": 5,
            "title": "Text Mining and Persuasion Analytics",
            "subtitle": "Survey Analysis, Question Answering, and Data-Driven Persuasion",
            "mcqs": [],
            "fillBlanks": [],
            "descriptive": [
                {
                    "id": "u5-1a",
                    "question": "a) Define Survey Analysis in the context of text mining.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Survey Analysis in text mining is the application of NLP techniques to extract meaningful insights, themes, and sentiments from open-ended text responses collected in surveys."
                        }
                    ],
                    "topic": "Survey Analysis"
                },
                {
                    "id": "u5-1b",
                    "question": "b) Mention any two tools used for text-based survey analysis.",
                    "answer": [
                        {
                            "type": "list",
                            "items": [
                                "NVivo: A qualitative data analysis software.",
                                "Python (libraries like NLTK, spaCy, Scikit-learn) for custom pipelines."
                            ]
                        }
                    ],
                    "topic": "Text Analysis Tools"
                },
                {
                    "id": "u5-1c",
                    "question": "c) Problem: Describe how you would use text preprocessing and sentiment analysis to classify customer satisfaction survey responses. Present the workflow.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Phase 1: Preprocessing"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Cleaning: Lowercase conversion, remove punctuation/HTML.",
                                "Tokenization: Split text into words.",
                                "Stop-word Removal: Remove common words like 'the', 'is'.",
                                "Stemming/Lemmatization: Reduce words to root form."
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Phase 2: Sentiment Analysis & Classification"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Method: Use Lexicon-based scoring (dictionary of positive/negative words) or train an ML model (Naive Bayes, SVM).",
                                "Classification: Assign label (Positive, Neutral, Negative) based on score/probability."
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Phase 3: Analysis"
                        },
                        {
                            "type": "text",
                            "content": "Calculate distribution (e.g., 60% Positive) and visualize frequent terms (Word Cloud) to identify key drivers of satisfaction or complaints."
                        }
                    ],
                    "topic": "Sentiment Analysis Workflow"
                },
                {
                    "id": "u5-2a",
                    "question": "a) What is Question Answering (QA) in text analytics?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "QA is a field of NLP focused on building systems that can automatically answer questions posed by humans in natural language."
                        }
                    ],
                    "topic": "Question Answering"
                },
                {
                    "id": "u5-2b",
                    "question": "b) Mention one real-world example where QA systems are used.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Virtual assistants like Google Assistant or Siri, which answer user questions like 'What's the weather today?'."
                        }
                    ],
                    "topic": "QA Examples"
                },
                {
                    "id": "u5-2c",
                    "question": "c) Problem: Design a simple QA model pipeline for a university admission chatbot.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "1. Data Collection"
                        },
                        {
                            "type": "text",
                            "content": "Build knowledge base from FAQs, handbooks, and historical Q&A pairs."
                        },
                        {
                            "type": "heading",
                            "content": "2. Preprocessing & NER"
                        },
                        {
                            "type": "text",
                            "content": "Clean text. Use Named Entity Recognition (NER) to extract entities like 'Program Name' (MBA) or 'Deadline' (May 1st)."
                        },
                        {
                            "type": "heading",
                            "content": "3. Retrieval & Extraction"
                        },
                        {
                            "type": "text",
                            "content": "Recognize intent. Search knowledge base using extracted entities. Extract specific answer span (e.g., date, fee amount)."
                        },
                        {
                            "type": "heading",
                            "content": "4. Evaluation"
                        },
                        {
                            "type": "text",
                            "content": "Use F1 Score (harmonic mean of Precision and Recall) to validate performance against a test set of ground truth answers."
                        }
                    ],
                    "topic": "QA Pipeline Design"
                },
                {
                    "id": "u5-3a",
                    "question": "a) Define the term Persuasion by the Numbers.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "The use of quantitative data, statistics, and numerical evidence to build a compelling argument and influence opinions or decisions."
                        }
                    ],
                    "topic": "Persuasion Definition"
                },
                {
                    "id": "u5-3b",
                    "question": "b) Mention one measurable indicator used in persuasive communication.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Conversion Rate: The percentage of audience members who take the desired action after being exposed to the message."
                        }
                    ],
                    "topic": "Persuasion Metrics"
                },
                {
                    "id": "u5-3c",
                    "question": "c) Analytical/Case Discussion: Explain how data analytics supports persuasive decision-making and discuss the ethical side.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Supporting Decision-Making"
                        },
                        {
                            "type": "text",
                            "content": "Analytics provides objective evidence (e.g., 'Vaccination reduces hospitalization by 85%'). Quantifiable statements are more credible than anecdotes, creating a logical rationale that drives action."
                        },
                        {
                            "type": "heading",
                            "content": "Ethical Concerns"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Data Visualization: Truncated axes or misleading scales can exaggerate small differences.",
                                "Cherry-Picking: Showing data only from favorable time periods.",
                                "Selective Sampling: Using non-representative samples (e.g., survivorship bias) to support a false narrative."
                            ]
                        }
                    ],
                    "topic": "Data Ethics & Persuasion"
                },
                {
                    "id": "u5-4a",
                    "question": "a) Define response bias in survey data.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Response bias is a systematic tendency of survey respondents to answer questions untruthfully or inaccurately, often due to social desirability or question phrasing."
                        }
                    ],
                    "topic": "Response Bias"
                },
                {
                    "id": "u5-4b",
                    "question": "b) What is the role of data cleaning in survey analytics?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "It ensures quality and reliability by identifying and correcting errors, inconsistencies, and missing values before analysis."
                        }
                    ],
                    "topic": "Data Cleaning"
                },
                {
                    "id": "u5-4c",
                    "question": "c) Discuss the typical text mining pipeline used to analyze qualitative survey data.",
                    "answer": [
                        {
                            "type": "list",
                            "items": [
                                "Preprocessing: Tokenization, stop-word removal, stemming/lemmatization.",
                                "Feature Extraction: Converting text to numbers using Bag-of-Words (BoW) or TF-IDF.",
                                "Clustering: Using K-Means or Topic Modeling (LDA) to automatically group similar responses into themes."
                            ]
                        }
                    ],
                    "topic": "Text Mining Pipeline"
                },
                {
                    "id": "u5-4d",
                    "question": "d) Problem: Explain step-by-step how frequency analysis and topic modeling (LDA) can uncover key themes in survey comments.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Frequency Analysis"
                        },
                        {
                            "type": "text",
                            "content": "Count word occurrences across all comments. Visualize with a Word Cloud to see the most common terms (e.g., 'staff', 'wait')."
                        },
                        {
                            "type": "heading",
                            "content": "Topic Modeling (LDA)"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Create a document-term matrix (TF-IDF).",
                                "Train LDA model to find 'k' abstract topics based on word co-occurrence.",
                                "Interpret topics by examining top words (e.g., Topic 1: 'slow', 'wait', 'time' -> 'Speed Issues')."
                            ]
                        },
                        {
                            "type": "callout",
                            "content": "Frequency shows *what* is talked about; LDA reveals the *context* or underlying themes."
                        }
                    ],
                    "topic": "LDA & Frequency Analysis"
                },
                {
                    "id": "u5-5a",
                    "question": "a) What are the major challenges in developing robust text mining models?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Ambiguity in natural language, handling slang/informal language, and the need for large, high-quality labeled datasets."
                        }
                    ],
                    "topic": "Text Mining Challenges"
                },
                {
                    "id": "u5-5b",
                    "question": "b) Define semantic ambiguity with an example in text mining.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "Semantic ambiguity occurs when a word has multiple meanings depending on context. Example: 'Bank' can refer to a financial institution or a river side."
                        }
                    ],
                    "topic": "Semantic Ambiguity"
                },
                {
                    "id": "u5-5c",
                    "question": "c) Explain the challenges of context sensitivity and natural language diversity in question answering systems.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Context Sensitivity"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Pronoun Resolution: Understanding what 'it' or 'he' refers to.",
                                "Temporal Reasoning: Handling time-relative terms like 'last year'.",
                                "Implicit Info: Understanding unstated assumptions."
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Natural Language Diversity"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Lexical Variation: Same question phrased differently (e.g., 'Capital of France?' vs 'What city is France's capital?').",
                                "Slang/Abbreviations: confuse models trained on formal text."
                            ]
                        }
                    ],
                    "topic": "QA Challenges"
                },
                {
                    "id": "u5-5d",
                    "question": "d) Problem: Design a strategy using text similarity to identify that 'What is AI?', 'Explain AI', and 'Define Artificial Intelligence' are semantically equivalent.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Strategy using Embeddings"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Embedding Model: Use a pre-trained model like Sentence-BERT (SBERT) to convert each question into a vector.",
                                "Similarity Metric: Calculate Cosine Similarity between the vectors.",
                                "Thresholding: If similarity > threshold (e.g., 0.85), classify them as equivalent."
                            ]
                        },
                        {
                            "type": "text",
                            "content": "Since these models capture semantic meaning, the vectors for all three questions would be very close in vector space, resulting in high cosine similarity scores."
                        }
                    ],
                    "topic": "Semantic Similarity"
                },
                {
                    "id": "u5-6a",
                    "question": "a) Define data-driven persuasion.",
                    "answer": [
                        {
                            "type": "text",
                            "content": "The practice of using data analysis, statistical evidence, and quantitative insights to influence attitudes, beliefs, or behaviors."
                        }
                    ],
                    "topic": "Data-Driven Persuasion"
                },
                {
                    "id": "u5-6b",
                    "question": "b) What is the role of visual analytics in persuasive reporting?",
                    "answer": [
                        {
                            "type": "text",
                            "content": "To transform complex data into intuitive, compelling visual narratives (charts, dashboards) that make arguments accessible, memorable, and persuasive."
                        }
                    ],
                    "topic": "Visual Analytics"
                },
                {
                    "id": "u5-6c",
                    "question": "c) Discuss how A/B testing and statistical summaries can be used to evaluate the effect of persuasive messages.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "A/B Testing Process"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Create Variants: Version A (control) vs Version B (challenger).",
                                "Random Assignment: Show to statistically similar groups.",
                                "Metric: Measure conversion rate (e.g., clicks, signups)."
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Evaluation"
                        },
                        {
                            "type": "text",
                            "content": "Calculate statistical summaries (e.g., Version A: 5%, Version B: 6.5%). Use statistical significance tests (p-value) to determine if the difference is real or due to chance. This validates which message is genuinely more persuasive."
                        }
                    ],
                    "topic": "A/B Testing"
                },
                {
                    "id": "u5-6d",
                    "question": "d) Problem: Two message formats (A and B) produce conversion rates of 15% and 18% with n=1000 each. Formulate a hypothesis test to check significance.",
                    "answer": [
                        {
                            "type": "heading",
                            "content": "Hypothesis Formulation"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Null Hypothesis (H₀): p₁ = p₂ (No difference in conversion rates)",
                                "Alternative Hypothesis (H₁): p₁ ≠ p₂ (There is a difference)"
                            ]
                        },
                        {
                            "type": "heading",
                            "content": "Calculation (Z-Test)"
                        },
                        {
                            "type": "list",
                            "items": [
                                "Pooled Proportion (p̂) = 0.165",
                                "Standard Error (SE) ≈ 0.0166",
                                "Z-Score = (0.15 - 0.18) / 0.0166 ≈ -1.81"
                            ]
                        },
                        {
                            "type": "callout",
                            "content": "At 95% confidence, critical Z is ±1.96. Since -1.81 is within range (-1.96 to 1.96), we fail to reject the null hypothesis. The difference is NOT statistically significant."
                        }
                    ],
                    "topic": "Hypothesis Testing"
                }
            ]
        }
    ]
}