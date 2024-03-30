
<script lang="ts">
	import { onMount } from 'svelte';
    import type { SDRServer } from '$lib/servers';
    import DoubleRangeSlider from '$lib/DoubleRangeSlider.svelte';

    export let receivers : SDRServer[] = [];
    let frequencyRangeSlider : DoubleRangeSlider;
    let allReceivers : SDRServer[] = [];
    
    /*let fetchReceivers = async () => {
        await fetch('/api/v1/all')
            .then(res => res.json())
            .then(data => {
                console.log(data)
                receivers = data;
            })
            .catch(err => console.error(err));
        setTimeout(fetchReceivers, 10000)
    }
    onMount(() => {
        fetchReceivers();
    });*/
    let dummyReceivers = [
        {
            name: "HF",
            antenna: "HF",
            center_frequency: 15000000,
            bandwidth: 30000000,
            users: 1
        },
        {
            name: "Receiver 1",
            antenna: "Antenna 1",
            center_frequency: 10000000,
            bandwidth: 1000000,
            users: 1
        },
        {
            name: "Receiver 2",
            antenna: "Antenna 2",
            center_frequency: 20000000,
            bandwidth: 1000000,
            users: 2
        },
        {
            name: "Receiver 3",
            antenna: "Antenna 3",
            center_frequency: 30000000,
            bandwidth: 1000000,
            users: 3
        }
    ]
    allReceivers = dummyReceivers;

    let start = HzToValue(1000000), end = HzToValue(30000000);
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
        receivers = allReceivers.filter(receiver => {
            let receiver_low = receiver.center_frequency - (receiver.bandwidth / 2);
            let receiver_high = receiver.center_frequency + (receiver.bandwidth / 2);
            let intersect_low = Math.max(receiver_low, startMHz * 1000000);
            let intersect_high = Math.min(receiver_high, endMHz * 1000000);
            return intersect_low < intersect_high;
        });
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
    <div class="flex flex-row grid-cols-4 w-3/4">
        {#each receivers as receiver}
            <div class="flex p-2 w-1/4 items-center bg-gradient-to-r from-gray-800 to-black text-white">
                <div class="ml-2">
                    <div class="flex items-center h-6">
                        <div class="w-8 flex items-center justify-center">
                            <i class="fa-solid fa-house-circle-exclamation"></i>
                        </div>
                        <p class="ml-2">{receiver.name}</p>
                    </div>
                    <div class="flex items-center h-6">
                        <div class="w-8  flex items-center justify-center">
                            <i class="fa-solid fa-satellite-dish"></i>
                        </div>
                        <p class="ml-2">{receiver.antenna}</p>
                    </div>
                    <div class="flex items-center h-6">
                        <div class="w-8  flex items-center justify-center">
                            <i class="fa-solid fa-arrows-left-right"></i>
                        </div>
                        <p class="ml-2">{receiver.center_frequency - (receiver.bandwidth / 2)} - {(receiver.center_frequency + (receiver.bandwidth / 2)) / 1000} kHz</p>
                    </div>
                    <div class="flex items-center h-6">
                        <div class="w-8 flex items-center justify-center">
                            <i class="fa-regular fa-user"></i>
                        </div>
                        <p class="ml-2">{receiver.users}</p>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>