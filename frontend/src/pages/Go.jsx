import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Go() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        // 1. Call backend to track click
        // 2. Redirect to product page based on response
        api.post(`/affiliates/track/${code}`)
            .then(res => {
                if (res.data?.productId) {
                    navigate(`/products/${res.data.productId}?ref=${res.data.code}`, { replace: true });
                } else {
                    setError('Invalid tracking response');
                }
            })
            .catch(err => {
                console.error('Tracking error:', err);
                setError('Link expired or invalid');
            });
    }, [code, navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="card max-w-md w-full text-center">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-400 text-xl font-bold">!</span>
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Oops!</h1>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button onClick={() => navigate('/marketplace')} className="btn-primary">
                        Browse Marketplace
                    </button>
                </div>
            </div>
        );
    }

    // Loading state while redirecting
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4" />
            <p className="text-gray-400 font-medium animate-pulse">Taking you to the product...</p>
        </div>
    );
}
