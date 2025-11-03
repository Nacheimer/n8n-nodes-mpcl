import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MercadoPublicoApi implements ICredentialType {
	name = 'mercadoPublicoApi';
	displayName = 'Mercado Público API';
	documentationUrl = 'https://api.mercadopublico.cl/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			required: true,
			description: 'API key for Mercado Público API (ticket parameter).',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				'ticket': '={{$credentials.apiKey}}'
			}
		},
	};
}
