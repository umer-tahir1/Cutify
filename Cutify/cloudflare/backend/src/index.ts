import { Container, getContainer } from '@cloudflare/containers';
import { env as workerEnv } from 'cloudflare:workers';

const asString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback;
};

export class CutifyApiContainer extends Container {
  defaultPort = 5000;
  sleepAfter = '10m';

  envVars = {
    NODE_ENV: 'production',
    PORT: '5000',
    MONGODB_URI: asString(workerEnv.MONGODB_URI),
    JWT_SECRET: asString(workerEnv.JWT_SECRET),
    JWT_EXPIRES_IN: asString(workerEnv.JWT_EXPIRES_IN, '7d'),
    JWT_REFRESH_SECRET: asString(workerEnv.JWT_REFRESH_SECRET),
    JWT_REFRESH_EXPIRES_IN: asString(workerEnv.JWT_REFRESH_EXPIRES_IN, '30d'),
    SMTP_HOST: asString(workerEnv.SMTP_HOST, 'smtp.gmail.com'),
    SMTP_PORT: asString(workerEnv.SMTP_PORT, '587'),
    SMTP_USER: asString(workerEnv.SMTP_USER),
    SMTP_PASS: asString(workerEnv.SMTP_PASS),
    EMAIL_FROM: asString(workerEnv.EMAIL_FROM, 'Cutify <noreply@cutify.com>'),
    FRONTEND_URL: asString(workerEnv.FRONTEND_URL),
    MAX_FILE_SIZE: asString(workerEnv.MAX_FILE_SIZE, '5242880'),
    UPLOAD_DIR: asString(workerEnv.UPLOAD_DIR, 'uploads'),
    WHATSAPP_PHONE_NUMBER_ID: asString(workerEnv.WHATSAPP_PHONE_NUMBER_ID),
    WHATSAPP_ACCESS_TOKEN: asString(workerEnv.WHATSAPP_ACCESS_TOKEN),
    WHATSAPP_BUSINESS_PHONE: asString(workerEnv.WHATSAPP_BUSINESS_PHONE, '+923306387976')
  };
}

interface RuntimeEnv {
  CUTIFY_API_CONTAINER: any;
}

export default {
  async fetch(request: Request, env: RuntimeEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/_health') {
      return new Response('ok', { status: 200 });
    }

    const container = getContainer(env.CUTIFY_API_CONTAINER, 'cutify-api-singleton');
    return container.fetch(request);
  }
};
