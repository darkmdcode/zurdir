
import React from 'react';

export default function Error({ statusCode }) {
	return (
		<div style={{ textAlign: 'center', marginTop: '10vh' }}>
			<h1>{statusCode ? `${statusCode} - An error occurred` : 'An error occurred'}</h1>
			<p>Sorry, something went wrong.</p>
		</div>
	);
}

