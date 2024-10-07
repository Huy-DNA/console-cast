import { createGlobalState } from '@vueuse/core';

export const useUserStore = createGlobalState(() => {
  const { clearUmask } = useUmaskStore();
  const username = ref(window?.localStorage?.getItem('username') || 'guest');
  onMounted(async () => {
    if (username.value === 'guest') {
      await useFetch('/api/auth/login', {
        method: 'post',
        body: {
          name: username.value,
        },
        credentials: 'include',
      });
    }
  });
  const userId = ref(null);
  const groupId = ref(null);
  const createdAt = ref(null);
  function switchUser (name: string) {
    username.value = name;
    localStorage.setItem('username', name);
    clearUmask();
  }
  watch(username, async () => {
    const meta = (await useFetch('/api/users', {
      method: 'get',
      query: { name: username.value },
      credentials: 'include',
    }))?.data?.value?.ok?.data;
    if (!meta) {
      username.value = 'guest';
      return;
    }
    userId.value = meta.userId;
    groupId.value = meta.groupId;
    createdAt.value = meta.createdAt;
  });
  return {
    username,
    switchUser,
    userId,
    groupId,
    createdAt,
  };
});
