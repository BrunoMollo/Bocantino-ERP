<script lang="ts">
	import { createForm } from 'zod-actions';
	import MateriaPrimaForm from '../../_components/MateriaPrimaForm.svelte';
	import { ingredient_schema } from '../../ingredient_schema';

	export let data;
	export let form;
	const zodAction = createForm(ingredient_schema, form);
</script>

<div class="card p-6">
	<h2 class="h2">Editar Tipo Materia Prima</h2>
	<MateriaPrimaForm {zodAction} btnMsj="Editar" value={data.ingredient} />
</div>

