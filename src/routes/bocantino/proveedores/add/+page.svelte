<script lang="ts">
	import SupplierForm from '../_components/SupplierForm.svelte';

	export let data;
</script>

<article class="card p-4">
	<h2 class="h2">Alta Proveedor</h2>
	<SupplierForm {data} ingridientsAvailables={data.ingredients} />
</article>
