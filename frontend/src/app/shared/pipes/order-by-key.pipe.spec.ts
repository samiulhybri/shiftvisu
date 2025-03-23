import { OrderByKeyPipe } from './order-by-key.pipe';

describe('OrderByKeyPipe', () => {
  it('create an instance', () => {
    const pipe = new OrderByKeyPipe();
    expect(pipe).toBeTruthy();
  });
});
