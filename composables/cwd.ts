import path from 'path';
import { createInjectionState } from '@vueuse/core';
import { VirtualPath } from '~/lib/path';

const [useProvideCwdStore, _useCwdStore] = createInjectionState(() => {
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

export { useProvideCwdStore };
export function useCwdStore() {
  const cwdStore = _useCwdStore();
  if (cwdStore == null)
    throw new Error('Please call `useProvideCwdStore` on the appropriate parent component');
  return cwdStore;
}
