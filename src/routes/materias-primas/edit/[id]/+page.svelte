<script lang="ts">
	import { createForm } from 'zod-actions';
	import type { ActionData, PageData } from './$types';
	import MateriaPrimaForm from '../../MateriaPrimaForm.svelte';
	import { ingredient_schema } from '../../ingredient_schema';

	export let data: PageData;
	export let form: ActionData;
	const zodAction = createForm(ingredient_schema, form);
</script>

<div class="card p-6">
	<h2 class="h2">Editar Tipo Materia Prima</h2>
	<MateriaPrimaForm {zodAction} btnMsj="Editar" value={data.tipoMateriaPrima} />
</div>
