<script lang="ts">
	let config = $state({
		server: 'localhost',
		port: 1433,
		database: '',
		user: '',
		password: '',
		encrypt: false,
		trustServerCertificate: true
	});

	let testResult = $state<{
		success: boolean;
		message: string;
	} | null>(null);

	let testing = $state(false);

	async function testConnection() {
		testing = true;
		testResult = null;

		try {
			const response = await fetch('/db-config/test', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(config)
			});

			const result = await response.json();
			testResult = result;
		} catch (error) {
			testResult = {
				success: false,
				message: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		} finally {
			testing = false;
		}
	}
</script>

<div class="db-config-container">
	<h1>Database Configuration</h1>
	<p class="subtitle">Configure your MSSQL database connection</p>

	<form class="config-form" on:submit|preventDefault={testConnection}>
		<div class="form-group">
			<label for="server">Server</label>
			<input
				id="server"
				type="text"
				bind:value={config.server}
				placeholder="localhost or server IP"
				required
			/>
		</div>

		<div class="form-group">
			<label for="port">Port</label>
			<input
				id="port"
				type="number"
				bind:value={config.port}
				placeholder="1433"
				required
			/>
		</div>

		<div class="form-group">
			<label for="database">Database</label>
			<input
				id="database"
				type="text"
				bind:value={config.database}
				placeholder="Database name"
				required
			/>
		</div>

		<div class="form-group">
			<label for="user">Username</label>
			<input
				id="user"
				type="text"
				bind:value={config.user}
				placeholder="Database user"
				required
			/>
		</div>

		<div class="form-group">
			<label for="password">Password</label>
			<input
				id="password"
				type="password"
				bind:value={config.password}
				placeholder="Database password"
				required
			/>
		</div>

		<div class="form-group checkbox-group">
			<label>
				<input type="checkbox" bind:checked={config.encrypt} />
				Encrypt connection
			</label>
			<span class="help-text">Enable for Azure SQL or encrypted connections</span>
		</div>

		<div class="form-group checkbox-group">
			<label>
				<input type="checkbox" bind:checked={config.trustServerCertificate} />
				Trust server certificate (recommended for local SQL Server)
			</label>
			<span class="help-text">Enable this for local SQL Server instances or self-signed certificates</span>
		</div>

		<button type="submit" class="test-button" disabled={testing}>
			{testing ? 'Testing...' : 'Test Connection'}
		</button>

		{#if testResult}
			<div class="result {testResult.success ? 'success' : 'error'}">
				<strong>{testResult.success ? '✓ Success' : '✗ Failed'}</strong>
				<p>{testResult.message}</p>
			</div>
		{/if}
	</form>
</div>

<style>
	.db-config-container {
		max-width: 600px;
		margin: 0 auto;
	}

	h1 {
		color: #ff6347;
		margin-bottom: 0.5rem;
		text-shadow: 0 0 10px rgba(255, 69, 0, 0.3);
	}

	.subtitle {
		color: #ff8c7a;
		margin-bottom: 2rem;
	}

	.config-form {
		background: #1a1a1a;
		background-image: 
			repeating-linear-gradient(
				45deg,
				transparent,
				transparent 10px,
				rgba(255, 69, 0, 0.02) 10px,
				rgba(255, 69, 0, 0.02) 20px
			);
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(255, 69, 0, 0.15);
		border: 1px solid rgba(255, 69, 0, 0.2);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #ff6347;
		font-weight: 500;
	}

	input[type='text'],
	input[type='password'],
	input[type='number'] {
		width: 100%;
		padding: 0.75rem;
		background: #0a0a0a;
		border: 1px solid rgba(255, 69, 0, 0.3);
		border-radius: 4px;
		font-size: 1rem;
		color: #ff6347;
		transition: all 0.2s;
	}

	input[type='text']:focus,
	input[type='password']:focus,
	input[type='number']:focus {
		outline: none;
		border-color: #ff6347;
		box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.2);
		background: #121212;
	}

	input[type='text']::placeholder,
	input[type='password']::placeholder,
	input[type='number']::placeholder {
		color: rgba(255, 99, 71, 0.4);
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		font-weight: normal;
		cursor: pointer;
		color: #ff6347;
	}

	.checkbox-group input[type='checkbox'] {
		width: auto;
		margin-right: 0.5rem;
		cursor: pointer;
		accent-color: #ff6347;
	}

	.test-button {
		width: 100%;
		padding: 0.75rem;
		background: #ff4500;
		color: #000;
		border: 2px solid rgba(255, 69, 0, 0.5);
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		box-shadow: 0 0 15px rgba(255, 69, 0, 0.3);
	}

	.test-button:hover:not(:disabled) {
		background: #ff6347;
		box-shadow: 0 0 25px rgba(255, 69, 0, 0.5);
		transform: translateY(-1px);
	}

	.test-button:disabled {
		background: #3a3a3a;
		color: #666;
		border-color: #2a2a2a;
		box-shadow: none;
		cursor: not-allowed;
	}

	.result {
		margin-top: 1.5rem;
		padding: 1rem;
		border-radius: 4px;
		border-left: 4px solid;
		background: #1a1a1a;
	}

	.result.success {
		border-color: #ff6347;
		color: #ff6347;
		box-shadow: 0 0 10px rgba(255, 69, 0, 0.2);
	}

	.result.error {
		border-color: #ff0000;
		color: #ff4444;
		box-shadow: 0 0 10px rgba(255, 0, 0, 0.2);
	}

	.result strong {
		display: block;
		margin-bottom: 0.5rem;
	}

	.result p {
		margin: 0;
		font-size: 0.9rem;
		color: #ff8c7a;
	}

	.help-text {
		display: block;
		font-size: 0.8rem;
		color: #ff8c7a;
		margin-top: 0.25rem;
		margin-left: 1.5rem;
		font-weight: normal;
		opacity: 0.8;
	}
</style>

