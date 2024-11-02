import path from 'path-browserify';
import { createGlobalState } from '@vueuse/core';
import { VirtualPath } from '~/lib/path';

export const useCwdStore = createGlobalState(() => {
  const homeDir = VirtualPath.homeDir('guest');
  const cwd = ref(homeDir);
  function switchCwd(newDir: string) {
    let newPath = cwd.value;
    if (path.isAbsolute(newDir)) {
      newPath = VirtualPath.createAndCheck(newDir);
    } else {
      newPath = VirtualPath.create(path.resolve(newPath.toString(), newDir));
    }
    cwd.value = newPath;
  }
  return {
    cwd,
    switchCwd,
  };
});
