import { createGlobalState } from '@vueuse/core';

export const useUmaskStore = createGlobalState(() => {
  const umask = ref(window?.localStorage?.getItem('umask') || '000000000010');
  function changeUmask(newUmask: string & { length: 12 } & { [index: number]: '0' | '1' }) {
    umask.value = newUmask;
  }
  function clearUmask() {
    umask.value = '000000000010';
  }
  return {
    umask,
    changeUmask,
    clearUmask,
  };
});
