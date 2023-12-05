<script lang="ts">
	import { createForm } from 'zod-actions';
	import type { ActionData, PageData } from './$types';
	import { tipoMateriaPrima_schema } from '../../tipoMateriaPrima_schema.js';
	import MateriaPrimaForm from '../../MateriaPrimaForm.svelte';

	export let data: PageData;
	export let form: ActionData;
	const zodAction = createForm(tipoMateriaPrima_schema, form);
</script>

<div class="card p-6">
	<h2 class="h2">Alta Tipo Materia Prima</h2>
	<MateriaPrimaForm {zodAction} btnMsj="Editar" value={data.tipoMateriaPrima} />
</div>
