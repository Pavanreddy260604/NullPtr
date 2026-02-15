
/**
 * Parse request body for serverless functions
 * Handles various body types: JSON, string, buffer
 */
export function parseBody(reqBody) {
    // If body is already an object, return it as-is
    if (typeof reqBody === 'object' && reqBody !== null && !Buffer.isBuffer(reqBody)) {
        return reqBody;
    }

    // If body is a Buffer, convert to string first
    let bodyStr = '';
    if (Buffer.isBuffer(reqBody)) {
        bodyStr = reqBody.toString('utf8');
    } else if (typeof reqBody === 'string') {
        bodyStr = reqBody;
    }

    // If we have a string to parse
    if (bodyStr) {
        try {
            // Try to parse as JSON
            return JSON.parse(bodyStr);
        } catch (parseError) {
            console.error("Failed to parse request body:", parseError);
            console.error("Raw body:", bodyStr);
            return {};
        }
    }

    // Default to empty object if no body
    return {};
}
