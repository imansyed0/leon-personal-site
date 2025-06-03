import React, { useEffect, useRef } from "react";
import Popup from "./atoms/Popup";
import copy from "../common/data/copy.json";
import { getGoogleDriveVideoUrl } from "../common/utilities/video";

const IntroPopup = ({ isOpen, onClose, language, styles }) => {
  const iframeRef = useRef(null);
  const googleDriveUrl = copy[language]?.legend?.intro?.video || "";
  const videoUrl = getGoogleDriveVideoUrl(googleDriveUrl);

  // Stop video when popup closes
  useEffect(() => {
    if (!isOpen && iframeRef.current) {
      // Reset iframe src to stop the video
      iframeRef.current.src = "about:blank";
    }
  }, [isOpen]);

  // Enhanced onClose to ensure video stops
  const handleClose = () => {
    if (iframeRef.current) {
      iframeRef.current.src = "about:blank";
    }
    onClose();
  };

  return (
    <Popup
      title={copy[language].legend.intro.header}
      content={copy[language].legend.intro.intro}
      onClose={handleClose}
      isOpen={isOpen}
      styles={{
        position: 'fixed',
        left: '55%',
        top: '37%',
        transform: 'translate(-50%, -50%)',
        width: '88vw',
        maxWidth: '1200px',
        height: '72vh',
        maxHeight: '90vh',
        bottom: 'auto',
        margin: 0,
        overflowY: 'auto'
      }}
    >
      {videoUrl && isOpen && (
        <div style={{ 
          marginTop: '20px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '100%',
            position: 'relative',
            paddingBottom: '56.25%',
            height: 0,
            overflow: 'hidden',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}>
            <iframe
              ref={iframeRef}
              src={videoUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="autoplay"
              allowFullScreen
              title="Intro Video"
            />
          </div>
        </div>
      )}
    </Popup>
  );
};

export default IntroPopup; 