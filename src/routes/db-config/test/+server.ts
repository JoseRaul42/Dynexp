import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from 'mssql';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const config = await request.json();

		// Build MSSQL config object
		const sqlConfig: sql.config = {
			server: config.server,
			port: config.port || 1433,
			database: config.database,
			user: config.user,
			password: config.password,
			options: {
				encrypt: config.encrypt ?? true,
				trustServerCertificate: config.trustServerCertificate ?? false,
				enableArithAbort: true
			},
			connectionTimeout: 15000,
			requestTimeout: 15000
		};

		// Attempt to connect
		const pool = await sql.connect(sqlConfig);
		
		// Test with a simple query
		await pool.request().query('SELECT 1 as test');
		
		// Close the connection
		await pool.close();

		return json({
			success: true,
			message: 'Successfully connected to the database!'
		});
	} catch (error) {
		console.error('Database connection error:', error);
		
		return json(
			{
				success: false,
				message: error instanceof Error ? error.message : 'Unknown error occurred'
			},
			{ status: 500 }
		);
	}
};

