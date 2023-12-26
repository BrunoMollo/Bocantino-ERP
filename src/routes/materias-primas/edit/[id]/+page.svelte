<script lang="ts">
	import MateriaPrimaForm from '../../_components/MateriaPrimaForm.svelte';

	export let data;
</script>

<div class="card p-6">
	<h2 class="h2">Editar Tipo Materia Prima</h2>
	<MateriaPrimaForm {data} ingredients={data.ingredients} btnMsj="Editar" />
</div>
