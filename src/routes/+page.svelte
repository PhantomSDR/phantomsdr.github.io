<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    onMount(() => {
        goto('/servers');
    });
</script>
<a href="/servers">Servers</a>