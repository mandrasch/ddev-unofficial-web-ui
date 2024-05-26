<div class="disclaimer-bar">
	🚧 Disclaimer: Early preview of a private project, work in progress 🚧
</div>

<header>
	<div class="header-inner">
		<!-- force full reload on click to let user reset the form -->
		<div class="logo-with-subline" data-sveltekit-reload>
			<a href="/" class="logo-container">
				<img src="/ddev.svg" alt="" />
			</a>
			<span class="subline">unofficial web UI experiment</span>
		</div>

		<nav>
			<a href="/">Project Configurator</a>
			<a href="/headless-setups">Headless Setups</a>
		</nav>
	</div>
</header>

<style>
	.disclaimer-bar {
		width: 100%;
		max-width: 100%;
		background-color: #fff3cd;
		margin: 0 auto;
		padding: 1rem 1rem;
		text-align: center;
		font-size: 0.9rem;
	}

	header {
		container-type: inline-size;
	}

	.header-inner {
		display: flex;
		width: 100%;
		justify-content: space-between;
		align-items: center;
		padding: 2rem 1rem;
		border-bottom: 1px solid #999;
		max-width: 1200px;
		margin: 0 auto;

		box-sizing: border-box;

		@container (max-width: 599px) {
			flex-direction: column;
			padding: 1rem;
		}
	}

	nav {
		display: flex;
		gap: 1rem;

		@container (max-width: 599px) {
			margin-top: 1rem;
			flex-direction: column;
		}
	}

	.logo-with-subline {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
	}
</style>
