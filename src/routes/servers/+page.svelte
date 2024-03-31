
<script lang="ts">
	import { onMount } from 'svelte';
    import type { SDRServer } from '$lib/servers';
    import DoubleRangeSlider from '$lib/DoubleRangeSlider.svelte';

    type Receiver = {
        server: SDRServer,
        elem: HTMLElement,
        visible: boolean
    }

    export let receivers : Receiver[] = [];
    let frequencyRangeSlider : DoubleRangeSlider;
    
    const apiUrl = 'https://phantomsdr.duckdns.org';

    let fetchReceivers = async () => {
        await fetch(`${apiUrl}/api/v1/all`)
            .then(res => res.json())
            .then(data => {
                data.sort((a : SDRServer, b : SDRServer) => {
                    return b.users - a.users;
                });
                receivers = data.map((server : SDRServer) => {
                    return {
                        server: server,
                        visible: true
                    }
                })
            })
            .catch(err => console.error(err));
        filterReceivers();
        setTimeout(fetchReceivers, 60000)
    }
    onMount(() => {
        fetchReceivers();
    });

    let start = HzToValue(1000000), end = HzToValue(3000000000);
    let startMHz = 1, endMHz = 30;
    $: handleRangeChange(start, end);
    function valueToHz(value : number) {
        return Math.pow(10, (value + 0.85) * 6.3);
    }
    function HzToValue(hz : number) {
        return Math.log10(hz) / 6.3 - 0.85;
    }
    function handleRangeChange(start : number, end : number) {
        startMHz = valueToHz(start) / 1000000;
        endMHz = valueToHz(end) / 1000000;
        filterReceivers();
    }

    function filterReceivers() {
        for(let receiver of receivers) {
            let server = receiver.server;
            let receiver_low = server.base_frequency
            let receiver_high = server.base_frequency + server.bandwidth;
            let intersect_low = Math.max(receiver_low, startMHz * 1000000);
            let intersect_high = Math.min(receiver_high, endMHz * 1000000);
            if (intersect_low < intersect_high) {
                receiver.visible = true;
            } else {
                receiver.visible = false;
            }
        }
        receivers = receivers;
    }
</script>

<style lang="postcss">
    :global(body) {
      @apply bg-slate-900;
    }
  </style>

<div class="flex items-center justify-center flex-col">
    <div class="mb-2">
        <span class="text-2xl text-white">Receiver List</span>
    </div>
    <div class="m-2 w-3/4">
        <DoubleRangeSlider bind:start bind:end/>
    </div>
    <div class="m-2 text-white">
        <input type="text" value="{startMHz.toFixed(3)}" class="w-20 bg-gray-800 text-center"/>MHz
        <span class="text-white mx-2">-</span>
        <input type="text" value="{endMHz.toFixed(3)}" class="w-20 bg-gray-800 text-center"/>MHz
    </div>
    <div class="grid grid-cols-4 gap-4 justify-start w-3/4">
        {#each receivers as {server, elem, visible}}
            <a class="flex p-2 bg-gradient-to-r from-gray-800
                        hover:from-gray-700 hover:to-gray-900
                        border border-white rounded-md to-black
                        transition-all transition-visibility
                        duration-100 ease-in-out
                        {visible ? 'opacity-100 visible' : 'opacity-0 hidden'}
                        text-sm text-white"
                        href="{server.url}"
                        bind:this={elem}>
                <div class="ml-2">
                    <div class="flex items-center h-6">
                        <div class="w-8 flex items-center justify-center">
                            <i class="fa-solid fa-house-circle-exclamation"></i>
                        </div>
                        <p class="ml-2">{server.name}</p>
                    </div>
                    <div class="flex items-center h-6">
                        <div class="w-8  flex items-center justify-center">
                            <i class="fa-solid fa-satellite-dish"></i>
                        </div>
                        <p class="ml-2">{server.antenna}</p>
                    </div>
                    <div class="flex items-center h-6">
                        <div class="w-8  flex items-center justify-center">
                            <i class="fa-solid fa-arrows-left-right"></i>
                        </div>
                        <p class="ml-2">{(server.base_frequency/1000000).toFixed(3)} - {((server.base_frequency + server.bandwidth)/1000000).toFixed(3)} MHz</p>
                    </div>
                    <div class="flex items-center h-6">
                        <div class="w-8 flex items-center justify-center">
                            <i class="fa-regular fa-user"></i>
                        </div>
                        <p class="ml-2">{server.users}</p>
                    </div>
                    <div class="flex items-center h-6">
                        <div class="w-8 flex items-center justify-center">
                            <i class="fa-solid fa-link"></i>
                        </div>
                        <p class="ml-2">{server.url}</p>
                    </div>
                </div>
            </a>
        {/each}
    </div>
</div>