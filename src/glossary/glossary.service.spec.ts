import { Test, TestingModule } from '@nestjs/testing';
import { GlossaryService } from './glossary.service';

describe('GlossaryService', () => {
  let service: GlossaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlossaryService],
    }).compile();

    service = module.get<GlossaryService>(GlossaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
