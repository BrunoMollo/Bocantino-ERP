<script lang="ts">
	import ProductForm from '../_shared/ProductsForm.svelte';

	export let data;
</script>

<article class="card p-4">
	<h2 class="h2">Alta Productos</h2>
	<ProductForm {data} availableIngredients={data.ingredients}></ProductForm>
</article>

