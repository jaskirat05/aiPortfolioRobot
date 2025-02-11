"use client"
import {WebContainer} from '@webcontainer/api'
import { useRef, useEffect, useState } from 'react';

const LivePreview = () => {
    const webcontainerInstance = useRef<WebContainer | null>(null);
    const iframeEl = useRef<HTMLIFrameElement>(null);
    const [status, setStatus] = useState<string>('Initializing...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function startWebContainer() {
            try {
                setStatus('Booting WebContainer...');
                console.log('🚀 Booting WebContainer...');
                webcontainerInstance.current = await WebContainer.boot({
                    coep: "none",
                    workdirName: "portfolio"
                });
                console.log('✅ WebContainer booted successfully');
                
                setStatus('Fetching project files...');
                console.log('📦 Fetching project files...');
                const response = await fetch('/api/get-project-files');
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ API Error:', errorText);
                    throw new Error(`Failed to fetch project files: ${response.status} ${response.statusText}`);
                }
                
                setStatus('Processing project files...');
                console.log('🔄 Processing project files...');
                const arrayBuffer = await response.arrayBuffer();
                console.log('📊 File size:', arrayBuffer.byteLength, 'bytes');
                
                setStatus('Mounting files in WebContainer...');
                console.log('📥 Mounting files in WebContainer...');
                await webcontainerInstance.current.mount(arrayBuffer);
                console.log('✅ Files mounted successfully');

                // Create or update .env.local with Clerk configuration
                await webcontainerInstance.current.fs.writeFile(
                    '.env.local',
                    `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
CLERK_SECRET_KEY=${process.env.CLERK_SECRET_KEY}
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_IFRAMEABLE=true`
                );
                
                await startDevServer();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('❌ WebContainer Error:', errorMessage);
                setError(errorMessage);
                setStatus('Failed to start');
            }
        }

        async function startDevServer() {
            if (!webcontainerInstance.current) {
                console.error('❌ WebContainer instance not found');
                return;
            }
            
            try {
                setStatus('Installing dependencies...');
                console.log('📦 Running npm install...');
                const installProcess = await webcontainerInstance.current.spawn('npm', ['install']);
                
                installProcess.output.pipeTo(new WritableStream({
                    write(chunk) {
                        console.log('📦 [npm install]:', chunk);
                    }
                }));
                
                const installExitCode = await installProcess.exit;
                
                if (installExitCode !== 0) {
                    throw new Error(`npm install failed with exit code ${installExitCode}`);
                }
                console.log('✅ Dependencies installed successfully');
                
                setStatus('Starting development server...');
                console.log('🚀 Starting dev server...');
                const startProcess = await webcontainerInstance.current.spawn('npm', ['run', 'dev']);
                
                startProcess.output.pipeTo(new WritableStream({
                    write(chunk) {
                        console.log('🔄 [dev server]:', chunk);
                    }
                }));
                
                // Wait for server to be ready
                webcontainerInstance.current.on('server-ready', (port, url) => {
                    console.log('✅ Server ready on port', port, 'at', url);
                    setStatus('Server ready');
                    if (iframeEl.current) {
                        iframeEl.current.src = url;
                    }
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('❌ Server Error:', errorMessage);
                setError(errorMessage);
                setStatus('Server failed to start');
            }
        }

        startWebContainer();
        
        return () => {
            console.log('🧹 Cleaning up WebContainer...');
            if (webcontainerInstance.current) {
                webcontainerInstance.current.teardown();
            }
        };
    }, []);

    return (
        <div className="webcontainer-preview relative">
            <div className="absolute top-0 left-0 right-0 bg-gray-800 text-white p-2 z-10">
                <p className="text-sm">Status: {status}</p>
                {error && (
                    <p className="text-sm text-red-400">Error: {error}</p>
                )}
            </div>
            <iframe 
                ref={iframeEl} 
                className="preview-iframe h-screen w-screen" 
                allow="cross-origin-isolated"
            />
        </div>
    );
}

export default LivePreview;