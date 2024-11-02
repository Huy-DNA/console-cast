import { createGlobalState } from '@vueuse/core';

export const useUserStore = createGlobalState(() => {
  const username = ref('');
  const userId = ref(null);
  const groupId = ref(null);
  const createdAt = ref(null);
  onMounted(() => username.value = 'guest');
  async function switchUser(name: string, password: string | undefined) {
    username.value = name;
    await useFetch('/api/auth/login', {
      method: 'post',
      body: { name, password },
      credentials: 'include',
    });
  }
  watch(username, async () => {
    await switchUser(username.value, undefined);
    const meta = (await useFetch('/api/users', {
      method: 'get',
      query: { name: username.value },
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
