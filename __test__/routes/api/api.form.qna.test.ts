

import { describe } from 'riteway';
import { build, constAuthedHeader, r3dAuthHeader } from '../../test.fastify';
import { QnAFormReqBody, _tdd_testAPIFormQna } from '../../../src/routes/api/api-form-qna';
import { serverConfig } from '../../../src/config';
import { BadRequestSchema } from '../../../src/schemas/std-schemas';




const url = '/api/form/qna';
const tdd = _tdd_testAPIFormQna;
const validForm = {
  name: 'some name',
  email: 'some@email.net',
  type: 1,
  questions: [
    {
      text: 'some text that is long',
      answer: 'some text that is at least as long as is required for it to work properly'
    },
    {
      text: 'some text that is long',
      answer: 'some text that is at least as long as is required for it to work properly'
    },
    {
      text: 'some text that is long',
      answer: 'some text that is at least as long as is required for it to work properly'
    },
  ]
};


/**
 * Clones form data so that mutations do not persist.
 */
const getForm = (data?: {[key: string]: any}) => {
  const questions = validForm.questions.slice().map(v => ({ text: v.text, answer: v.answer}));
  if (data) return { ...validForm, questions, ...data};
  return { ...validForm, questions, };
};


describe('POST /api/form/qna', async t => {
  const app = await build();
  tdd.setDevTransport();

  const testTooShortName = await testForm({ name: 'a' });
  t({
    given: 'too short of a name',
    should: 'send 400 status',
    actual: testTooShortName.payload.statusCode,
    expected: 400
  });
  t({
    given: 'too short of a name',
    should: 'send custom message',
    actual: testTooShortName.payload.message,
    expected: 'Name is Invalid'
  });


  const testTooLongName = await testForm({ name: 'abcdefghijabcdefghijabcdefghijk' });
  t({
    given: 'too long of a name',
    should: 'send 400 status',
    actual: testTooLongName.payload.statusCode,
    expected: 400
  });
  t({
    given: 'too long of a name',
    should: 'send custom message',
    actual: testTooLongName.payload.message,
    expected: 'Name is Invalid'
  });


  const testNewLineName = await testForm({ name: 'ab\ncd'});
  t({
    given: 'new line in name',
    should: 'send 400 status',
    actual: testNewLineName.payload.statusCode,
    expected: 400
  });
  t({
    given: 'new line in name',
    should: 'send custom message',
    actual: testNewLineName.payload.message,
    expected: 'Name is Invalid'
  });


  const testSpecialCharacterName = await testForm({ name: 'f**k'});
  t({
    given: 'special characters in name',
    should: 'send 400 status',
    actual: testSpecialCharacterName.payload.statusCode,
    expected: 400
  });
  t({
    given: 'special characters in name',
    should: 'send custom message',
    actual: testSpecialCharacterName.payload.message,
    expected: 'Name is Invalid'
  });


  t({
    given: 'a valid name',
    should: 'send 200 status',
    actual: (await testForm({ name: 'Dr. Valid'}, 'string')).statusCode,
    expected: 200
  });


  const testTooShortEmailExt = await testForm({ email: 'asdf@yas.c'});
  t({
    given: 'too short of an email extension',
    should: 'send 400 status',
    actual: testTooShortEmailExt.payload.statusCode,
    expected: 400
  });
  t({
    given: 'too short of an email extension',
    should: 'send custom message',
    actual: testTooShortEmailExt.payload.message,
    expected: 'Invalid E-mail'
  });


  const testSpecialCharacterEmail = await testForm({ email: 'asdf*asdf@asdf.com'});
  t({
    given: 'special characters in email',
    should: 'send 400 status',
    actual: testSpecialCharacterEmail.payload.statusCode,
    expected: 400
  });
  t({
    given: 'special characters in email',
    should: 'send custom message',
    actual: testSpecialCharacterEmail.payload.message,
    expected: 'Invalid E-mail'
  });


  t({
    given: 'a valid email',
    should: 'send 200 status',
    actual: (await testForm({ email: 'aEa%324-.fas@test.com'}, 'string')).statusCode,
    expected: 200
  });


  const testFormType = await testForm({ type: 7 });
  t({
    given: 'a non-existent form type',
    should: 'send 400 status',
    actual: testFormType.payload.statusCode,
    expected: 400
  });
  t({
    given: 'a non-existent form type',
    should: 'send custom message',
    actual: testFormType.payload.message,
    expected: 'Invalid Form Type'
  });


  t({
    given: 'a valid form type',
    should: 'send 200 status',
    actual: (await testForm({ type: 1}, 'string')).statusCode,
    expected: 200
  });


  const testExistingRed33mUser = await testForm({ type: 0 }, undefined, r3dAuthHeader);
  t({
    given: 'a red33m form type when already authed',
    should: 'send 409 status',
    actual: testExistingRed33mUser.payload.statusCode,
    expected: 409
  });
  t({
    given: 'a red33m form type when already authed',
    should: 'send custom message',
    actual: testExistingRed33mUser.payload.message,
    expected: 'Red33m access already Granted'
  });


  const testQuestionsLength = await testForm({ questions: []});
  t({
    given: 'no questions',
    should: 'send 400 status',
    actual: testQuestionsLength.payload.statusCode,
    expected: 400
  });
  t({
    given: 'no questions',
    should: 'send custom message',
    actual: testQuestionsLength.payload.message,
    expected: 'Invalid Questions'
  });


  const testEmptyAnswer = await testForm({
    questions: [
      { text: validForm.questions[0].text, answer: '           '},
      validForm.questions[1]
    ]
  });
  t({
    given: 'an empty answer',
    should: 'send 400 status',
    actual: testEmptyAnswer.payload.statusCode,
    expected: 400
  });
  t({
    given: 'an empty answer',
    should: 'send custom message',
    actual: testEmptyAnswer.payload.message,
    expected: 'Invalid Questions'
  });


  const testEmptyQuestionText = await testForm({
    questions: [
      { text: '        ', answer: validForm.questions[0].answer},
      validForm.questions[1]
    ]
  });
  t({
    given: 'empty question text',
    should: 'send 400 status',
    actual: testEmptyQuestionText.payload.statusCode,
    expected: 400
  });
  t({
    given: 'empty question text',
    should: 'send custom message',
    actual: testEmptyQuestionText.payload.message,
    expected: 'Invalid Questions'
  });


  const testQuestionTextTooShort = await testForm({
    questions: [
      { text: 'hello world', answer: validForm.questions[0].answer},
      validForm.questions[1]
    ]
  });
  t({
    given: 'question text that is too short',
    should: 'send 400 status',
    actual: testQuestionTextTooShort.payload.statusCode,
    expected: 400
  });
  t({
    given: 'question text that is too short',
    should: 'send 400 status & message',
    actual: testQuestionTextTooShort.payload.message,
    expected: 'Invalid Questions'
  });


  const testAnswerTooShort = await testForm({
    questions: [
      { text: validForm.questions[0].text, answer: 'hello world'},
      validForm.questions[1]
    ]
  });
  t({
    given: 'an answer that is too short',
    should: 'send 400 status',
    actual: testAnswerTooShort.payload.statusCode,
    expected: 400
  });
  t({
    given: 'an answer that is too short',
    should: 'send custom message',
    actual: testAnswerTooShort.payload.message,
    expected: 'Invalid Questions'
  });


  const testTooShortRed33mAnswer = await testForm({
    type: 0,
    questions: [
      {
        text: validForm.questions[0].text,
        answer: 'This answer is definitely too short for a red33m form because that is how its designed \
                 to be'
      },
      validForm.questions[1]
    ]
  });
  t({
    given: 'an answer too short for red33m form type',
    should: 'send 400 status',
    actual: testTooShortRed33mAnswer.payload.statusCode,
    expected: 400
  });
  t({
    given: 'an answer too short for red33m form type',
    should: 'send custom message',
    actual: testTooShortRed33mAnswer.payload.message,
    expected: 'Invalid Questions'
  });


  t({
    given: 'valid questions',
    should: 'send 200 status',
    actual: (await testForm({}, 'string')).statusCode,
    expected: 200
  });


  const testFormError = await testForm({ name: 'throwError' });
  t({
    given: 'an error response from transport',
    should: 'send 500 status',
    actual: testFormError.payload.statusCode,
    expected: 500
  });
  t({
    given: 'an error response from transport',
    should: 'send custom message',
    actual: testFormError.payload.message,
    expected: `I'm a bad boy!`
  });


  // Cleanup everything here
  app.close();


  //############################
  //###### TEST FUNCTIONS ######
  //############################
  type TestResp<T> = { statusCode: number; payload: T };

  async function testForm(formData: {[key: string]: any}): Promise<TestResp<BadRequestSchema>>
  async function testForm(formData: {[key: string]: any}, type: 'string'): Promise<TestResp<string>>
  async function testForm(formData: {[key: string]: any}, type: undefined, header: typeof constAuthedHeader): Promise<TestResp<BadRequestSchema>>
  async function testForm(formData: {[key: string]: any}, type?: 'string', header = constAuthedHeader) {
    const form = getForm(formData);
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: header })
    ;
    return {
      statusCode,
      payload: type == 'string' && payload || JSON.parse(payload) as BadRequestSchema,
    };
  }

});


