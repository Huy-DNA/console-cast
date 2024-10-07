import { createGlobalState } from '@vueuse/core';
import { VirtualPath } from '~/lib/path';

export const useCwdStore = createGlobalState(() => {
  const homeDir = VirtualPath.homeDir(window?.localStorage.getItem('username') || 'guest');
  const cwd = ref(homeDir);
  function switchCwd (newDir: string) {
    cwd.value = cwd.value.resolve(newDir);
  }
  return {
    cwd,
    switchCwd,
  };
});
