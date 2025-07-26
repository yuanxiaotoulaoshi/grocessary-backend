import { Test, TestingModule } from '@nestjs/testing';
import { ListenController } from './listen.controller';
import { ListenService } from './listen.service';

describe('ListenController', () => {
  let controller: ListenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListenController],
      providers: [ListenService],
    }).compile();

    controller = module.get<ListenController>(ListenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
