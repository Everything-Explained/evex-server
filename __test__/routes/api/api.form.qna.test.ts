

import { describe } from 'riteway';
import { build, constAuthedHeader, r3dAuthHeader } from '../../test.fastify';
import { QnAFormReqBody, _tdd_testAPIFormQna } from '../../../src/routes/api/api-form-qna';
import { serverConfig } from '../../../src/config';
import { BadRequestSchema } from '../../../src/schemas/std-schemas';
import { mockTransport } from '../../helpers/mock-mail';




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
  if (data) return { ...validForm, questions, ...data} as QnAFormReqBody;
  return { ...validForm, questions, } as QnAFormReqBody;
};


describe('POST /api/form/qna', async t => {
  const app = await build();
  tdd.setDevTransport(mockTransport);

  const testBadRequest = await testForm({ name: 'a' });
  t({
    given: 'a bad request',
    should: 'send 400 status',
    actual: testBadRequest.payload.statusCode,
    expected: 400
  });
  t({
    given: 'a bad request',
    should: 'send custom message',
    actual: testBadRequest.payload.message,
    expected: 'Name is Invalid'
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


  t({
    given: 'a valid form',
    should: 'send 200 status & OK',
    actual: (await testForm({}, 'string')).payload,
    expected: 'OK'
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


describe('POST /api/form/qna -- validateForm()', async t => {
  const testTooShortName = tdd.validateForm({ name: 'a' } as QnAFormReqBody);
  t({
    given: 'too short of a name',
    should: 'return false',
    actual: testTooShortName[0],
    expected: false
  });
  t({
    given: 'too short of a name',
    should: 'return bad req type',
    actual: testTooShortName[1],
    expected: 'bad'
  });
  t({
    given: 'too short of a name',
    should: 'return error message',
    actual: testTooShortName[2],
    expected: 'Name is Invalid'
  });


  const testTooLongName = tdd.validateForm({ name: 'abcdefghijabcdefghijabcdefghijk' } as QnAFormReqBody);
  t({
    given: 'too long of a name',
    should: 'return false',
    actual: testTooLongName[0],
    expected: false
  });
  t({
    given: 'too long of a name',
    should: 'return bad req type',
    actual: testTooLongName[1],
    expected: 'bad'
  });
  t({
    given: 'too long of a name',
    should: 'return error message',
    actual: testTooLongName[2],
    expected: 'Name is Invalid'
  });


  const testNewLineName = tdd.validateForm({ name: 'ab\ncd' } as QnAFormReqBody);
  t({
    given: 'new line in name',
    should: 'return false',
    actual: testNewLineName[0],
    expected: false
  });
  t({
    given: 'new line in name',
    should: 'return bad req type',
    actual: testNewLineName[1],
    expected: 'bad'
  });
  t({
    given: 'new line in name',
    should: 'return error message',
    actual: testNewLineName[2],
    expected: 'Name is Invalid'
  });


  const testSpecialCharacterName = tdd.validateForm({ name: 'f**k' } as QnAFormReqBody);
  t({
    given: 'special characters in name',
    should: 'return false',
    actual: testSpecialCharacterName[0],
    expected: false
  });
  t({
    given: 'special characters in name',
    should: 'return bad req type',
    actual: testSpecialCharacterName[1],
    expected: 'bad'
  });
  t({
    given: 'special characters in name',
    should: 'return error message',
    actual: testSpecialCharacterName[2],
    expected: 'Name is Invalid'
  });


  const validName = tdd.validateForm(getForm({ name: 'Dr. Valid' }));
  t({
    given: 'a valid name',
    should: 'return true',
    actual: validName[0],
    expected: true
  });


  const testTooShortEmailExt = tdd.validateForm(getForm({ email: 'asdf@yas.c' }));
  t({
    given: 'too short of an email extension',
    should: 'return false',
    actual: testTooShortEmailExt[0],
    expected: false
  });
  t({
    given: 'too short of an email extension',
    should: 'return bad req type',
    actual: testTooShortEmailExt[1],
    expected: 'bad'
  });
  t({
    given: 'too short of an email extension',
    should: 'return error message',
    actual: testTooShortEmailExt[2],
    expected: 'Invalid E-mail'
  });


  const testSpecialCharacterEmail = tdd.validateForm(getForm({ email: 'asdf*asdf@asdf.com' }));
  t({
    given: 'special characters in email',
    should: 'return false',
    actual: testSpecialCharacterEmail[0],
    expected: false
  });
  t({
    given: 'special characters in email',
    should: 'return bad req type',
    actual: testSpecialCharacterEmail[1],
    expected: 'bad'
  });
  t({
    given: 'special characters in email',
    should: 'return error message',
    actual: testSpecialCharacterEmail[2],
    expected: 'Invalid E-mail'
  });


  t({
    given: 'a valid email',
    should: 'return true',
    actual: tdd.validateForm(getForm({ email: 'aEa%324-.fas@test.com' }))[0],
    expected: true
  });


  const badFormType = tdd.validateForm(getForm({ type: 7 }));
  t({
    given: 'a non-existent form type',
    should: 'return false',
    actual: badFormType[0],
    expected: false
  });
  t({
    given: 'a non-existent form type',
    should: 'return bad req type',
    actual: badFormType[1],
    expected: 'bad'
  });
  t({
    given: 'a non-existent form type',
    should: 'return error message',
    actual: badFormType[2],
    expected: 'Invalid Form Type'
  });


  t({
    given: 'a valid form type',
    should: 'return true',
    actual: tdd.validateForm(getForm({ type: 1 }))[0],
    expected: true
  });


  const testExistingRed33mUser = tdd.validateForm(getForm( { type: 0, isRed33med: true }));
  t({
    given: 'a red33m form type when already authed',
    should: 'return false',
    actual: testExistingRed33mUser[0],
    expected: false
  });
  t({
    given: 'a red33m form type when already authed',
    should: 'return "conflict" req type',
    actual: testExistingRed33mUser[1],
    expected: 'conflict'
  });
  t({
    given: 'a red33m form type when already authed',
    should: 'return error message',
    actual: testExistingRed33mUser[2],
    expected: 'Red33m access already Granted'
  });


  const testQuestionsLength = tdd.validateForm(getForm({ questions: [] }));
  t({
    given: 'no questions',
    should: 'return false',
    actual: testQuestionsLength[0],
    expected: false
  });
  t({
    given: 'no questions',
    should: 'return bad req type',
    actual: testQuestionsLength[1],
    expected: 'bad'
  });
  t({
    given: 'no questions',
    should: 'return error message',
    actual: testQuestionsLength[2],
    expected: 'Invalid Questions'
  });


  const testEmptyAnswer = tdd.validateForm(getForm({
    questions: [
      { text: validForm.questions[0].text, answer: '           '},
      validForm.questions[1]
    ]
  }));
  t({
    given: 'an empty answer',
    should: 'return false',
    actual: testEmptyAnswer[0],
    expected: false
  });
  t({
    given: 'an empty answer',
    should: 'return bad req type',
    actual: testEmptyAnswer[1],
    expected: 'bad'
  });
  t({
    given: 'an empty answer',
    should: 'return false',
    actual: testEmptyAnswer[2],
    expected: 'Invalid Questions'
  });


  const testEmptyQuestionText = tdd.validateForm(getForm({
    questions: [
      { text: '        ', answer: validForm.questions[0].answer},
      validForm.questions[1]
    ]
  }));
  t({
    given: 'empty question text',
    should: 'return false',
    actual: testEmptyQuestionText[0],
    expected: false
  });
  t({
    given: 'empty question text',
    should: 'return bad req type',
    actual: testEmptyQuestionText[1],
    expected: 'bad'
  });
  t({
    given: 'empty question text',
    should: 'return error message',
    actual: testEmptyQuestionText[2],
    expected: 'Invalid Questions'
  });


  const testQuestionTextTooShort = tdd.validateForm(getForm({
    questions: [
      { text: 'hello world', answer: validForm.questions[0].answer},
      validForm.questions[1]
    ]
  }));
  t({
    given: 'question text that is too short',
    should: 'return false',
    actual: testQuestionTextTooShort[0],
    expected: false
  });
  t({
    given: 'question text that is too short',
    should: 'return bad req type',
    actual: testQuestionTextTooShort[1],
    expected: 'bad'
  });
  t({
    given: 'question text that is too short',
    should: 'return error message',
    actual: testQuestionTextTooShort[2],
    expected: 'Invalid Questions'
  });


  const testAnswerTooShort = tdd.validateForm(getForm({
    questions: [
      { text: validForm.questions[0].text, answer: 'hello world'},
      validForm.questions[1]
    ]
  }));
  t({
    given: 'an answer too short for red33m form type',
    should: 'return false',
    actual: testAnswerTooShort[0],
    expected: false
  });
  t({
    given: 'an answer too short for red33m form type',
    should: 'return bad req type',
    actual: testAnswerTooShort[1],
    expected: 'bad'
  });
  t({
    given: 'an answer too short for red33m form type',
    should: 'return error message',
    actual: testAnswerTooShort[2],
    expected: 'Invalid Questions'
  });


  const testTooShortRed33mAnswer = tdd.validateForm(getForm({
    type: 0,
    questions: [
      {
        text: validForm.questions[0].text,
        answer: 'This answer is definitely too short for a red33m form because that is how its designed \
                 to be'
      },
      validForm.questions[1]
    ]
  }));
  t({
    given: 'an answer that is too short',
    should: 'return false',
    actual: testTooShortRed33mAnswer[0],
    expected: false
  });
  t({
    given: 'an answer that is too short',
    should: 'return bad req type',
    actual: testTooShortRed33mAnswer[1],
    expected: 'bad'
  });
  t({
    given: 'an answer that is too short',
    should: 'return error message',
    actual: testTooShortRed33mAnswer[2],
    expected: 'Invalid Questions'
  });


  t({
    given: 'valid questions',
    should: 'return true',
    actual: tdd.validateForm(getForm({}))[0],
    expected: true
  });
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
    expected: serverConfig.mail.toEthan,
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
















