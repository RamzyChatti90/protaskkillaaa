import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

export class JhiMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    const key = params.key;
    console.warn(`Missing translation for key: ${key}`);
    return `??${key}??`;
  }
}