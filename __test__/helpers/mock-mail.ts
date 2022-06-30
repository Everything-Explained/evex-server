import Mail = require("nodemailer/lib/mailer");


export const mockTransport = {
  sendMail: (mail: Mail.Options) => {
    if (typeof mail.from == 'string' && mail.from!.includes('throwError')) {
      return Promise.reject(new Error("I'm a bad boy!"));
    }
    return Promise.resolve(mail);
  },
};









