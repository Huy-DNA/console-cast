import path from 'path';
import { createInjectionState } from '@vueuse/core';

const [useProvideCwdStore, _useCwdStore] = createInjectionState((username: string) => {
  const homeDir = `/home/${username}`;
  const cwd = ref(homeDir);
  function switchCwd(newDir: string) {
    let newPath = cwd.value;
    if (path.isAbsolute(newDir)) {
      newPath = newDir;
    } else {
      newPath = path.resolve(newPath, newDir);
    }
    cwd.value = newPath;
  }
  function formatCwd(): string {
    if (cwd.value.startsWith(homeDir)) {
      
    }
  }
  return {
    cwd,
    switchCwd,
  };
});

export { useProvideCwdStore };
export function useCwdStore() {
  const userStore = _useCwdStore();
  if (userStore == null)
    throw new Error('Please call `useProvideCwdStore` on the appropriate parent component');
  return userStore;
}
