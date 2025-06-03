import React from "react";
import { Player } from "video-react";
import { Img } from "react-image";
import Md from "./Md";
import Spinner from "../atoms/Spinner";
import NoSource from "../atoms/NoSource";

const getGoogleDriveUrl = (src) => {
  const match = src.match(/gdrive:(.+)/);
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return src;
};

const Content = ({ media, viewIdx, translations, switchLanguage, langIdx }) => {
  const el = document.querySelector(".source-media-gallery");
  const shiftW = el ? el.getBoundingClientRect().width : 0;

  function renderMedia(media) {
    const { path, type, poster } = media;
    switch (type) {
      case "Image":
        return (
          <div className="source-image-container">
            <Img
              className="source-image"
              src={path}
              loader={
                <div className="source-image-loader">
                  <Spinner />
                </div>
              }
              unloader={<NoSource failedUrls={[path]} />}
              onClick={() => window.open(path, "_blank")}
            />
          </div>
        );
      case "Video":
        const isGoogleDrive = path.startsWith('gdrive:');
        if (isGoogleDrive) {
          const videoUrl = getGoogleDriveUrl(path);
          return (
            <div className="media-player">
              <div className="banner-trans right-overlay">
                {translations
                  ? translations.map((trans, idx) =>
                      langIdx !== idx + 1 ? (
                        <div
                          className="trans-button"
                          onClick={() => switchLanguage(idx + 1)}
                        >
                          {trans.code}
                        </div>
                      ) : (
                        <div
                          className="trans-button"
                          onClick={() => switchLanguage(0)}
                        >
                          EN
                        </div>
                      )
                    )
                  : null}
              </div>
              <div style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                overflow: 'hidden',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '4px'
              }}>
                <iframe
                  src={videoUrl}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Video Preview"
                />
              </div>
            </div>
          );
        }
        return (
          <div className="media-player">
            <div className="banner-trans right-overlay">
              {translations
                ? translations.map((trans, idx) =>
                    langIdx !== idx + 1 ? (
                      <div
                        className="trans-button"
                        onClick={() => switchLanguage(idx + 1)}
                      >
                        {trans.code}
                      </div>
                    ) : (
                      <div
                        className="trans-button"
                        onClick={() => switchLanguage(0)}
                      >
                        EN
                      </div>
                    )
                  )
                : null}
            </div>
            <Player
              poster={poster}
              className="source-video"
              playsInline
              src={path}
            />
          </div>
        );
      case "Text":
        return (
          <div className="source-text-container">
            <Md
              path={path}
              loader={<Spinner />}
              unloader={() => this.renderError()}
            />
          </div>
        );
      case "Document":
        return <iframe title={path} className="source-document" src={path} />;
      default:
        return (
          <NoSource
            failedUrls={[
              `Application does not support extension: ${path.split(".")[1]}`,
            ]}
          />
        );
    }
  }

  return (
    <div
      className="source-media-gallery"
      style={{ transform: `translate(${viewIdx * -shiftW}px)` }}
    >
      {media.map((m) => renderMedia(m))}
    </div>
  );
};

export default Content;
