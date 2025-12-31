import { useEffect, useState, ReactNode } from 'react';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, MapPin, Camera as CameraIcon, AlertTriangle } from 'lucide-react';

type PermissionType = 'camera' | 'location';

interface PermissionGuardProps {
    type: PermissionType;
    children: ReactNode;
    fallback?: ReactNode;
    onPermissionGranted?: () => void;
}

export function PermissionGuard({ type, children, fallback, onPermissionGranted }: PermissionGuardProps) {
    const [status, setStatus] = useState<'granted' | 'denied' | 'prompt' | 'loading'>('loading');

    useEffect(() => {
        checkPermission();
    }, [type]);

    const checkPermission = async () => {
        try {
            let permissionStatus;
            if (type === 'camera') {
                const state = await Camera.checkPermissions();
                permissionStatus = state.camera;
            } else if (type === 'location') {
                const state = await Geolocation.checkPermissions();
                permissionStatus = state.location;
            }

            setStatus(permissionStatus as any);
        } catch (error) {
            console.error("Permission check failed", error);
            // On web or error, default to prompt/loading logic or assume granted if not strict
            // For safety in hybrid, assume 'prompt' to ask
            setStatus('prompt');
        }
    };

    const requestPermission = async () => {
        try {
            let result;
            if (type === 'camera') {
                result = await Camera.requestPermissions();
                if (result.camera === 'granted') {
                    setStatus('granted');
                    onPermissionGranted?.();
                    return;
                }
            } else if (type === 'location') {
                result = await Geolocation.requestPermissions();
                if (result.location === 'granted') {
                    setStatus('granted');
                    onPermissionGranted?.();
                    return;
                }
            }

            setStatus('denied');
            toast.error(`Permission denied. Please enable ${type} access in settings.`);
        } catch (error) {
            console.error("Permission request failed", error);
            setStatus('denied');
        }
    };

    if (status === 'loading') return <div className="p-4 text-center text-muted-foreground animate-pulse">Checking permissions...</div>;

    if (status === 'granted') return <>{children}</>;

    // Custom Rationale UI (Advanced/Safe requirement)
    if (status === 'prompt' || status === 'denied') {
        if (fallback) return <>{fallback}</>;

        const Config = {
            camera: {
                icon: <CameraIcon className="h-12 w-12 text-blue-500 mb-4" />,
                title: "Camera Access Required",
                desc: "Kabadiyo needs camera access to take photos of your scrap, upload profile pictures, and verifies items."
            },
            location: {
                icon: <MapPin className="h-12 w-12 text-green-500 mb-4" />,
                title: "Location Access Required",
                desc: "Kabadiyo needs location access to find the nearest Kabadiwala and schedule accurate pickups."
            }
        }[type];

        return (
            <Card className="w-full max-w-sm mx-auto border-dashed shadow-sm">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center">{Config.icon}</div>
                    <CardTitle>{Config.title}</CardTitle>
                    <CardDescription>{Config.desc}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg text-xs text-yellow-800 dark:text-yellow-200 flex gap-2 items-start text-left">
                        <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>We value your privacy. This permission is only used while the app is in use and data is never shared without your consent.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={requestPermission} className="w-full" variant={status === 'denied' ? 'outline' : 'default'} disabled={status === 'denied'}>
                        {status === 'denied' ? 'Permission Denied (Open Settings)' : 'Allow Access'}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return null;
}
