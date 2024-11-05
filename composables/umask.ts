import { createGlobalState } from '@vueuse/core';

export const useUmaskStore = createGlobalState(() => {
  const umask = ref(window?.localStorage?.getItem('umask') || '002');
  function changeUmask(newUmask: string) {
    umask.value = newUmask;
  }
  function clearUmask() {
    umask.value = '002';
  }
  return {
    umask,
    changeUmask,
    clearUmask,
  };
});
