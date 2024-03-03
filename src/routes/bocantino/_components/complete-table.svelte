<script lang="ts">
	export let list: object[];
	export let rows: number;
</script>

{#if 10 - list.length > 0}
	{#each Array(10 - list.length) as _}
		<tr class="h-16">
			{#each Array(rows) as _}
				<td />
			{/each}
		</tr>
	{/each}
{/if}

