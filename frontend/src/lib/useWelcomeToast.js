import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function useWelcomeToast() {
    const location = useLocation();

    useEffect(() => {
        const shouldWelcome = sessionStorage.getItem('showWelcomeToast') === '1';
        if (!shouldWelcome) return;
        sessionStorage.removeItem('showWelcomeToast');

        const hours = new Date().getHours();
        let greeting = 'Welcome';
        if (hours < 12) greeting = 'Good morning';
        else if (hours < 18) greeting = 'Good afternoon';
        else greeting = 'Good evening';

        const userStr = localStorage.getItem('user');
        const name = userStr ? (JSON.parse(userStr).name || '') : '';
        const message = name ? `${greeting}, ${name}!` : `${greeting}!`;

        toast.success(message);
    }, [location.pathname]);
}


