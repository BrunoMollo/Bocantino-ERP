<script lang="ts">
	import type { DocumentType } from '$lib/server/db/schema';

	export let doc: {
		number: string;
		second_number: string | null;
		issue_date: Date | null;
		type: DocumentType;
	};
	export let entry_id: number;
</script>

{#if doc.type != 'Remito & Factura'}
	<p>
		<span class="font-bold">Numero de {doc.type}: </span>
		{doc.number}
	</p>

	{#if doc.issue_date}
		<p class="mb-5">
			<span class="font-bold">Fecha de emision: </span>{doc.issue_date.toLocaleDateString('es')}
		</p>
	{/if}

	{#if doc.type === 'Remito'}
		<a
			class="absolute right-0 h-fit w-46 variant-filled lg:px-4 lg:py-2 px-2 py-1 mr-8 rounded-md"
			href={`/bocantino/insumos-ingresados/${entry_id}/add-invoice`}
		>
			Agregar Factura
		</a>
	{/if}
{:else}
	<p>
		<span class="font-bold">Numero de Remito: </span>
		{doc.number}
	</p>

	<p>
		<span class="font-bold">Numero de Factura: </span>
		{doc.second_number}
	</p>

	{#if doc.issue_date}
		<p class="mb-5">
			<span class="font-bold"
				>Fecha de emision de Factura:
			</span>{doc.issue_date.toLocaleDateString('es')}
		</p>
	{/if}
{/if}
