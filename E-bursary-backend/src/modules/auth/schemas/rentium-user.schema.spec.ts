import { RentiumUserSchema } from './rentium-user.schema';

describe('RentiumUser schema', () => {
  it('uses the legacy e-bursary user collection so seeded admin credentials match the live app login', () => {
    expect((RentiumUserSchema as any).options.collection).toBe('e-bursarycusers');
  });
});
