<script>
</script>

<span class="loader"></span>

<style>
	.loader {
		display: inline-block;
		position: relative;
		transform: scale(var(--scale, 1));
	}
	.loader::after,
	.loader::before {
		content: '';
		box-sizing: border-box;
		width: var(--size, 55px);
		height: var(--size, 55px);
		border-radius: 50%;
		border: 2px solid #fff;
		position: absolute;
		left: calc(-1 * var(--size, 55px) / 2);
		top: 0;
		animation: animloader 2s linear infinite;
	}
	.loader::after {
		animation-delay: 1s;
	}

	@keyframes animloader {
		0% {
			transform: scale(0);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 0;
		}
	}
</style>
