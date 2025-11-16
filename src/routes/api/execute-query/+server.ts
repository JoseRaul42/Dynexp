import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from 'mssql';

// You might want to load this from environment variables or a config file
// For now, we'll try to use a connection if configured
let pool: sql.ConnectionPool | null = null;

async function getPool() {
	if (pool && pool.connected) {
		return pool;
	}

	// Check if database is configured
	if (!process.env.DB_SERVER && !process.env.DB_PASSWORD) {
		throw new Error('Database not configured. Please configure your database connection in the DB Config page.');
	}

	// Try to get config from environment or use defaults
	const config: sql.config = {
		server: process.env.DB_SERVER || 'localhost',
		port: parseInt(process.env.DB_PORT || '1433'),
		database: process.env.DB_DATABASE || 'master',
		user: process.env.DB_USER || 'sa',
		password: process.env.DB_PASSWORD || '',
		options: {
			encrypt: process.env.DB_ENCRYPT === 'true',
			trustServerCertificate: process.env.DB_TRUST_CERT === 'true' || true,
			enableArithAbort: true
		},
		connectionTimeout: 15000,
		requestTimeout: 30000
	};

	pool = await sql.connect(config);
	return pool;
}

export const POST: RequestHandler = async ({ request }) => {
	const startTime = Date.now();
	
	try {
		const { query } = await request.json();

		if (!query || typeof query !== 'string') {
			return json(
				{
					success: false,
					error: 'Invalid query provided'
				},
				{ status: 400 }
			);
		}

		const pool = await getPool();
		const result = await pool.request().query(query);

		const executionTime = Date.now() - startTime;

		return json({
			success: true,
			data: result.recordset,
			rowsAffected: result.rowsAffected,
			executionTime
		});
	} catch (error) {
		console.error('Query execution error:', error);
		
		const executionTime = Date.now() - startTime;
		
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
				executionTime
			},
			{ status: 500 }
		);
	}
};


