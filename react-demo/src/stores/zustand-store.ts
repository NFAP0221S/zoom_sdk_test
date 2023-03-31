import { create } from 'zustand';

interface Store {
  //   count: number;
  //   increment: () => void;
  //   decrement: () => void;
  isTopic: string;
  isName: string;
  isPassword: string;
  isRole: string;
  topicChange: (topic: string) => void;
  nameChange: (name: string) => void;
  passwordChange: (password: string) => void;
  roleChange: (role: string) => void;
  isToggle: boolean;
  toggleHandler: (isToggle: boolean) => void;
  videoLayoutBtn: number;
  videoLayoutBtnHandler: (number: number) => void;
  clickedAvatar: number | null;
  setClickedAvatar: (avatarId: number) => void;
  clickToggle: boolean;
  setClcickToggle: (click: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  //   count: 0,
  //   increment: () => set((state) => ({ count: state.count + 1 })),
  //   decrement: () => set((state) => ({ count: state.count - 1 }))

  // session join 관련
  isTopic: '',
  isName: '',
  isPassword: '',
  isRole: '0',
  topicChange: (topic) => set(() => ({ isTopic: topic })),
  nameChange: (name) => set(() => ({ isName: name })),
  passwordChange: (password) => set(() => ({ isPassword: password })),
  roleChange: (role) => set(() => ({ isRole: role })),
  isToggle: false,
  toggleHandler: () => set((state) => ({ isToggle: !state.isToggle })),

  // 비디오 레이아웃 변경 관련
  videoLayoutBtn: 0,
  videoLayoutBtnHandler: (number) => set(() => ({ videoLayoutBtn: number })),
  clickedAvatar: null,
  setClickedAvatar: (avatarId) => set(() => ({ clickedAvatar: avatarId })),
  clickToggle: false,
  setClcickToggle: (click) => set(() => ({ clickToggle: click }))
}));
