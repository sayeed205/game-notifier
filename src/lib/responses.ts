import { VercelResponse } from '@vercel/node';

export function badRequest(res: VercelResponse, text = 'Bad Request') {
    res.status(400).json(text);
}

export const ok = (res: VercelResponse, text = 'Ok') => {
    res.status(200).json(text);
};
