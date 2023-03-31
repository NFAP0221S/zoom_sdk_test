export const settingSignature = (signature : string) => {
  if(signature){
    window.localStorage.setItem('signature', JSON.stringify(signature))
  } else {
    window.localStorage.setItem('signature', '');
  }
}

export const gettingSignature = () => {
  const signature = window.localStorage.getItem('signature');
  if(signature) {
    return JSON.parse(signature);
  } else {
    return null;
  }
}

export  const settingSessionInfo = (sessionInfo: object) => {
  if(sessionInfo){
    window.localStorage.setItem('sessionInfo', JSON.stringify(sessionInfo))
  } else {
    window.localStorage.setItem('sessionInfo', '');
  }
}

export const gettingSessionInfo = () => {
  const sessionInfo = window.localStorage.getItem('sessionInfo');
  if(sessionInfo) {
    return JSON.parse(sessionInfo);
  } else {
    return null;
  }
}

export const localStorageClear = () => {
  window.localStorage.clear();
}