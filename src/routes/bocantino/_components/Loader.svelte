<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' = 'lg';
	export let showText = true;

	const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
		sm: 'w-8 h-8',
		md: 'w-12 h-12',
		lg: 'w-16 h-16'
	};

	const textSizes: Record<'sm' | 'md' | 'lg', string> = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg'
	};
</script>

<div class="flex flex-col items-center gap-4">
	<div class="relative {sizeClasses[size]}">
		<!-- Spinning ring -->
		<div class="absolute inset-0 border-4 border-primary-200-700-token rounded-full"></div>
		<div
			class="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"
		></div>

		<!-- Center logo -->
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="w-1/2 h-1/2 bg-primary-500 rounded-lg flex items-center justify-center">
				<i class="bx bx-store text-white text-xs"></i>
			</div>
		</div>
	</div>

	{#if showText}
		<div class="text-center">
			<p class="font-medium text-surface-700-300-token {textSizes[size]}">Cargando...</p>
			<p class="text-sm text-surface-500-400-token">Bocantino ERP</p>
		</div>
	{/if}
</div>

<style>
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
