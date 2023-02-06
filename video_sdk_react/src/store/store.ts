import create from 'zustand';

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
}

export const useStore = create<Store>((set) => ({
  //   count: 0,
  //   increment: () => set((state) => ({ count: state.count + 1 })),
  //   decrement: () => set((state) => ({ count: state.count - 1 }))

  isTopic: '',
  isName: '',
  isPassword: '',
  isRole: '0',
  topicChange: (topic) => set(() => ({ isTopic: topic })),
  nameChange: (name) => set(() => ({ isName: name })),
  passwordChange: (password) => set(() => ({ isPassword: password })),
  roleChange: (role) => set(() => ({ isRole: role })),

  isToggle: false,
  toggleHandler: () => set((state) => ({ isToggle: !state.isToggle }))
}));
