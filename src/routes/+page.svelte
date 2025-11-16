<script lang="ts">
	// Example initial data
	let rows = $state<Array<{ id: string | number; name: string; age: string | number }>>([
		{ id: 1, name: 'Alice', age: 25 },
		{ id: 2, name: 'Bob', age: 30 }
	]);

	// Add an empty row
	function addRow() {
		rows = [...rows, { id: "", name: "", age: "" }];
	}

	// Remove a row
	function removeRow(index: number) {
		rows = rows.filter((_, i) => i !== index);
	}

	// Build SQL for a row (example: INSERT)
	function buildSQL(row: { id: string | number; name: string; age: string | number }) {
		// Escape single quotes for safety (minimal example)
		const esc = (v: string | number) => String(v).replace(/'/g, "''");
		return `
INSERT INTO users (id, name, age)
VALUES ('${esc(row.id)}', '${esc(row.name)}', '${esc(row.age)}');
		`.trim();
	}

	let copySuccess = $state(false);

	async function copyAllSQL() {
		const allSQL = rows.map(row => buildSQL(row)).join('\n\n');
		
		try {
			await navigator.clipboard.writeText(allSQL);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	// Query execution
	let query = $state('SELECT @@SERVERNAME');
	let queryResults: any = $state(null);
	let executing = $state(false);
	let autoRefresh = $state(false);
	let refreshInterval: number | null = $state(null);

	async function executeQuery() {
		executing = true;
		try {
			const response = await fetch('/api/execute-query', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ query })
			});

			const result = await response.json();
			queryResults = result;
		} catch (error) {
			queryResults = {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		} finally {
			executing = false;
		}
	}

	function toggleAutoRefresh() {
		autoRefresh = !autoRefresh;
		
		if (autoRefresh) {
			executeQuery(); // Execute immediately
			refreshInterval = window.setInterval(executeQuery, 3000); // Then every 3 seconds
		} else {
			if (refreshInterval) {
				clearInterval(refreshInterval);
				refreshInterval = null;
			}
		}
	}

	// Execute query on mount (only if we want to)
	$effect(() => {
		// Don't auto-execute on mount to avoid errors if DB isn't configured
		// executeQuery();
	});
</script>

<div class="split-layout">
	<!-- Top Section: Grid -->
	<div class="grid-section">
		<div class="header-actions">
			<h2>User Grid</h2>
			<button class="copy-all-btn" onclick={copyAllSQL}>
				{copySuccess ? '✓ Copied!' : '📋 Copy All SQL'}
			</button>
		</div>

		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>EXP_ID</th>
						<th>SEQ_NO</th>
						<th>DEFAULT_VALUE</th>
						<th>SQL Statement</th>
						<th></th>
					</tr>
				</thead>

				<tbody>
					{#each rows as row, i}
						<tr>
							<td><input type="text" bind:value={row.id} /></td>
							<td><input type="text" bind:value={row.name} /></td>
							<td><input type="number" bind:value={row.age} /></td>

							<td>
								<pre>{buildSQL(row)}</pre>
							</td>

						<td>
							<button onclick={() => removeRow(i)}>✕</button>
						</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<button class="add-row-btn" onclick={addRow}>Add Row</button>
	</div>

	<!-- Bottom Section: Query Results -->
	<div class="query-section">
		<div class="query-header">
			<h2>Live Query Results</h2>
			<div class="query-controls">
				<button class="toggle-refresh-btn" onclick={toggleAutoRefresh}>
					{autoRefresh ? '⏸ Pause Auto-Refresh' : '▶ Auto-Refresh (3s)'}
				</button>
				<button class="execute-btn" onclick={executeQuery} disabled={executing}>
					{executing ? 'Executing...' : '⚡ Execute'}
				</button>
			</div>
		</div>

		<div class="query-input">
			<textarea 
				bind:value={query} 
				placeholder="Enter SQL query..."
				rows="3"
			></textarea>
		</div>

		<div class="results-container">
			{#if executing}
				<div class="loading">Executing query...</div>
			{:else if queryResults}
				{#if queryResults.success}
					{#if queryResults.data && queryResults.data.length > 0}
						<div class="result-info">
							<span>Rows: {queryResults.data.length}</span>
							<span>Execution time: {queryResults.executionTime}ms</span>
						</div>
						<div class="results-table-container">
							<table class="results-table">
								<thead>
									<tr>
										{#each Object.keys(queryResults.data[0]) as column}
											<th>{column}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each queryResults.data as row}
										<tr>
											{#each Object.values(row) as value}
												<td>{value}</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="no-results">Query executed successfully (no rows returned)</div>
					{/if}
				{:else}
					<div class="error-message">
						<strong>Error:</strong> {queryResults.error}
						{#if queryResults.error.includes('Database not configured')}
							<p style="margin-top: 1rem;">
								<a href="/db-config" style="color: #ff6347; text-decoration: underline;">
									Go to DB Config to set up your database connection
								</a>
							</p>
						{/if}
					</div>
				{/if}
			{:else}
				<div class="no-results">
					Enter a SQL query and click Execute to see results
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	:global(body) {
		color: #ff6347;
	}

	.split-layout {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 120px);
		gap: 1.5rem;
	}

	.grid-section {
		flex: 0 0 45%;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.query-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		background: #1a1a1a;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 4px 20px rgba(255, 69, 0, 0.15);
		border: 1px solid rgba(255, 69, 0, 0.2);
	}

	.header-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		gap: 1rem;
	}

	.query-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.query-controls {
		display: flex;
		gap: 0.5rem;
	}

	h2 {
		color: #ff6347;
		text-shadow: 0 0 10px rgba(255, 69, 0, 0.3);
		margin: 0;
	}

	.copy-all-btn,
	.add-row-btn,
	.execute-btn,
	.toggle-refresh-btn {
		background: #ff4500;
		color: #000;
		border: 1px solid rgba(255, 69, 0, 0.5);
		padding: 10px 20px;
		border-radius: 4px;
		font-weight: 600;
		transition: all 0.3s;
		box-shadow: 0 0 10px rgba(255, 69, 0, 0.3);
		cursor: pointer;
		white-space: nowrap;
	}

	.copy-all-btn:hover,
	.add-row-btn:hover,
	.execute-btn:hover:not(:disabled),
	.toggle-refresh-btn:hover {
		background: #ff6347;
		box-shadow: 0 0 15px rgba(255, 69, 0, 0.5);
		transform: translateY(-1px);
	}

	.copy-all-btn:active,
	.add-row-btn:active,
	.execute-btn:active,
	.toggle-refresh-btn:active {
		transform: translateY(0);
	}

	.execute-btn:disabled,
	button:disabled {
		background: #3a3a3a;
		color: #666;
		border-color: #2a2a2a;
		box-shadow: none;
		cursor: not-allowed;
		transform: none;
	}

	.add-row-btn {
		margin-top: 1rem;
		width: fit-content;
	}

	.table-container {
		flex: 1;
		overflow: auto;
		min-height: 0;
		border-radius: 8px;
	}

	table { 
		border-collapse: collapse; 
		width: 100%;
		background: #1a1a1a;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(255, 69, 0, 0.15);
	}
	
	th, td { 
		border: 1px solid rgba(255, 69, 0, 0.3);
		padding: 12px;
		color: #ff6347;
	}

	th {
		background: #0a0a0a;
		font-weight: 600;
		text-transform: uppercase;
		font-size: 0.85rem;
		letter-spacing: 0.5px;
	}

	td {
		background: #1a1a1a;
	}

	tr:hover td {
		background: rgba(255, 69, 0, 0.05);
	}

	input { 
		width: 100%;
		background: #0a0a0a;
		border: 1px solid rgba(255, 69, 0, 0.2);
		padding: 6px;
		color: #ff6347;
		border-radius: 4px;
		transition: all 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #ff6347;
		box-shadow: 0 0 5px rgba(255, 69, 0, 0.3);
	}

	input::placeholder {
		color: rgba(255, 99, 71, 0.4);
	}

	pre { 
		margin: 0; 
		font-size: 0.75rem;
		color: #ff8c7a;
		background: #0a0a0a;
		padding: 8px;
		border-radius: 4px;
		border: 1px solid rgba(255, 69, 0, 0.2);
		max-width: 300px;
		overflow-x: auto;
	}

	button { 
		cursor: pointer;
		background: #ff4500;
		color: #000;
		border: 1px solid rgba(255, 69, 0, 0.5);
		padding: 8px 16px;
		border-radius: 4px;
		font-weight: 600;
		transition: all 0.3s;
		box-shadow: 0 0 10px rgba(255, 69, 0, 0.3);
	}

	button:hover {
		background: #ff6347;
		box-shadow: 0 0 15px rgba(255, 69, 0, 0.5);
		transform: translateY(-1px);
	}

	button:active {
		transform: translateY(0);
	}

	/* Query Section Styles */
	.query-input {
		margin-bottom: 1rem;
	}

	textarea {
		width: 100%;
		background: #0a0a0a;
		border: 1px solid rgba(255, 69, 0, 0.3);
		border-radius: 4px;
		padding: 0.75rem;
		color: #ff6347;
		font-family: 'Courier New', monospace;
		font-size: 0.95rem;
		resize: vertical;
		min-height: 80px;
		transition: all 0.2s;
	}

	textarea:focus {
		outline: none;
		border-color: #ff6347;
		box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.2);
		background: #121212;
	}

	textarea::placeholder {
		color: rgba(255, 99, 71, 0.4);
	}

	.results-container {
		flex: 1;
		overflow: auto;
		min-height: 0;
	}

	.loading,
	.no-results,
	.error-message {
		padding: 2rem;
		text-align: center;
		color: #ff8c7a;
		font-size: 1rem;
	}

	.error-message {
		color: #ff4444;
		background: rgba(255, 0, 0, 0.1);
		border-radius: 4px;
		border: 1px solid rgba(255, 0, 0, 0.3);
	}

	.result-info {
		display: flex;
		gap: 2rem;
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: rgba(255, 69, 0, 0.05);
		border-radius: 4px;
		color: #ff8c7a;
		font-size: 0.9rem;
	}

	.results-table-container {
		overflow: auto;
		border-radius: 4px;
	}

	.results-table {
		width: 100%;
		border-collapse: collapse;
		background: #0a0a0a;
	}

	.results-table th,
	.results-table td {
		border: 1px solid rgba(255, 69, 0, 0.3);
		padding: 10px;
		color: #ff6347;
		text-align: left;
	}

	.results-table th {
		background: rgba(255, 69, 0, 0.1);
		font-weight: 600;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.results-table tbody tr:hover {
		background: rgba(255, 69, 0, 0.05);
	}

	/* Scrollbar styling */
	.table-container::-webkit-scrollbar,
	.results-container::-webkit-scrollbar,
	.results-table-container::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}

	.table-container::-webkit-scrollbar-track,
	.results-container::-webkit-scrollbar-track,
	.results-table-container::-webkit-scrollbar-track {
		background: #0a0a0a;
		border-radius: 4px;
	}

	.table-container::-webkit-scrollbar-thumb,
	.results-container::-webkit-scrollbar-thumb,
	.results-table-container::-webkit-scrollbar-thumb {
		background: rgba(255, 69, 0, 0.3);
		border-radius: 4px;
	}

	.table-container::-webkit-scrollbar-thumb:hover,
	.results-container::-webkit-scrollbar-thumb:hover,
	.results-table-container::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 69, 0, 0.5);
	}
</style>
