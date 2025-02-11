import { NextResponse } from 'next/server';
import { snapshot } from '@webcontainer/snapshot';
import path from 'path';
import fs from 'fs/promises';

export async function GET() {
    try {
        const projectRoot = path.join(process.cwd(), '../../project/portfolio');
        const snapshotBuffer = await snapshot(projectRoot);
        
        return new NextResponse(snapshotBuffer, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename="snapshot.tar"'
            }
        });
    } catch (error) {
        console.error('Error getting project files:', error);
        return NextResponse.json({ error: 'Failed to get project files' }, { status: 500 });
    }
}
