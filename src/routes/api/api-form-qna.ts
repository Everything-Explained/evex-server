
type FormSubject = `EvEx Form - ${string}`;

/**
 * Route  : /api/form/qna
 * Method : POST
 * Body   : {
 *            subject  : string;
 *            name     : string;
 *            email    : string;
 *            question : Array<{q: string; a: string}>;
 *          }
 */

/**
 * 1. Validate form request
 *   - Check if the request is authorized
 *     - Must have a "Bearer" header
 *     - "Bearer" header must have a value
 *     - "Bearer" header value must be a valid user ID
 *   - Validate Form Name
 *   - Validate Form Email
 *   - Validate Form questions
 *   - Validate Form subject
 *
 * 2. Use Nodemailer to send the validated form data
 *   - Create an email using the posted form data
 *     - Use custom HTML and a function to dynamically stitch the form
 *       data together into a proper HTML document.
 *   - Send the form
 */