describe('POST /api/form/qna -- buildTextMsg()', async t => {
  const questions = [
    { text: 'this is a question', answer: 'this is an answer!' },
    { text: 'this is a question', answer: 'this is an answer!' },
  ];

  t({
    given: 'form questions',
    should: 'output questions in a readable QnA format',
    actual: tdd.buildTextMsg(questions),
    expected: '1.) this is a question\n\nthis is an answer!\n\n\n\n2.) this is a question\n\nthis is an answer!\n\n\n\n'
  });

});


describe('POST /api/form/qna -- buildHTMLMsg()', async t => {
  const { htmlHeader, htmlFooter, htmlSpan, htmlCloseSpan } = tdd;
  const questions = [
    { text: 'this is a question', answer: 'this is an answer!' },
    { text: 'this is a question', answer: 'this is an answer!' },
  ];
  const q1 = `1.) ${questions[0].text}${htmlSpan}${questions[0].answer}${htmlCloseSpan}`;
  const q2 = `2.) ${questions[1].text}${htmlSpan}${questions[1].answer}${htmlCloseSpan}`;

  t({
    given: 'form questions',
    should: 'output questions in an HTML QnA format',
    actual: tdd.buildHTMLMsg(questions),
    expected: `${htmlHeader}${q1}${q2}${htmlFooter}`
  });

});


