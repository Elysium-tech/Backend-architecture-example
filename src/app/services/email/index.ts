// Serviço de e-mail
// Implemente aqui o contrato de envio de e-mails

export interface EmailService {
  send(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void>;
}
