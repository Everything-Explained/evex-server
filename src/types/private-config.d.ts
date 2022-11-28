


export interface ServerConfig {
  auth: ConfigAuth;
  mail: Mail;
  allowedDevOrigins: string[];
}

interface ConfigAuth {
  red33m: string;
  testCode: string;
}

interface Mail {
  toEthan:    string;
  toTest:     string;
  mailgun:    Mailgun;
  sendinblue: Sendinblue;
  mailtrap:   Mailtrap;
}

interface Mailgun {
  service: string;
  auth:    MailgunAuth;
}

interface MailgunAuth {
  user: string;
  pass: string;
}

interface Mailtrap {
  host: string;
  port: number;
  auth: MailgunAuth;
}

interface Sendinblue {
  service:    string;
  port:       number;
  requireTLS: boolean;
  auth:       MailgunAuth;
}