describe('POST /api/form/qna -- createMail()', async t => {
  const { htmlHeader, htmlFooter, htmlSpan, htmlCloseSpan } = tdd;
  const form = getForm() as QnAFormReqBody;
  const { name, email, type } = form;
  const qHTML1 = `1.) ${form.questions[0].text}${htmlSpan}${form.questions[0].answer}${htmlCloseSpan}`;
  const qHTML2 = `2.) ${form.questions[1].text}${htmlSpan}${form.questions[1].answer}${htmlCloseSpan}`;
  const qHTML3 = `3.) ${form.questions[2].text}${htmlSpan}${form.questions[2].answer}${htmlCloseSpan}`;
  const q1 = `1.) ${form.questions[0].text}\n\n${form.questions[0].answer}\n\n\n\n`;
  const q2 = `2.) ${form.questions[1].text}\n\n${form.questions[1].answer}\n\n\n\n`;
  const q3 = `3.) ${form.questions[2].text}\n\n${form.questions[2].answer}\n\n\n\n`;
  const mail = tdd.createEmail(form);

  t({
    given: 'request body',
    should: 'create valid "from" property',
    actual: mail.from,
    expected: `"${name}" <${email}>`
  });

  t({
    given: 'request body',
    should: 'mail to ethan',
    actual: mail.to,
    expected: serverConfig().mail.toEthan,
  });

  t({
    given: 'request body',
    should: 'create "subject" from "type"',
    actual: mail.subject,
    expected: tdd.formSubjects[type],
  });

  t({
    given: 'request body',
    should: 'create text message',
    actual: mail.text,
    expected: `${q1}${q2}${q3}`,
  });

  t({
    given: 'request body',
    should: 'create an HTML message',
    actual: mail.html,
    expected: `${htmlHeader}${qHTML1}${qHTML2}${qHTML3}${htmlFooter}`,
  });

});
















