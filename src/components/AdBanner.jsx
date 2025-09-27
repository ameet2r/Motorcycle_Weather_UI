import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useUser } from '../contexts/UserContext';

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT;

export default function AdBanner({ adSlot, style = {} }) {
  const adRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(!!window.adsbygoogle);
  const { membershipTier } = useUser();

  if (membershipTier !== "free") return null;

  useEffect(() => {
    if (!ADSENSE_CLIENT) return;

    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => setScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  useLayoutEffect(() => {
    if (scriptLoaded && adRef.current && window.adsbygoogle) {
      const element = adRef.current;
      let retryCount = 0;
      const maxRetries = 5;

      const pushAd = () => {
        if (element.offsetWidth > 0 && element.offsetParent) {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (err) {
            console.error('AdSense error:', err);
          }
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(pushAd, 100);
        }
      };

      // Use ResizeObserver if available
      if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver((entries) => {
          for (let entry of entries) {
            if (entry.contentRect.width > 0) {
              pushAd();
              resizeObserver.disconnect();
              break;
            }
          }
        });
        resizeObserver.observe(element);
        // Fallback timeout
        setTimeout(() => {
          if (element.offsetWidth === 0 && retryCount === 0) {
            pushAd();
          }
          resizeObserver.disconnect();
        }, 2000);
      } else {
        // Fallback for browsers without ResizeObserver
        pushAd();
      }
    }
  }, [scriptLoaded, adSlot]);

  if (!ADSENSE_CLIENT || !scriptLoaded) return null;

  return (
    <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', width: '100%', ...style }}>
      {import.meta.env.VITE_ENVIRONMENT && import.meta.env.VITE_ENVIRONMENT !== "development" && (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ maxWidth: 400, width: '100%', mx: 'auto', my: 2 }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
          data-adtest="on"
        />
      )}
      {import.meta.env.VITE_ENVIRONMENT && import.meta.env.VITE_ENVIRONMENT === "development" && (
        <Box
          sx={{
            my: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            minHeight: 100,
            bgcolor: '#f0f0f0',
            border: '1px dashed #aaa',
            color: '#666',
            fontSize: 14,
            }}
          >
            [Ad Placeholder: {adSlot}]
        </Box>
      )}
    </Box>
  );
}