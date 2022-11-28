

import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance, RouteShorthandOptions } from "fastify";
import * as mailer from 'nodemailer';
import Mail = require("nodemailer/lib/mailer");
import { serverConfig } from "../../config";
import { APIRequest } from "../../hooks/api-auth-hook";
import { defaultResponseSchema } from "../../schemas/std-schemas";
import { isDev, isStaging, tryCatchPromise } from "../../utils";





type FormSubject = `EvEx Form - ${string}`;

type FormRequest = APIRequest & {
  Body: Static<typeof BodySchema>
}

type FormQuestions = Static<typeof BodySchema>['questions'];

type ValidationTuple = [isValid: boolean, reqType: 'bad'|'conflict'|null, errMsg: string];

export type QnAFormReqBody = FormRequest['Body']





const htmlHeader =
'<html><body style="background-color: #0f1112; \
color: hsl(194, 19%, 80%); \
font-size: 18px; font-family: Verdana;">';
const htmlFooter = `</body></html>`;
const htmlSpan  = `<br><br><span style='color: hsl(161, 50%, 60%);'>`;
const htmlCloseSpan = '</span><br><br><br>';

const formSubjects: Array<FormSubject> = [
  `EvEx Form - Exclusive Content Request`,
  `EvEx Form - I've got something to share`,
  `EvEx Form - I want to collaborate`,
  `EvEx Form - I want to correct you`,
];


const state = {
  transport: mailer.createTransport(
    (isDev() || isStaging()) && serverConfig.mail.mailtrap || serverConfig.mail.sendinblue
  )
};

enum FormType {
  Red33m = 0,
  ShareWithUs,
  CollaborateWithUs,
  CorrectUs,
}

const BodySchema = Type.Strict(Type.Object({
  name      : Type.String(),
  email     : Type.String(),
  questions : Type.Array(Type.Object({ text: Type.String(), answer: Type.String()})),
  type      : Type.Number()
}));

const formSchema: RouteShorthandOptions = {
  schema: {
    body: BodySchema,
    response: {
      ...defaultResponseSchema,
    }
  }
};






export function useFormQnA(f: FastifyInstance, rootURL: string) {
  f.post<FormRequest>(`${rootURL}/form/qna`, formSchema, async (req, res) => {
    const [isValid, reqType, errMsg] = validateForm(req.body);

    if (isValid) {
      const reply = await tryCatchPromise(state.transport.sendMail(createEmail(req.body)));
      if (reply instanceof Error) {
        return res.internalServerError(reply.message);
      }
      return 'OK';
    }

    if (reqType == 'conflict') {
      return res.conflict(errMsg);
    }

    return res.badRequest(errMsg);
  });
}


function validateForm(body: QnAFormReqBody): ValidationTuple {
  const { name, email, type, isRed33med, questions } = body;

  if (!name.trim().match(/^([a-z.]|[^\S\r\n]){2,30}$/i)) {
    return [false, 'bad', 'Name is Invalid'];
  }

  if (!email.trim().match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i)) {
    return [false, 'bad', 'Invalid E-mail'];
  }

  if (!FormType[type]) {
    return [false, 'bad', 'Invalid Form Type'];
  }

  if (type == FormType.Red33m && isRed33med) {
    return [false, 'conflict', 'Red33m access already Granted'];
  }

  const isValidQuestion =
       questions.length > 1
    && questions[0].answer.trim().length
    && questions[0].text.trim().length
    && questions[0].text.length > 15
    && questions[0].answer.length > ((type == FormType.Red33m) ? 119 : 69)
  ;

  if (!isValidQuestion) {
    return [false, 'bad', 'Invalid Questions'];
  }

  return [true, null, ''];
}


function createEmail(body: QnAFormReqBody) {
  const { name, email, type, questions } = body;

  const mail: Mail.Options = {
    from    : `"${name}" <${email}>`,
    to      : serverConfig.mail.toEthan,
    subject : formSubjects[type],
    text    : buildTextMsg(questions),
    html    : buildHTMLMsg(questions),
  };

  return mail;
}


function buildHTMLMsg(questions: FormQuestions) {
  let html = '';
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    html = `${html}${i+1}.) ${q.text}${htmlSpan}${q.answer}${htmlCloseSpan}`;
  }
  return `${htmlHeader}${html}${htmlFooter}`;
}


function buildTextMsg(questions: FormQuestions) {
  let msg = '';
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    msg = `${msg}${i+1}.) ${q.text}\n\n${q.answer}\n\n\n\n`;
  }
  return msg;
}


export const _tdd_testAPIFormQna = {
  htmlHeader,
  htmlFooter,
  htmlSpan,
  htmlCloseSpan,
  formSubjects,
  validateForm,
  createEmail,
  buildHTMLMsg,
  buildTextMsg,
  setDevTransport: (transport: any) => state.transport = transport,
};






