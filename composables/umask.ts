import { createGlobalState } from '@vueuse/core';

export const useUmaskStore = createGlobalState(() => {
  const umask = ref(window?.localStorage?.getItem('umask') || '000111111010');
  function changeUmask (newUmask: string & { length: 12 } & { [index: number]: '0' | '1' }) {
    umask.value = newUmask;
    localStorage.setItem('umask', newUmask);
  }
  function clearUmask () {
    umask.value = '000111111010';
    localStorage.setItem('umask', umask.value);
  }
  return {
    umask,
    changeUmask,
    clearUmask,
  };
});
