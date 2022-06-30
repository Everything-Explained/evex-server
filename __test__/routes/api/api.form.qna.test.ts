

import { describe } from 'riteway';
import { authorizedHeader, build, constAuthedHeader, r3dAuthHeader } from '../../test.fastify';
import { FastifyInstance } from 'fastify';
import { QnAFormReqBody, _tdd_testAPIFormQna } from '../../../src/routes/api/api-form-qna';
import { serverConfig } from '../../../src/config';




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

  t({
    given: 'too short of a name',
    should: 'send 400 status & message',
    actual: await testTooShortName(),
    expected: true
  });

  t({
    given: 'too long of a name',
    should: 'send 400 status & message',
    actual: await testTooLongName(),
    expected: true
  });

  t({
    given: 'new line in name',
    should: 'send 400 status & message',
    actual: await testNewLineName(),
    expected: true
  });

  t({
    given: 'special characters in name',
    should: 'send 400 status & message',
    actual: await testSpecialCharacterName(),
    expected: true
  });

  t({
    given: 'a valid name',
    should: 'send 200 status',
    actual: await testValidName(),
    expected: 200
  });

  t({
    given: 'too short of an email extension',
    should: 'send 400 status & message',
    actual: await testTooShortEmailExt(),
    expected: true
  });

  t({
    given: 'special characters in email',
    should: 'send 400 status & message',
    actual: await testSpecialCharacterEmail(),
    expected: true
  });

  t({
    given: 'a valid email',
    should: 'send 200 status',
    actual: await testValidEmail(),
    expected: 200
  });

  t({
    given: 'a non-existent form type',
    should: 'send 400 status & message',
    actual: await testFormType(),
    expected: true
  });

  t({
    given: 'a valid form type',
    should: 'send 200 status',
    actual: await testValidFormType(),
    expected: 200
  });

  t({
    given: 'a red33m form type, but already a red33m user',
    should: 'send 409 status & message',
    actual: await testExistingRed33mUser(),
    expected: true
  });

  t({
    given: 'no questions',
    should: 'send 400 status & message',
    actual: await testQuestionsLength(),
    expected: true
  });

  t({
    given: 'an empty answer',
    should: 'send 400 status & message',
    actual: await testEmptyAnswer(),
    expected: true
  });

  t({
    given: 'empty question text',
    should: 'send 400 status & message',
    actual: await testEmptyQuestionText(),
    expected: true
  });

  t({
    given: 'question text that is too short',
    should: 'send 400 status & message',
    actual: await testQuestionTextTooShort(),
    expected: true
  });

  t({
    given: 'an answer that is too short',
    should: 'send 400 status & message',
    actual: await testAnswerTooShort(),
    expected: true
  });

  t({
    given: 'an answer too short for red33m form type',
    should: 'send 400 status & message',
    actual: await testAnswerTooShortRed33m(),
    expected: true
  });

  t({
    given: 'valid questions',
    should: 'send 200 status',
    actual: await testValidQuestions(),
    expected: 200
  });

  t({
    given: 'an error response from transport',
    should: 'send 500 status & message',
    actual: await testErrorHandler(),
    expected: true
  });


  // Cleanup everything here
  app.close();


  //############################
  //###### TEST FUNCTIONS ######
  //############################
  async function testTooShortName() {
    const nameTooShortForm = getForm({ name: 'a'});
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: nameTooShortForm, headers: constAuthedHeader })
    ;
    return payload.includes('Name is Invalid') && statusCode == 400;
  }


  async function testTooLongName() {
    const form = getForm({ name: 'abcdefghijabcdefghijabcdefghijk'});
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('Name is Invalid') && statusCode == 400;
  }


  async function testNewLineName() {
    const form = getForm({ name: 'ab\ncd'});
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('Name is Invalid') && statusCode == 400;
  }


  async function testSpecialCharacterName() {
    const form = getForm({ name: '@biggie@test.com'});
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('Name is Invalid') && statusCode == 400;
  }


  async function testValidName() {
    const newLineNameForm = getForm({ name: 'Mr. Lambdadoodle'});
    const { statusCode } =
      await app.inject({ url, method: 'POST', payload: newLineNameForm, headers: constAuthedHeader })
    ;
    return statusCode;
  }


  async function testTooShortEmailExt() {
    const form = getForm({ email: 'asdf@yas.c'});
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('Invalid E-mail') && statusCode == 400;
  }


  async function testSpecialCharacterEmail() {
    const form = getForm({ email: 'as/df@yas.con'});
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('Invalid E-mail') && statusCode == 400;
  }


  async function testValidEmail() {
    const form = getForm({ email: 'aEa%324-.fas@test.com'});
    const { statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return statusCode;
  }


  async function testFormType() {
    const form = getForm({ type: 7});
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('Invalid Form Type') && statusCode == 400;
  }


  async function testValidFormType() {
    const form = getForm({ type: 1 });
    const { statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return statusCode;
  }


  async function testExistingRed33mUser() {
    const form = getForm({ type: 0 });
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: r3dAuthHeader })
    ;
    return payload.includes('access already Granted') && statusCode == 409;
  }


  async function testQuestionsLength() {
    const form = getForm({ questions: []});
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('Invalid Questions') && statusCode == 400;
  }


  async function testEmptyAnswer() {
    const form = getForm();
    form.questions[0].answer = '         ';
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('Invalid Questions') && statusCode == 400;
  }


  async function testEmptyQuestionText() {
    const form = getForm();
    form.questions[0].text = '         ';
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('Invalid Questions') && statusCode == 400;
  }


  async function testQuestionTextTooShort() {
    const form = getForm();
    form.questions[0].text = 'hello world';
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('Invalid Questions') && statusCode == 400;
  }


  async function testAnswerTooShort() {
    const form = getForm();
    form.questions[0].answer = 'hello there this is definitely too short of an answer!';
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('Invalid Questions') && statusCode == 400;
  }


  async function testAnswerTooShortRed33m() {
    const form = getForm({ type: 0 });
    form.questions[0].answer =
      'This answer is definitely too short for a red33m form because that is how its designed \
      to be';
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('Invalid Questions') && statusCode == 400;
  }


  async function testValidQuestions() {
    const form = getForm();
    const { statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return statusCode;
  }


  async function testErrorHandler() {
    // Built into mock-mailer to throw error with this name
    const form = getForm({ name: 'throwError'});
    const { payload, statusCode } =
      await app.inject({ url, method: 'POST', payload: form, headers: constAuthedHeader })
    ;
    return payload.includes('bad boy') && statusCode == 500;
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
















