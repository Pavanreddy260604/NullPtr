/**
 * Resolve image references inside descriptive answer blocks
 * Converts { type: "diagram", ref: "image.png" } → { content: "<cloudinary-url>" }
 */
export const resolveImageRefs = (question, refImages = {}) => {
    if (!question || !Array.isArray(question.answer)) {
        return question;
    }

    const resolvedAnswer = question.answer.map((block) => {
        if (block.type !== "diagram") return block;

        // Case 1: ref → Cloudinary URL mapping
        if (block.ref && refImages[block.ref]) {
            return {
                ...block,
                content: refImages[block.ref],
                ref: undefined,
            };
        }

        // Case 2: already a Cloudinary URL
        if (
            typeof block.content === "string" &&
            block.content.startsWith("https://res.cloudinary.com")
        ) {
            return block;
        }

        // Case 3: unresolved → empty
        return {
            ...block,
            content: "",
        };
    });

    return {
        ...question,
        answer: resolvedAnswer,
    };
};
