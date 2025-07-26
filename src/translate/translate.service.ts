import { Injectable,HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TranslateService {
    async translate(text: string, source = 'zh', target = 'en') {
        try {
          const response = await axios.get('https://api.mymemory.translated.net/get', {
            params: {
              q: text,
              langpair: `${source}|${target}`
            }
          });
    
          const translated = response.data?.responseData?.translatedText;
    
          if (!translated) {
            throw new Error('No translated text in response');
          }
    
          return translated;
        } catch (error) {
          console.error('Translation error:', error);
          throw new HttpException('Translation failed', 500);
        }
      }
    
}
