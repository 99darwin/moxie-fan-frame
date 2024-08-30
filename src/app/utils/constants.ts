import dotenv from 'dotenv';

dotenv.config();

export const getEnvVar = (variableName: string) => {
    const variable = process.env[variableName] || '';
    if (!variable) {
        throw new Error(`Environment variable ${variableName} is not set.`);
    }
    return variable;
};

export const NEYNAR_API_KEY: string = getEnvVar('NEYNAR_API_KEY') as string;
export const BASE_URL: string = getEnvVar('BASE_URL') as string;