import { getExploreName } from '../utils/platform';

export const devConfig = {
  // sdkKey: 'RVy68P1Mri76QcDHIt7cHgpHQ00CP6WcIyMr', // 회사
  sdkKey: '',
  // sdkSecret: 'gOebxAAVW7IKpxehxQBc2zBZ6eBC3Bb2fBI2', // 회사
  sdkSecret: '',
  webEndpoint: 'zoom.us',
  topic: '',
  name: `${getExploreName()}-${Math.floor(Math.random() * 1000)}`,
  password: '',
  signature: '',
  sessionKey: '',
  userIdentity: '',
  // role = 1 to join as host, 0 to join as attendee. The first user must join as host to start the session
  role: 1
};
