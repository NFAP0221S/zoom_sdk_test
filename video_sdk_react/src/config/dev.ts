import { getExploreName } from '../utils/platform';

export const devConfig = {
  sdkKey: 'RVy68P1Mri76QcDHIt7cHgpHQ00CP6WcIyMr',
  sdkSecret: 'gOebxAAVW7IKpxehxQBc2zBZ6eBC3Bb2fBI2',
  webEndpoint: 'zoom.us',
  topic: 'test2',
  name: `${getExploreName()}-${Math.floor(Math.random() * 1000)}`,
  password: 'test',
  signature: '',
  sessionKey: '',
  userIdentity: '',
  // role = 1 to join as host, 0 to join as attendee. The first user must join as host to start the session
  role: 1
};
